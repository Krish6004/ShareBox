import React from 'react';

export default function Logo({ size = 32, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-xl p-1.5 transition-transform duration-300 hover:scale-105"
        style={{
          width: size + 8,
          height: size + 8,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          boxShadow: '0 0 20px -3px rgba(99, 102, 241, 0.3)',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo-indigo" x1="6" y1="6" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#818CF8" />
              <stop offset="60%" stop-color="#6366F1" />
              <stop offset="100%" stop-color="#06B6D4" />
            </linearGradient>
            <linearGradient id="logo-cyan" x1="12" y1="6" x2="24" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#38BDF8" />
              <stop offset="100%" stop-color="#06B6D4" />
            </linearGradient>
          </defs>

          {/* Isometric Box Top Face */}
          <path
            d="M18 5L28 10.5L18 16L8 10.5L18 5Z"
            fill="url(#logo-cyan)"
            opacity="0.95"
          />

          {/* Isometric Box Left Flap / Wall */}
          <path
            d="M8 12.5L17 17.5V28L8 23V12.5Z"
            fill="#4F46E5"
            opacity="0.85"
          />

          {/* Isometric Box Right Flap / Wall */}
          <path
            d="M19 17.5L28 12.5V23L19 28V17.5Z"
            fill="url(#logo-indigo)"
          />

          {/* Upward Transfer Beacon Arrow */}
          <path
            d="M18 2L14.5 6.5H16.8V12H19.2V6.5H21.5L18 2Z"
            fill="#FFFFFF"
            filter="drop-shadow(0 0 4px rgba(6, 182, 212, 0.8))"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-sans leading-none">
            ShareBox
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
              Cloud
            </span>
          </span>
          <span className="text-[11px] font-medium text-slate-400 tracking-tight mt-1 leading-none">
            Share Files. Instantly.
          </span>
        </div>
      )}
    </div>
  );
}
