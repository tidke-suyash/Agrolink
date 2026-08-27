import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Package, X, Sparkles, Image as ImageIcon } from 'lucide-react';

const INITIAL_FARMER_PRODUCTS = [
  { id: 'fp-1', title: 'Organic Sharbati Wheat', category: 'grains', price: 48, unit: 'kg', stock: 500, status: 'Active' },
  { id: 'fp-2', title: 'Fresh Desi Tomatoes', category: 'vegetables', price: 35, unit: 'kg', stock: 150, status: 'Active' },
  { id: 'fp-3', title: 'Lakadong High Curcumin Turmeric', category: 'spices', price: 320, unit: '500g', stock: 80, status: 'Active' },
];

export default function FarmerProducts() {
  const [products, setProducts] = useState(INITIAL_FARMER_PRODUCTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'vegetables',
    price: '',
    unit: 'kg',
    stock: '',
    description: '',
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    const newProd = {
      id: `fp-${Date.now()}`,
      title: form.title,
      category: form.category,
      price: Number(form.price),
      unit: form.unit,
      stock: Number(form.stock),
      status: 'Active',
    };
    setProducts([newProd, ...products]);
    setModalOpen(false);
    setForm({ title: '', category: 'vegetables', price: '', unit: 'kg', stock: '', description: '' });
  };

  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">My Harvest Inventory</h1>
          <p className="text-sm text-gray-500">Manage your crops listed on the AgroLink direct buyer marketplace.</p>
        </div>

        <button className="btn btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>Add Crop Listing</span>
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100/80 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5 pl-5">Crop Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Available Stock</th>
                <th className="p-3.5">Listing Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="p-3.5 pl-5 font-bold text-gray-900">{p.title}</td>
                  <td className="p-3.5 capitalize text-gray-600">{p.category}</td>
                  <td className="p-3.5 font-bold font-mono text-[#4f6b58]">₹{p.price} / {p.unit}</td>
                  <td className="p-3.5 font-mono text-gray-700">{p.stock} {p.unit}</td>
                  <td className="p-3.5">
                    <span className="badge badge-success flex items-center gap-1 w-fit">
                      <CheckCircle2 size={11} /> {p.status}
                    </span>
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-[#e0a0a0] hover:text-[#c97b71] p-1.5 rounded hover:bg-[#faeae8]"
                      title="Delete listing"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Crop Modal */}
      {modalOpen && (
        <div className="crop-doctor-overlay" onClick={() => setModalOpen(false)}>
          <div className="crop-doctor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crop-doctor-header">
              <div className="flex items-center gap-2">
                <Package size={20} />
                <h3 className="font-bold text-lg">List New Farm Harvest</h3>
              </div>
              <button className="text-white/80 hover:text-white" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="crop-doctor-body">
              <div className="input-group">
                <label className="input-label">Crop / Product Title *</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g. Fresh Red Onions, A2 Cow Ghee"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select
                    className="input w-full"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains</option>
                    <option value="spices">Spices</option>
                    <option value="dairy">Dairy</option>
                    <option value="pulses">Pulses</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Unit</label>
                  <select
                    className="input w-full"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="dozen">dozen</option>
                    <option value="liter">liter</option>
                    <option value="500g">500g</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="input-label">Price (INR) *</label>
                  <input
                    type="number"
                    className="input w-full font-mono"
                    placeholder="e.g. 45"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    min="1"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Stock Quantity *</label>
                  <input
                    type="number"
                    className="input w-full font-mono"
                    placeholder="e.g. 200"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Sparkles size={15} />
                  <span>Publish to Marketplace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
