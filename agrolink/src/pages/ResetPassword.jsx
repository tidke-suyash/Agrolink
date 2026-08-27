import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Lock, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import farmCollage from '../assets/farm-collage.png';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password. Reset link may have expired.');
    } finally {
      setLoading(false);
    }
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

      <div className="relative w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-6 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-xl mb-3">
            <Sprout size={36} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-1 tracking-tight drop-shadow-md">AgroLink</h1>
          <p className="text-white/90 text-sm font-medium">Create your new password</p>
        </div>

        {/* Card */}
        <div className="glass p-6 sm:p-8 shadow-2xl rounded-2xl border border-white/30 backdrop-blur-xl animate-scale-in">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f6faf7] text-[var(--color-primary)] mb-2">
              <KeyRound size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Set New Password</h2>
            <p className="text-xs text-gray-600 mt-1">Please enter and confirm your new password below.</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#faeae8] text-[#c97b71] flex items-start gap-2.5 border border-[#e8c2ba] shadow-sm text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-[#c97b71]" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="p-5 rounded-xl bg-[#f6faf7] text-[#4f6b58] text-center border border-[#c4d9c8] shadow-sm">
              <CheckCircle2 size={36} className="text-[#7c9b85] mx-auto mb-2" />
              <h3 className="font-bold text-lg">Password Updated!</h3>
              <p className="text-xs text-[#7c9b85] mt-1">Redirecting you to AgroLink...</p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="input-group">
                <label className="input-label text-xs font-semibold text-gray-700 block mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <button
                type="submit"
                className="btn btn-primary w-full py-3 font-bold rounded-xl mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
