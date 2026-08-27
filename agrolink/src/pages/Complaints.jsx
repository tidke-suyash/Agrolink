import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  Zap, PhoneCall, Mail, AlertTriangle, CheckCircle2,
  Clock, ShieldAlert, Send, Plus, Filter, Search,
  ChevronRight, MapPin, Building2, Droplets, Sun,
  Sprout, FileText, ExternalLink, RefreshCw, X
} from 'lucide-react';

const MAHARASHTRA_DISTRICTS = [
  'Nashik', 'Pune', 'Ahmednagar', 'Solapur', 'Kolhapur',
  'Chhatrapati Sambhajinagar (Aurangabad)', 'Jalgaon', 'Satara',
  'Sangli', 'Amravati', 'Nagpur', 'Yavatmal', 'Nanded', 'Latur', 'Beed'
];

const ISSUE_CATEGORIES = [
  { id: 'Electricity / Load Shedding / Power Outage', label: '⚡ Power Cut / Load Shedding (MSEDCL)', icon: Zap, color: '#d9a857' },
  { id: 'Canal Water / Dam Rotation / Irrigation', label: '💧 Canal Water / Irrigation Rotation', icon: Droplets, color: '#7c96c4' },
  { id: 'Solar Pump / Feeder Trip', label: '☀️ Solar Pump / Feeder Trip', icon: Sun, color: '#e8c787' },
  { id: 'Crop Loss & Insurance Claim', label: '🌾 Crop Damage / PMFBY Insurance', icon: Sprout, color: '#7c9b85' },
  { id: 'Fertilizer / Seed Quality & Subsidy Grievance', label: '🧪 Bogus Fertilizer / Seed Grievance', icon: FileText, color: '#c97b71' },
];

