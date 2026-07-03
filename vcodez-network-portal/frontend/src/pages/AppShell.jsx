import React from "react";
import { Outlet } from "react-router-dom";
import BackgroundBlobs from "../components/layout/BackgroundBlobs";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import NavCards from "../components/layout/NavCards";
import GlassCard from "../components/ui/GlassCard";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 relative overflow-hidden flex flex-col">
      <BackgroundBlobs />

      <div className="relative z-40">
        <Header />
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10 flex-1 w-full">
        <div className="mb-8">
          <NavCards />
        </div>

        <GlassCard glow>
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </GlassCard>
      </div>

      <Footer />
    </div>
  );
}
