import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, Cpu, Search, Sparkles } from 'lucide-react';

export const ScanLoadingAnimation = ({ originalText }) => {
  const canvasRef = useRef(null);
  const [statusIndex, setStatusIndex] = useState(0);

  const statusMessages = [
    'Parsing message structure & domain footprints...',
    'Sweeping text with neural anti-phishing models...',
    'Checking urgency manipulation & scam patterns...',
    'Evaluating risk metrics & synthesizing plain-English breakdown...'
  ];

  // Cycle status messages
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Converging Particles Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = (canvas.width = canvas.parentElement.clientWidth || 600);
    const height = (canvas.height = 180);

    const centerX = width / 2;
    const centerY = height / 2;

    class ConvergingParticle {
      constructor() {
        this.reset();
      }

      reset() {
        // Spawn along outer border
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(width, height) / 1.4;

        this.x = centerX + Math.cos(angle) * distance;
        this.y = centerY + Math.sin(angle) * distance;
        this.speed = Math.random() * 2 + 1.2;
        this.size = Math.random() * 2.5 + 1;
        this.color = Math.random() > 0.3 ? 'rgba(6, 182, 212, ' : 'rgba(168, 85, 247, ';
        this.alpha = Math.random() * 0.7 + 0.3;
      }

      update() {
        const dx = centerX - this.x;
        const dy = centerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 12) {
          this.reset();
        } else {
          this.x += (dx / distance) * this.speed;
          this.y += (dy / distance) * this.speed;
        }
      }

      draw() {
        ctx.fillStyle = `${this.color}${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 45 }, () => new ConvergingParticle());

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw converging particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Draw faint target pulse ring in center
      const time = Date.now() * 0.003;
      const ringRadius = 25 + Math.sin(time) * 6;

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing core orb
      const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15);
      coreGlow.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
      coreGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in my-6">
      {/* Effect (a): Radar-Style Scanning Line Sweeping Across Pasted Message Text */}
      <div className="relative glass-panel rounded-xl p-5 overflow-hidden border border-cyan-500/30 shadow-lg shadow-cyan-950/40">
        {/* Animated Radar Scanning Line */}
        <div className="radar-line animate-radar-sweep" />

        <div className="flex items-center justify-between mb-3 text-cyan-400 font-mono text-xs tracking-wider uppercase">
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 animate-spin text-cyan-400" />
            AI Neural Text Analysis Active
          </span>
          <span className="animate-pulse flex items-center gap-1.5 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Scanning...
          </span>
        </div>

        {/* Truncated Text display with scan opacity effect */}
        <div className="font-mono text-sm text-slate-300 bg-slate-950/80 p-4 rounded-lg border border-slate-800 relative z-10 leading-relaxed max-h-36 overflow-hidden">
          <p className="line-clamp-4 select-none opacity-90">
            {originalText || 'Analyzing pasted message text...'}
          </p>
        </div>
      </div>

      {/* Effect (b): Converging Particles Toward Center Result Card */}
      <div className="glass-panel rounded-xl p-6 border border-indigo-500/30 text-center relative overflow-hidden shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-400 mb-1">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>

          <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
            Generating AI Risk Matrix
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          </h3>

          <p className="text-sm font-mono text-cyan-300 animate-pulse h-5">
            {statusMessages[statusIndex]}
          </p>
        </div>

        {/* Canvas displaying inward-converging particle field */}
        <div className="relative w-full h-36 mt-2">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
