import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

export default function AdminWeavers() {
  const [weavers, setWeavers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setIsLoading(true);
    api.get('/admin/weavers', { params: { kycStatus: filter || undefined } }).then((r) => {
      setWeavers(r.data.data);
      setIsLoading(false);
    });
  };

  useEffect(load, [filter]);

  const handleVerify = async (id, action) => {
    try {
      await api.patch(`/admin/weavers/${id}/verify`, { action });
      toast.success(`Weaver ${action}d`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Weavers</h1>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="submitted">Pending KYC</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading ? <Loader /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Region</th>
                <th className="pb-3">KYC Status</th>
                <th className="pb-3">Verified</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {weavers.map((w) => (
                <tr key={w._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-medium">{w.name}</td>
                  <td className="py-3 text-gray-500">{w.email}</td>
                  <td className="py-3">{w.region || '—'}</td>
                  <td className="py-3"><StatusBadge status={w.kycStatus} /></td>
                  <td className="py-3">{w.verified ? <span className="text-green-500">✓</span> : <span className="text-gray-300">—</span>}</td>
                  <td className="py-3">
                    {w.kycStatus === 'submitted' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleVerify(w._id, 'approve')} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Approve</button>
                        <button onClick={() => handleVerify(w._id, 'reject')} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {weavers.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No weavers found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
