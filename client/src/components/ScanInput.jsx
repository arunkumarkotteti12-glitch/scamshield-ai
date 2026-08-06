import React, { useState } from 'react';
import { Search, Sparkles, AlertCircle, FileText, Mail, Smartphone, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import { z } from 'zod';

const inputSchema = z.object({
  originalText: z
    .string()
    .min(10, { message: 'Message text must be at least 10 characters long.' })
    .max(5000, { message: 'Message text cannot exceed 5000 characters.' }),
  messageSource: z.enum(['email', 'sms', 'whatsapp', 'social_media', 'other'])
});

export const ScanInput = ({ onScan, isLoading }) => {
  const [text, setText] = useState('');
  const [source, setSource] = useState('other');
  const [validationError, setValidationError] = useState(null);

  const samplePresets = [
    {
      label: '🚨 Fake Netflix SMS',
      source: 'sms',
      text: 'URGENT: Your Netflix subscription has expired. Payment failed on 05/08/2026. Update your billing info immediately at http://netflix-verify-acc-9812.com or your account will be deleted in 24 hours!'
    },
    {
      label: '🏦 Bank Phishing Email',
      source: 'email',
      text: 'Dear Customer, your Bank of America account #****4912 has been temporarily suspended due to 3 unauthorized login attempts. Click here to verify your SSN and restore access: https://boa-secure-login-portal.net'
    },
    {
      label: '✅ Safe Team Email',
      source: 'email',
      text: 'Hi Team, please find attached the updated project roadmap and Q3 deliverables schedule for our upcoming client meeting on Thursday. Let me know if you have any questions.'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);

    const validation = inputSchema.safeParse({ originalText: text, messageSource: source });
    if (!validation.success) {
      setValidationError(validation.error.errors[0]?.message || 'Invalid input.');
      return;
    }

    onScan(text, source);
  };

  const handleLoadSample = (sample) => {
    setText(sample.text);
    setSource(sample.source);
    setValidationError(null);
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Paste Message for AI Scam Inspection
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Instantly detect phishing, financial fraud, impersonation tactics, and malicious links.
          </p>
        </div>

        {/* Message Source Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Source:
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={isLoading}
            className="glass-input rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300 bg-slate-900 border border-slate-700 outline-none cursor-pointer hover:border-cyan-500 transition"
          >
            <option value="other">Other / Unknown</option>
            <option value="email">Email</option>
            <option value="sms">SMS Text Message</option>
            <option value="whatsapp">WhatsApp Message</option>
            <option value="social_media">Social Media DM</option>
          </select>
        </div>
      </div>

      {/* Preset Quick Load Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" /> Quick Samples:
        </span>
        {samplePresets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleLoadSample(preset)}
            disabled={isLoading}
            className="text-xs font-medium text-slate-300 hover:text-cyan-300 bg-slate-900 hover:bg-cyan-950/60 px-3 py-1 rounded-lg border border-slate-800 hover:border-cyan-700/50 transition duration-150"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Textarea */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (validationError) setValidationError(null);
            }}
            disabled={isLoading}
            rows={6}
            placeholder="Paste suspicious text here (e.g. email body, SMS text, WhatsApp forward, or social media message)..."
            className="w-full glass-input rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 font-sans leading-relaxed outline-none resize-none"
          />

          {/* Char Counter */}
          <div className="absolute bottom-3 right-4 text-[11px] font-mono text-slate-500 pointer-events-none">
            <span className={text.length > 5000 ? 'text-rose-400 font-bold' : ''}>
              {text.length}
            </span> / 5000 chars
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || text.length < 10 || text.length > 5000}
            className="btn-primary font-bold text-white px-8 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Search className="w-5 h-5 text-white" />
            <span>Analyze Message Risk</span>
          </button>
        </div>
      </form>
    </div>
  );
};
