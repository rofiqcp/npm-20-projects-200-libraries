const EFFICIENCY_CONFIG = {
  A: { color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30',  label: 'Excellent' },
  B: { color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/30',    label: 'Good' },
  C: { color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', label: 'Average' },
  D: { color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/30',      label: 'Poor' }
};

const BUILDING_ICONS = { 'Office': '🏢', 'R&D': '🔬', 'Industrial': '🏭', 'Data Center': '💻', 'Retail': '🛍️' };

export default function BuildingCard({ building, isUpdating }) {
  if (!building) return null;
  const cfg = EFFICIENCY_CONFIG[building.efficiency] || EFFICIENCY_CONFIG.C;
  const renewablePct = building.consumption > 0 ? Math.round((building.solar + building.wind) / building.consumption * 100) : 0;
  const usagePct = building.targetKwh > 0 ? Math.round(building.consumption / building.targetKwh * 100) : 0;
  const overTarget = usagePct > 100;

  return (
    <div className={`rounded-xl p-4 border transition-all duration-300 ${isUpdating ? 'ring-1 ring-green-400/50' : ''}`}
      style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{BUILDING_ICONS[building.type] || '🏠'}</span>
          <div>
            <p className="font-semibold text-white text-sm">{building.name}</p>
            <p className="text-xs text-emerald-300/60">{building.type} · {building.floors}F · {building.area.toLocaleString()}m²</p>
          </div>
        </div>
        <span className={`text-sm font-bold px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color}`}>
          {building.efficiency}
        </span>
      </div>

      {/* Consumption vs target */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1" style={{ color: '#6ee7b7' }}>
          <span>Consumption: {building.consumption.toLocaleString()} kWh</span>
          <span className={overTarget ? 'text-red-400 font-bold' : 'text-emerald-300'}>{usagePct}% of target</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#065f46' }}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${overTarget ? 'bg-red-500' : renewablePct > 50 ? 'bg-green-500' : 'bg-yellow-500'}`}
            style={{ width: `${Math.min(120, usagePct)}%` }}
          />
        </div>
      </div>

      {/* Energy mix */}
      <div className="grid grid-cols-3 gap-1 text-center mb-2">
        {[['☀️', 'Solar', building.solar, '#fbbf24'], ['💨', 'Wind', building.wind, '#60a5fa'], ['🔌', 'Grid', building.grid, '#6b7280']].map(([icon, label, val, color]) => (
          <div key={label} className="rounded p-1.5" style={{ backgroundColor: '#022c22' }}>
            <p className="text-xs">{icon} {label}</p>
            <p className="text-xs font-bold" style={{ color }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Renewable badge */}
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: '#6ee7b7' }}>🌿 Renewable</span>
        <span className={`font-bold ${renewablePct >= 50 ? 'text-green-400' : renewablePct >= 25 ? 'text-yellow-400' : 'text-red-400'}`}>
          {renewablePct}%
        </span>
      </div>
    </div>
  );
}
