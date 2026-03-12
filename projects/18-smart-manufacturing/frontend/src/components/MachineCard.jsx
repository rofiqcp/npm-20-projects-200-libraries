const STATUS_CONFIG = {
  running:     { label: 'Running',     color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30',  dot: 'bg-green-400 animate-pulse' },
  idle:        { label: 'Idle',        color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', dot: 'bg-yellow-400' },
  maintenance: { label: 'Maintenance', color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/30',    dot: 'bg-blue-400 animate-pulse' },
  error:       { label: 'Error',       color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/30',      dot: 'bg-red-400 animate-pulse' }
};

function GaugeBar({ value, max, color, label, unit }) {
  const pct = Math.min(100, (value / max) * 100);
  const barColor = pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : color;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-medium">{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MachineCard({ machine }) {
  if (!machine) return null;
  const cfg = STATUS_CONFIG[machine.status] || STATUS_CONFIG.idle;
  const oeeColor = machine.oeeScore >= 85 ? 'text-green-400' : machine.oeeScore >= 70 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className={`border rounded-xl p-4 transition-all duration-300 ${cfg.bg}`} style={{backgroundColor:'#0f172a'}}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-white text-sm">{machine.name}</h4>
          <p className="text-xs text-slate-400">{machine.type}</p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${cfg.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <span className={cfg.color}>{cfg.label}</span>
        </div>
      </div>

      {/* OEE Score */}
      <div className="flex items-center justify-between mb-3 p-2 rounded-lg bg-slate-800/50">
        <span className="text-xs text-slate-400">OEE Score</span>
        <span className={`text-xl font-bold ${oeeColor}`}>{machine.oeeScore}%</span>
      </div>

      {/* Sensor Gauges */}
      <div className="space-y-2 mb-3">
        <GaugeBar value={machine.temperature} max={machine.type === 'Robotic Welder' || machine.type === 'Injection Mold' ? 400 : 100} color="bg-orange-500" label="Temperature" unit="°C" />
        <GaugeBar value={machine.vibration} max={10} color="bg-purple-500" label="Vibration" unit=" g" />
        <GaugeBar value={machine.power} max={60} color="bg-cyan-500" label="Power" unit=" kW" />
      </div>

      {/* OEE breakdown */}
      <div className="grid grid-cols-3 gap-1 text-center">
        {[['A', machine.availability, 'Avail.'], ['P', machine.performance, 'Perf.'], ['Q', machine.quality, 'Quality']].map(([key, val, lbl]) => (
          <div key={key} className="bg-slate-800/50 rounded p-1">
            <p className="text-xs text-slate-500">{lbl}</p>
            <p className={`text-xs font-bold ${val >= 90 ? 'text-green-400' : val >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>{val}%</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-2">Last maint: {machine.lastMaintenance}</p>
    </div>
  );
}
