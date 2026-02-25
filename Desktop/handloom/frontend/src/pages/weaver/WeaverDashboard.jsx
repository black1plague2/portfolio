import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWeaverSubOrders } from '../../redux/slices/orderSlice';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';
import { useState } from 'react';

export default function WeaverDashboard() {
  const dispatch = useDispatch();
  const { subOrders, isLoading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);
  const [capacity, setCapacity] = useState(null);
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    dispatch(fetchWeaverSubOrders({ limit: 5 }));
    api.get('/weaver/capacity').then((r) => setCapacity(r.data.data.capacity));
    api.get('/weaver/earnings').then((r) => setEarnings(r.data.data));
  }, [dispatch]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    const nodes = document.querySelectorAll('[data-reveal]');
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [subOrders, capacity, earnings]);

  const active = subOrders.filter((s) => ['accepted', 'in_progress', 'pending_acceptance'].includes(s.status)).length;

  const stats = [
    { label: 'Active Sub-Orders', value: active, icon: '📦', color: 'bg-blue-50 text-blue-700' },
    { label: 'Available Capacity', value: capacity?.availableCapacity ?? '—', icon: '⚙️', color: 'bg-green-50 text-green-700' },
    { label: 'Total Earnings', value: earnings ? `₹${earnings.totalEarnings.toLocaleString()}` : '—', icon: '💰', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Rating', value: user?.rating?.toFixed(1) || '—', icon: '⭐', color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-heritage-sand/60 bg-white/85 backdrop-blur shadow-[0_20px_40px_-32px_rgba(0,0,0,0.4)] px-5 py-4 reveal" data-reveal>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-heritage-maroon/70">Weaver Ops</p>
            <h1 className="text-2xl font-serif text-heritage-charcoal">Prime-style seller console</h1>
            <p className="text-sm text-heritage-charcoal/70">Capacity, earnings, and live sub-orders like an Amazon Seller dashboard.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a href="/weaver/capacity" className="px-4 py-2 rounded-lg bg-heritage-maroon text-white text-sm shadow hover:-translate-y-0.5 transition-all">Update capacity</a>
            <a href="/weaver/orders" className="px-4 py-2 rounded-lg border border-heritage-sand text-heritage-charcoal text-sm bg-white hover:-translate-y-0.5 transition-all">View orders</a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-reveal>
        {stats.map((s) => (
          <div key={s.label} className={`card flex items-center gap-4 bg-gradient-to-br from-white to-heritage-beige/30 reveal`} data-reveal>
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold text-heritage-charcoal">{s.value}</p>
              <p className="text-sm font-medium text-heritage-charcoal/80">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-reveal>
        <div className="card reveal" data-reveal>
          <h2 className="text-lg font-semibold text-heritage-charcoal mb-4">Recent Sub-Orders</h2>
          {isLoading ? (
            <Loader />
          ) : subOrders.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No sub-orders yet. Keep your capacity updated to receive assignments.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">Stage</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {subOrders.slice(0, 5).map((so) => (
                    <tr key={so._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-mono text-xs text-gray-500">{so._id.slice(-6).toUpperCase()}</td>
                      <td className="py-3">{so.quantity} units</td>
                      <td className="py-3 capitalize">{so.productionStage?.replace(/_/g, ' ')}</td>
                      <td className="py-3"><StatusBadge status={so.status} /></td>
                      <td className="py-3">{so.deadline ? new Date(so.deadline).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card reveal" data-reveal>
          <h3 className="text-sm font-semibold text-heritage-charcoal mb-3">Quick actions</h3>
          <div className="space-y-2">
            <a href="/weaver/orders" className="flex items-center justify-between px-3 py-2 rounded-lg bg-heritage-maroon/5 hover:bg-heritage-maroon/10 text-sm text-heritage-charcoal">
              <span>View all orders</span><span>→</span>
            </a>
            <a href="/weaver/earnings" className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-sm text-heritage-charcoal">
              <span>Earnings</span><span>→</span>
            </a>
            <a href="/weaver/capacity" className="flex items-center justify-between px-3 py-2 rounded-lg bg-heritage-mustard/10 hover:bg-heritage-mustard/20 text-sm text-heritage-charcoal">
              <span>Update capacity</span><span>→</span>
            </a>
          </div>
        </div>

        <div className="card reveal" data-reveal>
          <h3 className="text-sm font-semibold text-heritage-charcoal mb-3">Health</h3>
          <div className="space-y-2 text-sm text-heritage-charcoal/80">
            <div className="flex items-center justify-between">
              <span>Active orders</span>
              <span className="font-semibold">{active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Available capacity</span>
              <span className="font-semibold">{capacity?.availableCapacity ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total earnings</span>
              <span className="font-semibold">{earnings ? `₹${earnings.totalEarnings.toLocaleString()}` : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
