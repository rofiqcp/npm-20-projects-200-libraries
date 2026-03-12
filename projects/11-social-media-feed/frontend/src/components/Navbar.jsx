import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function BirdIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#1d9bf0]" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '🔍', label: 'Explore', path: '/' },
    { icon: '🔔', label: 'Notifications', path: '/' },
    { icon: '✉️', label: 'Messages', path: '/' },
    { icon: '👤', label: 'Profile', path: user ? `/profile/${user.username}` : '/' },
  ];

  return (
    <nav className="sticky top-0 h-screen flex flex-col justify-between py-4 px-3 border-r border-[#2f3336] w-64">
      <div>
        <Link to="/" className="flex items-center p-3 rounded-full hover:bg-white/10 w-fit mb-2">
          <BirdIcon />
        </Link>

        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className="sidebar-link font-medium text-lg"
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <Link to="/" className="mt-4 btn-primary flex items-center justify-center text-base w-full">
          Post
        </Link>
      </div>

      {user && (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 p-3 rounded-full hover:bg-white/10 w-full transition-colors"
          >
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.username}
              className="w-10 h-10 rounded-full bg-gray-700"
            />
            <div className="flex-1 text-left min-w-0">
              <p className="font-bold truncate">{user.username}</p>
              <p className="text-[#536471] text-sm truncate">@{user.username}</p>
            </div>
            <span className="text-[#536471]">•••</span>
          </button>

          {showMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-[#1e2732] rounded-2xl shadow-xl border border-[#2f3336] overflow-hidden animate-fadeIn">
              <Link
                to={`/profile/${user.username}`}
                className="block px-4 py-3 hover:bg-white/10 transition-colors font-medium"
                onClick={() => setShowMenu(false)}
              >
                View Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-red-400 font-medium border-t border-[#2f3336]"
              >
                Log out @{user.username}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
