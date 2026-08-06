import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-rose-400">
        <ShieldAlert className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-white">404 — Page Not Found</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The security endpoint or path you requested does not exist or has been moved.
        </p>
      </div>

      <Link
        to="/"
        className="btn-primary text-xs font-semibold text-white px-6 py-3 rounded-xl shadow-lg inline-flex items-center gap-2 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to ScamShield Home</span>
      </Link>
    </div>
  );
};
