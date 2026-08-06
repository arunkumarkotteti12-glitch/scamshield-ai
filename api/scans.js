import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type } from '@google/genai';

const SYSTEM_PROMPT = `You are an expert cybersecurity analyst specializing in phishing and scam detection. You will be given the text of a message a user received. Analyze it carefully for signs of phishing, fraud, impersonation, urgency manipulation, suspicious links, requests for sensitive information, or other scam indicators. Respond with your honest, calibrated assessment — do not mark a genuinely safe, ordinary message as a scam just to seem cautious, and do not miss real red flags in a genuinely dangerous message. Always respond with valid JSON only, matching the exact schema provided, with no additional commentary outside the JSON object.`;

const JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isScam: { type: Type.BOOLEAN },
    riskScore: { type: Type.INTEGER },
    riskLevel: { type: Type.STRING },
    scamType: { type: Type.STRING },
    redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
    explanation: { type: Type.STRING },
    recommendedAction: { type: Type.STRING }
  },
  required: ['isScam', 'riskScore', 'riskLevel', 'scamType', 'redFlags', 'explanation', 'recommendedAction']
};

export default async function handler(req, res) {
  // CORS Headers for Vercel Serverless Function
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'MethodNotAllowed', message: 'Only POST requests are supported.' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing Authorization header.' });
    }

    const token = authHeader.split(' ')[1];
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'ConfigError', message: 'Server missing Supabase credentials.' });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired session token.' });
    }

    const { originalText, messageSource = 'other' } = req.body || {};
    if (!originalText || originalText.length < 10) {
      return res.status(400).json({ error: 'ValidationError', message: 'Message text must be at least 10 characters long.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ConfigError', message: 'Server missing GEMINI_API_KEY environment variable.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const userPrompt = `Message source: ${messageSource}. Analyze the following message and return your assessment as JSON matching this exact schema: { isScam: boolean, riskScore: number (0-100), riskLevel: 'low' | 'medium' | 'high', scamType: one of [phishing, lottery_prize_scam, fake_delivery, job_scam, romance_scam, impersonation_bank_or_government, tech_support_scam, investment_scam, other, not_a_scam], redFlags: array of short strings (max 6 items), explanation: a 2-3 sentence plain-English explanation, recommendedAction: a single short actionable sentence }. Message to analyze: "${originalText}"`;

    const aiRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
      config: { responseMimeType: 'application/json', responseSchema: JSON_SCHEMA, temperature: 0.2 }
    });

    const result = JSON.parse(aiRes.text.replace(/```json\n?|\n?```/g, '').trim());

    const scanData = {
      user_id: user.id,
      message_source: messageSource,
      original_text: originalText,
      is_scam: Boolean(result.isScam),
      risk_score: Math.max(0, Math.min(100, Math.round(Number(result.riskScore) || 0))),
      risk_level: ['low', 'medium', 'high'].includes(result.riskLevel?.toLowerCase()) ? result.riskLevel.toLowerCase() : 'medium',
      scam_type: result.scamType || 'other',
      red_flags: Array.isArray(result.redFlags) ? result.redFlags.slice(0, 6) : [],
      explanation: result.explanation || 'Analysis completed.',
      recommended_action: result.recommendedAction || 'Do not click links or share personal info.'
    };

    const { data: newScan, error: dbError } = await supabase
      .from('scans')
      .insert([scanData])
      .select()
      .single();

    if (dbError) {
      console.error('Database Error:', dbError);
      return res.status(500).json({ error: 'DatabaseError', message: `Failed to save scan record: ${dbError.message}` });
    }

    return res.status(201).json(newScan);
  } catch (err) {
    console.error('Vercel API error:', err);
    return res.status(500).json({ error: 'ServerError', message: err.message || 'AI Scan failed.' });
  }
}
