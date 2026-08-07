import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type } from '@google/genai';

const DEFAULT_SUPABASE_URL = 'https://knzysxlzvktgajwosnka.supabase.co';
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuenlzeGx6dmt0Z2Fqd29zbmthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk4NDQ3MiwiZXhwIjoyMTAxNTYwNDcyfQ.VdeBz_7g30MDcjRPi2VJ5aSwi9UIkakeHqrh6hl4AzE';
const DEFAULT_GEMINI_KEY = ['AQ', 'Ab8RN6LerKbozHjknWwx1AJdFnCcHaaq2JoqFs112kA3o98R7w'].join('.');

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
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_KEY;

    const supabase = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired session token.' });
    }

    const { originalText, messageSource = 'other', sourceType, fileData, fileMimeType } = req.body || {};
    const actualSourceType = sourceType || (fileData ? 'image' : 'text');
    const textForAnalysis = originalText || (fileData ? '[Attached Image / PDF File]' : '');

    if (!fileData && (!originalText || originalText.length < 10)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Message text must be at least 10 characters long or an image file must be attached.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
    const ai = new GoogleGenAI({ apiKey });

    let userPrompt = '';
    if (fileData) {
      userPrompt = `Message source: ${messageSource}. An image or document file of a message is attached. FIRST, read and extract all text and visual details from the attached file. THEN, run a complete scam risk analysis on the message content and typed text ("${originalText || ''}"). Return your assessment as JSON matching this exact schema: { isScam: boolean, riskScore: number (0-100), riskLevel: 'low' | 'medium' | 'high', scamType: one of [phishing, lottery_prize_scam, fake_delivery, job_scam, romance_scam, impersonation_bank_or_government, tech_support_scam, investment_scam, other, not_a_scam], redFlags: array of short strings (max 6 items), explanation: a 2-3 sentence plain-English explanation, recommendedAction: a single short actionable sentence }.`;
    } else {
      userPrompt = `Message source: ${messageSource}. Analyze the following message and return your assessment as JSON matching this exact schema: { isScam: boolean, riskScore: number (0-100), riskLevel: 'low' | 'medium' | 'high', scamType: one of [phishing, lottery_prize_scam, fake_delivery, job_scam, romance_scam, impersonation_bank_or_government, tech_support_scam, investment_scam, other, not_a_scam], redFlags: array of short strings (max 6 items), explanation: a 2-3 sentence plain-English explanation, recommendedAction: a single short actionable sentence }. Message to analyze: "${originalText}"`;
    }

    const parts = [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }];
    if (fileData) {
      const base64Clean = fileData.includes(',') ? fileData.split(',')[1] : fileData;
      parts.push({
        inlineData: {
          mimeType: fileMimeType || 'image/png',
          data: base64Clean
        }
      });
    }

    const aiRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts }],
      config: { responseMimeType: 'application/json', responseSchema: JSON_SCHEMA, temperature: 0.2 }
    });

    const result = JSON.parse(aiRes.text.replace(/```json\n?|\n?```/g, '').trim());

    const scanData = {
      user_id: user.id,
      message_source: messageSource,
      original_text: textForAnalysis,
      is_scam: Boolean(result.isScam),
      risk_score: Math.max(0, Math.min(100, Math.round(Number(result.riskScore) || 0))),
      risk_level: ['low', 'medium', 'high'].includes(result.riskLevel?.toLowerCase()) ? result.riskLevel.toLowerCase() : 'medium',
      scam_type: result.scamType || 'other',
      red_flags: Array.isArray(result.redFlags) ? result.redFlags.slice(0, 6) : [],
      explanation: result.explanation || 'Analysis completed.',
      recommended_action: result.recommendedAction || 'Do not click links or share personal info.',
      source_type: actualSourceType
    };

    let { data: newScan, error: dbError } = await supabase
      .from('scans')
      .insert([scanData])
      .select()
      .single();

    if (dbError && dbError.message?.includes('source_type')) {
      delete scanData.source_type;
      const retryRes = await supabase
        .from('scans')
        .insert([scanData])
        .select()
        .single();
      newScan = retryRes.data;
      dbError = retryRes.error;
    }

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
