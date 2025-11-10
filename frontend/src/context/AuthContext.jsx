import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );
  const [loading, setLoading] = useState(false);

  // ✅ login/register logic
  const login = async ({ email, password, isRegister, name, role }) => {
    setLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? { name, email, password, role }
        : { email, password };
      const { data } = await api.post(endpoint, payload);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        message: e?.response?.data?.message || "Auth failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // ✅ logout logic
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
  };

  // ✅ refresh user from backend after purchase
  const refreshUser = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      console.log("✅ User refreshed:", data);
    } catch (err) {
      console.error("❌ Failed to refresh user:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ token, user, setUser, login, logout, refreshUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
