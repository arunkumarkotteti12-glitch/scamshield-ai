import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Mail,
  Smartphone,
  MessageSquare,
  ChevronRight,
  Database,
  Sparkles
} from 'lucide-react';

export const HistoryList = ({ scans = [], onSeedDemo, isSeeding }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatScamType = (type) => {
    if (!type) return 'Other';
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Filtered scans
  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.original_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.scam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.explanation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterLevel === 'all' ? true : scan.risk_level === filterLevel;

    return matchesSearch && matchesFilter;
  });

  const getRiskBadge = (level, score) => {
    if (level === 'high' || score >= 70) {
      return {
        bg: 'bg-red-500/10 border-red-500/30 text-red-400',
        label: 'HIGH RISK'
      };
    }
    if (level === 'medium' || score >= 35) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        label: 'MEDIUM RISK'
      };
    }
    return {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      label: 'LOW RISK'
    };
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past scans by keyword or scam type..."
            className="w-full glass-input rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 hidden sm:inline-block" />
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {['all', 'high', 'medium', 'low'].map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-3 py-1 rounded-md capitalize transition ${
                  filterLevel === level
                    ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scans List / Cards */}
      {filteredScans.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredScans.map((scan) => {
            const badge = getRiskBadge(scan.risk_level, scan.risk_score);
            return (
              <Link
                key={scan.id}
                to={`/history/${scan.id}`}
                className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-950/30 transition group block"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label} ({scan.risk_score}/100)
                      </span>
                      <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-2.5 py-0.5 rounded-full">
                        {formatScamType(scan.scam_type)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(scan.created_at)}
                      </span>
                    </div>

                    <p className="text-sm font-sans text-slate-200 line-clamp-2 leading-relaxed font-medium">
                      "{scan.original_text}"
                    </p>

                    <p className="text-xs text-slate-400 line-clamp-1 font-sans">
                      {scan.explanation}
                    </p>
                  </div>

                  <div className="flex items-center justify-end md:justify-center gap-2 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 transition">
                    <span>View Detail</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 mb-2">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Scans Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {searchTerm || filterLevel !== 'all'
              ? 'No scans match your current search query or filter criteria.'
              : 'You have not performed any scans yet. Paste a message on the Dashboard to get started, or seed sample demo data.'}
          </p>

          {scans.length === 0 && onSeedDemo && (
            <div className="pt-2">
              <button
                onClick={onSeedDemo}
                disabled={isSeeding}
                className="btn-primary text-xs font-semibold text-white px-5 py-2.5 rounded-xl shadow-lg inline-flex items-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>{isSeeding ? 'Seeding Demo Data...' : 'Populate Sample Demo Scans'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
