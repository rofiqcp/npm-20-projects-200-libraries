import { useState } from 'react';
import axios from 'axios';

const SCENES = [
  { id: 'good_morning', name: 'Good Morning', icon: '🌅', desc: 'Brighten up for the day', color: 'from-orange-500/20 to-yellow-500/20 border-orange-500/30' },
  { id: 'good_night',   name: 'Good Night',   icon: '🌙', desc: 'Wind down and secure',   color: 'from-blue-900/40 to-indigo-900/40 border-blue-500/30' },
  { id: 'away',         name: 'Away Mode',     icon: '🏠', desc: 'Lock up and monitor',   color: 'from-red-500/20 to-orange-500/20 border-red-500/30' },
  { id: 'movie_mode',   name: 'Movie Mode',    icon: '🎬', desc: 'Set the mood for film', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30' }
];

export default function SceneManager({ onActivated }) {
  const [activating, setActivating] = useState(null);
  const [lastActivated, setLastActivated] = useState(null);

  const activateScene = async (sceneId) => {
    setActivating(sceneId);
    try {
      await axios.post(`/api/scenes/${sceneId}/activate`);
      setLastActivated(sceneId);
      if (onActivated) onActivated(sceneId);
    } catch (err) {
      console.error('Scene activation failed', err);
      setLastActivated(sceneId);
    }
    setTimeout(() => setActivating(null), 800);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">🎭 Scenes</h3>
      <div className="grid grid-cols-2 gap-3">
        {SCENES.map(scene => (
          <button
            key={scene.id}
            onClick={() => activateScene(scene.id)}
            disabled={activating === scene.id}
            className={`bg-gradient-to-br ${scene.color} border rounded-xl p-4 text-left hover:scale-105 transition-all duration-200 focus:outline-none group ${lastActivated === scene.id ? 'ring-2 ring-blue-400' : ''}`}
          >
            <div className="text-3xl mb-2">{activating === scene.id ? '⏳' : scene.icon}</div>
            <p className="font-semibold text-sm text-white">{scene.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{scene.desc}</p>
            {lastActivated === scene.id && activating !== scene.id && (
              <span className="text-xs text-green-400 mt-1 block">✓ Activated</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
