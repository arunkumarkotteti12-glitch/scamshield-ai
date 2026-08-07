import React, { useEffect, useRef } from 'react';

export const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.6;
        this.vx = (Math.random() - 0.5) * 0.2; // Slow, subtle drift
        this.vy = (Math.random() - 0.5) * 0.2;
        this.color = Math.random() > 0.5 ? 'rgba(56, 189, 248, ' : 'rgba(20, 184, 166, '; // Teal & Cyan tones
        this.alpha = Math.random() * 0.35 + 0.15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        ctx.fillStyle = `${this.color}${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    let particles = [];
    const initParticles = () => {
      particles = [];
      // Sparse particle count: ~30-40 subtle drifting dots total
      const count = Math.min(Math.floor((width * height) / 35000), 40);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    initParticles();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Base background fill
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Soft low-center radial glow matching teal/blue palette
      const glowX = width / 2;
      const glowY = height * 0.45;
      const glowRadius = Math.min(width, height) * 0.6;

      const radialGlow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
      radialGlow.addColorStop(0, 'rgba(20, 184, 166, 0.12)'); // Soft teal glow center
      radialGlow.addColorStop(0.4, 'rgba(14, 165, 233, 0.06)'); // Soft cyan blue mid
      radialGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Update & Draw sparse drifting dots
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
