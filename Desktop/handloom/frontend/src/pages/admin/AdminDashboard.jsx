import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((r) => { setStats(r.data.data); setIsLoading(false); });
  }, []);

  useEffect(() => {
    if (!stats) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
    );
    const nodes = document.querySelectorAll('[data-reveal]');
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [stats]);

  const statusColors = { pending: '#f59e0b', confirmed: '#3b82f6', in_production: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444' };

  const doughnutData = useMemo(() => ({
    labels: (stats?.ordersByStatus || []).map((s) => s._id),
    datasets: [
      {
        data: (stats?.ordersByStatus || []).map((s) => s.count),
        backgroundColor: (stats?.ordersByStatus || []).map((s) => statusColors[s._id] || '#6b7280'),
        borderWidth: 2,
      },
    ],
  }), [stats]);

  if (isLoading || !stats) return <Loader />;

  const quickNav = [
    { label: 'Orders', value: stats.totalOrders, accent: 'from-heritage-mustard to-amber-200', pill: 'Live' },
    { label: 'Design Requests', value: stats.totalProducts, accent: 'from-heritage-maroon to-rose-200', pill: 'Queue' },
    { label: 'Weavers', value: stats.totalUsers, accent: 'from-heritage-green to-emerald-200', pill: 'Network' },
    { label: 'Revenue', value: `₹${stats.platformRevenue?.toLocaleString()}`, accent: 'from-heritage-sand to-amber-100', pill: 'MTD' },
  ];

  const vibes = [
    { title: 'Fulfilment rhythm', detail: `${stats.fulfillmentRate || 0}% on-time`, hint: 'Track delays before they snowball' },
    { title: 'Quality cadence', detail: `${stats.qaPassRate || 0}% QA pass`, hint: 'Escalate repeated rework' },
    { title: 'Capacity pulse', detail: `${stats.activeWeavers || 0} active looms`, hint: 'Balance north/south clusters' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-heritage-sand/50 bg-white/70 backdrop-blur shadow-[0_20px_50px_-35px_rgba(0,0,0,0.4)] overflow-hidden reveal" data-reveal>
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-heritage-sand/60 via-white to-heritage-beige/60" />
          <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-heritage-maroon/5 blur-3xl" />
          <div className="absolute -right-6 -bottom-10 h-40 w-40 rounded-full bg-heritage-mustard/10 blur-2xl" />
          <div className="relative px-6 md:px-8 py-5 border-b border-heritage-sand/50 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between animate-[slideDown_300ms_ease]">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-heritage-maroon/70">Admin Control</p>
              <h1 className="text-3xl font-serif text-heritage-charcoal">Command Center</h1>
              <p className="text-sm text-heritage-charcoal/70">Top-level health of artisan supply chain, surfaced like the landing textures.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button className="px-4 py-2 rounded-full bg-heritage-charcoal text-white shadow-md shadow-heritage-charcoal/20 hover:-translate-y-0.5 transition-all">Run audit</button>
              <button className="px-4 py-2 rounded-full bg-white text-heritage-charcoal border border-heritage-sand hover:-translate-y-0.5 transition-all">Export report</button>
              <button className="px-4 py-2 rounded-full bg-heritage-mustard/70 text-heritage-charcoal font-semibold hover:-translate-y-0.5 transition-all">Broadcast update</button>
            </div>
          </div>
          <div className="relative grid grid-cols-2 md:grid-cols-4 divide-x divide-heritage-sand/50 bg-white/60">
            {quickNav.map((item) => (
              <div key={item.label} className="p-4 md:p-5 group transition-all duration-300 hover:bg-gradient-to-br hover:from-white hover:to-heritage-beige/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-heritage-charcoal/80 text-white uppercase tracking-wide">{item.pill}</span>
                  <span className="w-2 h-2 rounded-full bg-heritage-maroon animate-pulse" />
                </div>
                <p className="text-sm text-heritage-charcoal/70">{item.label}</p>
                <p className="text-2xl font-semibold text-heritage-charcoal">{item.value}</p>
                <div className={`mt-3 h-1.5 rounded-full bg-gradient-to-r ${item.accent} group-hover:scale-x-105 origin-left transition-transform`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {vibes.map((item, idx) => (
          <div
            key={item.title}
            className="relative overflow-hidden rounded-2xl border border-heritage-sand/70 bg-gradient-to-br from-white via-heritage-beige/40 to-white shadow-[0_20px_40px_-35px_rgba(0,0,0,0.5)] p-5 md:p-6 reveal"
            data-reveal
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(125,64,52,0.06),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(240,204,80,0.08),transparent_30%)]" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-heritage-maroon/70">{item.title}</p>
                <p className="text-2xl font-semibold text-heritage-charcoal mt-1">{item.detail}</p>
                <p className="text-sm text-heritage-charcoal/70 mt-2">{item.hint}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/60 border border-heritage-sand flex items-center justify-center text-lg">✦</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card backdrop-blur bg-white/80 border border-heritage-sand/60 shadow-[0_24px_45px_-32px_rgba(0,0,0,0.45)] reveal" data-reveal>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-heritage-charcoal">Orders by Status</h2>
              <p className="text-xs text-heritage-charcoal/60">Live mix across the funnel</p>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full bg-heritage-mustard/70 text-heritage-charcoal">Realtime</span>
          </div>
          <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        </div>

        <div className="card backdrop-blur bg-white/80 border border-heritage-sand/60 shadow-[0_24px_45px_-32px_rgba(0,0,0,0.45)] reveal" data-reveal>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-heritage-charcoal">Top Weavers</h2>
              <p className="text-xs text-heritage-charcoal/60">Best performers this cycle</p>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full bg-heritage-charcoal text-white">Incentives</span>
          </div>
          <div className="space-y-3">
            {stats.topWeavers.map((w, i) => (
              <div key={w._id} className="flex items-center justify-between rounded-xl border border-heritage-sand/70 bg-white/70 px-3 py-2.5 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-heritage-maroon/80 text-white rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-heritage-charcoal">{w.weaver?.name}</p>
                    <p className="text-xs text-heritage-charcoal/60">{w.weaver?.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-heritage-charcoal">₹{w.totalEarnings?.toLocaleString()}</p>
                  <p className="text-[11px] text-heritage-charcoal/60">{w.ordersCompleted} orders</p>
                </div>
              </div>
            ))}
            {stats.topWeavers.length === 0 && <p className="text-heritage-charcoal/50 text-sm text-center py-4">No completed orders yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
