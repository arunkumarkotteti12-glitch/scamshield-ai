import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  ArrowRight,
  Eye,
  CheckCircle2,
  Database,
  Sparkles,
  AlertOctagon,
  FileSearch
} from 'lucide-react';

export const Landing = ({ session }) => {
  return (
    <div className="space-y-24 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wide shadow-lg shadow-cyan-950/40 animate-pulse">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Powered by Google Gemini AI & Supabase RLS Privacy
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Detect Phishing & Scams Before They Strike With{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-teal-300">
            Real-Time AI
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
          Paste any suspicious email, SMS, or WhatsApp message. Receive an instant risk score, red flag breakdown, and plain-English safety recommendations — with database-isolated privacy.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to={session ? '/dashboard' : '/signup'}
            className="w-full sm:w-auto btn-primary font-bold text-white text-base px-8 py-4 rounded-xl shadow-2xl flex items-center justify-center gap-3 transition group"
          >
            <span>{session ? 'Open AI Scanner' : 'Analyze A Message Now'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          {!session && (
            <Link
              to="/login"
              className="w-full sm:w-auto font-semibold text-slate-300 hover:text-white glass-panel border border-slate-700 px-8 py-4 rounded-xl transition text-center"
            >
              Sign In to History
            </Link>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition group shadow-xl">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Google Gemini Neural Analysis</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Evaluates urgency tactics, deceptive links, bank impersonation, and domain spoofing with calibrated AI risk scoring.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition group shadow-xl">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 w-fit">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">PostgreSQL Row Level Security</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            True database-level isolation. RLS policies enforce `auth.uid() = user_id` directly in PostgreSQL — ensuring zero cross-tenant data leaks.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition group shadow-xl">
          <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 w-fit">
            <FileSearch className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Plain-English Safety Action</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            No obscure cybersecurity jargon. Get clear, actionable steps on what to block, report, or double-check.
          </p>
        </div>
      </section>

      {/* Target Scam Categories */}
      <section className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-8 shadow-2xl">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Trained to Spot All Major Fraud Vector Types
          </h2>
          <p className="text-sm text-slate-400">
            Categorizes threats in real-time across critical online fraud patterns:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-mono text-slate-300">
          {[
            'Phishing Links & Spoofing',
            'Bank & Govt Impersonation',
            'Fake Delivery Alerts (USPS/FedEx)',
            'Lottery & Prize Scams',
            'Employment & Job Scams',
            'Romance & Catfish Scams',
            'Tech Support Overcharge',
            'Crypto & Investment Scams'
          ].map((cat, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>{cat}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
