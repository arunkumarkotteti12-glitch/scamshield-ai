import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const router = express.Router();

const signupSchema = z.object({
  email: z.string().email({ message: 'Valid email address is required.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
  fullName: z.string().optional()
});

/**
 * POST /api/auth/signup
 * Auto-confirms new users using the Supabase Service Role Key (bypassing email confirmation and rate limits)
 */
router.post('/signup', async (req, res, next) => {
  try {
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: validation.error.errors[0]?.message || 'Invalid signup input.'
      });
    }

    const { email, password, fullName } = validation.data;

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({
        error: 'ConfigError',
        message: 'Server missing Supabase credentials.'
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // 1. Create user with email_confirm: true using Admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || '',
        email_verified: true
      }
    });

    if (createError) {
      // If user already exists, check if we can handle clean response
      if (createError.message?.includes('already registered')) {
        return res.status(400).json({
          error: 'UserExists',
          message: 'An account with this email address already exists. Please log in.'
        });
      }
      return res.status(400).json({
        error: 'SignupError',
        message: createError.message
      });
    }

    // 2. Log in the newly created user to generate session JWT
    const { data: sessionData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      return res.status(200).json({
        message: 'Account created and confirmed! Please log in with your password.',
        user: newUser.user
      });
    }

    return res.status(201).json({
      message: 'Account created and auto-confirmed successfully!',
      session: sessionData.session,
      user: sessionData.user
    });
  } catch (err) {
    next(err);
  }
});

export default router;
