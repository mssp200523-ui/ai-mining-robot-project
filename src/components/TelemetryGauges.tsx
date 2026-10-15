import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  Activity,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Radio,
  CheckCircle2,
  Clock,
  Wifi,
} from 'lucide-react';
import { useMine } from '../context/MineContext';

export const TelemetryGauges: React.FC = () => {
  const {
    currentReading,
    telemetryHistory,
    thresholds,
    isRealHardwareLive,
    isLiveBlynkActive,
    triggerBlynkFetch,
    blynkStatus,
  } = useMine();

  const [useFahrenheit, setUseFahrenheit] = useState(false);

  const hasRealTemp = currentReading.temperature !== null;
  const hasRealHum = currentReading.humidity !== null;
  const hasRealGas = currentReading.mq8Gas !== null;

  const displayTemp = hasRealTemp
    ? useFahrenheit
      ? (currentReading.temperature! * 9) / 5 + 32
      : currentReading.temperature!
    : null;
  const tempUnit = useFahrenheit ? '°F' : '°C';

  // Threshold evaluations on real sensor values
  const isTempCritical = hasRealTemp && currentReading.temperature! >= thresholds.tempCrit;
  const isTempWarning = hasRealTemp && !isTempCritical && currentReading.temperature! >= thresholds.tempWarn;

  const isHumCritical = hasRealHum && currentReading.humidity! >= thresholds.humidityCrit;
  const isHumWarning = hasRealHum && !isHumCritical && currentReading.humidity! >= thresholds.humidityWarn;

  const isGasCritical = hasRealGas && currentReading.mq8Gas! >= thresholds.mq8Crit;
  const isGasWarning = hasRealGas && !isGasCritical && currentReading.mq8Gas! >= thresholds.mq8Warn;

  // LEL (Lower Explosive Limit) estimation for MQ8 hydrogen/flammable gas
  const lelPercentage = hasRealGas
    ? Math.min(100, Number((currentReading.mq8Gas! / 400).toFixed(1)))
    : null;

  // Compute SVG sparkline path for historical real values only
  const renderSparkline = (values: number[], minVal: number, maxVal: number, color: string) => {
    if (values.length < 2) {
      return (
        <div className="h-10 flex items-center justify-center text-[10px] text-slate-400 font-mono italic">
          Waiting for 2+ real packets...
        </div>
      );
    }
    const width = 180;
    const height = 40;
    const range = Math.max(1, maxVal - minVal);
    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const normalized = Math.max(0, Math.min(1, (val - minVal) / range));
      const y = height - normalized * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    return (
      <svg className="w-full h-10 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="6" opacity="0.15" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const tempValues = telemetryHistory.map((h) => h.temperature).filter((v): v is number => v !== null);
  const humValues = telemetryHistory.map((h) => h.humidity).filter((v): v is number => v !== null);
  const gasValues = telemetryHistory.map((h) => h.mq8Gas).filter((v): v is number => v !== null);

  return (
    <div className="space-y-4">
      {/* Real-time Hardware Telemetry Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3 h-3 rounded-full ${
              isRealHardwareLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`}
          />
          <div>
            <span className="font-bold text-slate-200">
              {isRealHardwareLive ? 'REAL-TIME HARDWARE TELEMETRY ACTIVE' : 'AWAITING PHYSICAL HARDWARE SIGNAL'}
            </span>
            <span className="text-slate-400 ml-2 text-[11px] hidden sm:inline">
              (Strict Real Data: No Mock/Simulated Values)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasRealTemp && (
            <span className="text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
              Last Real Packet: {new Date(currentReading.timestamp).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => triggerBlynkFetch()}
            disabled={blynkStatus === 'polling'}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
          >
            <RefreshCw className={`w-3 h-3 ${blynkStatus === 'polling' ? 'animate-spin' : ''}`} />
            <span>Fetch Real Sensor Now</span>
          </button>
        </div>
      </div>

      {/* Sensor Gauge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gauge 1: DHT11 Temperature Sensor (V2) */}
        <div
          className={`rounded-xl p-5 border transition-all duration-300 relative overflow-hidden backdrop-blur-sm ${
            isTempCritical
              ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-900/20'
              : isTempWarning
              ? 'bg-amber-950/30 border-amber-500/80'
              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          }`}
        >
          {isTempCritical && (
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg ${
                  isTempCritical
                    ? 'bg-red-500/20 text-red-400'
                    : isTempWarning
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  DHT11 TEMPERATURE
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono font-bold bg-slate-800 text-cyan-400 px-1.5 py-0.2 rounded border border-slate-700">
                    PIN V2
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Blynk Cloud Real-Time
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setUseFahrenheit(!useFahrenheit)}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
            >
              {useFahrenheit ? 'Switch to °C' : 'Switch to °F'}
            </button>
          </div>

          {/* Reading Display */}
          <div className="flex items-baseline justify-between mt-2">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {displayTemp !== null ? displayTemp.toFixed(1) : '--.-'}
                </span>
                <span className="font-mono text-xl font-bold text-slate-400">{tempUnit}</span>
              </div>
              <p className="text-xs font-mono mt-1 text-slate-400">
                Limit: {thresholds.tempWarn}°C / Crit: {thresholds.tempCrit}°C
              </p>
            </div>

            <div className="text-right">
              {displayTemp !== null ? (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wide ${
                    isTempCritical
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                      : isTempWarning
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isTempCritical ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" /> CRITICAL
                    </>
                  ) : isTempWarning ? (
                    <>
                      <ArrowUpRight className="w-3.5 h-3.5" /> ELEVATED
                    </>
                  ) : (
                    'OPTIMAL'
                  )}
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-amber-400 border border-slate-700">
                  WAITING SENSOR
                </span>
              )}

              {currentReading.rawV2 && (
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  Raw V2: "{currentReading.rawV2}"
                </p>
              )}
            </div>
          </div>

          {/* Mini Sparkline Chart */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
              <span>Real Telemetry Trend</span>
              <span>
                {tempValues.length > 0
                  ? `${Math.min(...tempValues).toFixed(1)}° - ${Math.max(...tempValues).toFixed(1)}°`
                  : '0 packets'}
              </span>
            </div>
            {renderSparkline(
              tempValues,
              15,
              45,
              isTempCritical ? '#EF4444' : isTempWarning ? '#F59E0B' : '#38BDF8'
            )}
          </div>
        </div>

        {/* Gauge 2: DHT11 Humidity Sensor (V3) */}
        <div
          className={`rounded-xl p-5 border transition-all duration-300 relative overflow-hidden backdrop-blur-sm ${
            isHumCritical
              ? 'bg-blue-950/40 border-cyan-500 shadow-lg shadow-cyan-900/20'
              : isHumWarning
              ? 'bg-amber-950/30 border-amber-500/80'
              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg ${
                  isHumCritical
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : isHumWarning
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-indigo-500/20 text-indigo-400'
                }`}
              >
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  DHT11 RELATIVE HUMIDITY
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono font-bold bg-slate-800 text-cyan-400 px-1.5 py-0.2 rounded border border-slate-700">
                    PIN V3
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Blynk Cloud Real-Time
                  </span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              {hasRealTemp && hasRealHum
                ? `Dew Point ~${(currentReading.temperature! - (100 - currentReading.humidity!) / 5).toFixed(1)}°C`
                : 'Dew Point: --'}
            </span>
          </div>

          {/* Reading Display */}
          <div className="flex items-baseline justify-between mt-2">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {hasRealHum ? currentReading.humidity!.toFixed(1) : '--.-'}
                </span>
                <span className="font-mono text-xl font-bold text-slate-400">%</span>
              </div>
              <p className="text-xs font-mono mt-1 text-slate-400">
                Warn: {thresholds.humidityWarn}% / Ingress: {thresholds.humidityCrit}%
              </p>
            </div>

            <div className="text-right">
              {hasRealHum ? (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wide ${
                    isHumCritical
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 animate-pulse'
                      : isHumWarning
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isHumCritical ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" /> SEEPAGE RISK
                    </>
                  ) : isHumWarning ? (
                    'HIGH MOISTURE'
                  ) : (
                    'NORMAL'
                  )}
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-amber-400 border border-slate-700">
                  WAITING SENSOR
                </span>
              )}

              {currentReading.rawV3 && (
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  Raw V3: "{currentReading.rawV3}"
                </p>
              )}
            </div>
          </div>

          {/* Mini Sparkline Chart */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
              <span>Real Humidity History</span>
              <span>
                {humValues.length > 0
                  ? `${Math.min(...humValues).toFixed(1)}% - ${Math.max(...humValues).toFixed(1)}%`
                  : '0 packets'}
              </span>
            </div>
            {renderSparkline(
              humValues,
              20,
              100,
              isHumCritical ? '#06B6D4' : isHumWarning ? '#F59E0B' : '#818CF8'
            )}
          </div>
        </div>

        {/* Gauge 3: MQ8 Gas Sensor (Hydrogen & Combustible Gas) */}
        <div
          className={`rounded-xl p-5 border transition-all duration-300 relative overflow-hidden backdrop-blur-sm ${
            isGasCritical
              ? 'bg-red-950/50 border-red-500 shadow-xl shadow-red-900/30'
              : isGasWarning
              ? 'bg-amber-950/30 border-amber-500/80'
              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          }`}
        >
          {isGasCritical && (
            <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none" />
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg ${
                  isGasCritical
                    ? 'bg-red-500/20 text-red-400 animate-bounce'
                    : isGasWarning
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  MQ8 GAS (H2 / FLAMMABLE)
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono font-bold bg-slate-800 text-amber-400 px-1.5 py-0.2 rounded border border-slate-700">
                    PIN {thresholds.mq8Pin || 'V1'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Real Sensor ADC
                  </span>
                </div>
              </div>
            </div>

            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                isGasCritical
                  ? 'bg-red-500/20 border-red-500 text-red-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              {lelPercentage !== null ? `LEL: ~${lelPercentage}%` : 'LEL: --'}
            </span>
          </div>

          {/* Reading Display */}
          <div className="flex items-baseline justify-between mt-2">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {hasRealGas ? currentReading.mq8Gas : '---'}
                </span>
                <span className="font-mono text-xl font-bold text-slate-400">PPM</span>
              </div>
              <p className="text-xs font-mono mt-1 text-slate-400">
                Warn: {thresholds.mq8Warn} ppm / Danger: {thresholds.mq8Crit} ppm
              </p>
            </div>

            <div className="text-right">
              {hasRealGas ? (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wide ${
                    isGasCritical
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/40 animate-pulse'
                      : isGasWarning
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isGasCritical ? (
                    <>
                      <Flame className="w-3.5 h-3.5" /> EXPLOSION RISK
                    </>
                  ) : isGasWarning ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" /> GAS ACCUMULATION
                    </>
                  ) : (
                    'SAFE ATMOSPHERE'
                  )}
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-amber-400 border border-slate-700">
                  WAITING SENSOR
                </span>
              )}

              {currentReading.rawV1 && (
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  Raw {thresholds.mq8Pin || 'V1'}: "{currentReading.rawV1}"
                </p>
              )}
            </div>
          </div>

          {/* Mini Sparkline Chart */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
              <span>Real Gas History</span>
              <span>
                {gasValues.length > 0
                  ? `${Math.min(...gasValues)} - ${Math.max(...gasValues)} ppm`
                  : '0 packets'}
              </span>
            </div>
            {renderSparkline(
              gasValues,
              50,
              1000,
              isGasCritical ? '#EF4444' : isGasWarning ? '#F59E0B' : '#10B981'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
