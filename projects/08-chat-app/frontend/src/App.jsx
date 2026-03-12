import React, { createContext, useContext, useState, useEffect } from 'react';
import Login from './pages/Login.jsx';
import Chat from './pages/Chat.jsx';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('chat_token'));

  useEffect(() => {
    const saved = localStorage.getItem('chat_user');
    if (saved && token) {
      try { setUser(JSON.parse(saved)); } catch { logout(); }
    }
  }, []);

  const login = (tok, userData) => {
    localStorage.setItem('chat_token', tok);
    localStorage.setItem('chat_user', JSON.stringify(userData));
    setToken(tok);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {user ? <Chat /> : <Login />}
    </AuthContext.Provider>
  );
}
