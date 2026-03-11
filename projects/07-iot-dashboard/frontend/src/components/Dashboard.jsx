import React, { useState } from 'react';
import SensorCard from './SensorCard.jsx';
import TrendChart from './TrendChart.jsx';
import AlertSettings from './AlertSettings.jsx';

export default function Dashboard({ sensors, latestReadings, alerts, connected, onRefresh }) {
  const [activeTab, setActiveTab] = useState('live');

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">🌡️ IoT Weather Dashboard</h1>
            <p className="text-slate-400 text-xs mt-0.5">Real-time sensor monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-sm ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {connected ? 'Live' : 'Disconnected'}
            </div>
            {unacknowledgedAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                {unacknowledgedAlerts.length} Alert{unacknowledgedAlerts.length > 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={onRefresh}
              className="text-slate-300 hover:text-white text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1 w-fit mb-6 border border-slate-700">
          {[
            { id: 'live', label: '📡 Live View' },
            { id: 'trends', label: '📈 Trends' },
            { id: 'alerts', label: `🔔 Alerts${unacknowledgedAlerts.length > 0 ? ` (${unacknowledgedAlerts.length})` : ''}` },
            { id: 'settings', label: '⚙️ Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live View */}
        {activeTab === 'live' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {sensors.map(sensor => (
                <SensorCard
                  key={sensor.id}
                  sensor={sensor}
                  reading={latestReadings[sensor.id]}
                />
              ))}
              {sensors.length === 0 && (
                <div className="col-span-3 text-center text-slate-400 py-12">
                  <p className="text-4xl mb-3">📡</p>
                  <p>No sensors found. Make sure the backend is running and connected to PostgreSQL.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trends */}
        {activeTab === 'trends' && (
          <TrendChart sensors={sensors} />
        )}

        {/* Alerts */}
        {activeTab === 'alerts' && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">🔔 Recent Alerts</h2>
            {alerts.length === 0 ? (
              <div className="text-center text-slate-400 py-12">
                <p className="text-4xl mb-3">✅</p>
                <p>No alerts. All sensors are within normal ranges.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert, i) => (
                  <div
                    key={alert.id || i}
                    className={`flex items-start justify-between p-4 rounded-lg border ${
                      alert.acknowledged
                        ? 'bg-slate-700/30 border-slate-700 opacity-60'
                        : 'bg-red-900/20 border-red-700/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          alert.type?.includes('temp') ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {alert.type}
                        </span>
                        <span className="text-slate-400 text-xs">{alert.sensor_name}</span>
                      </div>
                      <p className="text-sm text-slate-200">{alert.message}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded ml-3 whitespace-nowrap">
                        Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <AlertSettings sensors={sensors} onUpdate={onRefresh} />
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
