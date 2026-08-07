import React from 'react';

export const CurvedHorizon = () => {
  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none z-0 flex justify-center items-end overflow-hidden h-[400px] w-full">
      <svg
        className="w-[200vw] max-w-[2400px] h-[320px] pointer-events-none transform translate-y-12 sm:translate-y-8"
        viewBox="0 0 1200 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Animated Sweeping Light Gradient */}
          <linearGradient id="horizonGlowGrad" x1="-30%" y1="0%" x2="70%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0" />
            <stop offset="30%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#14b8a6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            <animate attributeName="x1" values="-40%;40%;-40%" dur="10s" repeatCount="indefinite" />
            <animate attributeName="x2" values="60%;140%;60%" dur="10s" repeatCount="indefinite" />
          </linearGradient>

          {/* Secondary Teal Accent Gradient */}
          <linearGradient id="horizonAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0" />
            <stop offset="20%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
            <animate attributeName="x1" values="-20%;30%;-20%" dur="14s" repeatCount="indefinite" />
            <animate attributeName="x2" values="80%;130%;80%" dur="14s" repeatCount="indefinite" />
          </linearGradient>

          {/* Soft Blur Filter for Horizon Glow */}
          <filter id="horizonBlur" x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur stdDeviation="10" result="blur1" />
            <feGaussianBlur stdDeviation="25" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Deep Background Glow Aura */}
        <path
          d="M -150 320 Q 600 -10 1350 320"
          stroke="url(#horizonGlowGrad)"
          strokeWidth="24"
          filter="url(#horizonBlur)"
          opacity="0.45"
        />

        {/* Soft Mid-Layer Glow Rim */}
        <path
          d="M -150 320 Q 600 -10 1350 320"
          stroke="url(#horizonAccentGrad)"
          strokeWidth="8"
          filter="url(#horizonBlur)"
          opacity="0.75"
        />

        {/* Crisp Top Highlight Arc Line */}
        <path
          d="M -150 320 Q 600 -10 1350 320"
          stroke="url(#horizonGlowGrad)"
          strokeWidth="2"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};
