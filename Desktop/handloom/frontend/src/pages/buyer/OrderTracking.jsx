import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderTracking } from '../../redux/slices/orderSlice';
import { joinOrderRoom, leaveOrderRoom } from '../../services/socket';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';

const STAGE_ORDER = ['assigned', 'yarn_procurement', 'loom_setup', 'weaving', 'finishing', 'quality_check', 'ready_to_ship', 'shipped'];

export default function OrderTracking() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { tracking, isLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderTracking(id));
    joinOrderRoom(id);
    return () => leaveOrderRoom(id);
  }, [dispatch, id]);

  if (isLoading || !tracking) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Tracking</h1>
      <p className="text-sm text-gray-500 mb-6">Order #{id.slice(-8).toUpperCase()} · Status: <StatusBadge status={tracking.overallStatus} /></p>

      {tracking.shipment && (
        <div className="card mb-6 bg-green-50 border-green-200">
          <h2 className="font-semibold text-green-800 mb-2">Shipment Info</h2>
          <p className="text-sm text-green-700">Courier: {tracking.shipment.courier} · Tracking: {tracking.shipment.trackingNumber}</p>
          <p className="text-sm text-green-700">Status: {tracking.shipment.status}</p>
        </div>
      )}

      <div className="space-y-4">
        {tracking.progress?.map((so, i) => {
          const currentStageIdx = STAGE_ORDER.indexOf(so.currentStage);
          return (
            <div key={so.subOrderId} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">Sub-Order {i + 1}: {so.weaver}</p>
                  <p className="text-sm text-gray-500">{so.quantity} units · Deadline: {so.deadline ? new Date(so.deadline).toLocaleDateString() : '—'}</p>
                </div>
                <StatusBadge status={so.status} />
              </div>

              {/* Stage Progress Bar */}
              <div className="relative mt-4">
                <div className="flex justify-between mb-2">
                  {STAGE_ORDER.slice(0, 7).map((stage, idx) => (
                    <div key={stage} className="flex flex-col items-center" style={{ width: `${100 / 7}%` }}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        idx <= currentStageIdx ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {idx <= currentStageIdx ? '✓' : idx + 1}
                      </div>
                      <p className="text-xs text-center mt-1 text-gray-500 hidden sm:block" style={{ fontSize: '10px' }}>
                        {stage.replace(/_/g, ' ')}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                  <div className="h-full bg-primary-600 transition-all duration-500" style={{ width: `${(currentStageIdx / 6) * 100}%` }} />
                </div>
              </div>

              {/* History */}
              {so.history?.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2">Stage History</p>
                  <div className="space-y-1">
                    {so.history.slice(-3).map((h, hi) => (
                      <div key={hi} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-green-500">✓</span>
                        <span className="capitalize">{h.stage?.replace(/_/g, ' ')}</span>
                        <span>·</span>
                        <span>{new Date(h.updatedAt).toLocaleDateString()}</span>
                        {h.note && <span className="text-gray-400">· {h.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
