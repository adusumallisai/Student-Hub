/**
 * context/AuthContext.jsx
 * Provides login/logout/register and the current user across the app.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sh_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sh_token');
    if (!token) {
      setLoading(false);
      return;
    }
    client.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('sh_token');
        localStorage.removeItem('sh_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    localStorage.setItem('sh_token', res.data.token);
    localStorage.setItem('sh_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    const res = await client.post('/auth/register', { name, email, password });
    localStorage.setItem('sh_token', res.data.token);
    localStorage.setItem('sh_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('sh_token');
    localStorage.removeItem('sh_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
