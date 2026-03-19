import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RadarOECD({ scores = {} }) {
  if (!scores || Object.keys(scores).length === 0) {
    return (
      <div className="empty-state-mini" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌍</div>
        <p>No OECD data yet — complete the assessment to see your radar.</p>
      </div>
    );
  }
  const labels = Object.keys(scores);
  const values = Object.values(scores);

  const data = {
    labels,
    datasets: [
      {
        label: 'OECD Score',
        data: values,
        fill: true,
        backgroundColor: 'rgba(124, 111, 239, 0.18)',
        borderColor: 'rgba(124, 111, 239, 0.9)',
        pointBackgroundColor: '#7c6fef',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#7c6fef',
      },
    ],
  };

  const options = {
    responsive: true,
    animation: { duration: 1000 },
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0, max: 10,
        ticks: { stepSize: 2, color: '#5a607a', backdropColor: 'transparent', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.07)' },
        angleLines: { color: 'rgba(255,255,255,0.07)' },
        pointLabels: { color: '#9197b3', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="chart-wrap" style={{ maxWidth: 420, margin: '0 auto' }}>
      <Radar data={data} options={options} />
    </div>
  );
}
