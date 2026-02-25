import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const FABRIC_TYPES = ['cotton', 'silk', 'wool', 'linen', 'jute', 'bamboo', 'polyester', 'blended'];
const WEAVE_TYPES = ['plain', 'twill', 'satin', 'dobby', 'jacquard', 'tapestry', 'velvet', 'crepe'];

export default function DesignRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null); // for viewing quotes
  const [form, setForm] = useState({ title: '', fabricType: 'cotton', weaveType: 'plain', description: '', colorPalette: '', patterns: '', quantity: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    setIsLoading(true);
    api.get('/designer/requests')
      .then((r) => setRequests(r.data.data?.requests || []))
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Title is required');
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        colorPalette: form.colorPalette ? form.colorPalette.split(',').map((s) => s.trim()).filter(Boolean) : [],
        patterns: form.patterns ? form.patterns.split(',').map((s) => s.trim()).filter(Boolean) : [],
        quantity: form.quantity ? Number(form.quantity) : undefined,
        status: 'submitted',
      };
      await api.post('/designer/requests', payload);
      toast.success('Design request submitted!');
      setShowForm(false);
      setForm({ title: '', fabricType: 'cotton', weaveType: 'plain', description: '', colorPalette: '', patterns: '', quantity: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptQuote = async (requestId, quoteId) => {
    try {
      await api.patch(`/designer/requests/${requestId}/accept-quote`, { quoteId });
      toast.success('Quote accepted!');
      setSelectedRequest(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Design Requests</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-base font-semibold mb-4">Create Design Request</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Traditional Banarasi Brocade" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Fabric Type</label>
                <select className="input" value={form.fabricType} onChange={(e) => setForm({ ...form, fabricType: e.target.value })}>
                  {FABRIC_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Weave Type</label>
                <select className="input" value={form.weaveType} onChange={(e) => setForm({ ...form, weaveType: e.target.value })}>
                  {WEAVE_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the design requirements..." />
            </div>            <div>
              <label className="label">Quantity (metres)</label>
              <input className="input" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 50" />
            </div>            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Color Palette <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                <input className="input" value={form.colorPalette} onChange={(e) => setForm({ ...form, colorPalette: e.target.value })} placeholder="e.g. Gold, Maroon, Ivory" />
              </div>
              <div>
                <label className="label">Pattern Notes <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                <input className="input" value={form.patterns} onChange={(e) => setForm({ ...form, patterns: e.target.value })} placeholder="e.g. Floral motifs, 2-inch border" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Loader /> : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r._id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{r.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{r.fabricType} · {r.weaveType}</p>
                  {r.description && <p className="text-sm text-gray-600 mt-2 max-w-xl">{r.description}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <StatusBadge status={r.status} />
                  {r.quotes?.length > 0 && (
                    <button onClick={() => setSelectedRequest(r)} className="text-sm text-primary-600 font-medium hover:underline">
                      {r.quotes.length} Quote{r.quotes.length > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-gray-400">No design requests yet. Create your first one!</p>
            </div>
          )}
        </div>
      )}

      {/* Quotes Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{selectedRequest.title} — Quotes</h2>
                <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <div className="space-y-3">
                {selectedRequest.quotes.map((q) => (
                  <div key={q._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{q.weaverId?.name || 'Weaver'}</span>
                      <span className="text-lg font-bold text-primary-700">₹{q.pricePerUnit}/unit</span>
                    </div>
                    <p className="text-sm text-gray-500">Production time: {q.productionDays} days</p>
                    {q.note && <p className="text-sm text-gray-600 mt-1">{q.note}</p>}
                    {selectedRequest.status === 'quoted' && String(selectedRequest.acceptedQuoteId) !== String(q._id) && (
                      <button
                        onClick={() => handleAcceptQuote(selectedRequest._id, q._id)}
                        className="mt-3 btn-primary text-sm py-1.5"
                      >
                        Accept this Quote
                      </button>
                    )}
                    {String(selectedRequest.acceptedQuoteId) === String(q._id) && (
                      <span className="mt-2 inline-block text-xs text-green-600 font-medium">✓ Accepted</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
