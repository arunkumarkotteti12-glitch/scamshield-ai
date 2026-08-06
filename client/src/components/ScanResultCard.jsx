import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Copy,
  Check,
  ExternalLink,
  Info,
  Clock,
  Mail,
  MessageSquare,
  Smartphone,
  Share2
} from 'lucide-react';

export const ScanResultCard = ({ scan, onAnalyzeAnother }) => {
  const [copied, setCopied] = useState(false);

  if (!scan) return null;

  const {
    is_scam,
    risk_score,
    risk_level,
    scam_type,
    red_flags = [],
    explanation,
    recommended_action,
    message_source,
    created_at,
    original_text
  } = scan;

  // Format scam type label
  const formatScamType = (type) => {
    if (!type) return 'Other';
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Color config according to risk level
  const getRiskConfig = (level, score) => {
    if (level === 'high' || score >= 70) {
      return {
        badgeBg: 'bg-red-500/10 border-red-500/30 text-red-400',
        barGradient: 'from-orange-500 to-red-600',
        textColor: 'text-red-400',
        glowColor: 'shadow-red-950/50 border-red-500/40',
        icon: AlertOctagon,
        title: 'HIGH RISK SCAM DETECTED',
        tagBg: 'bg-red-950/60 text-red-300 border-red-800'
      };
    }
    if (level === 'medium' || score >= 35) {
      return {
        badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        barGradient: 'from-yellow-500 to-amber-500',
        textColor: 'text-amber-400',
        glowColor: 'shadow-amber-950/50 border-amber-500/40',
        icon: AlertTriangle,
        title: 'SUSPICIOUS MESSAGE — EXERCISE CAUTION',
        tagBg: 'bg-amber-950/60 text-amber-300 border-amber-800'
      };
    }
    return {
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      barGradient: 'from-emerald-500 to-teal-400',
      textColor: 'text-emerald-400',
      glowColor: 'shadow-emerald-950/50 border-emerald-500/40',
      icon: ShieldCheck,
      title: 'LIKELY SAFE / LOW RISK',
      tagBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
    };
  };

  const riskConfig = getRiskConfig(risk_level, risk_score);
  const IconComponent = riskConfig.icon;

  const handleCopyAnalysis = () => {
    const textToCopy = `ScamShield AI Analysis:\nVerdict: ${riskConfig.title}\nRisk Score: ${risk_score}/100 (${risk_level.toUpperCase()})\nScam Type: ${formatScamType(scam_type)}\nExplanation: ${explanation}\nRecommended Action: ${recommended_action}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Icon for source
  const renderSourceIcon = (source) => {
    switch (source) {
      case 'email':
        return <Mail className="w-3.5 h-3.5" />;
      case 'sms':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'whatsapp':
      case 'social_media':
        return <MessageSquare className="w-3.5 h-3.5" />;
      default:
        return <Info className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className={`glass-panel rounded-2xl p-6 sm:p-8 border shadow-2xl transition-all duration-300 ${riskConfig.glowColor}`}>
      {/* Header Verdict Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl border ${riskConfig.badgeBg} shadow-inner`}>
            <IconComponent className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${riskConfig.badgeBg}`}>
                {risk_level.toUpperCase()} RISK
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                {renderSourceIcon(message_source)}
                {message_source.toUpperCase()}
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black ${riskConfig.textColor}`}>
              {riskConfig.title}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAnalysis}
            className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition"
            title="Copy Analysis Summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Share'}
          </button>
          {onAnalyzeAnother && (
            <button
              onClick={onAnalyzeAnother}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800 px-3.5 py-2 rounded-lg transition"
            >
              Scan Another
            </button>
          )}
        </div>
      </div>

      {/* Numeric Score & Horizontal Progress Bar */}
      <div className="py-6 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between font-mono text-sm">
          <span className="text-slate-400 font-sans font-medium flex items-center gap-2">
            AI Threat Assessment Score
            <span className={`text-xs px-2 py-0.5 rounded font-mono border ${riskConfig.tagBg}`}>
              {formatScamType(scam_type)}
            </span>
          </span>
          <span className={`text-lg font-bold ${riskConfig.textColor}`}>
            {risk_score}<span className="text-xs text-slate-500">/100</span>
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${riskConfig.barGradient} transition-all duration-1000 shadow-sm`}
            style={{ width: `${Math.max(risk_score, 4)}%` }}
          />
        </div>
      </div>

      {/* Grid: Red Flags & Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-800">
        {/* Red Flags List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Detected Red Flags ({red_flags.length})
          </h3>
          {red_flags.length > 0 ? (
            <ul className="space-y-2">
              {red_flags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              No major red flags detected in this message text.
            </div>
          )}
        </div>

        {/* Plain-English Explanation */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            Plain-English AI Breakdown
          </h3>
          <div className="text-sm text-slate-300 leading-relaxed bg-slate-900/70 p-4 rounded-xl border border-slate-800 font-sans">
            {explanation}
          </div>
        </div>
      </div>

      {/* Recommended Action Box */}
      <div className="pt-6 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-400" />
          Recommended Immediate Action
        </h3>
        <div className={`p-4 rounded-xl border ${riskConfig.badgeBg} flex items-start gap-3`}>
          <CheckCircle2 className={`w-5 h-5 ${riskConfig.textColor} flex-shrink-0 mt-0.5`} />
          <p className="text-sm font-medium text-slate-200 leading-relaxed">
            {recommended_action}
          </p>
        </div>
      </div>

      {/* Original Message Accordion/Snippet */}
      {original_text && (
        <details className="mt-6 pt-4 border-t border-slate-800/80 group">
          <summary className="text-xs font-mono text-slate-400 hover:text-slate-200 cursor-pointer flex items-center justify-between">
            <span>Show Analyzed Message Text ({original_text.length} chars)</span>
            <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto select-all">
            {original_text}
          </div>
        </details>
      )}
    </div>
  );
};
