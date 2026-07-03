import React from "react";

export default function GlassCard({ children, className = "", glow = false }) {
  return (
    <div className={`relative ${className}`}>
      {glow && (
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-3xl blur-xl opacity-60 pointer-events-none" />
      )}
      <div className="relative bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
