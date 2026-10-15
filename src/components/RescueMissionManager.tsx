import React, { useState } from 'react';
import {
  LifeBuoy,
  Users,
  Shield,
  Activity,
  Heart,
  Battery,
  AlertTriangle,
  Plus,
  CheckCircle,
  Clock,
  Radio,
} from 'lucide-react';
import { useMine } from '../context/MineContext';
import { RescueMission } from '../types/mine';

export const RescueMissionManager: React.FC = () => {
  const { miners, rescueMissions, createMission, updateMissionStatus, selectedZone } = useMine();

  const [showNewMissionForm, setShowNewMissionForm] = useState(false);
  const [teamName, setTeamName] = useState('Proto-6 Mine Rescue Squad');
  const [targetZone, setTargetZone] = useState(selectedZone);
  const [hazardLevel, setHazardLevel] = useState<RescueMission['hazardLevel']>('high');
  const [trappedCount, setTrappedCount] = useState(0);

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMission({
      title: `Emergency Sweep & Atmospheric Purge - ${targetZone}`,
      targetZone,
      status: 'dispatched',
      teamName,
      trappedMinersCount: Number(trappedCount) || 0,
      evacuatedMinersCount: 5 - (Number(trappedCount) || 0),
      hazardLevel,
      aiGuidance: 'Team must deploy with positive-pressure BG4 breathing apparatus and multi-gas detector.',
    });
    setShowNewMissionForm(false);
  };

  const getStatusColor = (status: RescueMission['status']) => {
    switch (status) {
      case 'dispatched':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
      case 'in_progress':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wide">
              UNDERGROUND RESCUE DISPATCH &amp; PERSONNEL TRACKING
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              RFID Miner tracking, vital biometrics, and rescue squad deployment
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewMissionForm(!showNewMissionForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition shadow"
        >
          <Plus className="w-4 h-4" />
          <span>DISPATCH RESCUE TEAM</span>
        </button>
      </div>

      {/* New Mission Modal / Drawer */}
      {showNewMissionForm && (
        <form onSubmit={handleCreateMission} className="p-4 bg-slate-950 border border-amber-500/40 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-amber-400 uppercase">DISPATCH RESCUE OPERATION</span>
            <button
              type="button"
              onClick={() => setShowNewMissionForm(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Rescue Squad Designation:</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Target Shaft Sector:</label>
              <input
                type="text"
                value={targetZone}
                onChange={(e) => setTargetZone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Atmospheric Hazard Severity:</label>
              <select
                value={hazardLevel}
                onChange={(e) => setHazardLevel(e.target.value as RescueMission['hazardLevel'])}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
              >
                <option value="low">Low (Standard Precaution)</option>
                <option value="medium">Medium (Ventilation Compromised)</option>
                <option value="high">High (Gas Ingress / High Temp)</option>
                <option value="extreme">Extreme (Explosive Atmosphere)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Estimated Miners Trapped:</label>
              <input
                type="number"
                min="0"
                max="50"
                value={trappedCount}
                onChange={(e) => setTrappedCount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNewMissionForm(false)}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
            >
              Confirm Dispatch
            </button>
          </div>
        </form>
      )}

      {/* Grid: Active Missions & Miners Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rescue Missions Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300">
            <span>ACTIVE RESCUE OPERATIONS ({rescueMissions.length})</span>
            <span className="text-[10px] text-slate-400">DGMS Mine Rescue Rules</span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {rescueMissions.map((mission) => (
              <div
                key={mission.id}
                className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 font-mono text-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-200">{mission.title}</h4>
                    <p className="text-[11px] text-slate-400">
                      Squad: <strong className="text-amber-300">{mission.teamName}</strong> | Sector: {mission.targetZone}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(
                      mission.status
                    )}`}
                  >
                    {mission.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800/80">
                  {mission.aiGuidance}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Trapped: {mission.trappedMinersCount} | Evacuated: {mission.evacuatedMinersCount}</span>
                  <div className="flex items-center gap-1.5">
                    {mission.status === 'dispatched' && (
                      <button
                        onClick={() => updateMissionStatus(mission.id, 'in_progress')}
                        className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                      >
                        Engage Sector
                      </button>
                    )}
                    {mission.status !== 'completed' && (
                      <button
                        onClick={() => updateMissionStatus(mission.id, 'completed')}
                        className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      >
                        Mark Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Miner Biometrics & Location Tracking Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300">
            <span>UNDERGROUND WORKERS ACTIVE ({miners.length})</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" /> RFID Beacons Online
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {miners.map((miner) => (
              <div
                key={miner.id}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{miner.name}</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-cyan-400">
                      {miner.beaconId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Location: {miner.shaftLevel}</p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="flex items-center gap-1 text-[11px] text-slate-300">
                    <Heart className="w-3 h-3 text-red-400 animate-pulse" />
                    <span>{miner.heartRate} bpm</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-300">
                    <Battery className="w-3 h-3 text-emerald-400" />
                    <span>{miner.battery}%</span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      miner.vitals === 'normal'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    }`}
                  >
                    {miner.vitals}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
