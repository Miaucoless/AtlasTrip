import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import {
  login,
  register,
  logout,
  updateProfile,
  uploadAvatar,
  resetPassword,
  onAuthStateChange,
} from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data);
    } catch {
      // Profile may not exist yet
    }
  }, []);

  useEffect(() => {
    // Initialize: get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) fetchProfile(session.user.id);
    }).catch(() => {
      // Ignore session fetch errors (e.g. when Supabase is not configured)
    }).finally(() => {
      setLoading(false);
    });

    // Listen for auth state changes
    const subscription = onAuthStateChange((authUser) => {
      setUser(authUser);
      if (authUser) {
        fetchProfile(authUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription?.unsubscribe?.();
  }, [fetchProfile]);

  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const u = await login(email, password);
      setUser(u);
      if (u) await fetchProfile(u.id);
      return u;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  const handleRegister = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const u = await register(name, email, password);
      setUser(u);
      return u;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
      setProfile(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateProfile = useCallback(async (data) => {
    try {
      const updated = await updateProfile(data);
      setProfile(updated);
      return updated;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const handleUploadAvatar = useCallback(async (uri) => {
    try {
      const url = await uploadAvatar(uri);
      await handleUpdateProfile({ avatar_url: url });
      return url;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [handleUpdateProfile]);

  const handleResetPassword = useCallback(async (email) => {
    try {
      await resetPassword(email);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    uploadAvatar: handleUploadAvatar,
    resetPassword: handleResetPassword,
  };
}

