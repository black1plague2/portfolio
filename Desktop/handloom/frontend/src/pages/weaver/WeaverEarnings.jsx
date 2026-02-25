import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function WeaverEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/weaver/earnings').then((r) => { setEarnings(r.data.data); setIsLoading(false); });
  }, []);

  if (isLoading) return <Loader />;

  const months = earnings ? Object.keys(earnings.monthly).sort() : [];
  const values = months.map((m) => earnings.monthly[m]);

  const chartData = {
    labels: months,
    datasets: [{
      label: 'Monthly Earnings (₹)',
      data: values,
      backgroundColor: '#d9531e',
      borderRadius: 4,
    }],
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card bg-yellow-50">
          <p className="text-sm text-yellow-700 font-medium">Gross Earnings</p>
          <p className="text-3xl font-bold text-yellow-800 mt-1">₹{earnings?.totalEarnings?.toLocaleString() || 0}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-green-700 font-medium">Net Earnings (after 8% commission)</p>
          <p className="text-3xl font-bold text-green-800 mt-1">₹{earnings?.netEarnings?.toLocaleString() || 0}</p>
        </div>
        <div className="card bg-blue-50">
          <p className="text-sm text-blue-700 font-medium">Completed Orders</p>
          <p className="text-3xl font-bold text-blue-800 mt-1">{earnings?.orders || 0}</p>
        </div>
      </div>

      {months.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Monthly Earnings Chart</h2>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
      )}
    </div>
  );
}
