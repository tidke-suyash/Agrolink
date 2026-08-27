import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import api from '../lib/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.access_token);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          await fetchProfile(s.access_token);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(token) {
    try {
      const { profile: p } = await api.get('/auth/profile', token);
      setProfile(p);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  }

  async function signInWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function signUpWithPassword(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  }

  async function resetPasswordForEmail(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  }

  async function updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  }

  async function deleteAccount() {
    if (!session?.access_token) return;
    await api.delete('/auth/account', session.access_token);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }

  async function updateProfile(updates) {
    if (!session?.access_token) return;
    const { profile: p } = await api.put('/auth/profile', updates, session.access_token);
    setProfile(p);
    return p;
  }

  async function setRole(role, profileData = {}) {
    if (!session?.access_token) return;
    const { profile: p } = await api.post('/auth/set-role', { role, ...profileData }, session.access_token);
    setProfile(p);
    return p;
  }

  const value = {
    user,
    session,
    profile,
    loading,
    userId: user?.id || profile?.id || null,
    role: profile?.role || null,
    token: session?.access_token || null,
    isAuthenticated: !!user,
    needsOnboarding: !!user && (!profile?.role || (!profile?.name && profile?.role !== 'admin')),
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword,
    resetPasswordForEmail,
    updatePassword,
    deleteAccount,
    signOut,
    updateProfile,
    setRole,
    refreshProfile: () => session?.access_token && fetchProfile(session.access_token),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
