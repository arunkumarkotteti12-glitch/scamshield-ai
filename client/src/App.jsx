import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { HistoryDetailPage } from './pages/HistoryDetailPage';
import { NotFound } from './pages/NotFound';

export function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen to session auth changes (login, signup, signout, token refresh)
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
        {/* Top Sticky Navigation */}
        <Navbar session={session} />

        {/* Main Content Viewport */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing session={session} />} />

            <Route
              path="/login"
              element={session ? <Navigate to="/dashboard" replace /> : <Login />}
            />
            <Route
              path="/signup"
              element={session ? <Navigate to="/dashboard" replace /> : <Signup />}
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute session={session} loading={loading}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute session={session} loading={loading}>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history/:scanId"
              element={
                <ProtectedRoute session={session} loading={loading}>
                  <HistoryDetailPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="glass-panel border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500 font-mono">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ScamShield AI Engine • Production v1.0</span>
            </div>
            <div>
              Built with React, Express, Google Gemini AI & Supabase RLS Privacy
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
