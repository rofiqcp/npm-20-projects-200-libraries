import React, { createContext, useContext, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Blog from './pages/Blog.jsx';
import Post from './pages/Post.jsx';
import Editor from './pages/Editor.jsx';
import Login from './pages/Login.jsx';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('blog_user')); } catch { return null; }
  });

  const login = (token, userData) => {
    localStorage.setItem('blog_token', token);
    localStorage.setItem('blog_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('blog_token');
    localStorage.removeItem('blog_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Routes>
        <Route path="/" element={<Blog />} />
        <Route path="/post/:slug" element={<Post />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/editor" element={user ? <Editor /> : <Navigate to="/login" />} />
        <Route path="/editor/:id" element={user ? <Editor /> : <Navigate to="/login" />} />
      </Routes>
    </AuthContext.Provider>
  );
}
