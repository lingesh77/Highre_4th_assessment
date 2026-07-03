import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, Zap } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import BandChart from "../components/charts/BandChart";
import GradientButton from "../components/ui/GradientButton";
import { usePersistedState } from "../hooks/usePersistedState";

const CLUSTERS = [
  { id: "cluster-a", label: "Cluster A" },
  { id: "cluster-b", label: "Cluster B" },
];

export default function ChartsPage() {
  const [cluster, setCluster] = usePersistedState("highre_selected_cluster", "cluster-a");
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSeries = useCallback((clusterId) => {
    setLoading(true);
    api
      .get(`/metrics/${clusterId}?limit=200`)
      .then((res) => setPoints(res.data.points))
      .catch(() => toast.error("Failed to load cluster metrics."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSeries(cluster);
  }, [cluster, fetchSeries]);

  const handleSimulatePoint = async () => {
    const last = points[points.length - 1];
    const base = last ? last.median : 45;
    const median = Math.round(base + (Math.random() * 6 - 3));
    const min = Math.round(median - (5 + Math.random() * 5));
    const max = Math.round(median + (5 + Math.random() * 5));

    try {
      await api.post(`/metrics/${cluster}`, { min, max, median });
      toast.success("New data point recorded.");
      fetchSeries(cluster);
    } catch {
      toast.error("Failed to record data point.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cluster Metrics — Band Chart</h2>
          <p className="text-sm text-slate-500">Min / Max / Median over time, time-based X axis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            {CLUSTERS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCluster(c.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  cluster === c.id ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchSeries(cluster)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <GradientButton onClick={handleSimulatePoint} className="!py-2 !px-3 text-sm" variant="success">
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> Simulate reading</span>
          </GradientButton>
        </div>
      </div>

      <div className="bg-white/80 rounded-xl border border-slate-200 p-4">
        {loading ? (
          <div className="h-80 flex items-center justify-center text-slate-400">Loading chart…</div>
        ) : points.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-slate-400">
            No data yet — click "Simulate reading" or run the backend seed script.
          </div>
        ) : (
          <BandChart points={points} clusterName={CLUSTERS.find((c) => c.id === cluster)?.label} />
        )}
      </div>
    </div>
  );
}
