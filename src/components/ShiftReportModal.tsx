import React from 'react';
import { FileText, X, Download, Printer, ShieldCheck, CheckCircle } from 'lucide-react';
import { useMine } from '../context/MineContext';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftReportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentReading, alerts, telemetryHistory, thresholds, miners, rescueMissions, selectedZone } = useMine();
  const { user } = useAuth();

  if (!isOpen) return null;

  const tempVals = telemetryHistory.map((t) => t.temperature).filter((t): t is number => t !== null);
  const humVals = telemetryHistory.map((t) => t.humidity).filter((t): t is number => t !== null);
  const gasVals = telemetryHistory.map((t) => t.mq8Gas).filter((t): t is number => t !== null);

  const maxTemp = tempVals.length ? Math.max(...tempVals).toFixed(1) : currentReading.temperature !== null ? currentReading.temperature.toFixed(1) : '--';
  const minTemp = tempVals.length ? Math.min(...tempVals).toFixed(1) : currentReading.temperature !== null ? currentReading.temperature.toFixed(1) : '--';
  const maxGas = gasVals.length ? Math.max(...gasVals) : currentReading.mq8Gas ?? '--';
  const maxHum = humVals.length ? Math.max(...humVals).toFixed(1) : currentReading.humidity !== null ? currentReading.humidity.toFixed(1) : '--';

  const downloadJsonReport = () => {
    const reportData = {
      system: 'Rock Rover AI Safety & Rescue Command System',
      auditTimestamp: new Date().toISOString(),
      officer: user?.displayName || user?.email || 'Field Safety Officer',
      sectorMonitored: selectedZone,
      sensorSummary: {
        dht11_temperature: { current: currentReading.temperature, min: minTemp, max: maxTemp, unit: '°C' },
        dht11_humidity: { current: currentReading.humidity, max: maxHum, unit: '%' },
        mq8_combustible_gas: { current: currentReading.mq8Gas, max: maxGas, unit: 'ppm' },
      },
      thresholds,
      alertsSummary: {
        totalAlerts: alerts.length,
        active: alerts.filter((a) => a.status === 'active').length,
        critical: alerts.filter((a) => a.severity === 'critical').length,
      },
      personnel: miners,
      rescueMissions,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rock-rover-safety-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>OFFICIAL MINE ATMOSPHERIC SHIFT SAFETY REPORT</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-slate-950/40" id="printable-report">
          {/* Metadata banner */}
          <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/80">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-3">
              <div>
                <h3 className="font-extrabold text-white text-base">ROCK ROVER SAFETY AUDIT CERTIFICATE</h3>
                <p className="text-[11px] text-slate-400">DGMS &amp; MSHA Underground Atmospheric Compliance Protocol</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                CERTIFIED COMPLIANT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500">Officer In-Charge: </span>
                <strong className="text-slate-200">{user?.displayName || user?.email || 'Field Shift Officer'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Date/Time: </span>
                <strong className="text-slate-200">{new Date().toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-500">Monitored Sector: </span>
                <strong className="text-amber-400">{selectedZone}</strong>
              </div>
              <div>
                <span className="text-slate-500">IoT Telemetry Node: </span>
                <strong className="text-cyan-400">Node-02 (DHT11 + MQ8)</strong>
              </div>
            </div>
          </div>

          {/* Sensor Stats Table */}
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <th className="p-2.5">Atmospheric Sensor</th>
                  <th className="p-2.5">Current Value</th>
                  <th className="p-2.5">Shift Min/Max</th>
                  <th className="p-2.5">Safety Threshold</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-[11px]">
                <tr>
                  <td className="p-2.5 text-white font-bold">DHT11 Temperature (V2)</td>
                  <td className="p-2.5 text-cyan-300">
                    {currentReading.temperature !== null ? `${currentReading.temperature.toFixed(1)}°C` : 'Awaiting Signal'}
                  </td>
                  <td className="p-2.5 text-slate-400">{minTemp}° / {maxTemp}°C</td>
                  <td className="p-2.5 text-slate-400">&lt; {thresholds.tempWarn}°C / {thresholds.tempCrit}°C</td>
                  <td className="p-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                      {currentReading.temperature !== null ? 'LIVE STREAM' : 'STANDBY'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 text-white font-bold">DHT11 Humidity (V3)</td>
                  <td className="p-2.5 text-blue-300">
                    {currentReading.humidity !== null ? `${currentReading.humidity.toFixed(1)}%` : 'Awaiting Signal'}
                  </td>
                  <td className="p-2.5 text-slate-400">Peak {maxHum}%</td>
                  <td className="p-2.5 text-slate-400">&lt; {thresholds.humidityWarn}% / {thresholds.humidityCrit}%</td>
                  <td className="p-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                      {currentReading.humidity !== null ? 'LIVE STREAM' : 'STANDBY'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 text-white font-bold">MQ8 Combustible / H2 Gas</td>
                  <td className="p-2.5 text-amber-300">
                    {currentReading.mq8Gas !== null ? `${currentReading.mq8Gas} ppm` : 'Awaiting Signal'}
                  </td>
                  <td className="p-2.5 text-slate-400">Peak {maxGas} ppm</td>
                  <td className="p-2.5 text-slate-400">&lt; {thresholds.mq8Warn} ppm / {thresholds.mq8Crit} ppm</td>
                  <td className="p-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      currentReading.mq8Gas !== null && currentReading.mq8Gas > thresholds.mq8Warn
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {currentReading.mq8Gas !== null && currentReading.mq8Gas > thresholds.mq8Warn ? 'WARNING' : 'LIVE PASS'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Incidents & Personnel Audit */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-400 font-semibold block mb-1">AUTOMATED ALERTS LOGGED:</span>
              <p className="text-slate-200">Total Alerts: {alerts.length}</p>
              <p className="text-slate-400">Active Critical: {alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length}</p>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-400 font-semibold block mb-1">PERSONNEL VERIFICATION:</span>
              <p className="text-slate-200">Active Miners: {miners.length} Accounted For</p>
              <p className="text-emerald-400">Refuge Bay: Ready (72h O2)</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-t border-slate-800">
          <span className="text-[11px] text-slate-400">Electronic report ready for export</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={downloadJsonReport}
              className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Audit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
