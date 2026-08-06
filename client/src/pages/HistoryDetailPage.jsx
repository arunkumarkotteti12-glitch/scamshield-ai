import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { scanApi } from '../api/client';
import { ScanResultCard } from '../components/ScanResultCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ArrowLeft, History, ShieldAlert } from 'lucide-react';

export const HistoryDetailPage = () => {
  const { scanId } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScanDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await scanApi.getScanById(scanId);
        setScan(data);
      } catch (err) {
        console.error('Fetch scan detail error:', err);
        const msg = err.response?.data?.message || err.message || 'Scan record not found or access denied.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (scanId) {
      fetchScanDetail();
    }
  }, [scanId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8 px-4 sm:px-6">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg border border-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scan History</span>
        </Link>

        <span className="text-xs font-mono text-slate-500 truncate max-w-[200px]">
          ID: {scanId}
        </span>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving RLS-protected scan record..." />
      ) : error ? (
        <ErrorMessage
          title="Scan Detail Unavailable"
          message={error}
        />
      ) : (
        scan && <ScanResultCard scan={scan} />
      )}
    </div>
  );
};
