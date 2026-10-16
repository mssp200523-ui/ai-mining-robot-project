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
  UserPlus,
  Trash2,
  X,
} from 'lucide-react';
import { useMine } from '../context/MineContext';
import { MinerWorker, RescueMission } from '../types/mine';

export const RescueMissionManager: React.FC = () => {
  const {
    miners,
    addMiner,
    removeMiner,
    clearMiners,
    rescueMissions,
    createMission,
    updateMissionStatus,
    selectedZone,
  } = useMine();

  const [showNewMissionForm, setShowNewMissionForm] = useState(false);
  const [teamName, setTeamName] = useState('Proto-6 Mine Rescue Squad');
  const [targetZone, setTargetZone] = useState(selectedZone);
  const [hazardLevel, setHazardLevel] = useState<RescueMission['hazardLevel']>('high');
  const [trappedCount, setTrappedCount] = useState(0);

  // Register worker form state
  const [showAddMinerModal, setShowAddMinerModal] = useState(false);
  const [newMinerName, setNewMinerName] = useState('');
  const [newMinerBeacon, setNewMinerBeacon] = useState('');
  const [newMinerShaft, setNewMinerShaft] = useState(selectedZone);
  const [newMinerHeartRate, setNewMinerHeartRate] = useState(78);
  const [newMinerBattery, setNewMinerBattery] = useState(95);
  const [newMinerVitals, setNewMinerVitals] = useState<MinerWorker['vitals']>('normal');

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMission({
      title: `Emergency Sweep & Atmospheric Purge - ${targetZone}`,
      targetZone,
      status: 'dispatched',
      teamName,
      trappedMinersCount: Number(trappedCount) || 0,
      evacuatedMinersCount: Math.max(0, miners.length - (Number(trappedCount) || 0)),
      hazardLevel,
      aiGuidance: 'Team must deploy with positive-pressure BG4 breathing apparatus and multi-gas detector.',
    });
    setShowNewMissionForm(false);
  };

  const handleAddMiner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMinerName.trim()) return;

    addMiner({
      name: newMinerName.trim(),
      beaconId: newMinerBeacon.trim() || `BCN-${Math.floor(100 + Math.random() * 900)}`,
      shaftLevel: newMinerShaft,
      vitals: newMinerVitals,
      heartRate: Number(newMinerHeartRate) || 78,
      battery: Number(newMinerBattery) || 95,
      status: 'active',
    });

    setNewMinerName('');
    setNewMinerBeacon('');
    setShowAddMinerModal(false);
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
              RESCUE TEAMS &amp; WORKER TRACKING
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Worker safety status, heart rate, and rescue team dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddMinerModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono text-xs font-bold transition shadow"
          >
            <UserPlus className="w-4 h-4" />
            <span>ADD WORKER</span>
          </button>
          <button
            onClick={() => setShowNewMissionForm(!showNewMissionForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>SEND RESCUE TEAM</span>
          </button>
        </div>
      </div>

      {/* Register Miner Modal / Drawer */}
      {showAddMinerModal && (
        <form onSubmit={handleAddMiner} className="p-4 bg-slate-950 border border-cyan-500/40 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-cyan-400 uppercase">REGISTER ACTIVE UNDERGROUND WORKER</span>
            <button
              type="button"
              onClick={() => setShowAddMinerModal(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Worker Name &amp; Role:</label>
              <input
                type="text"
                placeholder="e.g. John D. (Shift Specialist)"
                value={newMinerName}
                onChange={(e) => setNewMinerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">RFID Beacon Tag ID:</label>
              <input
                type="text"
                placeholder="e.g. BCN-101"
                value={newMinerBeacon}
                onChange={(e) => setNewMinerBeacon(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Assigned Shaft Level:</label>
              <select
                value={newMinerShaft}
                onChange={(e) => setNewMinerShaft(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Shaft 1 (-150m Haulage Drift)">Shaft 1 (-150m Haulage Drift)</option>
                <option value="Shaft 2 (-320m Working Face)">Shaft 2 (-320m Working Face)</option>
                <option value="Shaft 3 (-480m Deep Sump)">Shaft 3 (-480m Deep Sump)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Heart Rate (bpm):</label>
              <input
                type="number"
                min="40"
                max="180"
                value={newMinerHeartRate}
                onChange={(e) => setNewMinerHeartRate(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Beacon Battery (%):</label>
              <input
                type="number"
                min="1"
                max="100"
                value={newMinerBattery}
                onChange={(e) => setNewMinerBattery(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Vitals Status:</label>
              <select
                value={newMinerVitals}
                onChange={(e) => setNewMinerVitals(e.target.value as MinerWorker['vitals'])}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
              >
                <option value="normal">Normal</option>
                <option value="distress">Distress</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddMinerModal(false)}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
            >
              Save Worker
            </button>
          </div>
        </form>
      )}

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
              <X className="w-4 h-4" />
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
            {rescueMissions.length === 0 ? (
              <div className="p-6 rounded-lg bg-slate-950/60 border border-dashed border-slate-800 text-center font-mono space-y-2">
                <LifeBuoy className="w-7 h-7 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-bold text-xs">No Active Rescue Operations</p>
                <p className="text-slate-500 text-[11px] max-w-xs mx-auto">
                  Rescue squads are on standby at surface base. Dispatch a squad when hazard alerts occur.
                </p>
              </div>
            ) : (
              rescueMissions.map((mission) => (
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
              ))
            )}
          </div>
        </div>

        {/* Miner Biometrics & Location Tracking Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300">
            <span>UNDERGROUND WORKERS ACTIVE ({miners.length})</span>
            <div className="flex items-center gap-2">
              {miners.length > 0 && (
                <button
                  type="button"
                  onClick={clearMiners}
                  className="text-[10px] text-red-400 hover:text-red-300 transition"
                  title="Clear all registered workers"
                >
                  Clear
                </button>
              )}
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> RFID Online
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {miners.length === 0 ? (
              <div className="p-6 rounded-lg bg-slate-950/60 border border-dashed border-slate-800 text-center font-mono space-y-2.5">
                <Users className="w-7 h-7 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-bold text-xs">No Active Workers Registered</p>
                <p className="text-slate-500 text-[11px] max-w-xs mx-auto">
                  Dataset has been removed. Personnel will appear here once registered or when RFID beacon telemetry is received.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddMinerModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs transition mt-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Worker Beacon</span>
                </button>
              </div>
            ) : (
              miners.map((miner) => (
                <div
                  key={miner.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-xs flex items-center justify-between group hover:border-slate-700 transition"
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

                  <div className="flex items-center gap-3 text-right">
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

                    <button
                      type="button"
                      onClick={() => removeMiner(miner.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                      title="Remove worker"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
