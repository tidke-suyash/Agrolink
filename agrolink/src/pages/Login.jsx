import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import farmCollage from '../assets/farm-collage.png';

export default function Login() {
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup' | 'forgot'

  // Sign In / Sign Up fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signInWithPassword, signUpWithPassword, signInWithGoogle, resetPasswordForEmail } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await signInWithPassword(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

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
    setMessage('');

    try {
      const data = await signUpWithPassword(email, password, { name });
      if (data.session) {
        navigate('/onboarding');
      } else {
        setMessage('Account created! Please check your email to confirm or sign in directly.');
        setTab('signin');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await resetPasswordForEmail(email);
      setMessage('Password reset instructions have been sent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
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
          <p className="text-white/90 text-sm font-medium">The farmer-first marketplace</p>
        </div>

        {/* Card */}
        <div className="glass p-6 sm:p-8 shadow-2xl rounded-2xl border border-white/30 backdrop-blur-xl animate-scale-in">

          {/* Sign In / Create Account — two distinct buttons, not tabs */}
          {tab !== 'forgot' && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                className={`btn ${tab === 'signin' ? 'btn-primary' : 'btn-secondary'} w-full py-2.5`}
                onClick={() => { setTab('signin'); setError(''); setMessage(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`btn ${tab === 'signup' ? 'btn-primary' : 'btn-secondary'} w-full py-2.5`}
                onClick={() => { setTab('signup'); setError(''); setMessage(''); }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#faeae8] text-[#c97b71] flex items-start gap-2.5 border border-[#e8c2ba] shadow-sm animate-shake text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-[#c97b71]" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#f6faf7] text-[#4f6b58] flex items-start gap-2.5 border border-[#c4d9c8] shadow-sm text-sm font-medium">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-[#7c9b85]" />
              <span>{message}</span>
            </div>
          )}

          {/* Google Auth Button */}
          {tab !== 'forgot' && (
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-3 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold flex items-center justify-center gap-3 shadow-sm hover:shadow transition duration-150 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </button>

              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
            </div>
          )}

          {/* Tab 1: Sign In */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <div className="input-group">
                <label className="input-label text-xs font-semibold text-gray-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                    placeholder="farmer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="input-label text-xs font-semibold text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setError(''); setMessage(''); }}
                    className="text-xs text-[var(--color-primary)] font-semibold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
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

              <button
                type="submit"
                className="btn btn-primary w-full py-3 font-bold rounded-xl mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition"
                disabled={loading || !email || !password}
              >
                {loading ? 'Signing In...' : 'Sign In'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          {/* Tab 2: Sign Up */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <div className="input-group">
                <label className="input-label text-xs font-semibold text-gray-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                    placeholder="Ramesh Patel"
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
                    className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                    placeholder="farmer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="input-label text-xs font-semibold text-gray-700 block mb-1">Password</label>
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
                  <label className="input-label text-xs font-semibold text-gray-700 block mb-1">Confirm</label>
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

              <button
                type="submit"
                className="btn btn-primary w-full py-3 font-bold rounded-xl mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition"
                disabled={loading || !email || !password || !name}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          {/* View 3: Forgot Password */}
          {tab === 'forgot' && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f6faf7] text-[var(--color-primary)] mb-2">
                  <KeyRound size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Reset Your Password</h2>
                <p className="text-xs text-gray-600 mt-1">Enter your email and we will send you a reset link.</p>
              </div>

              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                <div className="input-group">
                  <label className="input-label text-xs font-semibold text-gray-700 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      className="input w-full pl-10 py-2.5 text-sm rounded-xl border-gray-300"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  disabled={loading || !email}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                  {!loading && <ArrowRight size={18} />}
                </button>

                <button
                  type="button"
                  onClick={() => { setTab('signin'); setError(''); setMessage(''); }}
                  className="text-xs text-gray-600 hover:text-gray-900 font-semibold text-center mt-2 cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
