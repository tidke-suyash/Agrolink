import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, ShoppingBag, ArrowRight, User, MapPin, Phone, Building, LogOut, CheckCircle2, ShieldCheck } from 'lucide-react';
import farmCollage from '../assets/farm-collage.png';

export default function Onboarding() {
  const { user, profile, setRole, signOut } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(profile?.role || null); // 'farmer' | 'customer'
  const [formData, setFormData] = useState({
    name: profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    farm_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile?.name && !formData.name) {
      setFormData(prev => ({ ...prev, name: profile.name }));
    }
  }, [profile]);

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!selectedRole || !formData.name || !formData.location) {
      setError('Please select your role and fill in your name and location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await setRole(selectedRole, formData);
      navigate(selectedRole === 'farmer' ? '/farmer/dashboard' : '/');
    } catch (err) {
      setError(err.message || 'Failed to complete profile setup');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4 sm:p-6 py-12">

      {/* Background image & Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${farmCollage})` }}
      />
      <div className="absolute inset-0 bg-[var(--color-primary)]/80" />
      <div className="absolute inset-0 bg-linear-to-b from-[var(--color-primary)]/60 via-black/25 to-[var(--color-bg)]" />

      <div className="relative w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-xl mb-3">
            <Sprout size={36} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-md">Complete Your Details</h1>
          <p className="text-white/90 text-sm sm:text-base font-medium">
            Signed in as <span className="underline font-bold">{user?.email || 'User'}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#faeae8] text-[#c97b71] text-center font-medium border border-[#e8c2ba] shadow-md">
            {error}
          </div>
        )}

        <div className="glass p-6 sm:p-10 shadow-2xl rounded-2xl border border-white/30 backdrop-blur-xl animate-scale-in">
          <form onSubmit={handleComplete}>

            {/* Step 1: Choose Role */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-sm shadow">1</span>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">How will you use AgroLink?</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Farmer Option */}
                <button
                  type="button"
                  className={`p-5 rounded-2xl text-left border-2 transition-all cursor-pointer relative ${selectedRole === 'farmer'
                      ? 'border-[var(--color-primary)] bg-[#f6faf7]/80 shadow-md ring-2 ring-[var(--color-primary)]/20'
                      : 'border-gray-200 bg-white/70 hover:border-[var(--color-primary)]/50 hover:bg-white'
                    }`}
                  onClick={() => setSelectedRole('farmer')}
                >
                  {selectedRole === 'farmer' && (
                    <CheckCircle2 size={20} className="absolute top-4 right-4 text-[var(--color-primary)]" />
                  )}
                  <div className="w-12 h-12 rounded-xl bg-[#f6faf7] flex items-center justify-center mb-3">
                    <Sprout size={28} className="text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">I am a Farmer</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    List your harvests, access live mandi prices, and sell direct to buyers with 0% middleman fees.
                  </p>
                </button>

                {/* Customer Option */}
                <button
                  type="button"
                  className={`p-5 rounded-2xl text-left border-2 transition-all cursor-pointer relative ${selectedRole === 'customer'
                      ? 'border-[#e8c787] bg-[#faf3e4]/80 shadow-md ring-2 ring-[#e8c787]/20'
                      : 'border-gray-200 bg-white/70 hover:border-[#e8c787]/50 hover:bg-white'
                    }`}
                  onClick={() => setSelectedRole('customer')}
                >
                  {selectedRole === 'customer' && (
                    <CheckCircle2 size={20} className="absolute top-4 right-4 text-[#d9a857]" />
                  )}
                  <div className="w-12 h-12 rounded-xl bg-[#faf3e4] flex items-center justify-center mb-3">
                    <ShoppingBag size={28} className="text-[#d9a857]" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">I am a Buyer / Customer</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Order fresh farm produce directly from verified farmers at fair, transparent prices.
                  </p>
                </button>
              </div>
            </div>

            {/* Step 2: Personal Details */}
            {selectedRole && (
              <div className="animate-fade-in-up border-t border-gray-200/70 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-sm shadow">2</span>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Your Details</h2>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                  <div className="input-group">
                    <label className="input-label text-xs font-semibold text-gray-700 block mb-1">
                      Full Name <span className="text-[#e0a0a0]">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                        placeholder="e.g. Ramesh Patel"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="input-group">
                      <label className="input-label text-xs font-semibold text-gray-700 block mb-1">
                        Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label text-xs font-semibold text-gray-700 block mb-1">
                        Location / City <span className="text-[#e0a0a0]">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                          placeholder="e.g. Nashik, Maharashtra"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {selectedRole === 'farmer' && (
                    <div className="input-group">
                      <label className="input-label text-xs font-semibold text-gray-700 block mb-1">
                        Farm / Business Name <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                          placeholder="e.g. Patel Organic Farms"
                          value={formData.farm_name}
                          onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-xs text-gray-500 hover:text-[#c97b71] flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <LogOut size={14} /> Sign out and use different account
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary w-full sm:w-auto px-8 py-3 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition"
                    disabled={loading || !formData.name || !formData.location}
                  >
                    {loading ? 'Setting up...' : 'Enter AgroLink'}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}
