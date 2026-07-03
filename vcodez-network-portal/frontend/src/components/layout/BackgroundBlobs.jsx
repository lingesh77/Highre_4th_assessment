import React from "react";

/**
 * Ambient animated background used across Login, Loading screen and the
 * dashboard shell. Built entirely from the app's own theme colors
 * (emerald / cyan / blue) — circles, squares and triangles, all animating
 * on an infinite loop so the page never feels static.
 */
export default function BackgroundBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* ---- Circles ---- */}
      <div className="absolute top-[8%] left-[10%] w-40 h-40 rounded-full bg-gradient-to-br from-emerald-300/50 to-emerald-100/20 blur-[2px] animate-drift-a" />
      <div className="absolute top-[22%] right-[14%] w-28 h-28 rounded-full bg-gradient-to-br from-cyan-300/50 to-cyan-100/20 blur-[1px] animate-drift-b" style={{ animationDelay: "0.8s" }} />
      <div className="absolute bottom-[18%] left-[16%] w-32 h-32 rounded-full bg-gradient-to-br from-blue-300/45 to-blue-100/15 animate-drift-a" style={{ animationDelay: "2.2s" }} />
      <div className="absolute bottom-[10%] right-[10%] w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400/45 to-teal-100/15 animate-drift-b" style={{ animationDelay: "1.4s" }} />
      <div className="absolute top-[45%] left-[45%] w-20 h-20 rounded-full bg-gradient-to-br from-sky-300/40 to-cyan-100/10 animate-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="absolute top-[4%] right-[38%] w-14 h-14 rounded-full bg-gradient-to-br from-teal-300/45 to-emerald-100/15 animate-drift-b" style={{ animationDelay: "3s" }} />

      {/* ---- Squares ---- */}
      <div className="absolute top-[14%] left-[32%] w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-300/40 to-cyan-200/25 shadow-lg animate-float-rotate" />
      <div className="absolute top-[62%] left-[6%] w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-300/40 to-blue-200/25 shadow-lg animate-float-rotate" style={{ animationDelay: "1.6s" }} />
      <div className="absolute bottom-[28%] right-[22%] w-20 h-20 rounded-xl bg-gradient-to-br from-blue-300/35 to-emerald-200/20 shadow-lg animate-float-rotate" style={{ animationDelay: "2.6s" }} />
      <div className="absolute top-[36%] right-[6%] w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-300/40 to-teal-200/25 shadow-md animate-float-rotate" style={{ animationDelay: "0.9s" }} />

      {/* ---- Triangles (clip-path) ---- */}
      <div
        className="absolute top-[30%] left-[22%] w-16 h-16 opacity-40 animate-spin-slow"
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.55), rgba(6,182,212,0.35))",
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        }}
      />
      <div
        className="absolute bottom-[14%] left-[42%] w-12 h-12 opacity-35 animate-spin-slow-reverse"
        style={{
          background: "linear-gradient(135deg, rgba(56,189,248,0.55), rgba(16,185,129,0.3))",
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        }}
      />
      <div
        className="absolute top-[68%] right-[30%] w-20 h-20 opacity-30 animate-spin-slow"
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.5), rgba(16,185,129,0.3))",
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          animationDelay: "1.2s",
        }}
      />
      <div
        className="absolute top-[6%] right-[20%] w-10 h-10 opacity-35 animate-spin-slow-reverse"
        style={{
          background: "linear-gradient(135deg, rgba(20,184,166,0.55), rgba(59,130,246,0.3))",
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        }}
      />
    </div>
  );
}
