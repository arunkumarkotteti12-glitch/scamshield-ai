import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({ title = 'No Data Available', description, actionLink, actionText }) => (
  <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
      <ShieldAlert className="w-8 h-8 text-cyan-400" />
    </div>
    <h3 className="text-xl font-bold text-white">{title}</h3>
    {description && <p className="text-sm text-slate-400 max-w-md mx-auto">{description}</p>}
    {actionLink && (
      <div className="pt-2">
        <Link
          to={actionLink}
          className="btn-primary text-xs font-semibold text-white px-5 py-2.5 rounded-xl shadow-lg inline-flex items-center gap-2 transition"
        >
          <span>{actionText || 'Get Started'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )}
  </div>
);
