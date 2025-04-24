import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || ''); 


  const login = (accessToken, refreshToken, userData) => {
    console.log("Keycloak Full Response:", userData); 

    const parsedToken = parseJwt(accessToken);
    const usernameFromToken = parsedToken?.preferred_username || parsedToken?.sub;
    const userIdFromToken = parsedToken?.sub;

    console.log("Username:", usernameFromToken); 
    console.log("User ID:", userIdFromToken); 

    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('username', usernameFromToken);
    localStorage.setItem('userId', userIdFromToken);

    setUsername(usernameFromToken); 
    setUserId(userIdFromToken);      
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setUsername('');  
    setUserId('');     
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

      if (response.ok) {
        const data = await response.json();
        login(data.access_token, data.refresh_token, username); 
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, refreshAccessToken, username, userId }}>
      {children}
    </AuthContext.Provider>
  );
};
