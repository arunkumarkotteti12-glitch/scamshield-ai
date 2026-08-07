import React, { useEffect, useState } from 'react';

export const CursorSpotlight = () => {
  const [position, setPosition] = useState({ x: -500, y: -500 });
  const [isMuted, setIsMuted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Disable on touch-only coarse pointer devices
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
      return;
    }

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if mouse is over an interactive element with its own hover effect
      const target = e.target;
      if (target && target.closest) {
        const isOverInteractive = target.closest('button, a, select, textarea, input, [role="button"]');
        setIsMuted(Boolean(isOverInteractive));
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: -500, y: -500 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (isTouch) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300 overflow-hidden"
      style={{ opacity: isMuted ? 0.25 : 1 }}
      aria-hidden="true"
    >
      <div
        className="absolute w-[450px] h-[450px] rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.08) 0%, rgba(6, 182, 212, 0.03) 45%, transparent 70%)'
        }}
      />
    </div>
  );
};
