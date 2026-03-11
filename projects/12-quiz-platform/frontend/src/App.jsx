import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Results from './components/Results';
import QuizCreator from './components/QuizCreator';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-4xl animate-pulse">🧠</div></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/results/:id" element={<Results />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><div className="max-w-5xl mx-auto px-4 py-8"><Dashboard /></div></ProtectedRoute>}
          />
          <Route
            path="/create"
            element={<ProtectedRoute><div className="max-w-3xl mx-auto px-4 py-8"><div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Create New Quiz</h1><p className="text-gray-500 mt-1">Build your quiz and share it with the world</p></div><QuizCreator /></div></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
