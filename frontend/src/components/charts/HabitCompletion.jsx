import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function HabitCompletion({ completed = 0, total = 7 }) {
  const remaining = Math.max(0, total - completed);

  const data = {
    datasets: [
      {
        data: [completed, remaining],
        backgroundColor: ['rgba(76, 175, 138, 0.85)', 'rgba(255, 255, 255, 0.07)'],
        borderColor: ['#4caf8a', 'rgba(255,255,255,0.05)'],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
    labels: ['Completed', 'Remaining'],
  };

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const options = {
    responsive: true,
    cutout: '72%',
    animation: { duration: 1000 },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item) => ` ${item.label}: ${item.raw}`,
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', maxWidth: 180, margin: '0 auto' }}>
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4caf8a' }}>{pct}%</span>
        <span style={{ fontSize: '0.7rem', color: '#9197b3' }}>done</span>
      </div>
    </div>
  );
}
