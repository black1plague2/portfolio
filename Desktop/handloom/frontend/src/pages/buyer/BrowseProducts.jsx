import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import Loader from '../../components/common/Loader';
import PublicNavbar from '../../components/common/PublicNavbar';

const FABRIC_TYPES = ['silk', 'cotton', 'wool', 'linen', 'jute', 'synthetic', 'blended', 'other'];
const WEAVE_TYPES = ['plain', 'twill', 'satin', 'jacquard', 'dobby', 'tapestry', 'ikat', 'other'];
const SORT_OPTIONS = [
  { label: 'Newest', value: '-createdAt' },
  { label: 'Price: Low → High', value: 'pricePerUnit' },
  { label: 'Price: High → Low', value: '-pricePerUnit' },
  { label: 'Top Rated', value: '-rating' },
];

export default function BrowseProducts() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { products, isLoading, pagination } = useSelector((s) => s.products);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [filters, setFilters] = useState({
    fabricType: searchParams.get('fabricType') || '',
    weaveType: searchParams.get('weaveType') || '',
    q: searchParams.get('q') || '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
    page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    dispatch(fetchProducts(params));
  }, [dispatch, filters]);

  // Sync URL params when they change (e.g. clicking category links)
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      fabricType: searchParams.get('fabricType') || '',
      weaveType: searchParams.get('weaveType') || '',
      q: searchParams.get('q') || '',
      page: 1,
    }));
  }, [searchParams]);

  const isWishlisted = (id) => wishlistItems.some((p) => p._id === id);

  const activeFilterCount = [filters.fabricType, filters.weaveType, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {filters.q ? `Results for "${filters.q}"` : 'All Handloom Products'}
            </h1>
            {!isLoading && <p className="text-sm text-gray-500 mt-0.5">{pagination?.total || products.length} products found</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              🎛 Filters {activeFilterCount > 0 && <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{activeFilterCount}</span>}
            </button>
            <select className="input w-auto text-sm py-2" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Fabric Type</label>
              <select className="input text-sm" value={filters.fabricType} onChange={(e) => setFilters({ ...filters, fabricType: e.target.value, page: 1 })}>
                <option value="">All Fabrics</option>
                {FABRIC_TYPES.map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Weave Type</label>
              <select className="input text-sm" value={filters.weaveType} onChange={(e) => setFilters({ ...filters, weaveType: e.target.value, page: 1 })}>
                <option value="">All Weaves</option>
                {WEAVE_TYPES.map((w) => <option key={w} value={w} className="capitalize">{w}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Min Price (₹)</label>
              <input className="input text-sm" type="number" placeholder="0" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value, page: 1 })} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Max Price (₹)</label>
              <input className="input text-sm" type="number" placeholder="Any" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value, page: 1 })} />
            </div>
            {activeFilterCount > 0 && (
              <button onClick={() => setFilters({ fabricType: '', weaveType: '', q: '', minPrice: '', maxPrice: '', sort: '-createdAt', page: 1 })}
                className="text-sm text-red-600 hover:underline text-left">
                ✕ Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <div key={p._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group relative">
                  {/* Wishlist button */}
                  {isAuthenticated && user?.role === 'buyer' && (
                    <button
                      onClick={(e) => { e.preventDefault(); dispatch(toggleWishlist(p)); }}
                      className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors ${isWishlisted(p._id) ? 'bg-red-100 text-red-500' : 'bg-white text-gray-400 hover:text-red-400'}`}
                    >
                      {isWishlisted(p._id) ? '♥' : '♡'}
                    </button>
                  )}

                  <Link to={`/products/${p._id}`}>
                    <div className="h-48 bg-gray-100 overflow-hidden">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">🧵</div>
                      )}
                    </div>
                    <div className="p-4">
                      {p.isFeatured && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium mb-1 inline-block">⭐ Featured</span>}
                      <h3 className="font-semibold text-gray-900 truncate mt-1">{p.title}</h3>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">{p.fabricType} · {p.weaveType}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-yellow-400 text-xs">⭐</span>
                        <span className="text-xs text-gray-600 font-medium">{p.rating?.toFixed(1) || '—'}</span>
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-xs text-gray-500">{p.weaverId?.region}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <span className="text-lg font-bold text-primary-600">₹{p.pricePerUnit}<span className="text-xs text-gray-400 font-normal">/m</span></span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">MOQ {p.moq}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-4 text-center py-20">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="text-gray-400 text-lg">No products found</p>
                  <button onClick={() => setFilters({ fabricType: '', weaveType: '', q: '', minPrice: '', maxPrice: '', sort: '-createdAt', page: 1 })}
                    className="btn-primary mt-4">Clear Filters</button>
                </div>
              )}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pg) => (
                  <button key={pg} onClick={() => setFilters({ ...filters, page: pg })}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${filters.page === pg ? 'bg-primary-600 text-white' : 'bg-white border hover:bg-gray-50'}`}>
                    {pg}
                  </button>
                ))}
                <button disabled={filters.page === pagination.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
