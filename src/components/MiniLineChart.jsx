import { Line } from "react-chartjs-2";
import "../chartSetup";

export default function MiniLineChart({ labels, values, color, unit, height = 160 }) {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: color,
        backgroundColor: `${color}1f`,
        borderWidth: 2.5,
        pointRadius: 0,
        fill: true,
        tension: 0.3,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.formattedValue}${unit || ""}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 6, font: { size: 10.5 } } },
      y: { grid: { color: "#eef1f5" }, ticks: { font: { size: 10.5 } } },
    },
  };
  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
}
