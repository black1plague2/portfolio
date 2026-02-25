import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toggleWishlist, clearWishlist } from '../../redux/slices/wishlistSlice';
import PublicNavbar from '../../components/common/PublicNavbar';

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.wishlist);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-500 mt-0.5">{items.length} saved {items.length === 1 ? 'product' : 'products'}</p>
          </div>
          {items.length > 0 && (
            <button onClick={() => dispatch(clearWishlist())}
              className="text-sm text-red-600 hover:underline">
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-24 text-center">
            <p className="text-6xl mb-4">🤍</p>
            <h2 className="text-xl font-bold text-gray-800">Your wishlist is empty</h2>
            <p className="text-gray-500 mt-2 mb-6">Save products you like to find them here later</p>
            <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((p) => (
              <div key={p._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden group relative">
                {/* Remove button */}
                <button onClick={() => dispatch(toggleWishlist(p))}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center shadow-sm transition-colors"
                  title="Remove from wishlist">
                  ♥
                </button>

                <Link to={`/products/${p._id}`}>
                  <div className="h-44 bg-gray-100 overflow-hidden">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🧵</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{p.fabricType} · {p.weaveType}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <span className="text-lg font-bold text-primary-600">₹{p.pricePerUnit}<span className="text-xs text-gray-400 font-normal">/m</span></span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">MOQ {p.moq}</span>
                    </div>
                  </div>
                </Link>

                <div className="px-4 pb-4">
                  <button onClick={() => navigate(`/buyer/place-order/${p._id}`)}
                    className="btn-primary w-full py-2 text-sm">
                    Place Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
