import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';

export default function DesignerDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/designer/requests')
      .then((r) => setRequests(r.data.data?.requests || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

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
  }, [requests]);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => ['draft', 'submitted'].includes(r.status)).length,
    inProgress: requests.filter((r) => ['quoted', 'sample_in_progress', 'sample_ready', 'approved', 'in_production'].includes(r.status)).length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-heritage-sand/60 bg-white/85 backdrop-blur shadow-[0_20px_40px_-32px_rgba(0,0,0,0.4)] px-5 py-4 reveal" data-reveal>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-heritage-maroon/70">Designer Studio</p>
            <h1 className="text-2xl font-serif text-heritage-charcoal">Amazon-Style workspace for briefs</h1>
            <p className="text-sm text-heritage-charcoal/70">Stage requests, quote fast, and move to production.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/designer/requests" className="px-4 py-2 rounded-lg bg-heritage-maroon text-white text-sm shadow hover:-translate-y-0.5 transition-all">+ New Request</Link>
            <Link to="/designer/requests" className="px-4 py-2 rounded-lg border border-heritage-sand text-heritage-charcoal text-sm bg-white hover:-translate-y-0.5 transition-all">View All</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-reveal>
        {[
          { label: 'Total Requests', value: stats.total, accent: 'from-heritage-mustard/30 to-amber-50' },
          { label: 'Pending', value: stats.pending, accent: 'from-heritage-maroon/20 to-rose-50' },
          { label: 'In Progress', value: stats.inProgress, accent: 'from-heritage-indigo/20 to-indigo-50' },
          { label: 'Completed', value: stats.completed, accent: 'from-heritage-green/20 to-emerald-50' },
        ].map((s) => (
          <div key={s.label} className={`card bg-gradient-to-br ${s.accent} reveal`} data-reveal>
            <div className="text-3xl font-bold text-heritage-charcoal mb-1">{s.value}</div>
            <div className="text-sm text-heritage-charcoal/70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Kanban-ish lanes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-reveal>
        {[
          { title: 'To Quote', filter: ['draft', 'submitted'], accent: 'bg-heritage-maroon/5' },
          { title: 'In Progress', filter: ['quoted', 'sample_in_progress', 'sample_ready', 'approved', 'in_production'], accent: 'bg-heritage-mustard/10' },
          { title: 'Completed', filter: ['completed'], accent: 'bg-emerald-50' },
        ].map((lane) => (
          <div key={lane.title} className="card reveal" data-reveal>
            <h3 className="text-sm font-semibold text-heritage-charcoal mb-3">{lane.title}</h3>
            <div className="space-y-2">
              {requests.filter((r) => lane.filter.includes(r.status)).slice(0, 4).map((r) => (
                <div key={r._id} className={`p-3 rounded-lg ${lane.accent} flex items-center justify-between`}> 
                  <div>
                    <p className="text-sm font-medium text-heritage-charcoal">{r.title}</p>
                    <p className="text-[11px] text-heritage-charcoal/60">{r.fabricType} · {r.weaveType}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
              {requests.filter((r) => lane.filter.includes(r.status)).length === 0 && (
                <p className="text-xs text-heritage-charcoal/50 text-center py-4">Nothing here yet</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent requests */}
      <div className="card reveal" data-reveal>
        <h2 className="text-base font-semibold mb-4 text-heritage-charcoal">Recent Design Requests</h2>
        {isLoading ? <Loader /> : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-sm">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.fabricType} · {r.weaveType}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{r.quotes?.length || 0} quotes</span>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
            {requests.length === 0 && <p className="text-gray-400 text-sm text-center py-6">No design requests yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
