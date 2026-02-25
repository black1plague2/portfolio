import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/slices/uiSlice';

const navItems = {
  weaver: [
    { label: 'Dashboard', path: '/weaver/dashboard', icon: '📊' },
    { label: 'Sub-Orders', path: '/weaver/orders', icon: '📦' },
    { label: 'My Products', path: '/weaver/products', icon: '🧵' },
    { label: 'Capacity', path: '/weaver/capacity', icon: '⚙️' },
    { label: 'Earnings', path: '/weaver/earnings', icon: '💰' },
  ],
  cluster_manager: [
    { label: 'Dashboard', path: '/weaver/dashboard', icon: '📊' },
    { label: 'Sub-Orders', path: '/weaver/orders', icon: '📦' },
    { label: 'My Products', path: '/weaver/products', icon: '🧵' },
    { label: 'Capacity', path: '/weaver/capacity', icon: '⚙️' },
    { label: 'Earnings', path: '/weaver/earnings', icon: '💰' },
  ],
  buyer: [
    { label: 'Dashboard', path: '/buyer/dashboard', icon: '📊' },
    { label: 'Browse Products', path: '/products', icon: '🛍️' },
    { label: 'My Orders', path: '/buyer/orders', icon: '📋' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Weavers', path: '/admin/weavers', icon: '🧑‍🎨' },
    { label: 'Orders', path: '/admin/orders', icon: '📦' },
    { label: 'Users', path: '/admin/users', icon: '👥' },
  ],
  designer: [
    { label: 'Dashboard', path: '/designer/dashboard', icon: '📊' },
    { label: 'Design Requests', path: '/designer/requests', icon: '🎨' },
  ],
};

export default function Sidebar() {
  const location = useLocation();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const items = navItems[user?.role] || [];

  return (
    <aside className={`fixed left-0 top-0 h-full bg-heritage-charcoal text-white flex flex-col transition-all duration-300 z-30 shadow-2xl ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        {sidebarOpen && (
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🧶</span>
            <span className="font-bold text-lg text-heritage-mustard tracking-wide">Handloom</span>
          </Link>
        )}
        <button onClick={() => dispatch(toggleSidebar())} className="p-1 rounded hover:bg-white/10 ml-auto">
          <span className="text-lg">{sidebarOpen ? '◀' : '▶'}</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto space-y-1">
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-heritage-maroon text-white shadow-md shadow-heritage-maroon/20'
                  : 'text-gray-200 hover:bg-white/10 hover:text-white'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      {sidebarOpen && user && (
        <div className="px-4 py-3 border-t border-white/10 bg-white/5">
          <p className="text-sm font-medium text-white truncate">{user.name}</p>
          <p className="text-xs text-heritage-mustard capitalize">{user.role}</p>
        </div>
      )}
    </aside>
  );
}
