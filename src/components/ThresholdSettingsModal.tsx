import React, { useState } from 'react';
import { Sliders, X, Save, AlertTriangle, Shield, Check, Info } from 'lucide-react';
import { useMine } from '../context/MineContext';
import { SafetyThresholds } from '../types/mine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ThresholdSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { thresholds, updateThresholds } = useMine();
  const [formData, setFormData] = useState<SafetyThresholds>({ ...thresholds });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateThresholds(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>MINE SAFETY THRESHOLDS &amp; IOT CONFIGURATION</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Temperature Sensor Thresholds (DHT11) */}
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
              <span>DHT11 TEMPERATURE SENSOR (PIN V2)</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Elevated Warning Limit (°C):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.tempWarn}
                  onChange={(e) => setFormData({ ...formData, tempWarn: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Critical Hazard Limit (°C):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.tempCrit}
                  onChange={(e) => setFormData({ ...formData, tempCrit: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  required
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              DGMS Standards recommend immediate work-rest cycles above 32°C; mandatory withdrawal above 38°C.
            </p>
          </div>

          {/* Humidity Sensor Thresholds (DHT11) */}
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
              <span>DHT11 RELATIVE HUMIDITY SENSOR (PIN V3)</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Warning Humidity (%):
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.humidityWarn}
                  onChange={(e) => setFormData({ ...formData, humidityWarn: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Water Ingress Critical (%):
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.humidityCrit}
                  onChange={(e) => setFormData({ ...formData, humidityCrit: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* MQ8 Combustible/H2 Gas Thresholds */}
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-red-400 text-xs flex items-center gap-1.5">
              <span>MQ8 GAS SENSOR (H2 / FLAMMABLE CONCENTRATION)</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Warning Threshold (ppm):
                </label>
                <input
                  type="number"
                  value={formData.mq8Warn}
                  onChange={(e) => setFormData({ ...formData, mq8Warn: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Explosive Limit Critical (ppm):
                </label>
                <input
                  type="number"
                  value={formData.mq8Crit}
                  onChange={(e) => setFormData({ ...formData, mq8Crit: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* IoT Polling & Siren Settings */}
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs">IOT CLOUD &amp; ALARM BEHAVIOR</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Blynk Cloud Device Token:</label>
                <input
                  type="text"
                  value={formData.blynkToken}
                  onChange={(e) => setFormData({ ...formData, blynkToken: e.target.value })}
                  placeholder="Paste your device token..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">MQ8 Gas Blynk Pin:</label>
                <input
                  type="text"
                  value={formData.mq8Pin || 'V1'}
                  onChange={(e) => setFormData({ ...formData, mq8Pin: e.target.value })}
                  placeholder="e.g. V1 or V4"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Polling Interval (sec):</label>
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={formData.pollingIntervalSec}
                  onChange={(e) => setFormData({ ...formData, pollingIntervalSec: parseInt(e.target.value) || 3 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="soundSiren"
                  checked={formData.soundSirenOnCritical}
                  onChange={(e) => setFormData({ ...formData, soundSirenOnCritical: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                />
                <label htmlFor="soundSiren" className="text-slate-300 text-[11px] cursor-pointer">
                  Auto-sound synthesized siren on critical hazard
                </label>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              Saves persistently to Firestore database
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved!' : 'Save Thresholds'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
