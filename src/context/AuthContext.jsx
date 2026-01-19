import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));

  const login = (accessToken, newRefreshToken, username) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', newRefreshToken);
    setToken(accessToken);
    setRefreshToken(newRefreshToken);
    setUser({ username });
  };

  const logout = async () => {
    try {
      // API call to blacklist token (as per README) 
      if (token && refreshToken) {
          await axios.post('https://devassist360.xyz//api/auth/logout/', 
            { refresh: refreshToken },
            { headers: { Authorization: `Bearer ${token}` } }
          );
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      // Clear local storage regardless of API success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);