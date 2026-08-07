import { GoogleGenAI, Type } from '@google/genai';

const SYSTEM_PROMPT = `You are an expert cybersecurity analyst specializing in phishing and scam detection. You will be given the text of a message a user received. Analyze it carefully for signs of phishing, fraud, impersonation, urgency manipulation, suspicious links, requests for sensitive information, or other scam indicators. Respond with your honest, calibrated assessment — do not mark a genuinely safe, ordinary message as a scam just to seem cautious, and do not miss real red flags in a genuinely dangerous message. Always respond with valid JSON only, matching the exact schema provided, with no additional commentary outside the JSON object.`;

const JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isScam: { type: Type.BOOLEAN, description: 'Whether the message is assessed as a scam' },
    riskScore: { type: Type.INTEGER, description: 'Risk score from 0 to 100' },
    riskLevel: { type: Type.STRING, description: 'Risk category: low, medium, or high' },
    scamType: {
      type: Type.STRING,
      description: 'Scam category: phishing, lottery_prize_scam, fake_delivery, job_scam, romance_scam, impersonation_bank_or_government, tech_support_scam, investment_scam, other, or not_a_scam'
    },
    redFlags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Array of short specific red flags identified'
    },
    explanation: { type: Type.STRING, description: '2-3 sentence plain-English explanation' },
    recommendedAction: { type: Type.STRING, description: 'Single short actionable recommended next step' }
  },
  required: ['isScam', 'riskScore', 'riskLevel', 'scamType', 'redFlags', 'explanation', 'recommendedAction']
};

export const analyzeMessageWithGemini = async (originalText, messageSource = 'other', options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your_gemini_api_key')) {
    throw new Error('GEMINI_API_KEY is missing or invalid in server environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const hasFile = Boolean(options.fileData);
  let userPrompt = '';

  if (hasFile) {
    userPrompt = `Message source: ${messageSource}. An image or document file of a suspicious message has been attached. FIRST, carefully read and transcribe all message text and visual details from the attached file. THEN, run a complete scam risk analysis on the message content and any typed text ("${originalText || ''}"). Return your assessment as JSON matching this exact schema: { isScam: boolean, riskScore: number (0-100), riskLevel: 'low' | 'medium' | 'high', scamType: one of [phishing, lottery_prize_scam, fake_delivery, job_scam, romance_scam, impersonation_bank_or_government, tech_support_scam, investment_scam, other, not_a_scam], redFlags: array of short strings (max 6 items), explanation: a 2-3 sentence plain-English explanation, recommendedAction: a single short actionable sentence }.`;
  } else {
    userPrompt = `Message source: ${messageSource}. Analyze the following message and return your assessment as JSON matching this exact schema: { isScam: boolean, riskScore: number (0-100), riskLevel: 'low' | 'medium' | 'high', scamType: one of [phishing, lottery_prize_scam, fake_delivery, job_scam, romance_scam, impersonation_bank_or_government, tech_support_scam, investment_scam, other, not_a_scam], redFlags: array of short strings (max 6 items), explanation: a 2-3 sentence plain-English explanation, recommendedAction: a single short actionable sentence }. Message to analyze: "${originalText}"`;
  }

  const parts = [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }];

  if (hasFile) {
    const base64Clean = options.fileData.includes(',') ? options.fileData.split(',')[1] : options.fileData;
    parts.push({
      inlineData: {
        mimeType: options.fileMimeType || 'image/png',
        data: base64Clean
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: JSON_SCHEMA,
        temperature: 0.2
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini API.');
    }

    // Clean potential markdown code blocks if present
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(cleanedText);

    // Sanitize & enforce valid bounds
    const isScam = Boolean(result.isScam);
    let riskScore = Math.max(0, Math.min(100, Math.round(Number(result.riskScore) || 0)));
    let riskLevel = ['low', 'medium', 'high'].includes(result.riskLevel?.toLowerCase())
      ? result.riskLevel.toLowerCase()
      : (riskScore >= 70 ? 'high' : riskScore >= 35 ? 'medium' : 'low');

    const validScamTypes = [
      'phishing',
      'lottery_prize_scam',
      'fake_delivery',
      'job_scam',
      'romance_scam',
      'impersonation_bank_or_government',
      'tech_support_scam',
      'investment_scam',
      'other',
      'not_a_scam'
    ];

    const scamType = validScamTypes.includes(result.scamType) ? result.scamType : (isScam ? 'other' : 'not_a_scam');
    const redFlags = Array.isArray(result.redFlags) ? result.redFlags.slice(0, 6) : [];
    const explanation = result.explanation || 'Analysis completed.';
    const recommendedAction = result.recommendedAction || 'Do not click links or share personal info.';

    return {
      isScam,
      riskScore,
      riskLevel,
      scamType,
      redFlags,
      explanation,
      recommendedAction
    };
  } catch (error) {
    console.error('Gemini API Analysis Error:', error);
    const customErr = new Error(`Failed to complete AI scam analysis: ${error.message}`);
    customErr.statusCode = 502;
    throw customErr;
  }
};
