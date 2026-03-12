import React, { createContext, useContext, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BoardView from './pages/BoardView.jsx';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kanban_user')); } catch { return null; }
  });

  const login = (token, userData) => {
    localStorage.setItem('kanban_token', token);
    localStorage.setItem('kanban_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('kanban_token');
    localStorage.removeItem('kanban_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/board/:id" element={user ? <BoardView /> : <Navigate to="/login" />} />
      </Routes>
    </AuthContext.Provider>
  );
}
