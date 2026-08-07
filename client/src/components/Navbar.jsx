import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, History, LayoutDashboard, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const Navbar = ({ session }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link to={session ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/30 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5 font-display">
                ScamShield <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">AI</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
                Zero-Trust Detection
              </span>
            </div>
          </Link>

          {/* Navigation Links with Requirement 10 Underline Glow Indicator */}
          <div className="flex items-center gap-2 sm:gap-4">
            {session ? (
              <>
                <Link
                  to="/dashboard"
                  className={`relative group flex items-center gap-2 text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition-all ${
                    isActive('/dashboard')
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Scanner</span>
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-center shadow-[0_0_10px_rgba(6,182,212,0.9)]" />
                </Link>

                <Link
                  to="/history"
                  className={`relative group flex items-center gap-2 text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition-all ${
                    isActive('/history') || location.pathname.startsWith('/history/')
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Scan History</span>
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-center shadow-[0_0_10px_rgba(6,182,212,0.9)]" />
                </Link>

                {/* User Dropdown / Logout */}
                <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-800">
                  <span className="hidden md:inline-block text-xs font-mono text-slate-400 truncate max-w-[150px]" title={session.user?.email}>
                    {session.user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 px-3 py-2 rounded-lg transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="relative group text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition"
                >
                  <span>Log In</span>
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-center shadow-[0_0_10px_rgba(6,182,212,0.9)]" />
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-xs sm:text-sm font-semibold text-white px-4 py-2 rounded-lg shadow-md hover:shadow-cyan-500/25 transition"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
