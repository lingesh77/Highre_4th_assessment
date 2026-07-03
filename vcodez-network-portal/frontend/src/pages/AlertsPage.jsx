import React, { useEffect, useState } from "react";
import {
  Send,
  Mail,
  ServerCrash,
  CheckCircle2,
  XCircle,
  UserPlus,
  KeyRound,
  Radio,
  Inbox,
  Sparkles,
  Clock,
  History,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import GradientButton from "../components/ui/GradientButton";
import TextField from "../components/ui/TextField";
import { useAuth } from "../context/AuthContext";
import { usePersistedState } from "../hooks/usePersistedState";

const SEVERITIES = [
  { value: "info", label: "Info", color: "bg-cyan-100 text-cyan-700 border-cyan-200 ring-cyan-300" },
  { value: "warning", label: "Warning", color: "bg-amber-100 text-amber-700 border-amber-200 ring-amber-300" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700 border-red-200 ring-red-300" },
];

// Icons chosen to actually reflect what this system does — account/security
// flows plus real network hardware (a switch/cluster going down), instead of
// a generic warning glyph.
const EMAIL_FLOWS = [
  {
    icon: UserPlus,
    title: "Account Creation",
    desc: "Sent automatically on Sign Up",
    gradient: "from-blue-500 to-cyan-500",
    ring: "hover:shadow-blue-200/70 hover:border-blue-200",
  },
  {
    icon: KeyRound,
    title: "Password Reset",
    desc: "Sent automatically on Forgot Password",
    gradient: "from-violet-500 to-purple-600",
    ring: "hover:shadow-violet-200/70 hover:border-violet-200",
  },
  {
    icon: ServerCrash,
    title: "Cluster Alert",
    desc: "Trigger manually below, or from monitoring",
    gradient: "from-rose-500 to-red-600",
    ring: "hover:shadow-rose-200/70 hover:border-rose-200",
  },
];

const PIPELINE_STEPS = [
  { icon: Send, title: "Triggered", desc: "Manually here, or by cluster monitoring" },
  { icon: Radio, title: "Relayed", desc: "Queued through the SMTP relay" },
  { icon: Inbox, title: "Delivered", desc: "Lands in the recipient's inbox" },
];

const TIPS = [
  "Reserve Critical for active outages — it skips straight to on-call inboxes.",
  "Leave Recipient Email blank to default to your own account address.",
  "Cluster Name should match the identifier shown on the dashboard exactly.",
];

export default function AlertsPage() {
  const { user } = useAuth();
  const [form, setForm] = usePersistedState("highre_alert_draft", {
    clusterName: "cluster-a",
    issue: "",
    severity: "warning",
    recipientEmail: "",
  });
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [lastSentAt, setLastSentAt] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get("/alerts", { params: { limit: 10 } });
      setHistory(res.data.alerts || []);
    } catch {
      // Non-fatal — the send flow still works even if history can't load.
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.issue.trim()) return toast.warn("Please describe the issue.");
    setSending(true);
    setLastResult(null);
    try {
      const res = await api.post("/alerts/cluster-issue", {
        clusterName: form.clusterName,
        issue: form.issue,
        severity: form.severity,
        recipientEmail: form.recipientEmail || undefined,
      });
      toast.success(res.data.message);
      setLastResult(res.data);
      setLastSentAt(new Date());
      setForm({ ...form, issue: "" });
      loadHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send alert email.");
    } finally {
      setSending(false);
    }
  };

  const activeSeverity = SEVERITIES.find((s) => s.value === form.severity);
  const severityMeta = (value) => SEVERITIES.find((s) => s.value === value) || SEVERITIES[0];

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Alerts &amp; Email Notifications</h2>
        <p className="text-sm text-slate-500 mt-1">Account, password reset, and cluster alert emails.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {EMAIL_FLOWS.map((f) => (
          <div
            key={f.title}
            className={`group bg-white/70 rounded-2xl p-6 border border-slate-200 shadow-sm
              transition-all duration-300 ease-out cursor-default
              hover:-translate-y-2 hover:shadow-xl ${f.ring}`}
          >
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4
                shadow-md transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3`}
            >
              <f.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">{f.title}</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        <form
          onSubmit={handleSend}
          className="bg-white/80 rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6
            transition-shadow duration-300 hover:shadow-lg"
        >
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-base">
            <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600" />
            </span>
            Send Cluster Issue Alert
          </h3>

          <TextField
            label="Cluster Name"
            value={form.clusterName}
            onChange={(e) => setForm({ ...form, clusterName: e.target.value })}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Issue Description</label>
            <textarea
              value={form.issue}
              onChange={(e) => setForm({ ...form, issue: e.target.value })}
              placeholder="e.g. High packet loss detected on uplink port 3"
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Severity</label>
            <div className="flex gap-2">
              {SEVERITIES.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => setForm({ ...form, severity: s.value })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200
                    hover:-translate-y-0.5 hover:shadow-sm ${
                    form.severity === s.value ? s.color + " ring-2 ring-offset-1" : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <TextField
            label={`Recipient Email (optional — defaults to ${user?.email || "your account email"})`}
            type="email"
            placeholder={user?.email}
            value={form.recipientEmail}
            onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
          />

          <GradientButton
            type="submit"
            disabled={sending}
            variant="danger"
            className="w-full transition-transform duration-200 hover:-translate-y-0.5"
          >
            <span className="flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send Alert Email"}
            </span>
          </GradientButton>

          {lastResult && (
            <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 mt-0.5" />
              <span>{lastResult.message}</span>
            </div>
          )}
        </form>

        <div className="space-y-6">
          <div className="bg-white/70 rounded-2xl border border-slate-200 shadow-sm p-6 transition-shadow duration-300 hover:shadow-lg">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Delivery Pipeline
            </h4>
            <div className="space-y-0">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step.title} className="flex gap-3 group">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center
                        text-slate-500 transition-all duration-300 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 group-hover:scale-110"
                    >
                      <step.icon className="w-3.5 h-3.5" />
                    </div>
                    {i < PIPELINE_STEPS.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm font-medium text-slate-800">{step.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/70 rounded-2xl border border-slate-200 shadow-sm p-6 transition-shadow duration-300 hover:shadow-lg">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-slate-500" />
              Last Alert This Session
            </h4>
            {lastResult ? (
              <div className="space-y-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${activeSeverity.color}`}
                >
                  {activeSeverity.label}
                </span>
                <p className="text-sm text-slate-600">{lastResult.message}</p>
                {lastSentAt && (
                  <p className="text-xs text-slate-400">{lastSentAt.toLocaleTimeString()}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No alerts sent yet this session.</p>
            )}
          </div>

          <div className="bg-white/70 rounded-2xl border border-slate-200 shadow-sm p-6 transition-shadow duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-500" />
                Recent Alerts
              </h4>
              <button
                type="button"
                onClick={loadHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            {historyLoading ? (
              <p className="text-xs text-slate-400">Loading…</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-400">No alerts stored yet. Sent alerts are persisted to Redis.</p>
            ) : (
              <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {history.map((a) => {
                  const meta = severityMeta(a.severity);
                  return (
                    <li key={a.id} className="flex items-start gap-2.5 text-xs border-b border-slate-100 last:border-0 pb-2.5 last:pb-0">
                      {a.status === "failed" ? (
                        <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-700">{a.clusterName}</span>
                          <span className={`px-1.5 py-0.5 rounded-full border text-[10px] font-semibold ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-0.5 truncate">{a.issue}</p>
                        <p className="text-slate-400 mt-0.5">
                          {a.sentBy} · {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-blue-50/60 rounded-2xl border border-slate-200 p-6">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Tips</h4>
            <ul className="space-y-2.5">
              {TIPS.map((tip) => (
                <li key={tip} className="text-xs text-slate-600 leading-relaxed flex gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
