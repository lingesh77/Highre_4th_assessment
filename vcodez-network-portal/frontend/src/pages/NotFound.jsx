import React from "react";
import { Link } from "react-router-dom";
import BackgroundBlobs from "../components/layout/BackgroundBlobs";
import GradientButton from "../components/ui/GradientButton";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 relative overflow-hidden flex items-center justify-center">
      <BackgroundBlobs />
      <div className="relative z-10 text-center">
        <h1 className="text-7xl font-extrabold bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <p className="text-slate-600 mb-6">This page doesn't exist.</p>
        <Link to="/">
          <GradientButton>Go Home</GradientButton>
        </Link>
      </div>
    </div>
  );
}
