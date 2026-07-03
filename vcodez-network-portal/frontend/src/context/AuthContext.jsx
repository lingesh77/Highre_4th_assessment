import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("highre_token"));
  const [loading, setLoading] = useState(true); // true while we verify persisted session

  // Rehydrate session on refresh from localStorage + verify with /me
  useEffect(() => {
    const storedToken = localStorage.getItem("highre_token");
    const storedUser = localStorage.getItem("highre_user");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ }
    }

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("highre_user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem("highre_token");
        localStorage.removeItem("highre_user");
        setUser(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = useCallback((newUser, newToken) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("highre_token", newToken);
    localStorage.setItem("highre_user", JSON.stringify(newUser));
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await api.post("/auth/login", { email, password });
      persistSession(res.data.user, res.data.token);
      return res.data.user;
    },
    [persistSession]
  );

  const signup = useCallback(
    async (name, email, password) => {
      const res = await api.post("/auth/signup", { name, email, password });
      persistSession(res.data.user, res.data.token);
      return res.data.user;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("highre_token");
    localStorage.removeItem("highre_user");
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data.message;
  }, []);

  const resetPassword = useCallback(async (resetToken, password) => {
    const res = await api.post("/auth/reset-password", { token: resetToken, password });
    return res.data.message;
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
