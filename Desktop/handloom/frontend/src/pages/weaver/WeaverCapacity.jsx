import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

export default function WeaverCapacity() {
  const [capacity, setCapacity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ loomCount: '', avgProductionPerDay: '', maxCapacityPerMonth: '', downtimeDays: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/weaver/capacity').then((r) => {
      const c = r.data.data.capacity;
      setCapacity(c);
      if (c) setForm({ loomCount: c.loomCount, avgProductionPerDay: c.avgProductionPerDay, maxCapacityPerMonth: c.maxCapacityPerMonth, downtimeDays: c.downtimeDays });
      setIsLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/weaver/capacity', form);
      setCapacity(res.data.data.capacity);
      toast.success('Capacity updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  if (isLoading) return <Loader />;

  const available = capacity ? Math.max(0, capacity.maxCapacityPerMonth - capacity.activeOrderQuantity) : 0;
  const pct = capacity ? Math.round((capacity.activeOrderQuantity / capacity.maxCapacityPerMonth) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Loom Capacity</h1>

      {capacity && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-green-50">
            <p className="text-sm text-green-700 font-medium">Available Capacity</p>
            <p className="text-3xl font-bold text-green-800 mt-1">{capacity.availableCapacity} <span className="text-base font-normal">units</span></p>
          </div>
          <div className="card bg-blue-50">
            <p className="text-sm text-blue-700 font-medium">Active Orders</p>
            <p className="text-3xl font-bold text-blue-800 mt-1">{capacity.activeOrderQuantity} <span className="text-base font-normal">units</span></p>
          </div>
          <div className="card bg-orange-50">
            <p className="text-sm text-orange-700 font-medium">Capacity Used</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-orange-700 mb-1"><span>0</span><span>{pct}%</span><span>{capacity.maxCapacityPerMonth}</span></div>
              <div className="w-full bg-orange-200 rounded-full h-2.5"><div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${pct}%` }} /></div>
            </div>
          </div>
        </div>
      )}

      <div className="card max-w-lg">
        <h2 className="text-lg font-semibold mb-4">{capacity ? 'Update' : 'Set'} Capacity</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Number of Looms</label><input type="number" className="input" value={form.loomCount} onChange={(e) => setForm({ ...form, loomCount: e.target.value })} required /></div>
          <div><label className="label">Avg Production / Day (units)</label><input type="number" className="input" value={form.avgProductionPerDay} onChange={(e) => setForm({ ...form, avgProductionPerDay: e.target.value })} required /></div>
          <div><label className="label">Max Capacity / Month (units)</label><input type="number" className="input" value={form.maxCapacityPerMonth} onChange={(e) => setForm({ ...form, maxCapacityPerMonth: e.target.value })} required /></div>
          <div><label className="label">Downtime Days / Month</label><input type="number" className="input" value={form.downtimeDays} onChange={(e) => setForm({ ...form, downtimeDays: e.target.value })} /></div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Capacity'}</button>
        </form>
      </div>
    </div>
  );
}
