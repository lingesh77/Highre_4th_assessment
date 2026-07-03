import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Network,
  Activity,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  History,
  ServerCrash,
  CheckCircle2,
  XCircle,
  Send,
  LineChart,
} from "lucide-react";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

/** Small hook that animates a number counting up from 0 -> value whenever value changes. */
function useCountUp(value, duration = 700) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const from = 0;
    const to = Number(value) || 0;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return display;
}

function greetingForNow() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const SEVERITY_DOT = { info: "bg-cyan-400", warning: "bg-amber-400", critical: "bg-red-500" };

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const [activeStat, setActiveStat] = useState(null);

  const loadDevices = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    api
      .get("/devices")
      .then((res) => {
        setDevices(res.data.devices);
        setLastUpdated(new Date());
        setError("");
      })
      .catch(() => setError("Could not load device stats."))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  const loadAlerts = () => {
    setAlertsLoading(true);
    api
      .get("/alerts", { params: { limit: 5 } })
      .then((res) => setAlerts(res.data.alerts || []))
      .catch(() => {})
      .finally(() => setAlertsLoading(false));
  };

  useEffect(() => {
    loadDevices();
    loadAlerts();
  }, []);

  const online = devices.filter((d) => d.status === "Online").length;
  const offline = devices.filter((d) => d.status === "Offline").length;
  const maintenance = devices.filter((d) => d.status === "Maintenance").length;
  const uptimePct = devices.length ? Math.round((online / devices.length) * 100) : 0;

  const stats = useMemo(
    () => [
      {
        key: "All",
        label: "Total Devices",
        value: devices.length,
        icon: Network,
        color: "from-blue-500 to-cyan-500",
        ring: "hover:shadow-blue-200/70",
      },
      {
        key: "Online",
        label: "Online",
        value: online,
        icon: Activity,
        color: "from-emerald-500 to-green-500",
        ring: "hover:shadow-emerald-200/70",
      },
      {
        key: "Offline",
        label: "Offline",
        value: offline,
        icon: AlertTriangle,
        color: "from-red-500 to-rose-500",
        ring: "hover:shadow-rose-200/70",
      },
      {
        key: "Maintenance",
        label: "Maintenance",
        value: maintenance,
        icon: TrendingUp,
        color: "from-amber-500 to-orange-500",
        ring: "hover:shadow-amber-200/70",
      },
    ],
    [devices.length, online, offline, maintenance]
  );

  const goToDevices = (statusKey) => {
    setActiveStat(statusKey);
    navigate("/app/devices", { state: { initialStatus: statusKey } });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {greetingForNow()}, {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-slate-600 mt-1">Here's what's happening across your network right now.</p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => loadDevices(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/70 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Live uptime bar */}
      <div className="bg-white/70 rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Fleet Uptime
          </span>
          <span className="text-sm font-bold text-slate-800">{loading ? "…" : `${uptimePct}%`}</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-700 ease-out"
            style={{ width: `${loading ? 0 : uptimePct}%` }}
          />
        </div>
      </div>

      {/* Clickable, animated KPI cards -> jump into a pre-filtered device list */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard
            key={s.key}
            stat={s}
            loading={loading}
            active={activeStat === s.key}
            onClick={() => goToDevices(s.key)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/app/devices"
            className="group bg-white/70 rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 mb-1">Manage Switch Devices</h3>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-sm text-slate-500">Search by model or ID, and update device status.</p>
          </Link>
          <Link
            to="/app/charts"
            className="group bg-white/70 rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-cyan-300 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <LineChart className="w-4 h-4 text-cyan-500" />
                View Cluster Metrics
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-sm text-slate-500">Interactive band chart with min/max/median over time.</p>
          </Link>
          <Link
            to="/app/alerts"
            className="group bg-white/70 rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-rose-300 transition-all duration-300 md:col-span-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <Send className="w-4 h-4 text-rose-500" />
                Send a Cluster Alert
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-sm text-slate-500">Notify your team by email — every alert is logged to Redis.</p>
          </Link>
        </div>

        {/* Live alert feed, pulled from the Redis-backed alert history */}
        <div className="bg-white/70 rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-500" />
              Recent Activity
            </h4>
            <button
              onClick={loadAlerts}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${alertsLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {alertsLoading ? (
            <p className="text-xs text-slate-400">Loading…</p>
          ) : alerts.length === 0 ? (
            <div className="text-center py-6">
              <ServerCrash className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No alerts sent yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {alerts.map((a) => (
                <li key={a.id} className="flex items-start gap-2.5 text-xs border-b border-slate-100 last:border-0 pb-2.5 last:pb-0">
                  <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${SEVERITY_DOT[a.severity] || "bg-slate-400"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 truncate">{a.clusterName}</span>
                      {a.status === "failed" ? (
                        <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-slate-500 truncate">{a.issue}</p>
                    <p className="text-slate-400 mt-0.5">
                      {a.createdAt ? new Date(a.createdAt).toLocaleTimeString() : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/app/alerts"
            className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-700 mt-4"
          >
            View all alerts →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ stat, loading, active, onClick }) {
  const count = useCountUp(loading ? 0 : stat.value);
  return (
    <button
      onClick={onClick}
      className={`text-left bg-white/70 rounded-xl p-5 border shadow-sm transition-all duration-300 cursor-pointer
        hover:-translate-y-1.5 hover:shadow-xl ${stat.ring} ${
        active ? "border-blue-400 ring-2 ring-blue-200" : "border-slate-200"
      }`}
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 transition-transform duration-300 hover:scale-110 hover:rotate-3`}>
        <stat.icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-bold text-slate-800 tabular-nums">{loading ? "…" : count}</div>
      <div className="text-xs text-slate-500 flex items-center gap-1">
        {stat.label}
        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100" />
      </div>
    </button>
  );
}
