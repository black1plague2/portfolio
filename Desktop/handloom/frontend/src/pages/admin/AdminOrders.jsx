import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const STATUSES = ['pending_allocation', 'allocated', 'in_production', 'ready_to_ship', 'shipped', 'delivered', 'cancelled', 'partially_cancelled', 'disputed'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [overrideModal, setOverrideModal] = useState(null); // { orderId, currentStatus }
  const [newStatus, setNewStatus] = useState('');

  const load = () => {
    setIsLoading(true);
    api.get('/admin/orders', { params: { status: filter || undefined } }).then((r) => {
      setOrders(r.data.data);
      setIsLoading(false);
    });
  };

  useEffect(load, [filter]);

  const openOverride = (order) => {
    setOverrideModal({ orderId: order._id, currentStatus: order.status });
    setNewStatus(order.status);
  };

  const handleOverride = async () => {
    try {
      await api.patch(`/admin/orders/${overrideModal.orderId}/override`, { status: newStatus });
      toast.success('Order status updated');
      setOverrideModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {isLoading ? <Loader /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Buyer</th>
                <th className="pb-3">Qty</th>
                <th className="pb-3">Total (₹)</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-mono text-xs text-gray-500">{o._id.slice(-8)}</td>
                  <td className="py-3">{o.buyerId?.name || '—'}</td>
                  <td className="py-3">{o.totalQuantity}</td>
                  <td className="py-3 font-medium">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                  <td className="py-3"><StatusBadge status={o.status} /></td>
                  <td className="py-3"><StatusBadge status={o.paymentStatus} /></td>
                  <td className="py-3">
                    <button onClick={() => openOverride(o)} className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700">Override</button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-gray-400">No orders found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {overrideModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Override Order Status</h2>
            <p className="text-sm text-gray-500 mb-4">Current: <StatusBadge status={overrideModal.currentStatus} /></p>
            <select className="input mb-4" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setOverrideModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleOverride} className="btn-primary">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
