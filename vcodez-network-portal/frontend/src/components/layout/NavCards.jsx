import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Network, LineChart, BellRing } from "lucide-react";

const NAV_ITEMS = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard", description: "Overview and quick stats" },
  { to: "/app/devices", icon: Network, label: "Switch Devices", description: "Search, manage & update status" },
  { to: "/app/charts", icon: LineChart, label: "Cluster Metrics", description: "Band chart (min/max/median)" },
  { to: "/app/alerts", icon: BellRing, label: "Alerts & Email", description: "Cluster issue notifications" },
];

export default function NavCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} className="group">
          {({ isActive }) => (
            <div
              className={`relative overflow-hidden rounded-xl p-6 border-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-br from-blue-500 to-green-500 border-blue-400 text-white shadow-xl shadow-blue-500/25"
                  : "bg-white/60 border-slate-200 text-slate-700 hover:bg-white/80 hover:border-blue-300 hover:shadow-lg"
              }`}
            >
              <div className="relative z-10 text-center">
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "bg-white/20" : "bg-slate-100"
                  }`}
                >
                  <item.icon className={`w-6 h-6 ${isActive ? "text-white" : "text-slate-600"}`} />
                </div>
                <h3 className={`font-semibold mb-1 ${isActive ? "text-white" : "text-slate-800"}`}>{item.label}</h3>
                <p className={`text-xs ${isActive ? "text-blue-100" : "text-slate-500"}`}>{item.description}</p>
              </div>
              {isActive && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
              )}
            </div>
          )}
        </NavLink>
      ))}
    </div>
  );
}
