import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('myday_user'));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const persist = (token, userData) => {
    localStorage.setItem('myday_token', token);
    localStorage.setItem('myday_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('myday_token');
    localStorage.removeItem('myday_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.user) {
        const u = { ...data.user, token: data.token };
        if (data.token) localStorage.setItem('myday_token', data.token);
        localStorage.setItem('myday_user', JSON.stringify(data.user));
        setUser(data.user);
      }
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('myday_token');
    if (token) refreshUser().finally(() => setLoading(false));
    else setLoading(false);
  }, [refreshUser]);

  const login = async (email, password, rememberMe) => {
    const { data } = await api.post('/auth/login', { email, password, rememberMe });
    persist(data.token, data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    persist(data.token, data.user);
    return data.user;
  };

  const googleLogin = async (profile) => {
    const { data } = await api.post('/auth/google', profile);
    persist(data.token, data.user);
    return data.user;
  };

  const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

  const updateUserLocal = (updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('myday_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        forgotPassword,
        logout,
        refreshUser,
        updateUserLocal,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
