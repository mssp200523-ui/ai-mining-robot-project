import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  Radio,
  Sliders,
  Volume2,
  VolumeX,
  ShieldCheck,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  LogIn,
  FileText,
  OctagonAlert,
} from 'lucide-react';
import { useMine } from '../context/MineContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenReport: () => void;
  onOpenEvacModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, onOpenReport, onOpenEvacModal }) => {
  const {
    currentReading,
    activeAlertCount,
    criticalAlertCount,
    isAlarmSounding,
    isMuted,
    toggleMute,
    stopAlarmSound,
    isLiveBlynkActive,
    isRealHardwareLive,
  } = useMine();

  const { user, signInWithGoogle, signOut, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isCritical = currentReading.status === 'critical' || criticalAlertCount > 0;
  const isWarning = currentReading.status === 'warning' || activeAlertCount > 0;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 select-none backdrop-blur-md bg-opacity-95">
      {/* Critical Emergency Banner if Siren is Active */}
      {isCritical && (
        <div className="bg-red-600 text-white px-4 py-2 font-mono text-xs uppercase tracking-wider flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 font-bold">
            <OctagonAlert className="w-4 h-4 animate-bounce text-white" />
            <span>CRITICAL ATMOSPHERIC ALERT: SAFETY THRESHOLD EXCEEDED IN UNDERGROUND SHAFT</span>
          </div>
          <div className="flex items-center gap-3">
            {isAlarmSounding && (
              <button
                onClick={stopAlarmSound}
                className="bg-white text-red-700 px-2 py-0.5 rounded text-xs font-bold hover:bg-slate-100 transition shadow"
              >
                SILENCE SIREN
              </button>
            )}
            <button
              onClick={onOpenEvacModal}
              className="bg-black/60 hover:bg-black text-amber-300 px-2.5 py-0.5 rounded text-xs font-bold transition border border-amber-400"
            >
              DISPATCH EVACUATION
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & System Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg ${
              isCritical
                ? 'bg-red-500 text-white ring-4 ring-red-500/30'
                : isWarning
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-500/30'
                : 'bg-emerald-500 text-slate-950'
            }`}>
              <Flame className="w-5 h-5" />
            </div>
            <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
              isLiveBlynkActive ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base sm:text-lg font-mono text-amber-400">ROCK ROVER</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded font-semibold">
                AI v2.4
              </span>
              <span className="hidden md:inline-flex text-[10px] uppercase font-mono px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded font-medium">
                MQ8 + DHT11
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Underground Mine Safety, Atmospheric Monitoring &amp; Rescue Telemetry
            </p>
          </div>
        </div>

        {/* Center: Realtime Telemetry Pulse & Status Badge */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/80 font-mono text-xs">
            <Radio className={`w-3.5 h-3.5 ${isRealHardwareLive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-slate-400">DATA SOURCE:</span>
            <span className={isRealHardwareLive ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {isRealHardwareLive ? 'REAL BLYNK SENSORS (V2/V3)' : 'SIMULATION MODE'}
            </span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono text-xs font-semibold ${
            isCritical
              ? 'bg-red-500/20 border-red-500 text-red-300'
              : isWarning
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
          }`}>
            {isCritical ? (
              <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            <span>
              {isCritical ? 'ATMOSPHERE CRITICAL' : isWarning ? 'HAZARD WARNING' : 'MINE NORMAL'}
            </span>
          </div>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Siren Mute Toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute Audio Siren' : 'Mute Audio Siren'}
            className={`p-2 rounded-lg border transition text-xs font-mono flex items-center gap-1.5 ${
              isMuted
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                : isAlarmSounding
                ? 'bg-red-600 border-red-500 text-white animate-bounce'
                : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'ALARM'}</span>
          </button>

          {/* Threshold Settings Modal Trigger */}
          <button
            onClick={onOpenSettings}
            title="Configure Safety Thresholds & Blynk Token"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Shift Report Generator */}
          <button
            onClick={onOpenReport}
            title="Download Official Safety Report"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Emergency Evac Button */}
          <button
            onClick={onOpenEvacModal}
            className="hidden sm:flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white font-mono text-xs font-bold px-3 py-2 rounded-lg border border-red-500 transition shadow-md shadow-red-900/30"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            <span>EVAC ALARM</span>
          </button>

          {/* Firebase Google Auth State */}
          <div className="relative">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse border border-slate-700" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-xs font-mono"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[80px] truncate text-slate-200 font-medium hidden md:inline">
                    {user.displayName?.split(' ')[0] || 'Officer'}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-800 border border-slate-700 shadow-xl py-2 z-50 text-xs font-mono">
                    <div className="px-3 py-2 border-b border-slate-700">
                      <p className="font-semibold text-slate-200 truncate">{user.displayName || 'Safety Officer'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        Officer Verified (Firestore)
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-700/60 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold px-3 py-2 rounded-lg transition shadow-md shadow-amber-500/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google Sign-In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
