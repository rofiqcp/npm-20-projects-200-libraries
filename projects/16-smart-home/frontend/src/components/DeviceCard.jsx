import { useState } from 'react';
import axios from 'axios';

const DEVICE_ICONS = { light: '💡', thermostat: '🌡️', camera: '📷', lock: '🔒', fan: '💨', plug: '🔌' };
const TYPE_COLORS = {
  light: 'border-yellow-500/30 bg-yellow-500/5',
  thermostat: 'border-orange-500/30 bg-orange-500/5',
  camera: 'border-blue-500/30 bg-blue-500/5',
  lock: 'border-red-500/30 bg-red-500/5',
  fan: 'border-cyan-500/30 bg-cyan-500/5',
  plug: 'border-green-500/30 bg-green-500/5',
};

export default function DeviceCard({ device, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const control = async (action, value) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/devices/${device.id}/control`, { action, value });
      onUpdate(data);
    } catch {
      // Optimistic update fallback
      const updated = { ...device };
      if (action === 'toggle') updated.status = device.status === 'on' ? 'off' : 'on';
      if (action === 'setBrightness') { updated.brightness = value; updated.power = Math.round(value * 0.15); }
      if (action === 'setTemperature') updated.targetTemp = value;
      if (action === 'setSpeed') { updated.speed = value; updated.power = value * 15; }
      if (updated.status === 'off') updated.power = 0;
      onUpdate(updated);
    }
    setLoading(false);
  };

  const isOn = device.status === 'on';
  const colorClass = TYPE_COLORS[device.type] || 'border-gray-600 bg-gray-800';

  return (
    <div className={`rounded-xl border p-4 ${colorClass} transition-all duration-200 ${isOn ? 'opacity-100' : 'opacity-60'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{DEVICE_ICONS[device.type]}</span>
          <div>
            <p className="font-semibold text-sm text-white">{device.name}</p>
            <p className="text-xs text-gray-400">{device.room}</p>
          </div>
        </div>
        <button
          onClick={() => control('toggle')}
          disabled={loading}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${isOn ? 'bg-blue-500' : 'bg-gray-600'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isOn ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Power badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${isOn ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
        <span className="text-xs text-gray-400">{isOn ? `${device.power || 0}W` : 'Standby'}</span>
      </div>

      {/* Device-specific controls */}
      {device.type === 'light' && isOn && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Brightness</span><span>{device.brightness}%</span>
          </div>
          <input type="range" min="10" max="100" value={device.brightness || 50}
            onChange={e => control('setBrightness', +e.target.value)}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-600 accent-yellow-400" />
        </div>
      )}

      {device.type === 'thermostat' && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Temp: {device.temperature}°C</span>
            <span>Target: {device.targetTemp}°C</span>
          </div>
          {isOn && (
            <input type="range" min="16" max="30" value={device.targetTemp || 22}
              onChange={e => control('setTemperature', +e.target.value)}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-600 accent-orange-400" />
          )}
        </div>
      )}

      {device.type === 'fan' && isOn && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Speed</span><span>{['Off','Low','Med','High'][device.speed] || 'Off'}</span>
          </div>
          <div className="flex gap-1">
            {[0,1,2,3].map(s => (
              <button key={s} onClick={() => control('setSpeed', s)}
                className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${device.speed === s ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {['Off','Low','Med','Hi'][s]}
              </button>
            ))}
          </div>
        </div>
      )}

      {device.type === 'lock' && (
        <button onClick={() => control('toggleLock')}
          className={`w-full mt-1 py-1.5 rounded text-xs font-medium transition-colors ${device.locked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
          {device.locked ? '🔒 Locked' : '🔓 Unlocked'}
        </button>
      )}

      {device.type === 'camera' && (
        <div className={`text-xs px-2 py-1 rounded mt-1 ${device.recording ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>
          {device.recording ? '🔴 Recording' : '⚫ Idle'}
        </div>
      )}
    </div>
  );
}
