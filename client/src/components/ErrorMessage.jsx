import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({ title = 'An Error Occurred', message, onRetry }) => (
  <div className="glass-panel p-6 rounded-2xl border border-rose-900/60 bg-rose-950/30 text-center space-y-3 my-4">
    <div className="inline-flex p-3 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800">
      <AlertCircle className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-bold text-rose-200">{title}</h3>
    <p className="text-xs text-rose-300 max-w-md mx-auto">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 text-xs font-semibold text-rose-200 hover:text-white bg-rose-900/60 hover:bg-rose-800 px-4 py-2 rounded-lg border border-rose-700 inline-flex items-center gap-2 transition"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Try Again</span>
      </button>
    )}
  </div>
);
