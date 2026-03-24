import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

// Decode JWT payload to extract expiry time
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  // 30-second buffer before actual expiry
  return Date.now() >= (payload.exp * 1000) - 30000;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('brewmap_token');
    // Clear expired tokens on load
    if (saved && isTokenExpired(saved)) {
      localStorage.removeItem('brewmap_token');
      localStorage.removeItem('brewmap_user');
      return null;
    }
    return saved;
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('brewmap_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const isAuthenticated = !!token && !isTokenExpired(token);

  // Auto-logout when token expires
  useEffect(() => {
    if (!token) return;
    const payload = decodeToken(token);
    if (!payload?.exp) return;

    const msUntilExpiry = (payload.exp * 1000) - Date.now();
    if (msUntilExpiry <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, msUntilExpiry);

    return () => clearTimeout(timer);
  }, [token]);

  const saveAuth = useCallback((tokenVal, userVal) => {
    localStorage.setItem('brewmap_token', tokenVal);
    localStorage.setItem('brewmap_user', JSON.stringify(userVal));
    setToken(tokenVal);
    setUser(userVal);
  }, []);

  const loginUser = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      const tokenVal = res.data.access_token;
      saveAuth(tokenVal, { email });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

  const registerUser = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await api.register(email, password);
      // Auto-login after successful registration
      const loginRes = await api.login(email, password);
      const tokenVal = loginRes.data.access_token;
      saveAuth(tokenVal, { email, id: res.data.id });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('brewmap_token');
    localStorage.removeItem('brewmap_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loading,
      initializing,
      loginUser,
      registerUser,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
