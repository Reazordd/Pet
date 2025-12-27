// ViewStatsChart.jsx
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ViewStatsChart({ petId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/pets/${petId}/stats/`);
        const chartData = {
          labels: res.data.map(item => new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })),
          datasets: [{
            label: 'Просмотры',
            data: res.data.map(item => item.count),
            borderColor: '#0071f0',
            backgroundColor: 'rgba(0, 113, 240, 0.1)',
            tension: 0.3,
            fill: true
          }]
        };
        setData(chartData);
      } catch (err) {
        console.warn('Статистика недоступна');
      }
    };
    fetchStats();
  }, [petId]);

  if (!data) return <p className="text-gray-500 text-sm">Загрузка статистики...</p>;

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Просмотры за неделю</h4>
      <Line data={data} options={{ responsive: true, plugins: { legend: { display: false } }}} />
    </div>
  );
}