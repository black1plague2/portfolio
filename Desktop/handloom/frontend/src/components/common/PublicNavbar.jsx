import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';

const ROLE_HOME = {
  weaver: '/weaver/dashboard',
  buyer: '/buyer/dashboard',
  admin: '/admin/dashboard',
  designer: '/designer/dashboard',
  cluster_manager: '/weaver/dashboard',
};

export default function PublicNavbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const wishlist = useSelector((s) => s.wishlist?.items || []);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?q=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl">🧶</span>
          <span className="font-bold text-lg text-primary-600 hidden sm:block">Handloom</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search fabrics, weaves, regions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
              🔍
            </button>
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {isAuthenticated && user?.role === 'buyer' && (
            <Link to="/buyer/wishlist" className="relative p-2 text-gray-600 hover:text-primary-600 hidden sm:flex items-center gap-1 text-sm font-medium">
              <span className="text-lg">♡</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
              <span className="hidden md:block">Wishlist</span>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:block font-medium text-gray-700 max-w-24 truncate">{user?.name?.split(' ')[0]}</span>
                <span className="text-gray-400 text-xs">▾</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                  <Link to={ROLE_HOME[user?.role] || '/'} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    📊 Dashboard
                  </Link>
                  {user?.role === 'buyer' && (
                    <>
                      <Link to="/buyer/orders" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        📋 My Orders
                      </Link>
                      <Link to="/buyer/wishlist" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        ♡ Wishlist
                      </Link>
                    </>
                  )}
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary text-sm px-4 py-1.5">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-1.5">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Category bar */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 py-1.5 overflow-x-auto text-xs font-medium text-gray-600 scrollbar-hide">
          {[
            ['All Products', '/products'],
            ['Silk', '/products?fabricType=silk'],
            ['Cotton', '/products?fabricType=cotton'],
            ['Wool', '/products?fabricType=wool'],
            ['Jacquard', '/products?weaveType=jacquard'],
            ['Ikat', '/products?weaveType=ikat'],
            ['Banarasi', '/products?q=banarasi'],
            ['Kerala', '/products?q=kerala'],
          ].map(([label, href]) => (
            <Link key={label} to={href} className="whitespace-nowrap hover:text-primary-600 py-0.5 border-b-2 border-transparent hover:border-primary-600 transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
