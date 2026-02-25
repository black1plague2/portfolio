import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../redux/slices/authSlice';
import { markAllRead } from '../../redux/slices/uiSlice';

const NOTIF_ICONS = { order: '📦', message: '💬', system: '⚙️', payment: '💳' };
const NAV_ITEMS = {
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
    { label: 'Browse', path: '/products', icon: '🛍️' },
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
    { label: 'Requests', path: '/designer/requests', icon: '🎨' },
  ],
};

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.ui);
  const unread = notifications.filter((n) => !n.read).length;
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const navItems = NAV_ITEMS[user?.role] || [];

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/85 border-b border-heritage-maroon/10 shadow-[0_20px_35px_-30px_rgba(0,0,0,0.45)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-heritage-sand/40 via-white to-heritage-beige/40" />
        <div className="absolute -left-10 -bottom-8 h-28 w-28 rounded-full bg-heritage-maroon/10 blur-2xl" />
        <div className="absolute -right-6 -top-10 h-24 w-24 rounded-full bg-heritage-mustard/10 blur-2xl" />

        <div className="relative px-5 md:px-7 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="animate-[slideDown_220ms_ease]">
              <p className="text-[11px] uppercase tracking-[0.35em] text-heritage-maroon/70">{user?.role?.replace('_', ' ')} Portal</p>
              <h1 className="text-xl md:text-2xl font-serif text-heritage-charcoal">Supply cloud for artisans</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications bell */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => { setShowNotifs((v) => !v); if (showNotifs) dispatch(markAllRead()); }}
                  className="relative p-2 text-heritage-charcoal hover:text-heritage-maroon rounded-lg hover:bg-heritage-maroon/10 transition-all">
                  <span className="text-xl">🔔</span>
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-heritage-maroon text-heritage-beige text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-[pulse_1.2s_infinite]">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-heritage-maroon/10 z-50 overflow-hidden animate-[slideDown_180ms_ease]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-heritage-maroon/10">
                      <span className="font-semibold text-heritage-charcoal">Notifications</span>
                      {unread > 0 && (
                        <button onClick={() => dispatch(markAllRead())} className="text-xs text-heritage-maroon hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-heritage-maroon/10">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center text-heritage-charcoal/50 text-sm">No notifications yet</div>
                      ) : (
                        notifications.slice(0, 20).map((n, i) => (
                          <div key={n._id || i} className={`flex gap-3 px-4 py-3 ${!n.read ? 'bg-heritage-maroon/5' : ''}`}>
                            <span className="text-xl flex-shrink-0">{NOTIF_ICONS[n.type] || '🔔'}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-heritage-charcoal' : 'text-heritage-charcoal/80'}`}>{n.message}</p>
                              <p className="text-xs text-heritage-charcoal/50 mt-0.5">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</p>
                            </div>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-heritage-maroon flex-shrink-0 mt-1.5" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User avatar + name */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-heritage-maroon to-heritage-indigo text-heritage-beige flex items-center justify-center text-sm font-bold shadow-md shadow-heritage-maroon/20">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-semibold text-heritage-charcoal">{user?.name}</span>
              </div>

              <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg border border-heritage-maroon/30 text-heritage-charcoal font-semibold bg-white hover:bg-heritage-maroon/10 text-sm transition-all">
                Logout
              </button>
            </div>
          </div>

          {navItems.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-heritage-maroon/10 via-transparent to-heritage-mustard/10 blur-xl" />
              <nav className="relative flex items-center gap-2 overflow-x-auto bg-white/70 border border-heritage-maroon/10 rounded-xl px-2 py-2 shadow-[0_14px_30px_-25px_rgba(0,0,0,0.45)] animate-[fadeIn_320ms_ease]">
                {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`group relative flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-heritage-maroon to-heritage-charcoal text-white shadow-md shadow-heritage-maroon/30'
                          : 'text-heritage-charcoal hover:bg-heritage-maroon/10'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>
                      {!active && <span className="absolute inset-x-2 bottom-1 h-0.5 bg-gradient-to-r from-heritage-maroon/0 via-heritage-maroon/50 to-heritage-mustard/0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
