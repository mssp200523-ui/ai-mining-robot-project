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
      name: 'Level 1 - Conveyor Tunnel',
      depth: '-150m',
      status: 'nominal',
      minersCount: miners.filter((m) => m.shaftLevel.includes('Shaft 1')).length,
      airVelocity: '2.8 m/s',
      description: 'Conveyor belt tunnel bringing fresh air inside.',
    },
    {
      id: 'Shaft 2 (-320m Working Face)',
      name: 'Level 2 - Main Work Area',
      depth: '-320m',
      status: isCritical ? 'critical' : isWarning ? 'warning' : 'nominal',
      minersCount: miners.filter((m) => m.shaftLevel.includes('Shaft 2')).length,
      airVelocity: isCritical ? '4.2 m/s (Boosted)' : '1.9 m/s',
      description: 'Main work area with live Temperature, Humidity & Gas sensors.',
      hasSensors: true,
    },
    {
      id: 'Shaft 3 (-480m Deep Sump)',
      name: 'Level 3 - Water Pumps',
      depth: '-480m',
      status: 'nominal',
      minersCount: miners.filter((m) => m.shaftLevel.includes('Shaft 3')).length,
      airVelocity: '1.2 m/s',
      description: 'Water pump area and lower emergency exit.',
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
              UNDERGROUND MINE MAP
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Live sensors, tunnel levels, and emergency exit routes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">SELECTED LEVEL:</span>
          <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            {selectedZone.includes('Shaft 1')
              ? 'Level 1 (-150m Conveyor)'
              : selectedZone.includes('Shaft 2')
              ? 'Level 2 (-320m Work Area)'
              : 'Level 3 (-480m Water Pumps)'}
          </span>
        </div>
      </div>

      {/* SVG Interactive Mine Schematic */}
      <div className="relative w-full bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 overflow-hidden">
        <div className="absolute top-2 right-2 flex items-center gap-2 text-[10px] font-mono text-slate-400 z-10 bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>North Direction | Slope: 14°</span>
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
            GROUND LEVEL (0m) - RESCUE BASE &amp; MAIN ELEVATOR
          </text>

          {/* Surface Infrastructure Icons & Buildings */}
          {/* Elevator Tower / Headframe */}
          <polygon points="120,70 140,15 160,15 180,70" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <line x1="150" y1="15" x2="150" y2="70" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
          <circle cx="150" cy="18" r="6" fill="#f59e0b" />
          <text x="110" y="60" fill="#f59e0b" fontSize="9" fontFamily="monospace">ELEVATOR</text>

          {/* Surface Main Ventilation Exhaust Fan */}
          <rect x="670" y="30" width="85" height="40" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="678" y="47" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">EXHAUST FAN</text>
          <text x="678" y="61" fill="#94a3b8" fontSize="8" fontFamily="monospace">Air Out: 95 m³/s</text>

          {/* Shaft 1 Vertical Intake Hoist (Left) */}
          <rect x="135" y="70" width="30" height="380" fill="#090d16" stroke="#475569" strokeWidth="1.5" />
          {/* Shaft 2 Vertical Return Airway (Right) */}
          <rect x="700" y="70" width="30" height="380" fill="#090d16" stroke="#475569" strokeWidth="1.5" />

          {/* Fresh Air Flow Down Shaft 1 */}
          <line x1="150" y1="80" x2="150" y2="430" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6,4" />
          <polygon points="150,435 145,423 155,423" fill="#38bdf8" />
          <text x="68" y="110" fill="#38bdf8" fontSize="9" fontFamily="monospace">FRESH AIR IN ↓</text>

          {/* Return Air Up Shaft 2 */}
          <line x1="715" y1="430" x2="715" y2="80" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6,4" />
          <polygon points="715,75 710,87 720,87" fill="#f97316" />
          <text x="735" y="110" fill="#f97316" fontSize="9" fontFamily="monospace">↑ USED AIR OUT</text>

          {/* LEVEL 1: -150m Transport Conveyor Tunnel */}
          <g
            className="cursor-pointer transition hover:opacity-90"
            onClick={() => setSelectedZone('Shaft 1 (-150m Haulage Drift)')}
          >
            <rect
              x="165"
              y="150"
              width="535"
              height="36"
              rx="4"
              fill={selectedZone.includes('Shaft 1') ? '#1e293b' : '#0f172a'}
              stroke={selectedZone.includes('Shaft 1') ? '#38bdf8' : '#334155'}
              strokeWidth="2"
            />
            {/* Conveyor Line */}
            <line x1="175" y1="176" x2="690" y2="176" stroke="#475569" strokeWidth="2" strokeDasharray="4,2" />
            <text x="180" y="171" fill="#e2e8f0" fontSize="11" fontFamily="monospace" fontWeight="bold">
              LEVEL 1: CONVEYOR BELT TUNNEL (-150m)
            </text>
            <text x="590" y="171" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              {miners.filter((m) => m.shaftLevel.includes('Shaft 1')).length} Workers
            </text>
          </g>

          {/* LEVEL 2: -320m Active Work Area (Where DHT11 & MQ8 Sensors are placed) */}
          <g
            className="cursor-pointer transition hover:opacity-95"
            onClick={() => setSelectedZone('Shaft 2 (-320m Working Face)')}
          >
            <rect
              x="165"
              y="255"
              width="535"
              height="62"
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
                y="255"
                width="535"
                height="62"
                fill="url(#gasHazardGradient)"
                className="animate-pulse"
              />
            )}

            {/* Title and Worker Count on Left */}
            <text x="180" y="280" fill="#ffffff" fontSize="12" fontFamily="monospace" fontWeight="bold">
              LEVEL 2: ACTIVE WORK AREA (-320m)
            </text>

            <text x="180" y="302" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              {`${miners.filter((m) => m.shaftLevel.includes('Shaft 2')).length} Workers on Level`}
            </text>

            {/* Live Sensor Badge - Positioned neatly without overlapping */}
            <rect
              x="395"
              y="265"
              width="195"
              height="42"
              rx="4"
              fill="#090d16"
              stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8'}
              strokeWidth="1"
            />
            {/* Sensor Status Indicator Dot */}
            <circle
              cx="410"
              cy="286"
              r="7"
              fill={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'}
              className="animate-ping opacity-60"
            />
            <circle
              cx="410"
              cy="286"
              r="4.5"
              fill={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'}
              stroke="#ffffff"
              strokeWidth="1"
            />
            <text x="424" y="278" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">
              LIVE AIR &amp; GAS SENSORS
            </text>
            <text
              x="424"
              y="297"
              fill={isCritical ? '#fca5a5' : '#38bdf8'}
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {currentReading.temperature !== null
                ? `${currentReading.temperature.toFixed(1)}°C · ${currentReading.humidity?.toFixed(0)}% · ${currentReading.mq8Gas}ppm`
                : 'Waiting for hardware...'}
            </text>

            {/* Emergency Refuge Chamber at Level 2 */}
            <rect x="600" y="265" width="90" height="42" rx="3" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
            <text x="608" y="282" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">
              SAFETY SHELTER
            </text>
            <text x="608" y="297" fill="#a7f3d0" fontSize="8" fontFamily="monospace">
              Emergency Air
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
              LEVEL 3: WATER PUMP TUNNEL (-480m)
            </text>
            <text x="590" y="402" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              {miners.filter((m) => m.shaftLevel.includes('Shaft 3')).length} Workers
            </text>
          </g>

          {/* Escape Hoist Airway Arrow Vector */}
          <path
            d="M 645 255 L 645 186 L 165 186"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="5,3"
          />
          <text x="430" y="228" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">
            EMERGENCY EXIT ROUTE → MAIN ELEVATOR
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
                  <Users className="w-3 h-3 text-cyan-400" /> {zone.minersCount} Workers
                </span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <Wind className="w-3 h-3" /> Air Flow: {zone.airVelocity}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
