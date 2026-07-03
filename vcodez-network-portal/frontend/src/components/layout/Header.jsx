import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, ChevronDown, Bell, ServerCrash, CheckCircle2, XCircle } from "lucide-react";
import BrandMark from "./BrandMark";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosClient";

const SEVERITY_DOT = { info: "bg-cyan-400", warning: "bg-amber-400", critical: "bg-red-500" };

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [unseen, setUnseen] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("[data-profile-dropdown]") && showDropdown) {
        setShowDropdown(false);
      }
      if (!event.target.closest("[data-alerts-dropdown]") && showAlerts) {
        setShowAlerts(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown, showAlerts]);

  useEffect(() => {
    let cancelled = false;
    const fetchAlerts = () => {
      api
        .get("/alerts", { params: { limit: 6 } })
        .then((res) => {
          if (cancelled) return;
          const list = res.data.alerts || [];
          setAlerts(list);
          setUnseen(list.length);
        })
        .catch(() => {});
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20 relative z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/app/dashboard" className="flex items-center space-x-3">
            <BrandMark subtitle="Student Management System" size="lg" />
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-gray-800 text-lg">Highre Software Network Portal</span>
              <span className="text-sm text-gray-500">Switch &amp; Cluster Management</span>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="relative" data-alerts-dropdown>
              <button
                onClick={() => { setShowAlerts((v) => !v); setUnseen(0); }}
                className="relative p-2 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
              >
                <Bell className={`w-5 h-5 ${unseen > 0 ? "animate-wiggle" : ""}`} />
                {unseen > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse">
                    {unseen}
                  </span>
                )}
              </button>

              {showAlerts && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                    <ServerCrash className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-medium text-gray-800">Recent Alerts</p>
                  </div>
                  {alerts.length === 0 ? (
                    <p className="px-4 py-4 text-xs text-gray-400">No alerts sent yet.</p>
                  ) : (
                    alerts.map((a) => (
                      <div key={a.id} className="px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                        <div className="flex items-start gap-2">
                          <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${SEVERITY_DOT[a.severity] || "bg-slate-400"}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold text-gray-800 truncate">{a.clusterName}</p>
                              {a.status === "failed" ? (
                                <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{a.issue}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <Link
                    to="/app/alerts"
                    onClick={() => setShowAlerts(false)}
                    className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 mt-1"
                  >
                    View all alerts →
                  </Link>
                </div>
              )}
            </div>

            <div className="relative" data-profile-dropdown>
              <div
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
                onClick={() => setShowDropdown((v) => !v)}
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-medium text-gray-800">{user?.name}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </div>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center space-x-3"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
