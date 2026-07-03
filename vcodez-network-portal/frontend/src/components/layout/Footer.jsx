import React from "react";
import BrandMark from "./BrandMark";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-white/60 backdrop-blur-sm border-t border-white/20 mt-12">
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <BrandMark subtitle="NETWORK PORTAL" />
        <p className="text-sm text-slate-500 text-center">
          &copy; {new Date().getFullYear()} Highre Software Network Portal. Switch monitoring, cluster analytics &amp; alerting.
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="hover:text-blue-600 transition-colors cursor-pointer">Docs</span>
          <span className="hover:text-blue-600 transition-colors cursor-pointer">Support</span>
          <span className="hover:text-blue-600 transition-colors cursor-pointer">Status</span>
        </div>
      </div>
    </footer>
  );
}
