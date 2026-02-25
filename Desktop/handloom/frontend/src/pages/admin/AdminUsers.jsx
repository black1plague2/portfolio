import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const ROLES = ['weaver', 'buyer', 'designer', 'cluster_manager', 'admin'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const load = () => {
    setIsLoading(true);
    api.get('/admin/users', { params: { role: roleFilter || undefined } }).then((r) => {
      setUsers(r.data.data);
      setIsLoading(false);
    });
  };

  useEffect(load, [roleFilter]);

  const toggleActive = async (id, active) => {
    try {
      await api.patch(`/admin/users/${id}`, { isActive: !active });
      toast.success('User status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <select className="input w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {isLoading ? <Loader /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Region</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">KYC</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-medium">{u.name}</td>
                  <td className="py-3 text-gray-500">{u.email}</td>
                  <td className="py-3">
                    <span className="text-xs bg-handloom-gold/20 text-handloom-brown px-2 py-0.5 rounded-full font-medium capitalize">{u.role}</span>
                  </td>
                  <td className="py-3">{u.region || '—'}</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium ${u.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3"><StatusBadge status={u.kycStatus} /></td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleActive(u._id, u.isActive)}
                      className={`text-xs px-2 py-1 rounded ${u.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-gray-400">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
