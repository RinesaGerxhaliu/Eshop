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
    } catch (e) {
      return null;
    }
  };

  const login = (accessToken, refreshToken, userData) => {
    const parsedToken = parseJwt(accessToken);
    const usernameFromToken = parsedToken?.preferred_username || parsedToken?.sub;
    const userIdFromToken = parsedToken?.sub;
    const rolesFromToken = parsedToken?.resource_access?.myclient?.roles || [];

    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
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
    localStorage.removeItem("refreshToken");
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
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      logout();
      return;
    }

    const parsedRefreshToken = parseJwt(refreshToken);
    const currentTime = Date.now() / 1000;

    if (!parsedRefreshToken || parsedRefreshToken.exp < currentTime) {
      console.log("Refresh token expired, logging out...");
      logout();
      return;
    }

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", "myclient");
    params.append("refresh_token", refreshToken);
  

    try {
      const response = await fetch(
        "http://localhost:9090/realms/myrealm/protocol/openid-connect/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      if (response.ok) {
        const data = await response.json();
        login(data.access_token, data.refresh_token, username);
      } else {
        const errorText = await response.text();
        console.error("Failed to refresh token:", errorText);
      }
    } catch (error) {
      console.error("Error during token refresh:", error);
    }
  }, [username]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token || !refreshToken) return;

    const parsedToken = parseJwt(token);
    const parsedRefreshToken = parseJwt(refreshToken);

    if (!parsedToken || !parsedRefreshToken) return;

    const tokenExpiresIn = parsedToken.exp - Date.now() / 1000;
    const refreshExpiresIn = parsedRefreshToken.exp - Date.now() / 1000;

    const refreshTime = (tokenExpiresIn - 60) * 1000; 
    const logoutTime = (refreshExpiresIn - 10) * 1000; 

    const refreshTimeout = setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);

    const logoutTimeout = setTimeout(() => {
      console.log("Refresh token expired. Logging out...");
      logout();
    }, logoutTime);

    return () => {
      clearTimeout(refreshTimeout);
      clearTimeout(logoutTimeout);
    };
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
