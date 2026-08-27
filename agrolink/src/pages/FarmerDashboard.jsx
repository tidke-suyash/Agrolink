import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp, Package, ShoppingCart, Users, ArrowUpRight,
  Plus, CheckCircle2, Clock, AlertCircle, BarChart3, Sprout
} from 'lucide-react';

export default function FarmerDashboard() {
  const { profile } = useAuth();

  const [stats] = useState({
    totalEarnings: '₹84,250',
    activeCrops: 6,
    pendingOrders: 3,
    completedOrders: 42,
  });

  const [recentOrders] = useState([
    { id: 'AGRO-9021', crop: 'Organic Wheat (100kg)', buyer: 'FreshMart Organics', price: '₹4,800', status: 'pending' },
    { id: 'AGRO-8842', crop: 'Nashik Red Onions (50kg)', buyer: 'Aarav Sharma', price: '₹1,300', status: 'shipped' },
    { id: 'AGRO-7619', crop: 'Organic Tomatoes (25kg)', buyer: 'GreenRoots Cafe', price: '₹875', status: 'delivered' },
  ]);

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">
            Farmer Harvest Hub 🌾
          </h1>
          <p className="text-sm text-gray-500">Welcome back, {profile?.name || 'Cultivator'}! Here is your live farm performance.</p>
        </div>

        <Link to="/farmer/products/new" className="btn btn-primary flex items-center gap-2">
          <Plus size={16} />
          <span>List New Harvest</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass p-5 rounded-xl border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase">Direct Sales Revenue</div>
            <div className="text-2xl font-bold text-[#4f6b58] font-mono mt-1">{stats.totalEarnings}</div>
            <div className="text-xs text-[#7c9b85] font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight size={13} /> +14.2% this month
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#f6faf7] text-[#4f6b58] flex items-center justify-center font-bold">
            ₹
          </div>
        </div>

        <div className="glass p-5 rounded-xl border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase">Active Listings</div>
            <div className="text-2xl font-bold text-gray-900 font-mono mt-1">{stats.activeCrops}</div>
            <div className="text-xs text-gray-400 mt-1">Verified on Marketplace</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[rgba(124,150,196,0.14)] text-[#7c96c4] flex items-center justify-center">
            <Package size={22} />
          </div>
        </div>

        <div className="glass p-5 rounded-xl border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase">Pending Dispatch</div>
            <div className="text-2xl font-bold text-[#d9a857] font-mono mt-1">{stats.pendingOrders}</div>
            <div className="text-xs text-[#d9a857] font-semibold mt-1">Needs packing</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#faf3e4] text-[#d9a857] flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="glass p-5 rounded-xl border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase">Fulfilled Deliveries</div>
            <div className="text-2xl font-bold text-[#7c9b85] font-mono mt-1">{stats.completedOrders}</div>
            <div className="text-xs text-gray-400 mt-1">100% On-time payout</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#f6faf7] text-[#7c9b85] flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Recent Direct Orders */}
      <div className="glass rounded-xl overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/40">
          <h3 className="font-bold text-base text-gray-900 font-heading">Recent Buyer Orders</h3>
          <Link to="/farmer/orders" className="text-xs text-[#7c9b85] hover:underline font-semibold">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100/80 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="p-3.5 pl-5">Order ID</th>
                <th className="p-3.5">Produce Details</th>
                <th className="p-3.5">Buyer</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 pr-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition">
                  <td className="p-3.5 pl-5 font-bold font-mono text-gray-900">{o.id}</td>
                  <td className="p-3.5 font-medium">{o.crop}</td>
                  <td className="p-3.5 text-gray-600">{o.buyer}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-[#4f6b58]">{o.price}</td>
                  <td className="p-3.5 pr-5 text-right">
                    <span className={`badge ${o.status === 'delivered' ? 'badge-success' : o.status === 'pending' ? 'badge-amber' : 'badge-info'}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
