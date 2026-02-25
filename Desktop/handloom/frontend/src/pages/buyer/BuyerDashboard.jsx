import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';

export default function BuyerDashboard() {
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/buyer/dashboard').then((r) => {
      setStats(r.data.data.stats);
      setRecentOrders(r.data.data.recentOrders);
      setIsLoading(false);
    });
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
  }, [stats, recentOrders]);

  const totalAmount = stats.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const totalOrders = stats.reduce((s, i) => s + i.count, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-heritage-sand/60 bg-white/85 backdrop-blur shadow-[0_20px_40px_-32px_rgba(0,0,0,0.4)] px-5 py-4 reveal" data-reveal>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-heritage-maroon/70">Buyer Home</p>
            <h1 className="text-2xl font-serif text-heritage-charcoal">Reorder fast, track faster</h1>
            <p className="text-sm text-heritage-charcoal/70">Amazon-like shortcuts: browse, reorder, and watch delivery states.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a href="/products" className="px-4 py-2 rounded-lg bg-heritage-maroon text-white text-sm shadow hover:-translate-y-0.5 transition-all">Browse catalog</a>
            <a href="/buyer/orders" className="px-4 py-2 rounded-lg border border-heritage-sand text-heritage-charcoal text-sm bg-white hover:-translate-y-0.5 transition-all">Your orders</a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-reveal>
        <div className="card bg-gradient-to-br from-amber-50 to-heritage-mustard/40 reveal" data-reveal>
          <p className="text-xs uppercase text-heritage-charcoal/60">Total Orders</p>
          <p className="text-3xl font-bold text-heritage-charcoal mt-1">{totalOrders}</p>
          <p className="text-xs text-heritage-charcoal/60 mt-1">Across all time</p>
        </div>
        <div className="card bg-gradient-to-br from-rose-50 to-heritage-maroon/15 reveal" data-reveal>
          <p className="text-xs uppercase text-heritage-charcoal/60">Total Spent</p>
          <p className="text-3xl font-bold text-heritage-charcoal mt-1">₹{totalAmount.toLocaleString()}</p>
          <p className="text-xs text-heritage-charcoal/60 mt-1">Incl. taxes & fees</p>
        </div>
        <div className="card bg-gradient-to-br from-emerald-50 to-heritage-green/20 reveal" data-reveal>
          <p className="text-xs uppercase text-heritage-charcoal/60">Delivered</p>
          <p className="text-3xl font-bold text-heritage-charcoal mt-1">{stats.find((s) => s._id === 'delivered')?.count || 0}</p>
          <p className="text-xs text-heritage-charcoal/60 mt-1">Completed arrivals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-reveal>
        <div className="card col-span-2 reveal" data-reveal>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-heritage-charcoal">Recent Orders</h2>
            <a href="/buyer/orders" className="text-primary-600 text-sm hover:underline">View all →</a>
          </div>
          {isLoading ? <Loader /> : recentOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400">No orders yet.</p>
              <a href="/products" className="btn-primary mt-4 inline-block">Browse Products</a>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{o.productId?.title || 'Unknown Product'}</p>
                    <p className="text-xs text-gray-500">₹{o.totalAmount?.toLocaleString()} · {o.totalQuantity} units</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={o.status} />
                    <a href={`/buyer/orders/${o._id}/track`} className="text-xs text-primary-600 hover:underline">Track</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card reveal" data-reveal>
          <h3 className="text-sm font-semibold text-heritage-charcoal mb-3">Quick actions</h3>
          <div className="space-y-2">
            <a href="/products" className="flex items-center justify-between px-3 py-2 rounded-lg bg-heritage-maroon/5 hover:bg-heritage-maroon/10 text-sm text-heritage-charcoal">
              <span>Browse products</span><span>→</span>
            </a>
            <a href="/buyer/orders" className="flex items-center justify-between px-3 py-2 rounded-lg bg-heritage-mustard/10 hover:bg-heritage-mustard/20 text-sm text-heritage-charcoal">
              <span>Your orders</span><span>→</span>
            </a>
            <a href="/wishlist" className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-sm text-heritage-charcoal">
              <span>Wishlist</span><span>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
