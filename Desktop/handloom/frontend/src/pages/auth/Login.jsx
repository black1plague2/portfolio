import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/slices/authSlice';

const quickCreds = {
  admin: { email: 'admin@handloom.com', password: 'Password@123' },
  buyer: { email: 'buyer@stylehub.com', password: 'Password@123' },
  weaver: { email: 'rajesh@weaver.com', password: 'Password@123' },
  designer: { email: 'priya@designer.com', password: 'Password@123' },
};

const quickButtons = [
  { key: 'admin', label: 'Admin HQ', helper: 'Full access' },
  { key: 'buyer', label: 'Buyer', helper: 'Discover & order' },
  { key: 'weaver', label: 'Weaver', helper: 'Capacity + jobs' },
  { key: 'designer', label: 'Designer', helper: 'Requests & uploads' },
];

const redirects = {
  weaver: '/weaver/dashboard',
  buyer: '/buyer/dashboard',
  admin: '/admin/dashboard',
  designer: '/designer/dashboard',
  cluster_manager: '/weaver/dashboard',
};

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (!result.error) {
      const role = result.payload?.user?.role;
      navigate(redirects[role] || '/');
    }
  };

  const handleQuickLogin = async (role) => {
    const creds = quickCreds[role];
    if (!creds) return;
    const result = await dispatch(loginUser(creds));
    if (!result.error) {
      const dest = redirects[result.payload?.user?.role] || '/';
      navigate(dest);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-beige via-handloom-cream to-white px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="bg-white border border-heritage-mustard/30 shadow-lg rounded-2xl p-8 space-y-8">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.22em] text-heritage-maroon">
              <span className="h-px flex-1 max-w-[72px] bg-gradient-to-r from-heritage-mustard to-transparent" />
              Login
              <span className="h-px flex-1 max-w-[72px] bg-gradient-to-l from-heritage-mustard to-transparent" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Sign in to Handloom</h2>
            <p className="text-sm text-gray-600">Use your credentials or hop into a seeded role to preview flows.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickButtons.map(({ key, label, helper }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleQuickLogin(key)}
                className="group rounded-xl border border-heritage-mustard/30 bg-heritage-beige/70 px-4 py-3 text-left hover:border-heritage-mustard hover:bg-heritage-beige transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{label}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-heritage-maroon">Quick</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{helper}</p>
              </button>
            ))}
          </div>

          <div className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    className="input pr-20"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-2 px-3 text-sm font-semibold text-gray-600 hover:text-primary-700"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-[11px] text-gray-500">Seeded demo accounts auto-navigate to their dashboards.</p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>New to Handloom?</span>
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
