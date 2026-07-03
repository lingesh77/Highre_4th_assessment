import React from "react";

export default function TextField({ label, icon: Icon, error, className = "", ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-700 flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4" />}
          <span>{label}</span>
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
          error ? "border-red-300" : "border-slate-200"
        } ${className}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
