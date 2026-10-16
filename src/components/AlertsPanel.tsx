import React, { useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Volume2,
  VolumeX,
  XCircle,
  ShieldAlert,
} from 'lucide-react';
import { useMine } from '../context/MineContext';
import { SafetyAlert } from '../types/mine';

export const AlertsPanel: React.FC = () => {
  const {
    alerts,
    activeAlertCount,
    criticalAlertCount,
    acknowledgeAlert,
    resolveAlert,
    isAlarmSounding,
    stopAlarmSound,
  } = useMine();

  const [filter, setFilter] = useState<'all' | 'active' | 'critical'>('all');

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'active') return alert.status === 'active';
    if (filter === 'critical') return alert.severity === 'critical';
    return true;
  });

  const getSeverityBadge = (severity: SafetyAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  const getStatusBadge = (status: SafetyAlert['status']) => {
    switch (status) {
      case 'active':
        return 'bg-red-500 text-white animate-pulse';
      case 'acknowledged':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'resolved':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wide">
                SAFETY WARNINGS &amp; ALERTS
              </h2>
              {activeAlertCount > 0 && (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                  {activeAlertCount} ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Live warnings when gas, temperature, or humidity levels get too high
            </p>
          </div>
        </div>

        {/* Filter buttons & Siren Silence */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {isAlarmSounding && (
            <button
              onClick={stopAlarmSound}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold transition shadow"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>SILENCE SIREN</span>
            </button>
          )}

          <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded text-xs transition ${
                filter === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-2.5 py-1 rounded text-xs transition ${
                filter === 'active' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({activeAlertCount})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-2.5 py-1 rounded text-xs transition ${
                filter === 'critical' ? 'bg-red-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Critical ({criticalAlertCount})
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-8 text-slate-400 font-mono text-xs border border-dashed border-slate-800 rounded-lg">
          <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
          <p className="font-bold text-slate-300">Atmosphere Within Safe Operational Boundaries</p>
          <p className="text-[11px] text-slate-400 mt-1">
            No threshold triggers currently logged for this filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-lg border font-mono text-xs transition ${
                alert.status === 'active' && alert.severity === 'critical'
                  ? 'bg-red-950/40 border-red-500/80'
                  : alert.status === 'active'
                  ? 'bg-amber-950/30 border-amber-500/60'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityBadge(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusBadge(
                      alert.status
                    )}`}
                  >
                    {alert.status}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Sector: <strong className="text-slate-200">{alert.shaftZone}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Message */}
              <p className="text-slate-200 text-xs font-semibold mb-2">{alert.message}</p>

              {/* Sensor Telemetry snapshot at trigger */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="flex items-center gap-3 text-slate-400">
                  <span>
                    Temp: <strong className="text-slate-200">{alert.temperature}°C</strong>
                  </span>
                  <span>
                    Humidity: <strong className="text-slate-200">{alert.humidity}%</strong>
                  </span>
                  <span>
                    MQ8 Gas: <strong className="text-slate-200">{alert.mq8Gas} ppm</strong>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {alert.status === 'active' && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'resolved' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                    >
                      Resolve Hazard
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
