import React, { useState } from 'react';
import { ScanInput } from '../components/ScanInput';
import { ScanLoadingAnimation } from '../components/ScanLoadingAnimation';
import { ScanResultCard } from '../components/ScanResultCard';
import { ErrorMessage } from '../components/ErrorMessage';
import { scanApi } from '../api/client';
import { analyzeAndSaveScanFallback } from '../lib/geminiClientService';
import { ShieldCheck, History } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [resultScan, setResultScan] = useState(null);
  const [error, setError] = useState(null);

  const handleScanSubmit = async (originalText, messageSource) => {
    setError(null);
    setResultScan(null);
    setCurrentText(originalText);
    setLoading(true);

    try {
      // 1. Try server API scan first
      try {
        const scanData = await scanApi.createScan(originalText, messageSource);
        setResultScan(scanData);
        return;
      } catch (backendErr) {
        console.warn('Backend API endpoint returned error, executing direct AI client fallback:', backendErr);
      }

      // 2. Failproof Client-Side AI Scan Fallback
      const fallbackScan = await analyzeAndSaveScanFallback(originalText, messageSource);
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
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 sm:px-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
            AI Scam & Phishing Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Paste suspicious content below. Gemini AI inspects domain credibility, urgency flags & risk vectors.
          </p>
        </div>

        <Link
          to="/history"
          className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 w-fit transition"
        >
          <History className="w-4 h-4" />
          <span>View Past Scans</span>
        </Link>
      </div>

      {/* Main Input Form */}
      <ScanInput onScan={handleScanSubmit} isLoading={loading} />

      {/* Error Message display */}
      {error && (
        <ErrorMessage
          title="Analysis Failed"
          message={error}
          onRetry={() => handleScanSubmit(currentText, 'other')}
        />
      )}

      {/* Combined Loading Animation during AI Analysis */}
      {loading && <ScanLoadingAnimation originalText={currentText} />}

      {/* Live Result Card */}
      {resultScan && !loading && (
        <div className="animate-fade-in space-y-4">
          <ScanResultCard scan={resultScan} onAnalyzeAnother={handleReset} />
        </div>
      )}
    </div>
  );
};
