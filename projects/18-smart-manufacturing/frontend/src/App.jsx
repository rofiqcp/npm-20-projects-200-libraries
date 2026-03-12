import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Analytics from './pages/Analytics.jsx';

export default function App() {
  return (
    <div className="min-h-screen" style={{backgroundColor:'#0a0f1a',color:'#e2e8f0'}}>
      <nav className="border-b px-6 py-4" style={{backgroundColor:'#0f172a',borderColor:'#1e3a5f'}}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏭</span>
            <span className="text-xl font-bold text-cyan-400">SmartFactory</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{backgroundColor:'#1e3a5f',color:'#7dd3fc'}}>Industry 4.0</span>
          </div>
          <div className="flex gap-6 text-sm">
            <NavLink to="/" end className={({isActive}) => isActive ? 'text-cyan-400 font-medium' : 'text-slate-400 hover:text-white'}>Dashboard</NavLink>
            <NavLink to="/analytics" className={({isActive}) => isActive ? 'text-cyan-400 font-medium' : 'text-slate-400 hover:text-white'}>Analytics</NavLink>
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
