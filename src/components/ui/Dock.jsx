"use client";
import React from "react";

export const Dock = ({ children, className = "" }) => {
  return (
    <div
      className={`mx-auto flex h-[64px] w-max items-center gap-3 rounded-2xl bg-[#0c0015]/80 p-2 px-3 backdrop-blur-md border border-white/10 shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
};

export const DockIcon = ({ children, onClick, active, label }) => {
  return (
    <div className="relative group flex flex-col items-center justify-center h-full">
      {label && (
        <div className="absolute -top-12 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 bg-[#1a0b2e] border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-xl">
          {label}
        </div>
      )}
      <button
        onClick={onClick}
        className={`flex items-center justify-center rounded-xl transition-all duration-300 ease-out h-[40px] w-[40px] group-hover:w-[48px] group-hover:h-[48px] group-hover:-translate-y-1 ${
          active 
            ? "bg-[#c385f0] text-black shadow-[0_0_15px_rgba(195,133,240,0.4)]" 
            : "bg-white/5 hover:bg-white/15 text-white/80 hover:text-white"
        }`}
      >
        <div className="scale-110 group-hover:scale-125 transition-transform duration-300">
          {children}
        </div>
      </button>
    </div>
  );
};
