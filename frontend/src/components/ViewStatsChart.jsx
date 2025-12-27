// frontend/src/components/ViewStatsChart.jsx
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip } from 'chart.js';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);

export default function ViewStatsChart({ petId }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/pets/${petId}/stats/`);
        const labels = res.data.map(item =>
          new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
        );
        const counts = res.data.map(item => item.count);

        setChartData({
          labels,
          datasets: [{
            data: counts,
            borderColor: '#0071f0',
            backgroundColor: 'rgba(0, 113, 240, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5
          }]
        });
      } catch (err) {
        console.warn('Статистика недоступна');
      }
    };
    fetchStats();
  }, [petId]);

  if (!chartData) return null;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Просмотры: ${context.raw}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  return (
    <div className="mt-4" style={{ height: '200px' }}>
      <h4 className="font-medium mb-2 text-gray-700">Просмотры за неделю</h4>
      <Line data={chartData} options={options} />
    </div>
  );
}