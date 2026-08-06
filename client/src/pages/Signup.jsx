import React from 'react';
import { ParticleBackground } from '../components/ParticleBackground';
import { AuthForm } from '../components/AuthForm';

export const Signup = () => {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Particle dust background active ONLY on /login and /signup */}
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-md">
        <AuthForm type="signup" />
      </div>
    </div>
  );
};
