import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function TrendLine({ history = [] }) {
  // Aggregate history by date to avoid duplication
  const dailyData = (Array.isArray(history) ? history : []).reduce((acc, row) => {
    const dateKey = new Date(row.created_at || row.date).toISOString().split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = { date: dateKey, oecd: null, perma: null };

    const calculateAvg = (scores) => {
      const vals = Object.values(scores || {});
      return vals.length ? (vals.reduce((sum, val) => sum + Number(val), 0) / vals.length) : null;
    };

    const oecdAvg = calculateAvg(row.oecd_scores || row.scores?.oecd);
    const permaAvg = calculateAvg(row.perma_scores || row.scores?.perma);

    if (oecdAvg !== null) acc[dateKey].oecd = oecdAvg;
    if (permaAvg !== null) acc[dateKey].perma = permaAvg;

    return acc;
  }, {});

  const sortedDaily = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

  const labels = sortedDaily.map(d => {
    try { return format(new Date(d.date), 'MMM d'); } catch { return ''; }
  });

  const oecdAvgData = sortedDaily.map(d => d.oecd !== null ? d.oecd.toFixed(1) : null);
  const permaAvgData = sortedDaily.map(d => d.perma !== null ? d.perma.toFixed(1) : null);

  const data = {
    labels,
    datasets: [
      {
        label: 'OECD Avg',
        data: oecdAvgData,
        borderColor: '#7c6fef',
        backgroundColor: 'rgba(124, 111, 239, 0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'PERMA Avg',
        data: permaAvgData,
        borderColor: '#5cbcf0',
        backgroundColor: 'rgba(92, 188, 240, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: { intersect: false, mode: 'index' },
    animation: { duration: 1000 },
    plugins: {
      legend: {
        labels: { color: '#9197b3', usePointStyle: true, pointStyleWidth: 10 },
      },
    },
    scales: {
      y: {
        min: 0, max: 10,
        ticks: { color: '#9197b3', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      x: {
        ticks: { color: '#9197b3', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="chart-wrap">
      <Line data={data} options={options} />
    </div>
  );
}
