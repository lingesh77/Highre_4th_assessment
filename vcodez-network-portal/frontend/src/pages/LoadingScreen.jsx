import React from "react";
import BackgroundBlobs from "../components/layout/BackgroundBlobs";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
      <BackgroundBlobs />

      <div className="text-center z-10 relative">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-transparent border-t-emerald-400 border-r-cyan-400 rounded-full animate-spin mx-auto" />
          <div
            className="absolute inset-2 w-20 h-20 border-[3px] border-transparent border-t-blue-300 border-l-emerald-300 rounded-full animate-spin mx-auto"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />
          <div className="absolute inset-8 w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse mx-auto shadow-lg" />

          <div className="absolute inset-0 w-24 h-24 mx-auto">
            <div
              className="absolute top-0 left-1/2 w-3 h-3 bg-emerald-400 rounded-full animate-ping transform -translate-x-1/2"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="absolute top-1/2 right-0 w-3 h-3 bg-cyan-400 rounded-full animate-ping transform -translate-y-1/2"
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-400 rounded-full animate-ping transform -translate-x-1/2"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="absolute top-1/2 left-0 w-3 h-3 bg-emerald-300 rounded-full animate-ping transform -translate-y-1/2"
              style={{ animationDelay: "1.5s" }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3 animate-pulse">
            Highre Software
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 rounded-full mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600 text-lg font-medium">Initializing Network Portal...</p>
        </div>

        <div className="w-80 bg-white/60 backdrop-blur-sm rounded-full h-3 mx-auto mb-6 shadow-inner border border-white/40">
          <div
            className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 h-3 rounded-full animate-pulse shadow-sm relative overflow-hidden"
            style={{ width: "65%" }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
              style={{ animationDuration: "2s" }}
            />
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-500">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
            <span>Checking session</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <span>Loading your workspace</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            <span>Almost ready...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
