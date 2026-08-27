import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Phone, MapPin, Shield, Sprout, ShoppingBag,
  Copy, Check, Lock, LogOut, Trash2, AlertTriangle, KeyRound,
  CheckCircle2, AlertCircle, Save
} from 'lucide-react';

export default function Profile() {
  const { user, profile, userId, role, updateProfile, updatePassword, signOut, deleteAccount } = useAuth();
  const navigate = useNavigate();

  // Profile Edit State
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI status states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleCopyId = () => {
    if (!userId) return;
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      await updateProfile({
        name,
        phone,
        location,
        avatar_url: avatarUrl,
      });
      setProfileSuccess('Profile details updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setSavingPassword(true);
    setPasswordSuccess('');
    setPasswordError('');

    try {
      await updatePassword(newPassword);
      setPasswordSuccess('Password successfully changed!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toUpperCase() !== 'DELETE') return;
    
    setDeleteLoading(true);
    try {
      await deleteAccount();
      navigate('/login');
    } catch (err) {
      alert(err.message || 'Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account & Profile</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your identity, personal information, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: ID & Quick Overview Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl shadow-sm border border-gray-200/80 text-center">
            
            {/* Avatar */}
            <div className="relative inline-block mx-auto mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#f6faf7] border-4 border-white shadow-md flex items-center justify-center text-[var(--color-primary)] mx-auto">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={48} />
                )}
              </div>
              <span className={`absolute bottom-0 right-0 px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase shadow ${
                role === 'admin' ? 'bg-[#c97b71]' : role === 'farmer' ? 'bg-[var(--color-primary)]' : 'bg-[#d9a857]'
              }`}>
                {role || 'Customer'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-gray-900">{profile?.name || 'AgroLink User'}</h2>
            <p className="text-xs text-gray-500 mb-4">{user?.email || profile?.email}</p>

            {/* Unique User ID Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-left">
              <div className="flex justify-between items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Account ID</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-semibold cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copied ? <Check size={12} className="text-[#7c9b85]" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy ID'}
                </button>
              </div>
              <p className="font-mono text-xs text-gray-800 break-all select-all bg-white p-2 rounded border border-gray-200/60">
                {userId || 'Loading ID...'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <LogOut size={16} /> Sign Out
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-[#e8c2ba] text-[#c97b71] font-semibold text-sm hover:bg-[#faeae8] flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Trash2 size={16} /> Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="md:col-span-2 flex flex-col gap-8">
          
          {/* Section 1: Personal Details */}
          <div className="glass p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200/80">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-gray-200/70">
              <User className="text-[var(--color-primary)]" size={22} />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
                <p className="text-xs text-gray-500">Update your name, contact phone, and location</p>
              </div>
            </div>

            {profileSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#f6faf7] text-[#4f6b58] flex items-start gap-2.5 border border-[#c4d9c8] text-sm font-medium">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-[#7c9b85]" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#faeae8] text-[#c97b71] flex items-start gap-2.5 border border-[#e8c2ba] text-sm font-medium">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-[#c97b71]" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label text-xs font-semibold text-gray-700 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label text-xs font-semibold text-gray-700 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
                      value={user?.email || profile?.email || ''}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label text-xs font-semibold text-gray-700 block mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label text-xs font-semibold text-gray-700 block mb-1">Location / City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                      placeholder="e.g. Pune, Maharashtra"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label text-xs font-semibold text-gray-700 block mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  className="input w-full py-2.5 text-sm rounded-xl border-gray-300"
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer shadow hover:shadow-md transition"
                >
                  <Save size={16} />
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Security & Password Reset */}
          <div className="glass p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200/80">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-gray-200/70">
              <KeyRound className="text-[var(--color-primary)]" size={22} />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Security & Password</h3>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#f6faf7] text-[#4f6b58] flex items-start gap-2.5 border border-[#c4d9c8] text-sm font-medium">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-[#7c9b85]" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#faeae8] text-[#c97b71] flex items-start gap-2.5 border border-[#e8c2ba] text-sm font-medium">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-[#c97b71]" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label text-xs font-semibold text-gray-700 block mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label text-xs font-semibold text-gray-700 block mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword || !newPassword || !confirmPassword}
                  className="btn btn-primary px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer shadow hover:shadow-md transition disabled:opacity-50"
                >
                  <Lock size={16} />
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in border border-[#e8c2ba]">
            <div className="w-12 h-12 rounded-full bg-[#faeae8] text-[#c97b71] flex items-center justify-center mb-4">
              <AlertTriangle size={26} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              This action is <strong className="text-[#c97b71]">irreversible</strong>. All your profile data, orders, and listed products will be permanently deleted.
            </p>

            <div className="mb-5">
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Type <span className="font-mono bg-[#faeae8] text-[#c97b71] px-1.5 py-0.5 rounded border border-[#e8c2ba]">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                className="input w-full py-2 px-3 text-sm rounded-xl border-gray-300"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.toUpperCase() !== 'DELETE' || deleteLoading}
                className="px-5 py-2.5 bg-[#c97b71] hover:bg-[#b8695f] text-white text-sm font-bold rounded-xl shadow cursor-pointer disabled:opacity-50 flex items-center gap-2 transition"
              >
                {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
