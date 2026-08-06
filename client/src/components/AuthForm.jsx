import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { apiClient } from '../api/client';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
  fullName: z.string().optional()
});

export const AuthForm = ({ type = 'login' }) => {
  const isSignup = type === 'signup';
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Zod validation
    const validation = authSchema.safeParse({ email, password, fullName });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Invalid input.');
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        // Call backend auto-confirm signup API (bypasses rate limits and email confirmation)
        const response = await apiClient.post('/api/auth/signup', {
          email,
          password,
          fullName
        });

        if (response.data?.session) {
          await supabase.auth.setSession(response.data.session);
          navigate('/dashboard');
        } else {
          // If session wasn't returned directly, perform immediate sign-in
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (signInError) throw signInError;
          if (signInData.session) navigate('/dashboard');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        if (data.session) {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Auth action error:', err);
      const msg = err.response?.data?.message || err.message || 'Authentication failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative z-10 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 shadow-inner">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {isSignup ? 'Create Your Account' : 'Welcome Back'}
        </h1>
        <p className="text-sm text-slate-400 mt-1 font-sans">
          {isSignup
            ? 'Instant auto-confirm registration — zero email confirmation required'
            : 'Log in to access your personal AI scam scanner & scan history'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Demo Credentials Assistant */}
      <div className="mb-6 p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-300 font-medium">Ready-to-use Account:</span>
        <button
          type="button"
          onClick={() => {
            setEmail('demo@scamshield.ai');
            setPassword('Password123!');
          }}
          className="text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-900/60 hover:bg-cyan-800/80 px-2.5 py-1 rounded border border-cyan-700 transition"
        >
          Use Demo Credentials
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary font-semibold text-white py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 mt-6 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>{isSignup ? 'Create Account' : 'Log In'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        {isSignup ? (
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
              Log In
            </Link>
          </p>
        ) : (
          <p>
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-cyan-400 hover:underline font-semibold">
              Sign Up Free
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
