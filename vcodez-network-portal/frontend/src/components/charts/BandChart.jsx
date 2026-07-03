import React, { useMemo, useRef, useState } from "react";
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import TimestampModal from "./TimestampModal";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function BandChart({ points, clusterName }) {
  const chartRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);

  const data = useMemo(() => {
    const labels = points.map((p) => p.t);
    return {
      labels,
      datasets: [
        {
          label: "Max",
          data: points.map((p) => ({ x: p.t, y: p.max })),
          borderColor: "rgba(6, 182, 212, 0.9)",
          backgroundColor: "rgba(6, 182, 212, 0.12)",
          pointRadius: 0,
          borderWidth: 1.5,
          fill: "+1", // fill down to Min dataset -> creates the "band"
          tension: 0.3,
        },
        {
          label: "Min",
          data: points.map((p) => ({ x: p.t, y: p.min })),
          borderColor: "rgba(59, 130, 246, 0.9)",
          backgroundColor: "rgba(59, 130, 246, 0.08)",
          pointRadius: 0,
          borderWidth: 1.5,
          fill: false,
          tension: 0.3,
        },
        {
          label: "Median",
          data: points.map((p) => ({ x: p.t, y: p.median })),
          borderColor: "rgba(16, 185, 129, 1)",
          backgroundColor: "rgba(16, 185, 129, 1)",
          pointRadius: 0,
          borderWidth: 2.5,
          fill: false,
          tension: 0.3,
        },
      ],
    };
  }, [points]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "top", labels: { usePointStyle: true, color: "#334155" } },
        tooltip: {
          backgroundColor: "#0f172a",
          padding: 10,
          titleFont: { size: 12 },
          bodyFont: { size: 12 },
        },
      },
      scales: {
        x: {
          type: "time",
          time: { unit: "minute", tooltipFormat: "MMM d, HH:mm:ss" },
          grid: { color: "rgba(148,163,184,0.15)" },
          ticks: { color: "#64748b", maxRotation: 0 },
        },
        y: {
          grid: { color: "rgba(148,163,184,0.15)" },
          ticks: { color: "#64748b" },
        },
      },
    }),
    []
  );

  return (
    <div>
      <div
        className="h-80 sm:h-96 cursor-pointer"
        title="Double-click the chart to view timestamped data"
        onDoubleClick={() => setModalOpen(true)}
      >
        <Line ref={chartRef} data={data} options={options} />
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">Double-click the chart to view raw timestamped data</p>

      <TimestampModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        points={points}
        clusterName={clusterName}
      />
    </div>
  );
}
