import React from "react";

const STYLES = {
  Online: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Offline: "bg-red-100 text-red-700 border-red-200",
  Maintenance: "bg-amber-100 text-amber-700 border-amber-200",
};

const DOT = {
  Online: "bg-emerald-500",
  Offline: "bg-red-500",
  Maintenance: "bg-amber-500",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || "bg-slate-100 text-slate-700 border-slate-200";
  const dot = DOT[status] || "bg-slate-400";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === "Online" ? "animate-pulse" : ""}`} />
      {status}
    </span>
  );
}
