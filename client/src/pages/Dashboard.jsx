import React, { useState } from 'react';
import { ScanInput } from '../components/ScanInput';
import { ScanLoadingAnimation } from '../components/ScanLoadingAnimation';
import { ScanResultCard } from '../components/ScanResultCard';
import { ErrorMessage } from '../components/ErrorMessage';
import { CursorSpotlight } from '../components/CursorSpotlight';
import { scanApi } from '../api/client';
import { analyzeAndSaveScanFallback } from '../lib/geminiClientService';
import { ShieldCheck, History } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [resultScan, setResultScan] = useState(null);
  const [error, setError] = useState(null);

  const handleScanSubmit = async (originalText, messageSource, fileOptions = {}) => {
    setError(null);
    setResultScan(null);
    const displayText = originalText || (fileOptions.fileName ? `[Attached File: ${fileOptions.fileName}]` : '[Attached Image / PDF File]');
    setCurrentText(displayText);
    setLoading(true);

    try {
      // 1. Try server API scan first
      try {
        const scanData = await scanApi.createScan(originalText, messageSource, fileOptions);
        setResultScan(scanData);
        return;
      } catch (backendErr) {
        console.warn('Backend API endpoint returned error, executing direct AI client fallback:', backendErr);
      }

      // 2. Failproof Client-Side AI Scan Fallback
      const fallbackScan = await analyzeAndSaveScanFallback(originalText, messageSource, fileOptions);
      setResultScan(fallbackScan);
    } catch (err) {
      console.error('Scan error:', err);
      const apiMessage = err.response?.data?.message || err.message || 'Failed to complete AI scam analysis.';
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResultScan(null);
    setError(null);
    setCurrentText('');
  };

  return (
    <div className="relative max-w-4xl mx-auto space-y-8 py-8 px-4 sm:px-6">
      {/* 1. Page-Level Soft Cursor Radial Glow */}
      <CursorSpotlight />

      {/* 2. Top Banner Header with Staggered Entrance Animation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2 animate-page-entrance-1">
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
            AI Scam & Phishing Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans animate-page-entrance-2">
            Paste suspicious content below. Gemini AI inspects domain credibility, urgency flags & risk vectors.
          </p>
        </div>

        {/* 9. View Past Scans Button with Hover Lift + Teal Glow */}
        <Link
          to="/history"
          className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/50 hover:scale-[1.04] active:scale-95 transition-all duration-200 w-fit animate-page-entrance-2"
        >
          <History className="w-4 h-4" />
          <span>View Past Scans</span>
        </Link>
      </div>

      {/* 3. Main Input Form Container with Entrance Stagger */}
      <div className="animate-page-entrance-3">
        <ScanInput onScan={handleScanSubmit} isLoading={loading} />
      </div>

      {/* Error Message display */}
      {error && (
        <div className="animate-page-entrance-4">
          <ErrorMessage
            title="Analysis Failed"
            message={error}
            onRetry={() => handleScanSubmit(currentText, 'other')}
          />
        </div>
      )}

      {/* Combined Loading Animation during AI Analysis */}
      {loading && <ScanLoadingAnimation originalText={currentText} />}

      {/* Live Result Card */}
      {resultScan && !loading && (
        <div className="animate-fade-in space-y-4 animate-page-entrance-4">
          <ScanResultCard scan={resultScan} onAnalyzeAnother={handleReset} />
        </div>
      )}
    </div>
  );
};
