import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../../redux/slices/productSlice';
import { placeOrder } from '../../redux/slices/orderSlice';

export default function PlaceOrder() {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct } = useSelector((state) => state.products);
  const { isLoading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    productId,
    quantity: '',
    deliveryAddress: { street: '', city: '', state: '', pincode: '' },
    buyerNotes: '',
  });

  useEffect(() => { dispatch(fetchProduct(productId)); }, [dispatch, productId]);

  const p = currentProduct;
  const total = p && form.quantity ? form.quantity * p.pricePerUnit : 0;
  const advance = total * 0.3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(placeOrder(form));
    if (!result.error) navigate('/buyer/orders');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Place Bulk Order</h1>

      {p && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Summary */}
          <div className="card">
            <h2 className="font-semibold text-gray-700 mb-3">Product</h2>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                {p.images?.[0] ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover rounded-lg" /> : '🧵'}
              </div>
              <div>
                <p className="font-bold">{p.title}</p>
                <p className="text-sm text-gray-500 capitalize">{p.fabricType} · {p.weaveType}</p>
                <p className="text-primary-600 font-bold mt-1">₹{p.pricePerUnit}/unit</p>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="font-medium">{form.quantity || '—'} units</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Amount</span><span className="font-bold text-lg">₹{total.toLocaleString()}</span></div>
              <div className="flex justify-between text-green-600"><span>Advance (30%)</span><span className="font-medium">₹{advance.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-500"><span>Balance on completion</span><span className="font-medium">₹{(total - advance).toLocaleString()}</span></div>
            </div>
          </div>

          {/* Order Form */}
          <div className="card">
            <h2 className="font-semibold text-gray-700 mb-4">Order Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Quantity (min {p.moq} units)</label>
                <input type="number" className="input" min={p.moq} value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} required />
              </div>

              <div>
                <label className="label">Delivery Address</label>
                <div className="space-y-2">
                  <input className="input" placeholder="Street" value={form.deliveryAddress.street}
                    onChange={(e) => setForm({ ...form, deliveryAddress: { ...form.deliveryAddress, street: e.target.value } })} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input" placeholder="City" value={form.deliveryAddress.city}
                      onChange={(e) => setForm({ ...form, deliveryAddress: { ...form.deliveryAddress, city: e.target.value } })} />
                    <input className="input" placeholder="State" value={form.deliveryAddress.state}
                      onChange={(e) => setForm({ ...form, deliveryAddress: { ...form.deliveryAddress, state: e.target.value } })} />
                  </div>
                  <input className="input" placeholder="Pincode" value={form.deliveryAddress.pincode}
                    onChange={(e) => setForm({ ...form, deliveryAddress: { ...form.deliveryAddress, pincode: e.target.value } })} />
                </div>
              </div>

              <div>
                <label className="label">Notes (optional)</label>
                <textarea className="input" rows={2} value={form.buyerNotes}
                  onChange={(e) => setForm({ ...form, buyerNotes: e.target.value })} />
              </div>

              <button type="submit" disabled={isLoading || !form.quantity} className="btn-primary w-full py-3">
                {isLoading ? 'Placing order...' : `Place Order · ₹${advance.toLocaleString()} advance`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
