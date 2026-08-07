import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Interactive3DButton } from '../components/Interactive3DButton';
import { CurvedHorizon } from '../components/CurvedHorizon';

export const Landing = ({ session }) => {
  const headlineWords = [
    'Detect',
    'Phishing',
    '&',
    'Scams',
    'With'
  ];

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-12">
      {/* Animated Glowing Curved Horizon Arc Background */}
      <CurvedHorizon />

      {/* Centered Hero Container */}
      <section className="relative z-10 text-center space-y-8 max-w-3xl mx-auto my-auto">
        {/* 1. Centered Headline with Staggered Entrance Animation */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.2]">
          {headlineWords.map((word, idx) => (
            <span
              key={idx}
              className="inline-block mr-[0.22em] animate-headline-word"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {word}
            </span>
          ))}
          <span
            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-teal-300 animate-realtime-reveal"
            style={{ animationDelay: `${headlineWords.length * 100 + 20}ms` }}
          >
            Real-Time AI
          </span>
        </h1>

        {/* 2. Shortened Single-Sentence Description */}
        <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed font-sans font-normal">
          Paste any message and get an instant risk score with clear next steps.
        </p>

        {/* 3. Centered Button Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {/* 3D Interactive Primary Button */}
          <Interactive3DButton
            to={session ? '/dashboard' : '/signup'}
            className="w-full sm:w-auto text-base px-8 py-4 flex items-center justify-center gap-3 group"
          >
            <span>{session ? 'Open AI Scanner' : 'Analyze a Message'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Interactive3DButton>

          {/* Secondary Text Link */}
          <Link
            to={session ? '/history' : '/login'}
            className="w-full sm:w-auto font-semibold text-slate-300 hover:text-white glass-panel border border-slate-700/70 hover:border-cyan-500/40 px-8 py-4 rounded-xl transition text-center text-base shadow-md"
          >
            {session ? 'View Scan History' : 'Sign In to History'}
          </Link>
        </div>
      </section>

      {/* 4. Faded Low-Opacity Watermark Text Bleeding Off Bottom Edge */}
      <div className="absolute bottom-[-2.5rem] sm:bottom-[-4rem] left-1/2 -translate-x-1/2 pointer-events-none select-none z-0 w-full text-center overflow-hidden">
        <span className="text-[14vw] sm:text-[13vw] leading-none font-black text-slate-700/10 tracking-widest uppercase block transform translate-y-1/4">
          ScamShield
        </span>
      </div>
    </div>
  );
};
