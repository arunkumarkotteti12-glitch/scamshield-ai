import React from 'react';
import { Sparkles, X, Check } from 'lucide-react';

export const ConsentModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel border border-slate-700/80 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Image & PDF Analysis Consent</h3>
            <p className="text-xs text-slate-400">Powered by Google Gemini Vision</p>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <p>
            Before attaching screenshots or PDFs for scam inspection, please acknowledge:
          </p>
          <ul className="space-y-2 pl-4 list-disc text-slate-300">
            <li>
              Your uploaded file will be sent securely to <strong className="text-cyan-300">Google Gemini AI</strong> to read visible text and evaluate fraud risk.
            </li>
            <li>
              The file itself is <strong className="text-cyan-300">not stored anywhere</strong> except as the resulting scan analysis record in your history.
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg transition"
          >
            <Check className="w-4 h-4 text-white" />
            <span>I Understand & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
