import { useState } from 'react';
import { TrendingUp, TrendingDown, Search, ArrowUpDown, Filter, BarChart3, MapPin } from 'lucide-react';

const MANDI_PRICES = [
  { id: 1, crop: 'Wheat (Sharbati)', mandi: 'Indore Mandi', state: 'Madhya Pradesh', min: 2350, max: 2600, modal: 2480, trend: '+3.5%', isUp: true },
  { id: 2, crop: 'Onion (Red Nashik)', mandi: 'Lasalgaon Mandi', state: 'Maharashtra', min: 900, max: 1550, modal: 1350, trend: '-2.1%', isUp: false },
  { id: 3, crop: 'Tomato (Hybrid)', mandi: 'Vashi APMC', state: 'Maharashtra', min: 1400, max: 2100, modal: 1850, trend: '+8.2%', isUp: true },
  { id: 4, crop: 'Basmati Rice (Pusa 1121)', mandi: 'Karnal Mandi', state: 'Haryana', min: 3900, max: 4400, modal: 4150, trend: '+1.4%', isUp: true },
  { id: 5, crop: 'Soybean (Yellow)', mandi: 'Ujjain Mandi', state: 'Madhya Pradesh', min: 4300, max: 4850, modal: 4620, trend: '+4.0%', isUp: true },
  { id: 6, crop: 'Cotton (Medium Staple)', mandi: 'Rajkot APMC', state: 'Gujarat', min: 6200, max: 7100, modal: 6750, trend: '-1.0%', isUp: false },
  { id: 7, crop: 'Turmeric (Finger Grade)', mandi: 'Erode Market', state: 'Tamil Nadu', min: 11500, max: 13200, modal: 12400, trend: '+6.8%', isUp: true },
  { id: 8, crop: 'Mustard (High Oil)', mandi: 'Jaipur Mandi', state: 'Rajasthan', min: 4900, max: 5400, modal: 5180, trend: '+0.5%', isUp: true },
  { id: 9, crop: 'Red Chilli (Guntur 334)', mandi: 'Guntur APMC', state: 'Andhra Pradesh', min: 15000, max: 19500, modal: 17200, trend: '+12.0%', isUp: true },
  { id: 10, crop: 'Potato (Jyoti)', mandi: 'Azadpur Mandi', state: 'Delhi', min: 1100, max: 1600, modal: 1350, trend: '-3.2%', isUp: false },
];

export default function MarketPrices() {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('all');

  const filtered = MANDI_PRICES.filter((item) => {
    const matchState = selectedState === 'all' || item.state === selectedState;
    const matchSearch =
      item.crop.toLowerCase().includes(search.toLowerCase()) ||
      item.mandi.toLowerCase().includes(search.toLowerCase());
    return matchState && matchSearch;
  });

  const states = ['all', ...new Set(MANDI_PRICES.map((m) => m.state))];

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Real-Time Mandi Commodity Rates</h1>
          <p className="text-sm text-gray-500">Official Agmarknet synced daily prices across premier agricultural markets in India.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search crop or mandi..."
              className="input w-full pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input text-sm"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All States' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Commodity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-2">
        {filtered.slice(0, 4).map((p) => (
          <div key={p.id} className="glass p-5 rounded-xl border border-gray-200/80 flex flex-col justify-between hover:shadow-md transition bg-white">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-gray-900 text-sm">{p.crop}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${p.isUp ? 'bg-[#f6faf7] text-[#4f6b58]' : 'bg-[#faeae8] text-[#a24c41]'}`}>
                {p.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {p.trend}
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#4f6b58] mb-1">
              ₹{p.modal}
              <span className="text-xs font-normal text-gray-400"> / Quintal</span>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={11} />
              <span>{p.mandi}, {p.state}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mandi Table */}
      <div className="glass rounded-xl overflow-hidden border border-gray-200 bg-white mt-4 shadow-sm">
        <div className="p-5 border-b border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="font-bold text-base text-gray-900 font-heading">Commodity Benchmark Price Index (INR / Quintal)</h3>
          <span className="text-xs text-gray-400 font-medium">Synced daily from Agmarknet</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100/80 text-xs font-bold uppercase text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-3.5 pl-5">Crop Name</th>
                <th className="p-3.5">Mandi / APMC</th>
                <th className="p-3.5">State</th>
                <th className="p-3.5 text-right">Min Price</th>
                <th className="p-3.5 text-right">Max Price</th>
                <th className="p-3.5 text-right">Modal (Avg)</th>
                <th className="p-3.5 pr-5 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#f6faf7]/40 transition">
                  <td className="p-3.5 pl-5 font-bold text-gray-900">{item.crop}</td>
                  <td className="p-3.5 text-gray-600">{item.mandi}</td>
                  <td className="p-3.5 text-gray-600">{item.state}</td>
                  <td className="p-3.5 text-right font-mono">₹{item.min}</td>
                  <td className="p-3.5 text-right font-mono">₹{item.max}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-[#4f6b58]">₹{item.modal}</td>
                  <td className="p-3.5 pr-5 text-right font-semibold">
                    <span className={item.isUp ? 'text-[#7c9b85]' : 'text-[#c97b71]'}>
                      {item.trend}
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
