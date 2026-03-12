import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏪</span>
            <span className="text-xl font-bold text-violet-400">MicroShop</span>
            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded">Microservices Architecture</span>
          </div>
          <NavLink to="/" className="text-slate-400 hover:text-white text-sm">Store</NavLink>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}
