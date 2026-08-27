import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  ShieldAlert, Zap, PhoneCall, Mail, AlertTriangle, CheckCircle2,
  Clock, Send, Filter, Search, MapPin, Building2,
  FileText, ExternalLink, RefreshCw, Copy, Check, X,
  Edit3, ArrowUpRight, CheckCircle, ChevronDown
} from 'lucide-react';

const MAHARASHTRA_DISTRICTS = [
  'All Districts', 'Nashik', 'Pune', 'Ahmednagar', 'Solapur', 'Kolhapur',
  'Chhatrapati Sambhajinagar (Aurangabad)', 'Jalgaon', 'Satara',
  'Sangli', 'Amravati', 'Nagpur', 'Yavatmal', 'Nanded', 'Latur', 'Beed'
];

export default function AdminComplaints() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, outages: 0, escalated: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All Districts');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Selected complaint for status update / escalation
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [escalationModalOpen, setEscalationModalOpen] = useState(false);
  const [escalationDraft, setEscalationDraft] = useState(null);
  const [copied, setCopied] = useState(false);

  // Status Form state
  const [statusForm, setStatusForm] = useState({
    status: 'Under Review',
    escalated_to: '',
    escalated_email: 'customercare@mahadiscom.in',
    resolution_notes: '',
  });

  useEffect(() => {
    loadComplaints();
  }, [token]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.get('/complaints', token);
      setComplaints(data.complaints || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.warn('Error loading admin complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusForm({
      status: complaint.status || 'Under Review',
      escalated_to: complaint.escalated_to || 'Executive Engineer, MSEDCL',
      escalated_email: complaint.escalated_email || (complaint.category.includes('Electricity') ? 'customercare@mahadiscom.in' : 'agri.comm@maharashtra.gov.in'),
      resolution_notes: complaint.resolution_notes || '',
    });
    setUpdateModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await api.patch(`/complaints/${selectedComplaint.id}/status`, statusForm, token);
      setUpdateModalOpen(false);
      loadComplaints();
    } catch (err) {
      alert('Failed to update ticket: ' + (err.message || 'Server error'));
    }
  };

  const handleOpenEscalation = async (complaint) => {
    setSelectedComplaint(complaint);
    try {
      const draft = await api.post(`/complaints/${complaint.id}/escalation-draft`, {}, token);
      setEscalationDraft(draft);
      setEscalationModalOpen(true);
    } catch (err) {
      alert('Failed to generate draft: ' + err.message);
    }
  };

  const handleCopyDraft = () => {
    if (!escalationDraft) return;
    navigator.clipboard.writeText(`TO: ${escalationDraft.to}\nSUBJECT: ${escalationDraft.subject}\n\n${escalationDraft.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesDistrict = districtFilter === 'All Districts' || c.district === districtFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.farmer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.village?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.consumer_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-5xl mx-auto w-full pb-12">
      {/* ─── Admin Top Header ────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4f6b58]/15 text-[#2c4033] text-xs font-bold mb-1 border border-[#4f6b58]/30">
            <ShieldAlert size={14} />
            <span>State Redressal Control Console • Maharashtra</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-heading text-black">
            Agricultural &amp; Power Grievance Admin Console
          </h1>
          <p className="text-sm font-semibold text-gray-800">
            Centralized monitoring for rural load shedding, feeder outages, and agricultural grievances across Maharashtra districts.
          </p>
        </div>

        <button
          onClick={loadComplaints}
          className="btn btn-secondary text-xs font-bold flex items-center gap-2 shrink-0 border border-gray-300 hover:bg-gray-100 text-black"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Live Queue</span>
        </button>
      </div>

      {/* ─── Live Stats Overview Cards ────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-gray-300 text-center flex flex-col items-center">
          <div className="text-xs text-gray-700 font-bold mb-1">Total Grievances</div>
          <div className="text-3xl font-black font-heading text-black">{stats.total || complaints.length}</div>
          <div className="text-[11px] text-[#2c4033] mt-1 font-bold">Across all 36 MH Districts</div>
        </div>

        <div className="glass p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/40 text-center flex flex-col items-center">
          <div className="text-xs text-amber-950 font-bold mb-1 flex items-center gap-1.5">
            <Zap size={14} className="text-amber-700" />
            <span>Active Power Outages</span>
          </div>
          <div className="text-3xl font-black font-heading text-amber-950">
            {complaints.filter((c) => c.category?.includes('Electricity') && c.status !== 'Resolved').length}
          </div>
          <div className="text-[11px] text-amber-900 mt-1 font-bold">MSEDCL Feeder / Drip Halts</div>
        </div>

        <div className="glass p-5 rounded-2xl border-2 border-blue-300 bg-blue-50/40 text-center flex flex-col items-center">
          <div className="text-xs text-blue-950 font-bold mb-1 flex items-center gap-1.5">
            <Send size={14} className="text-blue-700" />
            <span>Escalated to Officials</span>
          </div>
          <div className="text-3xl font-black font-heading text-blue-950">
            {complaints.filter((c) => c.status?.includes('Escalated')).length}
          </div>
          <div className="text-[11px] text-blue-900 mt-1 font-bold">MSEDCL EE / Agri Dept Memos</div>
        </div>

        <div className="glass p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 text-center flex flex-col items-center">
          <div className="text-xs text-emerald-950 font-bold mb-1 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-700" />
            <span>Resolved Tickets</span>
          </div>
          <div className="text-3xl font-black font-heading text-emerald-950">
            {complaints.filter((c) => c.status === 'Resolved').length}
          </div>
          <div className="text-[11px] text-emerald-900 mt-1 font-bold">Power &amp; Canal Restored</div>
        </div>
      </div>

      {/* ─── Filter & Search Control Panel ───────────────── */}
      <div className="glass p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold mr-1">
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          <select
            className="input select py-1.5 px-3 text-xs font-semibold"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            {MAHARASHTRA_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            className="input select py-1.5 px-3 text-xs font-semibold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Reported">Reported (New)</option>
            <option value="Under Review">Under Review</option>
            <option value="Escalated to MSEDCL">Escalated to MSEDCL</option>
            <option value="Escalated to Dept">Escalated to Agri Dept</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            className="input select py-1.5 px-3 text-xs font-semibold"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Electricity / Load Shedding / Power Outage">⚡ Power Cuts (MSEDCL)</option>
            <option value="Canal Water / Dam Rotation / Irrigation">💧 Canal Water (WRD)</option>
            <option value="Solar Pump / Feeder Trip">☀️ Solar Pumps</option>
            <option value="Crop Loss & Insurance Claim">🌾 Crop Loss</option>
            <option value="Fertilizer / Seed Quality & Subsidy Grievance">🧪 Fertilizer / Seeds</option>
          </select>
        </div>

        <div className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search farmer, village, consumer no..."
            className="input w-full pl-9 py-1.5 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ─── Main Grievance Queue Table / Grid ────────────── */}
      {filteredComplaints.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl flex flex-col items-center gap-3">
          <CheckCircle2 size={40} className="text-[#7c9b85]" />
          <h3 className="text-lg font-bold text-gray-800 font-heading">No Matching Grievances</h3>
          <p className="text-sm text-gray-500">All tickets resolved or no complaints match the active filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredComplaints.map((c) => {
            const isOutage = c.category?.includes('Electricity');
            const isEmergency = c.severity === 'Emergency';
            const isResolved = c.status === 'Resolved';
            const isEscalated = c.status?.includes('Escalated');

            return (
              <div
                key={c.id}
                className={`glass p-5 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border transition hover:shadow-md ${
                  isEmergency && !isResolved ? 'border-amber-400 bg-amber-50/20' : 'border-gray-200'
                }`}
              >
                {/* Left ticket overview */}
                <div className="flex-1 min-w-[280px]">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-900 border border-gray-300">
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
                      {isResolved ? '✓ Resolved' : isEscalated ? `⚡ ${c.status}` : '⏳ Under Review'}
                    </span>
                    {isEmergency && !isResolved && (
                      <span className="badge badge-error font-bold">🚨 Emergency</span>
                    )}
                    <span className="text-xs text-gray-800 font-bold">
                      {c.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-950 font-heading text-base mb-1">
                    {c.title}
                  </h3>
                  <p className="text-xs text-gray-900 leading-relaxed mb-3 line-clamp-2 font-normal">
                    {c.description}
                  </p>

                  {/* Metadata line */}
                  <div className="flex items-center gap-4 flex-wrap text-xs text-gray-950 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-[#2c4033]" />
                      <strong>{c.village || 'Village'}</strong>, {c.taluka || ''} ({c.district})
                    </span>
                    {c.consumer_no && c.consumer_no !== 'N/A' && (
                      <span className="flex items-center gap-1 font-mono">
                        Cons: <strong className="text-black">{c.consumer_no}</strong>
                      </span>
                    )}
                    {c.feeder_name && (
                      <span className="flex items-center gap-1 text-gray-950 font-bold">
                        <Zap size={13} className="text-amber-600" />
                        Feeder: <strong className="text-black">{c.feeder_name}</strong>
                      </span>
                    )}
                    <span>
                      Farmer: <strong className="text-black">{c.farmer_name}</strong> ({c.phone})
                    </span>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 flex-wrap shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 w-full lg:w-auto justify-end">
                  <button
                    onClick={() => handleOpenEscalation(c)}
                    className="btn btn-amber btn-sm font-bold flex items-center gap-1.5 shadow-sm"
                    title="1-Click Official Escalation Email Draft"
                  >
                    <Mail size={13} />
                    <span>1-Click Escalate</span>
                  </button>

                  <button
                    onClick={() => handleOpenStatusModal(c)}
                    className="btn btn-primary btn-sm font-bold flex items-center gap-1.5"
                  >
                    <Edit3 size={13} />
                    <span>Update Status</span>
                  </button>

                  <a
                    href={`tel:${c.phone}`}
                    className="btn btn-secondary btn-sm flex items-center gap-1"
                    title="Call Farmer directly"
                  >
                    <PhoneCall size={12} />
                    <span>Call Farmer</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODAL 1: Update Status & Resolution Log ─────── */}
      {updateModalOpen && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setUpdateModalOpen(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 font-heading">
                  Update Grievance Status
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  Ticket #{selectedComplaint.id} • {selectedComplaint.village}, {selectedComplaint.district}
                </p>
              </div>
              <button onClick={() => setUpdateModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="flex flex-col gap-4">
              <div className="input-group">
                <label className="input-label">Ticket Status *</label>
                <select
                  className="input select w-full font-bold"
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                >
                  <option value="Under Review">⏳ Under Review (Initial Assessment)</option>
                  <option value="Escalated to MSEDCL">⚡ Escalated to MSEDCL (Power Outage Squad)</option>
                  <option value="Escalated to Dept">🏛️ Escalated to Agriculture Department</option>
                  <option value="Resolved">✓ Resolved (Power / Canal Restored)</option>
                </select>
              </div>

              {statusForm.status.includes('Escalated') && (
                <>
                  <div className="input-group">
                    <label className="input-label">Designation / Official Escalated To</label>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="e.g. Executive Engineer, MSEDCL Dindori Division"
                      value={statusForm.escalated_to}
                      onChange={(e) => setStatusForm({ ...statusForm, escalated_to: e.target.value })}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Official Email</label>
                    <input
                      type="email"
                      className="input w-full font-mono text-xs"
                      value={statusForm.escalated_email}
                      onChange={(e) => setStatusForm({ ...statusForm, escalated_email: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="input-group">
                <label className="input-label">Resolution Log &amp; Ground Notes</label>
                <textarea
                  className="input w-full text-xs"
                  rows={3}
                  placeholder="Enter linemen dispatch notes, replacement transformer ticket numbers, or power restoration time..."
                  value={statusForm.resolution_notes}
                  onChange={(e) => setStatusForm({ ...statusForm, resolution_notes: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-1">
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  onClick={() => setUpdateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs font-bold">
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: 1-Click Official Escalation Email ───── */}
      {escalationModalOpen && escalationDraft && (
        <div className="modal-overlay" onClick={() => setEscalationModalOpen(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 font-heading">
                    1-Click Official Escalation Memo
                  </h3>
                  <p className="text-xs text-gray-500">
                    Prepared for: {escalationDraft.authorityName} ({escalationDraft.to})
                  </p>
                </div>
              </div>
              <button onClick={() => setEscalationModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                <div className="mb-1 text-gray-500">To: <strong className="text-gray-800">{escalationDraft.to}</strong></div>
                <div className="text-gray-500">Subject: <strong className="text-gray-800">{escalationDraft.subject}</strong></div>
              </div>

              <div className="input-group">
                <label className="input-label">Official Formal Memo Body</label>
                <textarea
                  className="input w-full font-mono text-[11px] leading-relaxed"
                  rows={10}
                  readOnly
                  value={escalationDraft.body}
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 mt-1 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyDraft}
                  className="btn btn-secondary text-xs flex items-center gap-1.5"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Full Memo'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary text-xs"
                    onClick={() => setEscalationModalOpen(false)}
                  >
                    Close
                  </button>
                  <a
                    href={escalationDraft.mailtoUrl}
                    className="btn btn-amber text-xs font-bold flex items-center gap-1.5 shadow-md"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Send size={14} />
                    <span>Open in Email App (1-Click Send)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
