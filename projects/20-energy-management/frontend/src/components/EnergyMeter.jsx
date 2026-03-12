export default function EnergyMeter({ current, previous, costPerHour, label }) {
  const safeC = current ?? 0;
  const safeP = previous ?? safeC;
  const changePct = safeP > 0 ? (((safeC - safeP) / safeP) * 100).toFixed(1) : 0;
  const isIncrease = changePct > 0;
  const maxVal = Math.max(safeC * 1.2, 1000);
  const fillPct = Math.min(100, (safeC / maxVal) * 100);
  const arcColor = fillPct > 80 ? '#ef4444' : fillPct > 60 ? '#f59e0b' : '#22c55e';

  return (
    <div className="rounded-xl p-5 border" style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#6ee7b7' }}>{label || '⚡ Energy Meter'}</h3>

      {/* Circular gauge (CSS art) */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#065f46" strokeWidth="10" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={arcColor} strokeWidth="10"
              strokeDasharray={`${fillPct * 2.51} ${251 - fillPct * 2.51}`}
              strokeDashoffset="62.75" strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.8s ease' }} />
          </svg>
          <div className="absolute text-center">
            <div className="text-lg font-bold text-white">{safeC.toLocaleString()}</div>
            <div className="text-xs" style={{ color: '#6ee7b7' }}>kWh</div>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: '#6ee7b7' }}>vs Previous</span>
            <span className={`font-bold ${isIncrease ? 'text-red-400' : 'text-green-400'}`}>
              {isIncrease ? '▲' : '▼'} {Math.abs(changePct)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#6ee7b7' }}>Cost/hr</span>
            <span className="font-bold text-white">${(costPerHour ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#6ee7b7' }}>Status</span>
            <span className={`font-medium ${fillPct > 80 ? 'text-red-400' : fillPct > 60 ? 'text-yellow-400' : 'text-green-400'}`}>
              {fillPct > 80 ? 'High' : fillPct > 60 ? 'Moderate' : 'Optimal'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
