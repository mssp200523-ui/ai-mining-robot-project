import React, { useState } from 'react';
import { AlertOctagon, X, Volume2, ShieldAlert } from 'lucide-react';
import { useMine } from '../context/MineContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualEvacuationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { selectedZone, triggerManualEvacuation } = useMine();
  const [reason, setReason] = useState('Atmospheric methane / combustible gas spike & thermal stress');
  const [zone, setZone] = useState(selectedZone);

  if (!isOpen) return null;

  const handleEvacuate = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerManualEvacuation(zone, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-red-500 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between p-4 bg-red-600 text-white font-bold text-sm">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
            <span>DISPATCH GENERAL UNDERGROUND EVACUATION</span>
          </div>
          <button onClick={onClose} className="text-white hover:text-slate-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleEvacuate} className="p-5 space-y-4">
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-red-200">
            <p className="font-bold mb-1">WARNING: LIVE EMERGENCY PROTOCOL</p>
            <p className="text-[11px] text-red-300">
              Triggering this action immediately sounds the synthesized evacuation horn, broadcasts an emergency alert to all mine shifts, logs a critical incident to Firestore, and pushes an MQTT emergency telegram.
            </p>
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Target Sector for Evacuation:</label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Emergency Dispatch Directive / Rationale:</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-red-600/30 animate-pulse"
            >
              <Volume2 className="w-4 h-4" />
              <span>SOUND EVACUATION SIREN NOW</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
