import { useState } from "react";
import { Line } from "react-chartjs-2";
import "../chartSetup";
import { formatClock } from "../data/mockData";

const METRICS = {
  rainfall: { en: "Rainfall", id: "Curah Hujan", unit: "mm/h", color: "#0d9488" },
  waterLevel: { en: "Water Level", id: "Tinggi Muka Air", unit: "cm", color: "#0f4c81" },
  flow: { en: "Flow", id: "Debit Air", unit: "m³/s", color: "#7c3aed" },
};

export default function SensorChart({ series, locale = "en" }) {
  const [metric, setMetric] = useState("waterLevel");
  const [mode, setMode] = useState("now");

  const def = METRICS[metric];
  const points = mode === "now" ? series.now : series.forecast;
  const labels = points.map((p) => formatClock(p.t));
  const values = points.map((p) => p[metric]);

  const data = {
    labels,
    datasets: [
      {
        label: locale === "id" ? def.id : def.en,
        data: values,
        borderColor: def.color,
        backgroundColor: `${def.color}22`,
        pointRadius: mode === "now" ? 0 : 3,
        pointBackgroundColor: def.color,
        borderDash: mode === "forecast" ? [6, 4] : undefined,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.formattedValue} ${def.unit}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 7, font: { size: 10.5 } } },
      y: { grid: { color: "#eef1f5" }, ticks: { font: { size: 10.5 } } },
    },
  };

  return (
    <div>
      <div className="sensor-chart__controls">
        <div className="pill-tabs">
          {Object.keys(METRICS).map((key) => (
            <button key={key} className={metric === key ? "active" : ""} onClick={() => setMetric(key)}>
              {locale === "id" ? METRICS[key].id : METRICS[key].en}
            </button>
          ))}
        </div>
        <div className="pill-tabs pill-tabs--ghost">
          <button className={mode === "now" ? "active" : ""} onClick={() => setMode("now")}>
            {locale === "id" ? "Saat Ini" : "Now"}
          </button>
          <button className={mode === "forecast" ? "active" : ""} onClick={() => setMode("forecast")}>
            {locale === "id" ? "Prakiraan" : "Forecast"}
          </button>
        </div>
      </div>
      <div className="sensor-chart__canvas">
        <Line data={data} options={options} />
      </div>
      <div className="sensor-chart__caption muted">
        {mode === "now"
          ? locale === "id"
            ? "24 jam terakhir (data aktual)"
            : "Last 24 hours (actual readings)"
          : locale === "id"
            ? "Prakiraan 12 jam ke depan (model)"
            : "Next 12 hours (model forecast)"}
      </div>
    </div>
  );
}
