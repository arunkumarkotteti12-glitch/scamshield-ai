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
      // If user already exists, update and confirm them
      if (createError.message?.includes('already registered')) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (existingUser) {
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password,
            email_confirm: true
          });
        }
      } else {
        return res.status(400).json({
          error: 'SignupError',
          message: createError.message
        });
      }
    }

    // 2. Log in the newly created user to generate session JWT
    const { data: sessionData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      return res.status(200).json({
        message: 'Account created and confirmed! Please log in with your password.',
        user: newUser?.user || null
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

/**
 * POST /api/auth/confirm-user
 * Self-healing auto-confirm endpoint for users marked 'Email not confirmed'
 */
router.post('/confirm-user', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required.' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
      return res.json({ success: true, message: `User ${email} auto-confirmed.` });
    }

    return res.status(404).json({ error: 'User not found.' });
  } catch (err) {
    next(err);
  }
});

export default router;
