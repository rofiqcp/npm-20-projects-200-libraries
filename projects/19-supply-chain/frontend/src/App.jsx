import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Analytics from './pages/Analytics.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚢</span>
            <span className="text-xl font-bold text-blue-400">LogiTrack</span>
            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded">Supply Chain</span>
          </div>
          <div className="flex gap-6 text-sm">
            <NavLink to="/" end className={({isActive}) => isActive ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-white'}>Dashboard</NavLink>
            <NavLink to="/analytics" className={({isActive}) => isActive ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-white'}>Analytics</NavLink>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  );
}
