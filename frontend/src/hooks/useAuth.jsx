import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { API } from "../utils/constants";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f5f3ef"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48, height: 48,
          border: "3px solid rgba(26,92,58,0.2)",
          borderTop: "3px solid #1a5c3a",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 16px"
        }} />
        <div style={{
          color: "#1a5c3a", fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, letterSpacing: 2
        }}>SCALERBANK</div>
      </div>
    </div>
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("sb_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(u => { setUser(u); setLoading(false); })
        .catch(() => {
          setToken(null);
          localStorage.removeItem("sb_token");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem("sb_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (info) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem("sb_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("sb_token");
  };

  const apiFetch = useCallback((url, opts = {}) => {
    return fetch(`${API}${url}`, {
      ...opts,
      headers: {
        ...opts.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
  }, [token]);

  if (loading) return <LoadingScreen />;

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}
