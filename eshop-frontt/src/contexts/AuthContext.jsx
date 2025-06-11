import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function isAccessTokenExpired(token) {
  if (!token) return true;
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return exp < Date.now() / 1000;
  } catch {
    return true;
  }
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [roles, setRoles] = useState([]);
  const initialized = useRef(false);

  const parseJwt = (token) => {
    try { return JSON.parse(atob(token.split(".")[1])); }
    catch { return null; }
  };

  const login = useCallback((accessToken) => {
    const parsed = parseJwt(accessToken);
    if (!parsed) return;

    const name = parsed.preferred_username || parsed.sub;
    const id = parsed.sub;
    const r = parsed.resource_access?.myclient?.roles || [];

    localStorage.setItem("token", accessToken);
    localStorage.setItem("username", name);
    localStorage.setItem("userId", id);
    localStorage.setItem("roles", JSON.stringify(r));

    setUsername(name);
    setUserId(id);
    setRoles(r);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    fetch("https://localhost:5050/auth/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      localStorage.clear();
      setIsLoggedIn(false);
      navigate("/login");
    });
  }, [navigate]);

  const refreshAccessToken = useCallback(async () => {
    if (location.pathname === "/login") return;

    try {
      const res = await fetch("https://localhost:5050/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const { accessToken } = await res.json();
        accessToken ? login(accessToken) : logout();
      } else {
        logout();
      }
    } catch {
      logout();
    }
  }, [login, logout, location.pathname]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (location.pathname === "/login") return;

    const token = localStorage.getItem("token");
    if (token) {
      const parsed = parseJwt(token);
      if (parsed && parsed.exp >= Date.now() / 1000) {
        setUsername(localStorage.getItem("username") || "");
        setUserId(localStorage.getItem("userId") || "");
        setRoles(JSON.parse(localStorage.getItem("roles")) || []);
        setIsLoggedIn(true);
        return;
      }
    }
    refreshAccessToken();
  }, [refreshAccessToken, location.pathname]);

  const fetchWithAuth = useCallback(async (input, init = {}) => {
    let token = localStorage.getItem("token");
    if (!token || isAccessTokenExpired(token)) {
      await refreshAccessToken();
      token = localStorage.getItem("token");
    }
    if (!token) throw new Error("Not authenticated");

    init.headers = {
      ...(init.headers || {}),
      "Authorization": `Bearer ${token}`,
    };
    return fetch(input, init);
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, login, logout, refreshAccessToken, fetchWithAuth, username, userId, roles }}
    >
      {children}
    </AuthContext.Provider>
  );
};
