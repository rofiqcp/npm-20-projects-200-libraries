import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SustainabilityReport() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('/api/sustainability').then(r => setData(r.data)).catch(() => {
      setData({ renewablePct: 34.5, co2Saved: 125.4, co2Emitted: 890.2, sustainabilityScore: 58, monthlyCost: 42800, treesEquivalent: 6 });
    });
  }, []);

  if (!data) return null;

  const scoreColor = data.sustainabilityScore >= 80 ? '#22c55e' : data.sustainabilityScore >= 60 ? '#f59e0b' : '#ef4444';
  const scoreLetter = data.sustainabilityScore >= 80 ? 'A' : data.sustainabilityScore >= 60 ? 'B' : data.sustainabilityScore >= 40 ? 'C' : 'D';

  return (
    <div className="rounded-xl p-5 border" style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
      <h3 className="font-semibold text-white mb-4">🌍 Sustainability Report</h3>

      {/* Score */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-xl" style={{ backgroundColor: '#022c22' }}>
        <div className="text-center">
          <div className="text-4xl font-black" style={{ color: scoreColor }}>{scoreLetter}</div>
          <div className="text-xs text-emerald-300">Rating</div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: '#6ee7b7' }}>Sustainability Score</span>
            <span className="font-bold text-white">{data.sustainabilityScore}/100</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#065f46' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${data.sustainabilityScore}%`, backgroundColor: scoreColor }} />
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Renewable Energy', value: `${data.renewablePct}%`, icon: '🌱', color: '#22c55e' },
          { label: 'CO₂ Saved',        value: `${data.co2Saved}t`,    icon: '🌿', color: '#6ee7b7' },
          { label: 'CO₂ Emitted',      value: `${data.co2Emitted}t`,  icon: '💨', color: '#ef4444' },
          { label: 'Monthly Cost',     value: `$${data.monthlyCost?.toLocaleString()}`, icon: '💰', color: '#fbbf24' },
          { label: 'Trees Equivalent', value: data.treesEquivalent,   icon: '🌳', color: '#22c55e' },
          { label: 'Grid Dependency',  value: `${(100 - data.renewablePct).toFixed(1)}%`, icon: '🔌', color: '#6b7280' }
        ].map(m => (
          <div key={m.label} className="p-2 rounded-lg" style={{ backgroundColor: '#022c22' }}>
            <p className="text-xs text-emerald-300/70">{m.icon} {m.label}</p>
            <p className="text-sm font-bold" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
