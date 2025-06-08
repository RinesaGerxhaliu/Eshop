import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [roles, setRoles] = useState([]);

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
    fetch("https://localhost:5050/auth/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("roles");

      setUsername("");
      setUserId("");
      setRoles([]);
      setIsLoggedIn(false);

      navigate("/login");
    });
  };

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await fetch("https://localhost:5050/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      console.log("refreshAccessToken response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("refreshAccessToken data:", data);
        if (data.accessToken) {
          login(data.accessToken);
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error("refreshAccessToken error:", error);
      logout();
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("AuthProvider: token from localStorage =", token);

    if (!token) {
      refreshAccessToken();
      return;
    }

    const parsedToken = parseJwt(token);
    console.log("AuthProvider: parsedToken =", parsedToken);

    if (!parsedToken) {
      refreshAccessToken();
      return;
    }

    const isExpired = parsedToken.exp < Date.now() / 1000;
    console.log("AuthProvider: token isExpired =", isExpired);

    if (isExpired) {
      refreshAccessToken();
      return;
    }

    setUsername(localStorage.getItem("username") || "");
    setUserId(localStorage.getItem("userId") || "");
    setRoles(JSON.parse(localStorage.getItem("roles")) || []);
    setIsLoggedIn(true);
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
