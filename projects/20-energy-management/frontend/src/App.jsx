import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Analytics from './pages/Analytics.jsx';

export default function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#022c22', color: '#ecfdf5' }}>
      <nav className="border-b px-6 py-4" style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold text-green-400">EnergyHub</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#065f46', color: '#6ee7b7' }}>Resource Management</span>
          </div>
          <div className="flex gap-6 text-sm">
            <NavLink to="/" end className={({isActive}) => isActive ? 'text-green-400 font-medium' : 'text-emerald-200/60 hover:text-white'}>Dashboard</NavLink>
            <NavLink to="/analytics" className={({isActive}) => isActive ? 'text-green-400 font-medium' : 'text-emerald-200/60 hover:text-white'}>Analytics</NavLink>
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
