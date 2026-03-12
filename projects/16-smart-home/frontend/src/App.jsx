import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Automation from './pages/Automation.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏠</span>
            <span className="text-xl font-bold text-blue-400">SmartHome</span>
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">IoT Control Panel</span>
          </div>
          <div className="flex gap-6">
            <NavLink to="/" end className={({isActive}) => isActive ? 'text-blue-400 font-medium' : 'text-gray-400 hover:text-white'}>
              Dashboard
            </NavLink>
            <NavLink to="/automation" className={({isActive}) => isActive ? 'text-blue-400 font-medium' : 'text-gray-400 hover:text-white'}>
              Automation
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/automation" element={<Automation />} />
        </Routes>
      </main>
    </div>
  );
}
