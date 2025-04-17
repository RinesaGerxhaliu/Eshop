import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const login = (accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
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
    params.append('grant_type', 'refresh_token');
    params.append('client_id', 'myclient');
    params.append('refresh_token', refreshToken);
    params.append('client_secret', 'VvZg6mZTpji9AQNRwwQLPalqWR015c7q');

    try {
      const response = await fetch('http://localhost:9090/realms/myrealm/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        logout();
        return;
      }

      const data = await response.json();
      console.log("Refreshed Token:", data.access_token);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      setIsLoggedIn(true);

    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

  useEffect(() => {
    const checkInitialTokens = () => {
      const accessToken = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const currentTime = Date.now() / 1000;

      if (!accessToken || !refreshToken) {
        logout();
        return;
      }

      const parsedAccessToken = parseJwt(accessToken);
      const parsedRefreshToken = parseJwt(refreshToken);

      if (!parsedAccessToken || parsedAccessToken.exp < currentTime) {
        console.log("Access token expired at start.");
      }

      if (!parsedRefreshToken || parsedRefreshToken.exp < currentTime) {
        console.log("Refresh token expired at start, logging out...");
        logout();
        return;
      }
    };

    checkInitialTokens();

    const interval = setInterval(() => {
      refreshAccessToken();
    }, 4 * 60 * 1000); // çdo 4 minuta

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
