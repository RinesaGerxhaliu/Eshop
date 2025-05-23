import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [roles, setRoles] = useState(JSON.parse(localStorage.getItem("roles")) || []);

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const login = (accessToken) => {
    const parsedToken = parseJwt(accessToken);
    if (!parsedToken) return;

    const usernameFromToken = parsedToken?.preferred_username || parsedToken?.sub;
    const userIdFromToken = parsedToken?.sub;
    const rolesFromToken = parsedToken?.resource_access?.myclient?.roles || [];

    localStorage.setItem("token", accessToken);
    localStorage.setItem("username", usernameFromToken);
    localStorage.setItem("userId", userIdFromToken);
    localStorage.setItem("roles", JSON.stringify(rolesFromToken));

    setUsername(usernameFromToken);
    setUserId(userIdFromToken);
    setRoles(rolesFromToken);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("roles");

    setUsername("");
    setUserId("");
    setRoles([]);
    setIsLoggedIn(false);

    setTimeout(() => {
      navigate("/login");
    }, 70);
  };

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await fetch("https://localhost:5050/auth/refresh", {
        method: "POST",
        credentials: "include", // send HttpOnly cookie with refresh token
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          login(data.accessToken);
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch {
      logout();
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const parsedToken = parseJwt(token);
    if (!parsedToken) return;

    const tokenExpiresIn = parsedToken.exp - Date.now() / 1000;
    if (tokenExpiresIn <= 0) {
      refreshAccessToken();
      return;
    }

    const refreshTime = (tokenExpiresIn - 60) * 1000;

    const refreshTimeout = setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);

    return () => clearTimeout(refreshTimeout);
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        refreshAccessToken,
        username,
        userId,
        roles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
