import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBuyerOrders } from '../../redux/slices/orderSlice';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';

export default function BuyerOrders() {
  const dispatch = useDispatch();
  const { orders, isLoading, pagination } = useSelector((state) => state.orders);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    dispatch(fetchBuyerOrders({ status: filter || undefined }));
  }, [dispatch, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending', 'confirmed', 'in_production', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {isLoading ? <Loader /> : orders.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 text-lg">No orders found</p>
          <Link to="/products" className="btn-primary mt-4 inline-block">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{o.productId?.title || 'Product'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {o.totalQuantity} units · ₹{o.totalAmount?.toLocaleString()} · {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Order #{o._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <Link to={`/buyer/orders/${o._id}/track`} className="btn-secondary text-xs px-3 py-1.5">
                    Track
                  </Link>
                </div>
              </div>

              {o.subOrders?.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-2">Allocated to {o.subOrders.length} weaver(s)</p>
                  <div className="flex flex-wrap gap-2">
                    {o.subOrders.slice(0, 3).map((so) => (
                      <span key={so._id} className="badge-gray text-xs">
                        {so.weaverId?.name || '—'} · {so.quantity} units · {so.productionStage?.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {o.subOrders.length > 3 && <span className="badge-gray text-xs">+{o.subOrders.length - 3} more</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
