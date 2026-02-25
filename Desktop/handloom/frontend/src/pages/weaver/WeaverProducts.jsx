import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProducts, createProduct } from '../../redux/slices/productSlice';
import { useState } from 'react';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function WeaverProducts() {
  const dispatch = useDispatch();
  const { myProducts, isLoading } = useSelector((state) => state.products);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', fabricType: 'cotton', weaveType: 'plain', pricePerUnit: '', moq: 50, productionTimeDays: 14, stock: 0 });
  const [images, setImages] = useState([]);

  useEffect(() => { dispatch(fetchMyProducts()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    images.forEach((f) => fd.append('images', f));
    const result = await dispatch(createProduct(fd));
    if (!result.error) { setShowForm(false); setForm({ title: '', description: '', fabricType: 'cotton', weaveType: 'plain', pricePerUnit: '', moq: 50, productionTimeDays: 14, stock: 0 }); setImages([]); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="col-span-2"><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div>
              <label className="label">Fabric Type</label>
              <select className="input" value={form.fabricType} onChange={(e) => setForm({ ...form, fabricType: e.target.value })}>
                {['silk', 'cotton', 'wool', 'linen', 'jute', 'synthetic', 'blended', 'other'].map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Weave Type</label>
              <select className="input" value={form.weaveType} onChange={(e) => setForm({ ...form, weaveType: e.target.value })}>
                {['plain', 'twill', 'satin', 'jacquard', 'dobby', 'tapestry', 'ikat', 'other'].map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div><label className="label">Price / Unit (₹)</label><input type="number" className="input" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} required /></div>
            <div><label className="label">MOQ</label><input type="number" className="input" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} /></div>
            <div><label className="label">Production Days</label><input type="number" className="input" value={form.productionTimeDays} onChange={(e) => setForm({ ...form, productionTimeDays: e.target.value })} /></div>
            <div><label className="label">Stock</label><input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            <div className="col-span-2"><label className="label">Images</label><input type="file" multiple accept="image/*" onChange={(e) => setImages([...e.target.files])} className="text-sm" /></div>
            <div className="col-span-2"><button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? 'Saving...' : 'Save Product'}</button></div>
          </form>
        </div>
      )}

      {isLoading && !showForm ? <Loader /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myProducts.map((p) => (
            <div key={p._id} className="card hover:shadow-md transition-shadow">
              {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="w-full h-40 object-cover rounded-lg mb-3" />}
              <h3 className="font-semibold text-gray-900">{p.title}</h3>
              <p className="text-sm text-gray-500 capitalize">{p.fabricType} · {p.weaveType}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="font-bold text-primary-600">₹{p.pricePerUnit}/unit</span>
                <span className="text-xs text-gray-500">MOQ: {p.moq}</span>
              </div>
            </div>
          ))}
          {myProducts.length === 0 && !isLoading && <p className="col-span-3 text-center text-gray-400 py-10">No products yet. Add your first product!</p>}
        </div>
      )}
    </div>
  );
}
