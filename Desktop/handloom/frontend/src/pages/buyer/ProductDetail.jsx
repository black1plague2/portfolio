import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../../redux/slices/productSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import Loader from '../../components/common/Loader';
import PublicNavbar from '../../components/common/PublicNavbar';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, isLoading } = useSelector((state) => state.products);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => { dispatch(fetchProduct(id)); }, [dispatch, id]);

  if (isLoading || !currentProduct) return <Loader fullScreen />;

  const p = currentProduct;
  const images = p.images?.length ? p.images : [];
  const isWishlisted = wishlistItems.some((w) => w._id === p._id);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <nav className="text-sm text-gray-500 mb-4">
          <button onClick={() => navigate('/products')} className="hover:text-primary-600">Products</button>
          <span className="mx-2 text-gray-300">›</span>
          <span className="capitalize text-gray-500">{p.fabricType}</span>
          <span className="mx-2 text-gray-300">›</span>
          <span className="text-gray-800 font-medium truncate">{p.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left — Image gallery */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-96">
              {images.length > 0 ? (
                <img src={images[activeImg]} alt={p.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl bg-gray-50">🧵</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-600' : 'border-transparent hover:border-gray-300'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Details */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                {p.isFeatured && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">⭐ Featured</span>}
                <h1 className="text-2xl font-bold text-gray-900 mt-1">{p.title}</h1>
                <p className="text-gray-500 capitalize mt-0.5">{p.fabricType} · {p.weaveType}</p>
              </div>
              {isAuthenticated && user?.role === 'buyer' && (
                <button onClick={() => dispatch(toggleWishlist(p))}
                  className={`flex-shrink-0 mt-1 w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl transition-all ${isWishlisted ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-400 hover:border-red-300 hover:text-red-400'}`}>
                  {isWishlisted ? '♥' : '♡'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <span className="text-yellow-400">⭐</span>
              <span className="font-medium text-gray-700">{p.rating?.toFixed(1) || '—'}</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500 text-sm">{p.weaverId?.region}</span>
            </div>

            <p className="mt-4 text-gray-600 leading-relaxed">{p.description}</p>

            {/* Color options */}
            {p.colorOptions?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Available Colors</p>
                <div className="flex flex-wrap gap-2">
                  {p.colorOptions.map((c) => (
                    <span key={c} className="px-3 py-1 bg-gray-100 rounded-full text-xs capitalize text-gray-700">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Key specs */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-primary-50 rounded-xl p-4">
                <p className="text-xs text-primary-600 font-medium mb-1">Price per Metre</p>
                <p className="text-2xl font-bold text-primary-700">₹{p.pricePerUnit}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-medium mb-1">Min. Order Qty</p>
                <p className="text-2xl font-bold text-gray-800">{p.moq}<span className="text-sm font-normal text-gray-400 ml-1">m</span></p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Production Time</p>
                <p className="font-semibold text-gray-800">{p.productionTimeDays} days</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Stock Available</p>
                <p className="font-semibold text-gray-800">{p.stockMetres ?? '—'} m</p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 mt-5">
              {isAuthenticated && user?.role === 'buyer' ? (
                <button onClick={() => navigate(`/buyer/place-order/${p._id}`)} className="btn-primary flex-1 py-3 text-base font-semibold">
                  🛒 Place Bulk Order
                </button>
              ) : !isAuthenticated ? (
                <button onClick={() => navigate('/login')} className="btn-secondary flex-1 py-3">
                  Login to Order
                </button>
              ) : null}
              {isAuthenticated && user?.role === 'buyer' && (
                <button onClick={() => { dispatch(toggleWishlist(p)); }}
                  className={`px-5 py-3 rounded-xl border-2 font-medium transition-all ${isWishlisted ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-700 hover:border-primary-300'}`}>
                  {isWishlisted ? '♥ Saved' : '♡ Save'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Weaver profile card */}
        {p.weaverId && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">About the Weaver</h2>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {p.weaverId.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{p.weaverId.name}</h3>
                  {p.weaverId.isVerified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{p.weaverId.region}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span>⭐ {p.weaverId.rating?.toFixed(1) || '—'} rating</span>
                  <span>📦 {p.weaverId.totalOrders ?? '—'} orders</span>
                  <span>🏭 Cluster: {p.weaverId.clusterName ?? '—'}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.weaverId.bio}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
