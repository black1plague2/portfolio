import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/slices/authSlice';

const ROLES = [
  { value: 'buyer', label: 'Buyer / Retailer', icon: '🛍️' },
  { value: 'weaver', label: 'Weaver / Artisan', icon: '🧵' },
  { value: 'designer', label: 'Designer', icon: '🎨' },
  { value: 'cluster_manager', label: 'Cluster Manager', icon: '🏭' },
];

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', phone: '', region: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) return;
    const result = await dispatch(registerUser(form));
    if (!result.error) {
      const redirects = { weaver: '/weaver/dashboard', buyer: '/buyer/dashboard', designer: '/designer/dashboard', cluster_manager: '/weaver/dashboard' };
      navigate(redirects[form.role] || '/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-handloom-cream to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🧶</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Create Account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join the Handloom Marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" type="text" placeholder="Your name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" type="tel" placeholder="+91 9999999999" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min 8 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div>
              <label className="label">Region</label>
              <input className="input" type="text" placeholder="e.g. Varanasi" value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">I am a...</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`p-3 rounded-lg border-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                    form.role === r.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{r.icon}</span> {r.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isLoading || !form.role} className="btn-primary w-full py-2.5 mt-2">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
