import React, { useEffect, useState } from 'react';
import { scanApi } from '../api/client';
import { HistoryList } from '../components/HistoryList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { DEMO_SCANS } from '../../../server/scripts/seedDemoData';
import { History as HistoryIcon, Shield, Sparkles } from 'lucide-react';

export const History = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState(null);

  const fetchScans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scanApi.getScans();
      setScans(data || []);
    } catch (err) {
      console.error('Fetch history error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load scan history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  // Demo seeding action for instant demo/judging populate
  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      for (const item of DEMO_SCANS) {
        try {
          await scanApi.createScan(item.original_text, item.message_source);
        } catch (e) {
          console.warn('Seed item skipped or generated:', e);
        }
      }
      await fetchScans();
    } catch (err) {
      console.error('Seed demo error:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 sm:px-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <HistoryIcon className="w-7 h-7 text-cyan-400" />
            Your Scan History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Protected by Supabase Row Level Security. Only you can view your personal scan database records.
          </p>
        </div>

        {scans.length > 0 && (
          <button
            onClick={handleSeedDemoData}
            disabled={seeding}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 w-fit transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{seeding ? 'Seeding...' : '+ Add Sample Scans'}</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching user-isolated scan history from PostgreSQL..." />
      ) : error ? (
        <ErrorMessage title="Failed to Load History" message={error} onRetry={fetchScans} />
      ) : (
        <HistoryList scans={scans} onSeedDemo={handleSeedDemoData} isSeeding={seeding} />
      )}
    </div>
  );
};
