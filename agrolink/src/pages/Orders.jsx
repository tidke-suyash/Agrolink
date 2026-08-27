import { useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, ChevronRight, ExternalLink } from 'lucide-react';

const MOCK_ORDERS = [
  {
    id: 'AGRO-892134',
    date: '24 Aug 2026',
    status: 'delivered',
    total: 840,
    items: [
      { name: 'Organic Sharbati Wheat', qty: '10 kg', price: 480 },
      { name: 'Fresh Organic Tomatoes', qty: '4 kg', price: 140 },
      { name: 'Organic Lakadong Turmeric', qty: '500 g', price: 320 }
    ],
    farmer: 'Rajesh Patil (Nashik Cluster)',
    trackingStep: 4,
  },
  {
    id: 'AGRO-439012',
    date: 'Yesterday, 04:30 PM',
    status: 'shipped',
    total: 1450,
    items: [
      { name: 'Pure A2 Gir Cow Desi Ghee', qty: '1 Liter', price: 1450 }
    ],
    farmer: 'Bhikhu Bhai (Junagadh, GJ)',
    trackingStep: 3,
  },
  {
    id: 'AGRO-210943',
    date: 'Today, 11:15 AM',
    status: 'confirmed',
    total: 650,
    items: [
      { name: 'Ratnagiri Alphonso Mangoes', qty: '1 Dozen', price: 650 }
    ],
    farmer: 'Ganesh Sawant (Ratnagiri)',
    trackingStep: 2,
  }
];

export default function Orders() {
  const [orders] = useState(MOCK_ORDERS);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="badge badge-success flex items-center gap-1"><CheckCircle2 size={12} /> Delivered</span>;
      case 'shipped':
        return <span className="badge badge-info flex items-center gap-1"><Truck size={12} /> In Transit</span>;
      case 'confirmed':
        return <span className="badge badge-amber flex items-center gap-1"><Clock size={12} /> Farm Packed</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-heading">My Direct Orders</h1>
        <p className="text-sm text-gray-500">Track and monitor fresh harvests dispatched directly from partner farms.</p>
      </div>

      <div className="flex flex-col gap-5">
        {orders.map((order) => (
          <div key={order.id} className="glass p-6 rounded-xl flex flex-col gap-4 border border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#f6faf7] text-[#4f6b58] flex items-center justify-center font-bold">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-heading">{order.id}</h3>
                  <span className="text-xs text-gray-400">Placed on {order.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(order.status)}
                <span className="text-lg font-bold font-mono text-[#4f6b58]">₹{order.total}</span>
              </div>
            </div>

            {/* Tracking progress bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-semibold py-2">
              <div className={order.trackingStep >= 1 ? 'text-[#7c9b85]' : 'text-gray-300'}>
                1. Order Placed
                <div className={`h-1.5 rounded-full mt-1 ${order.trackingStep >= 1 ? 'bg-[#7c9b85]' : 'bg-gray-200'}`} />
              </div>
              <div className={order.trackingStep >= 2 ? 'text-[#7c9b85]' : 'text-gray-300'}>
                2. Harvested & Packed
                <div className={`h-1.5 rounded-full mt-1 ${order.trackingStep >= 2 ? 'bg-[#7c9b85]' : 'bg-gray-200'}`} />
              </div>
              <div className={order.trackingStep >= 3 ? 'text-[#7c9b85]' : 'text-gray-300'}>
                3. Rural Express Transit
                <div className={`h-1.5 rounded-full mt-1 ${order.trackingStep >= 3 ? 'bg-[#7c9b85]' : 'bg-gray-200'}`} />
              </div>
              <div className={order.trackingStep >= 4 ? 'text-[#7c9b85]' : 'text-gray-300'}>
                4. Delivered
                <div className={`h-1.5 rounded-full mt-1 ${order.trackingStep >= 4 ? 'bg-[#7c9b85]' : 'bg-gray-200'}`} />
              </div>
            </div>

            {/* Items summary */}
            <div className="bg-gray-50/80 p-3 rounded-lg flex flex-col gap-1.5 text-xs text-gray-700">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                Direct Farm Origin: <span className="text-[#4f6b58]">{order.farmer}</span>
              </div>
              {order.items.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span>{it.name} ({it.qty})</span>
                  <span className="font-mono font-medium">₹{it.price}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
