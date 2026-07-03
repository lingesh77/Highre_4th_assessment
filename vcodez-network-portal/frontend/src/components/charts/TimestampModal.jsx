import React from "react";
import { X } from "lucide-react";
import { format } from "date-fns";

export default function TimestampModal({ open, onClose, points, clusterName }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div>
            <h3 className="font-bold text-slate-800">Timestamped Data — {clusterName}</h3>
            <p className="text-xs text-slate-500">{points.length} data points</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/60 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[65vh]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Min</th>
                <th className="px-6 py-3">Median</th>
                <th className="px-6 py-3">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {points.map((p, i) => (
                <tr key={i} className="hover:bg-blue-50/40">
                  <td className="px-6 py-2.5 text-slate-700 font-mono text-xs">
                    {format(new Date(p.t), "MMM d, HH:mm:ss")}
                  </td>
                  <td className="px-6 py-2.5 text-blue-600">{p.min}</td>
                  <td className="px-6 py-2.5 text-emerald-600 font-medium">{p.median}</td>
                  <td className="px-6 py-2.5 text-rose-600">{p.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
