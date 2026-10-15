import React from 'react';
import {
  Layers,
  MapPin,
  Wind,
  Shield,
  AlertCircle,
  Users,
  Compass,
  ArrowDown,
  Activity,
  Flame,
} from 'lucide-react';
import { useMine } from '../context/MineContext';

export const MineShaftMap: React.FC = () => {
  const { currentReading, selectedZone, setSelectedZone, miners } = useMine();

  const isCritical = currentReading.status === 'critical';
  const isWarning = currentReading.status === 'warning';

  const zones = [
    {
      id: 'Shaft 1 (-150m Haulage Drift)',
      name: 'Shaft 1 - Haulage Drift',
      depth: '-150m',
      status: 'nominal',
      minersCount: miners.filter((m) => m.shaftLevel.includes('Shaft 1')).length,
      airVelocity: '2.8 m/s',
      description: 'Conveyor belt line, primary intake airflow.',
    },
    {
      id: 'Shaft 2 (-320m Working Face)',
      name: 'Shaft 2 - Active Mining Face',
      depth: '-320m',
      status: isCritical ? 'critical' : isWarning ? 'warning' : 'nominal',
      minersCount: miners.filter((m) => m.shaftLevel.includes('Shaft 2')).length,
      airVelocity: isCritical ? '4.2 m/s (Boosted)' : '1.9 m/s',
      description: 'Active drilling/extraction face. DHT11 + MQ8 Sensor Cluster Node-02 installed here.',
      hasSensors: true,
    },
    {
      id: 'Shaft 3 (-480m Deep Sump)',
      name: 'Shaft 3 - Drainage Sump & Decline',
      depth: '-480m',
      status: 'nominal',
      minersCount: miners.filter((m) => m.shaftLevel.includes('Shaft 3')).length,
      airVelocity: '1.2 m/s',
      description: 'Dewatering pumps, lower escape incline.',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wide">
              UNDERGROUND MINE SHAFT &amp; TUNNEL CROSS-SECTION
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Real-time atmospheric telemetry mapping &amp; escape route visualization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">ACTIVE SECTOR:</span>
          <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            {selectedZone}
          </span>
        </div>
      </div>

      {/* SVG Interactive Mine Schematic */}
      <div className="relative w-full bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 overflow-hidden">
        <div className="absolute top-2 right-2 flex items-center gap-2 text-[10px] font-mono text-slate-400 z-10 bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>North Haulage Axis | Dip: 14°</span>
        </div>

        <svg viewBox="0 0 900 480" className="w-full h-auto max-h-[460px] select-none">
          {/* Defs for gradients & patterns */}
          <defs>
            <linearGradient id="rockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="gasHazardGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
            </linearGradient>

            <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#334155" strokeWidth="0.4" strokeOpacity="0.3" />
            </pattern>
          </defs>

          {/* Subsurface Rock Background */}
          <rect x="0" y="70" width="900" height="410" fill="url(#rockGradient)" />
          <rect x="0" y="70" width="900" height="410" fill="url(#gridPattern)" />

          {/* Surface Ground Layer (0m) */}
          <rect x="0" y="0" width="900" height="70" fill="#1e293b" />
          <line x1="0" y1="70" x2="900" y2="70" stroke="#64748b" strokeWidth="2.5" />
          <text x="20" y="32" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold">
            SURFACE LEVEL (0.0m) - RESCUE BASE &amp; SURFACE HOIST
          </text>

          {/* Surface Infrastructure Icons & Buildings */}
          {/* Elevator Tower / Headframe */}
          <polygon points="120,70 140,15 160,15 180,70" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <line x1="150" y1="15" x2="150" y2="70" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
          <circle cx="150" cy="18" r="6" fill="#f59e0b" />
          <text x="110" y="60" fill="#f59e0b" fontSize="9" fontFamily="monospace">HEADFRAME</text>

          {/* Surface Main Ventilation Exhaust Fan */}
          <rect x="680" y="30" width="70" height="40" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="690" y="48" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">VENT FAN</text>
          <text x="690" y="62" fill="#94a3b8" fontSize="8" fontFamily="monospace">95 m³/s EXH</text>

          {/* Shaft 1 Vertical Intake Hoist (Left) */}
          <rect x="135" y="70" width="30" height="380" fill="#090d16" stroke="#475569" strokeWidth="1.5" />
          {/* Shaft 2 Vertical Return Airway (Right) */}
          <rect x="700" y="70" width="30" height="380" fill="#090d16" stroke="#475569" strokeWidth="1.5" />

          {/* Fresh Air Flow Down Shaft 1 */}
          <line x1="150" y1="80" x2="150" y2="430" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6,4" />
          <polygon points="150,435 145,423 155,423" fill="#38bdf8" />
          <text x="80" y="110" fill="#38bdf8" fontSize="9" fontFamily="monospace">FRESH AIR INTAKE ↓</text>

          {/* Return Air Up Shaft 2 */}
          <line x1="715" y1="430" x2="715" y2="80" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6,4" />
          <polygon points="715,75 710,87 720,87" fill="#f97316" />
          <text x="735" y="110" fill="#f97316" fontSize="9" fontFamily="monospace">↑ RETURN AIRWAY</text>

          {/* LEVEL 1: -150m Haulage Drift */}
          <g
            className="cursor-pointer transition hover:opacity-90"
            onClick={() => setSelectedZone('Shaft 1 (-150m Haulage Drift)')}
          >
            <rect
              x="165"
              y="150"
              width="535"
              height="34"
              rx="4"
              fill={selectedZone.includes('Shaft 1') ? '#1e293b' : '#0f172a'}
              stroke={selectedZone.includes('Shaft 1') ? '#38bdf8' : '#334155'}
              strokeWidth="2"
            />
            {/* Conveyor Line */}
            <line x1="175" y1="175" x2="690" y2="175" stroke="#475569" strokeWidth="2" strokeDasharray="4,2" />
            <text x="180" y="171" fill="#e2e8f0" fontSize="11" fontFamily="monospace" fontWeight="bold">
              LEVEL 1: MAIN HAULAGE CONVEYOR DRIFT (-150m)
            </text>
            <text x="590" y="171" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              1 Miner (BCN-103)
            </text>
          </g>

          {/* LEVEL 2: -320m Active Coal/Ore Face (Where DHT11 & MQ8 Sensors are placed) */}
          <g
            className="cursor-pointer transition hover:opacity-95"
            onClick={() => setSelectedZone('Shaft 2 (-320m Working Face)')}
          >
            <rect
              x="165"
              y="260"
              width="535"
              height="50"
              rx="4"
              fill={
                isCritical
                  ? '#450a0a'
                  : selectedZone.includes('Shaft 2')
                  ? '#1e293b'
                  : '#0f172a'
              }
              stroke={
                isCritical
                  ? '#ef4444'
                  : isWarning
                  ? '#f59e0b'
                  : selectedZone.includes('Shaft 2')
                  ? '#f59e0b'
                  : '#334155'
              }
              strokeWidth={selectedZone.includes('Shaft 2') ? '2.5' : '1.5'}
            />

            {/* If Gas Spike or Critical, render animated hazardous vapor cloud */}
            {isCritical && (
              <rect
                x="165"
                y="260"
                width="535"
                height="50"
                fill="url(#gasHazardGradient)"
                className="animate-pulse"
              />
            )}

            <text x="180" y="282" fill="#ffffff" fontSize="12" fontFamily="monospace" fontWeight="bold">
              LEVEL 2: ACTIVE MINING FACE &amp; EXTRACTION (-320m)
            </text>

            <text x="180" y="299" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              DHT11 &amp; MQ8 Telemetry Node 02 | 3 Miners Active (BCN-101, 102, 105)
            </text>

            {/* Sensor Node Indicator on Level 2 */}
            <circle
              cx="440"
              cy="285"
              r="10"
              fill={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'}
              className="animate-ping opacity-60"
            />
            <circle
              cx="440"
              cy="285"
              r="6"
              fill={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <text x="455" y="289" fill={isCritical ? '#fca5a5' : '#67e8f9'} fontSize="10" fontFamily="monospace" fontWeight="bold">
              NODE-02 ({currentReading.temperature !== null ? `${currentReading.temperature.toFixed(1)}°C | ${currentReading.humidity?.toFixed(0)}% | ${currentReading.mq8Gas}ppm` : 'Awaiting Real Signal'})
            </text>

            {/* Emergency Refuge Chamber at Level 2 */}
            <rect x="610" y="265" width="80" height="40" rx="3" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
            <text x="618" y="282" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">
              REFUGE BAY
            </text>
            <text x="618" y="295" fill="#a7f3d0" fontSize="8" fontFamily="monospace">
              72h Oxygen
            </text>
          </g>

          {/* LEVEL 3: -480m Deep Sump & Dewatering */}
          <g
            className="cursor-pointer transition hover:opacity-90"
            onClick={() => setSelectedZone('Shaft 3 (-480m Deep Sump)')}
          >
            <rect
              x="165"
              y="380"
              width="535"
              height="36"
              rx="4"
              fill={selectedZone.includes('Shaft 3') ? '#1e293b' : '#0f172a'}
              stroke={selectedZone.includes('Shaft 3') ? '#38bdf8' : '#334155'}
              strokeWidth="2"
            />
            <text x="180" y="402" fill="#e2e8f0" fontSize="11" fontFamily="monospace" fontWeight="bold">
              LEVEL 3: DEEP DRAINAGE SUMP &amp; PUMP STATION (-480m)
            </text>
            <text x="590" y="402" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              1 Miner (BCN-104)
            </text>
          </g>

          {/* Escape Hoist Airway Arrow Vector */}
          <path
            d="M 650 260 L 650 184 L 165 184"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="5,3"
          />
          <text x="460" y="228" fill="#10b981" fontSize="9" fontFamily="monospace">
            PRIMARY ESCAPE ROUTE → HOIST 1
          </text>
        </svg>
      </div>

      {/* Sector Selection Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {zones.map((zone) => {
          const isSelected = selectedZone === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone.id)}
              className={`p-3 rounded-lg border text-left transition font-mono ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs truncate">{zone.name}</span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                  {zone.depth}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{zone.description}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-cyan-400" /> {zone.minersCount} Miners Assigned
                </span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <Wind className="w-3 h-3" /> {zone.airVelocity}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
