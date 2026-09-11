import React from 'react';

// Full-screen branded loader used for auth checks and route transitions.
// Same component adapts via responsive classes for mobile vs desktop.
export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-50 grad-brand flex flex-col items-center justify-center text-white px-6 text-center">
      <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl glass flex items-center justify-center text-4xl md:text-5xl shadow-2xl animate-fade-up"
           style={{ animation: 'bsFloat 2.6s ease-in-out infinite' }}>
        🔍
      </div>
      <div className="mt-5 text-2xl md:text-3xl font-extrabold tracking-tight">ApiMitra</div>
      <div className="mt-6 w-40 md:w-56 h-1.5 rounded-full bg-white/25 overflow-hidden">
        <div className="h-full w-2/5 bg-white rounded-full"
             style={{ animation: 'bsSlide 1.1s ease-in-out infinite' }} />
      </div>
      <div className="mt-4 text-xs text-white/70">{label}</div>

      <style>{`
        @keyframes bsFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes bsSlide { 0% { transform: translateX(-120%); } 100% { transform: translateX(320%); } }
      `}</style>
    </div>
  );
}
