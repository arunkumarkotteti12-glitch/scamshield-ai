import express from 'express';
import { supabaseAuthMiddleware } from '../middleware/supabaseAuthMiddleware.js';
import { scanRateLimiter } from '../middleware/rateLimiter.js';
import { validateScanInput } from '../validators/scanValidators.js';
import { analyzeMessageWithGemini } from '../services/geminiService.js';

const router = express.Router();

// Apply Supabase authentication middleware to all scan routes
router.use(supabaseAuthMiddleware);

/**
 * POST /api/scans
 * Analyzes message via Gemini AI and saves scan to Supabase PostgreSQL (RLS enforced)
 */
router.post('/', scanRateLimiter, async (req, res, next) => {
  try {
    // 1. Zod Validation
    const validationResult = validateScanInput(req.body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || 'Invalid input parameters.';
      return res.status(400).json({
        error: 'ValidationError',
        message: firstError,
        details: validationResult.error.flatten()
      });
    }

    const { originalText, messageSource, sourceType, fileData, fileMimeType } = validationResult.data;

    const actualSourceType = sourceType || (fileData ? 'image' : 'text');
    const textForAnalysis = originalText || (fileData ? '[Attached Image / PDF File]' : '');

    // 2. Perform AI Scam Analysis with Gemini
    const aiAnalysis = await analyzeMessageWithGemini(textForAnalysis, messageSource, {
      fileData,
      fileMimeType,
      sourceType: actualSourceType
    });

    // 3. Insert record using request-scoped Supabase client (RLS automatically enforces auth.uid() = user_id)
    const scanData = {
      user_id: req.user.id,
      message_source: messageSource,
      original_text: textForAnalysis,
      is_scam: aiAnalysis.isScam,
      risk_score: aiAnalysis.riskScore,
      risk_level: aiAnalysis.riskLevel,
      scam_type: aiAnalysis.scamType,
      red_flags: aiAnalysis.redFlags,
      explanation: aiAnalysis.explanation,
      recommended_action: aiAnalysis.recommendedAction,
      source_type: actualSourceType
    };

    let { data: newScan, error: dbError } = await req.supabase
      .from('scans')
      .insert([scanData])
      .select()
      .single();

    // Fallback if source_type column does not exist on Supabase DB yet
    if (dbError && dbError.message?.includes('source_type')) {
      delete scanData.source_type;
      const retryResult = await req.supabase
        .from('scans')
        .insert([scanData])
        .select()
        .single();
      newScan = retryResult.data;
      dbError = retryResult.error;
    }

    if (dbError) {
      console.error('Supabase DB Insert Error:', dbError);
      const isMissingTable = dbError.message?.includes("schema cache") || dbError.message?.includes("does not exist");
      return res.status(500).json({
        error: 'DatabaseError',
        message: isMissingTable
          ? "The 'scans' table has not been created in Supabase yet. Please execute 001_initial_schema.sql in your Supabase Dashboard SQL Editor."
          : `Failed to save scan record: ${dbError.message}`
      });
    }

    return res.status(201).json(newScan);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/scans
 * Fetches all past scans for the logged-in user, sorted by created_at DESC (RLS enforced)
 */
router.get('/', async (req, res, next) => {
  try {
    const { data: scans, error } = await req.supabase
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Fetch Scans Error:', error);
      return res.status(500).json({
        error: 'DatabaseError',
        message: `Failed to retrieve scan history: ${error.message}`
      });
    }

    return res.json(scans || []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/scans/:id
 * Fetches single scan breakdown by ID (RLS enforces user ownership, returns 404 if unauthorized)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: scan, error } = await req.supabase
      .from('scans')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase Fetch Scan Detail Error:', error);
      return res.status(500).json({
        error: 'DatabaseError',
        message: `Failed to retrieve scan detail: ${error.message}`
      });
    }

    if (!scan) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Scan record not found or access denied.'
      });
    }

    return res.json(scan);
  } catch (err) {
    next(err);
  }
});

export default router;
