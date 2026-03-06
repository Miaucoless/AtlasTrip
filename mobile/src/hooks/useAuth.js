import { useState, useEffect, useCallback } from 'react';
import { login, register, logout, getCurrentUser, isAuthenticated } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const authed = await isAuthenticated();
        if (authed) {
          const stored = await getCurrentUser();
          setUser(stored);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const u = await login(email, password);
      setUser(u);
      return u;
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegister = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const u = await register(name, email, password);
      setUser(u);
      return u;
    } catch (e) {
      setError(e.response?.data?.message || e.message);
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
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}
