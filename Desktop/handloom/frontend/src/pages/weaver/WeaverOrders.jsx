import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWeaverSubOrders, updateSubOrderStage } from '../../redux/slices/orderSlice';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const STAGES = ['yarn_procurement', 'loom_setup', 'weaving', 'finishing', 'quality_check', 'ready_to_ship'];

export default function WeaverOrders() {
  const dispatch = useDispatch();
  const { subOrders, isLoading } = useSelector((state) => state.orders);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    dispatch(fetchWeaverSubOrders({ status: filter || undefined }));
  }, [dispatch, filter]);

  const handleAccept = async (id) => {
    try {
      await api.patch(`/weaver/sub-orders/${id}/accept`);
      toast.success('Sub-order accepted');
      dispatch(fetchWeaverSubOrders());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    }
  };

  const handleStageUpdate = async (id, stage) => {
    setUpdating(id);
    await dispatch(updateSubOrderStage({ id, stage }));
    setUpdating(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Sub-Orders</h1>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending_acceptance">Pending Acceptance</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <Loader />
      ) : subOrders.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 text-lg">No sub-orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subOrders.map((so) => (
            <div key={so._id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Sub-Order #{so._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Quantity: <strong>{so.quantity} units</strong> · Sub Total: <strong>₹{so.subTotal?.toLocaleString()}</strong>
                  </p>
                  <p className="text-sm text-gray-500">Deadline: {so.deadline ? new Date(so.deadline).toLocaleDateString() : '—'}</p>
                </div>
                <StatusBadge status={so.status} />
              </div>

              {/* Production Stage Progress */}
              {['accepted', 'in_progress'].includes(so.status) && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Stage: <span className="capitalize text-primary-600">{so.productionStage?.replace(/_/g, ' ')}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.map((stage) => {
                      const current = STAGES.indexOf(so.productionStage);
                      const idx = STAGES.indexOf(stage);
                      return (
                        <button
                          key={stage}
                          disabled={idx !== current + 1 || updating === so._id}
                          onClick={() => handleStageUpdate(so._id, stage)}
                          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                            idx <= current ? 'bg-green-100 text-green-700 border-green-300' :
                            idx === current + 1 ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700' :
                            'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          {stage.replace(/_/g, ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {so.status === 'pending_acceptance' && (
                <div className="mt-4 flex gap-3">
                  <button onClick={() => handleAccept(so._id)} className="btn-primary text-sm">Accept</button>
                  <button onClick={async () => { await api.patch(`/weaver/sub-orders/${so._id}/reject`); dispatch(fetchWeaverSubOrders()); }} className="btn-danger text-sm">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