export default function Complaints() {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [helplines, setHelplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' or 'helplines'

  // Form State
  const [formData, setFormData] = useState({
    category: 'Electricity / Load Shedding / Power Outage',
    title: '',
    description: '',
    district: 'Nashik',
    taluka: '',
    village: '',
    consumer_no: '',
    feeder_name: '',
    substation: '',
    severity: 'Emergency',
    phone: '',
  });

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [complaintsRes, helplinesRes] = await Promise.all([
        api.get('/complaints', token).catch(() => ({ complaints: [] })),
        api.get('/complaints/helplines', token).catch(() => ({ helplines: [] })),
      ]);
      setComplaints(complaintsRes.complaints || []);
      setHelplines(helplinesRes.helplines || []);
    } catch (err) {
      console.warn('Error loading grievance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    try {
      const res = await api.post('/complaints', formData, token);
      setSuccessMessage(`Ticket #${res.complaint?.id || 'CMP-NEW'} filed successfully! Department alerted.`);
      setShowModal(false);
      setFormData({
        category: 'Electricity / Load Shedding / Power Outage',
        title: '',
        description: '',
        district: 'Nashik',
        taluka: '',
        village: '',
        consumer_no: '',
        feeder_name: '',
        substation: '',
        severity: 'Emergency',
        phone: '',
      });
      loadData();
    } catch (err) {
      alert('Failed to submit grievance: ' + (err.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesCat = selectedCategoryFilter === 'all' || c.category === selectedCategoryFilter;
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.village?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* ─── Hero Redressal Banner (Centered) ────────────────── */}
      <div className="glass p-8 md:p-10 rounded-2xl border-2 border-gray-300 bg-white shadow-md flex flex-col items-center text-center gap-5 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300">
          <Zap size={14} className="text-amber-700 animate-pulse" />
          <span className="text-gray-950 font-bold">Maharashtra 24x7 Agricultural &amp; Power Grievance Cell</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-black font-heading leading-tight max-w-3xl">
          Urgent Power Cut &amp; Agricultural Grievance Redressal
        </h1>

        <p className="text-sm font-semibold text-gray-800 leading-relaxed max-w-2xl">
          When power cuts stop drip irrigation or canal water is delayed, file an official grievance immediately. Directly escalates to MSEDCL, Mahavitaran Executive Engineers &amp; District Agriculture Officers with 1-click calling &amp; automated formal email memos.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2">
          <button
            className="btn btn-amber py-3 px-6 text-sm font-bold flex items-center justify-center gap-2 shadow-md text-black"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} />
            <span>Report Power Cut / Issue</span>
          </button>
          <a
            href="tel:1912"
            className="btn btn-secondary py-3 px-6 text-sm font-bold flex items-center justify-center gap-2 transition text-black border border-gray-400 hover:bg-gray-100"
          >
            <PhoneCall size={16} className="text-amber-700" />
            <span className="text-black font-bold">Call MSEDCL 1912</span>
          </a>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] rounded-xl flex items-center justify-between text-sm animate-scale-in max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <strong>{successMessage}</strong>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ─── Fast Navigation Tabs (Centered) ──────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-b border-gray-200 pb-2 max-w-4xl mx-auto w-full">
        <button
          className={`pb-2 px-3 text-sm font-bold font-heading border-b-2 transition flex items-center gap-2 ${
            activeTab === 'complaints'
              ? 'border-[#4f6b58] text-[#2c4033] bg-[#4f6b58]/10 rounded-t-lg'
              : 'border-transparent text-gray-700 hover:text-black'
          }`}
          onClick={() => setActiveTab('complaints')}
        >
          <AlertTriangle size={16} className="text-amber-600" />
          <span>Grievances &amp; Power Outage Tickets ({complaints.length})</span>
        </button>

        <button
          className={`pb-2 px-3 text-sm font-bold font-heading border-b-2 transition flex items-center gap-2 ${
            activeTab === 'helplines'
              ? 'border-[#4f6b58] text-[#2c4033] bg-[#4f6b58]/10 rounded-t-lg'
              : 'border-transparent text-gray-700 hover:text-black'
          }`}
          onClick={() => setActiveTab('helplines')}
        >
          <PhoneCall size={16} className="text-[#2c4033]" />
          <span>Maharashtra Official Helplines Directory (6)</span>
        </button>

        <button
          onClick={loadData}
          className="p-1.5 text-gray-600 hover:text-black transition rounded-lg ml-auto sm:ml-0"
          title="Refresh live tickets"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ─── TAB 1: Grievances List & Filters (Centered) ──── */}
      {activeTab === 'complaints' && (
        <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white p-3 rounded-xl border border-gray-200">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap justify-center">
              <button
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-[#2c4033] text-white border-[#2c4033]'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-gray-500'
                }`}
                onClick={() => setSelectedCategoryFilter('all')}
              >
                All Grievances
              </button>
              {ISSUE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategoryFilter === cat.id
                      ? 'bg-[#2c4033] text-white border-[#2c4033]'
                      : 'bg-white text-gray-800 border-gray-300 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                >
                  <cat.icon size={12} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px] w-full md:w-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search ticket, village, consumer no..."
                className="input w-full pl-9 py-2 text-xs font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Grievances Feed */}
          {filteredComplaints.length === 0 ? (
            <div className="glass p-12 text-center rounded-2xl flex flex-col items-center gap-3">
              <CheckCircle2 size={40} className="text-[#7c9b85]" />
              <h3 className="text-lg font-bold text-gray-800 font-heading">No Open Grievances Found</h3>
              <p className="text-sm text-gray-500 max-w-md">
                No active complaints registered under this filter. If your agricultural feeder or canal water is interrupted, report it immediately below.
              </p>
              <button
                className="btn btn-primary text-xs font-bold mt-2"
                onClick={() => setShowModal(true)}
              >
                <Plus size={14} />
                <span>File First Complaint</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredComplaints.map((c) => {
                const isOutage = c.category?.includes('Electricity');
                const isEmergency = c.severity === 'Emergency';
                const isResolved = c.status === 'Resolved';
                const isEscalated = c.status?.includes('Escalated');

                return (
                  <div
                    key={c.id}
                    className={`glass p-5 rounded-2xl flex flex-col justify-between gap-4 border transition hover:shadow-md ${
                      isEmergency && !isResolved ? 'border-amber-400 bg-amber-50/20' : 'border-gray-200'
                    }`}
                  >
                    <div>
                      {/* Card Header Tag Row */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200">
                            {c.id}
                          </span>
                          <span
                            className={`badge ${
                              isResolved
                                ? 'badge-success'
                                : isEscalated
                                ? 'badge-primary'
                                : 'badge-amber'
                            }`}
                          >
                            {isResolved ? '✓ Resolved' : isEscalated ? '⚡ Escalated to MSEDCL/Dept' : '⏳ Under Review'}
                          </span>
                          {isEmergency && !isResolved && (
                            <span className="badge badge-error">🚨 Emergency</span>
                          )}
                        </div>

                        <span className="text-[11px] text-gray-400">
                          {new Date(c.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Title & Category */}
                      <h3 className="font-bold text-gray-950 font-heading text-base mb-1.5 line-clamp-2">
                        {c.title}
                      </h3>
                      <p className="text-xs text-gray-900 leading-relaxed mb-3 line-clamp-3 font-normal">
                        {c.description}
                      </p>

                      {/* Infrastructure Meta Tags */}
                      <div className="p-2.5 bg-white rounded-xl border border-gray-200 grid grid-cols-2 gap-2 text-xs text-gray-950">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin size={13} className="text-[#2c4033] shrink-0" />
                          <span className="truncate font-semibold">{c.village || 'Village'}, {c.taluka || ''} ({c.district})</span>
                        </div>
                        {c.consumer_no && c.consumer_no !== 'N/A' && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 size={13} className="text-gray-700 shrink-0" />
                            <span className="truncate">Cons: <strong className="text-black">{c.consumer_no}</strong></span>
                          </div>
                        )}
                        {c.feeder_name && (
                          <div className="flex items-center gap-1.5 truncate col-span-2 text-gray-950">
                            <Zap size={13} className="text-amber-600 shrink-0" />
                            <span className="truncate">Feeder: <strong className="text-black">{c.feeder_name}</strong> ({c.substation || 'Substation'})</span>
                          </div>
                        )}
                      </div>

                      {/* Resolution Log / Officer Escalation details */}
                      {c.resolution_notes && (
                        <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 font-medium">
                          <strong className="block mb-0.5 text-black">Department Action / Resolution:</strong>
                          <span>{c.resolution_notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Action Footer */}
                    <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="text-gray-900 font-semibold">
                        Farmer: <strong className="text-black">{c.farmer_name}</strong> ({c.phone})
                      </div>

                      <div className="flex items-center gap-2">
                        {isOutage && (
                          <a
                            href="tel:1912"
                            className="p-1.5 px-3 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center gap-1 transition"
                            title="Direct Call Mahavitaran Control Room"
                          >
                            <PhoneCall size={12} />
                            <span>1912</span>
                          </a>
                        )}
                        <a
                          href={`mailto:customercare@mahadiscom.in?subject=${encodeURIComponent(
                            `[URGENT OUTAGE] Ticket ${c.id} - ${c.village}, ${c.district}`
                          )}&body=${encodeURIComponent(
                            `Respected Officer,\n\nPower Cut / Grievance Ticket #${c.id}\nLocation: Village ${c.village}, District ${c.district}\nFeeder: ${c.feeder_name}\nConsumer: ${c.consumer_no}\n\nDetails: ${c.description}\n\nPlease take immediate restoration action.\n\nFarmer: ${c.farmer_name} (${c.phone})`
                          )}`}
                          className="p-1.5 px-3 rounded-lg bg-gray-100 hover:bg-[#7c9b85] hover:text-white text-gray-700 font-medium flex items-center gap-1 transition"
                          title="1-Click Direct Email to Authority"
                        >
                          <Mail size={12} />
                          <span>1-Click Email Dept</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: Maharashtra Official Helplines Directory ─ */}
      {activeTab === 'helplines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {helplines.map((h) => (
            <div
              key={h.id}
              className={`glass p-5 rounded-2xl flex flex-col justify-between gap-4 border ${
                h.emergency ? 'border-amber-300 bg-amber-50/10' : 'border-gray-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-[#4f6b58] font-heading">{h.category}</span>
                  {h.emergency && (
                    <span className="badge badge-error">24x7 Emergency</span>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 font-heading text-base mb-1">
                  {h.name}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{h.department}</p>

                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {h.description}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-500 font-medium">Toll-Free Phone:</span>
                  <a
                    href={`tel:${h.phone.replace(/[^0-9]/g, '')}`}
                    className="btn btn-primary btn-sm font-mono font-bold flex items-center gap-1.5"
                  >
                    <PhoneCall size={13} />
                    <span>{h.phone}</span>
                  </a>
                </div>

                {h.alternatePhone && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Alternate Line:</span>
                    <a href={`tel:${h.alternatePhone}`} className="text-[#4f6b58] font-mono hover:underline font-semibold">
                      {h.alternatePhone}
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-50">
                  <span>Official Email:</span>
                  <a
                    href={`mailto:${h.email}?subject=${encodeURIComponent(
                      `[AgroLink Maharashtra Grievance] Urgent Assistance Request`
                    )}&body=${encodeURIComponent(
                      `Respected Officer,\n\nI am writing to seek urgent redressal regarding agricultural operations in Maharashtra.\n\nName:\nContact:\nDistrict:\nDetails of Issue:\n\nPlease assist at the earliest.`
                    )}`}
                    className="text-[#4f6b58] hover:underline font-medium flex items-center gap-1 truncate max-w-[170px]"
                    title={h.email}
                  >
                    <Mail size={12} />
                    <span className="truncate">{h.email}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── MODAL: File New Grievance / Power Cut ────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 font-heading">
                    Report Power Cut / Agricultural Issue
                  </h3>
                  <p className="text-xs text-gray-500">
                    Direct notification to MSEDCL / District Agriculture Department
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Category */}
              <div className="input-group">
                <label className="input-label">Issue Category *</label>
                <select
                  className="input select w-full font-medium"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {ISSUE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgency & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="input-label">Urgency Level *</label>
                  <select
                    className="input select w-full font-bold"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  >
                    <option value="Emergency">🚨 Emergency (Active Crop Loss)</option>
                    <option value="High">⚠️ High (Pump / Canal Halted)</option>
                    <option value="Medium">🟡 Medium (Quality / General)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Your Phone Number *</label>
                  <input
                    type="tel"
                    className="input w-full font-mono font-medium"
                    placeholder="e.g. 9822019283"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Location: District, Taluka, Village */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="input-group">
                  <label className="input-label">District (MH) *</label>
                  <select
                    className="input select w-full text-xs font-semibold"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                  >
                    {MAHARASHTRA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Taluka</label>
                  <input
                    type="text"
                    className="input w-full text-xs"
                    placeholder="e.g. Dindori / Niphad"
                    value={formData.taluka}
                    onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Village *</label>
                  <input
                    type="text"
                    className="input w-full text-xs"
                    placeholder="e.g. Vani Khurd"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Power specific details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="input-group">
                  <label className="input-label text-[11px]">MSEDCL Consumer No.</label>
                  <input
                    type="text"
                    className="input w-full text-xs font-mono"
                    placeholder="12-digit number"
                    value={formData.consumer_no}
                    onChange={(e) => setFormData({ ...formData, consumer_no: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label text-[11px]">11kV Feeder Name</label>
                  <input
                    type="text"
                    className="input w-full text-xs"
                    placeholder="e.g. Agri Feeder 1"
                    value={formData.feeder_name}
                    onChange={(e) => setFormData({ ...formData, feeder_name: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label text-[11px]">Substation</label>
                  <input
                    type="text"
                    className="input w-full text-xs"
                    placeholder="e.g. 33/11kV Substation"
                    value={formData.substation}
                    onChange={(e) => setFormData({ ...formData, substation: e.target.value })}
                  />
                </div>
              </div>

              {/* Title & Description */}
              <div className="input-group">
                <label className="input-label">Grievance Summary / Title *</label>
                <input
                  type="text"
                  className="input w-full font-medium"
                  placeholder="e.g. Unscheduled 14-hour power cut during grape irrigation"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Detailed Description &amp; Crop Impact *</label>
                <textarea
                  className="input w-full text-sm"
                  rows={3}
                  placeholder="Describe when outage started, phase status (single phasing / voltage drop), crops affected, or transformer pole location..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-1">
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary text-xs font-bold flex items-center gap-2"
                >
                  {submitting ? (
                    <span>Registering Ticket...</span>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Grievance &amp; Notify Dept</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
