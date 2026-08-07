import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const Interactive3DButton = ({ to, children, className = '', onClick }) => {
  const buttonRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    const handleGlobalMouseMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - btnCenterX;
      const deltaY = e.clientY - btnCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Magnetic pull radius threshold (~60px beyond boundary)
      const maxMagneticRadius = Math.max(rect.width, rect.height) / 2 + 60;

      if (distance < maxMagneticRadius) {
        const pullFactor = (1 - distance / maxMagneticRadius) * 8; // Subtle 8px max pull
        const magX = (deltaX / (distance || 1)) * pullFactor;
        const magY = (deltaY / (distance || 1)) * pullFactor;

        if (isHovered) {
          // Calculate 3D tilt angles inside hover area (max ~8-9 degrees)
          const mouseXRel = e.clientX - rect.left;
          const mouseYRel = e.clientY - rect.top;
          const rotateY = ((mouseXRel / rect.width) - 0.5) * 16;
          const rotateX = -((mouseYRel / rect.height) - 0.5) * 16;

          setTransformStyle(
            `perspective(1000px) translate3d(${magX}px, ${magY}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
          );
        } else {
          // Magnetic pull only outside direct hover
          setTransformStyle(
            `perspective(1000px) translate3d(${magX}px, ${magY}px, 0px) rotateX(0deg) rotateY(0deg)`
          );
        }
      } else {
        // Reset position when outside magnetic radius
        setTransformStyle('perspective(1000px) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isHovered]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle('perspective(1000px) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  const commonProps = {
    ref: buttonRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick,
    style: {
      transform: transformStyle,
      transition: isHovered
        ? 'transform 0.1s ease-out'
        : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
      transformStyle: 'preserve-3d',
      willChange: 'transform'
    },
    className: `relative inline-flex items-center justify-center font-bold text-white btn-primary rounded-xl shadow-2xl transition-shadow ${className}`
  };

  if (to) {
    return <Link to={to} {...commonProps}>{children}</Link>;
  }

  return <button type="button" {...commonProps}>{children}</button>;
};
