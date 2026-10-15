import React, { useState } from 'react';
import {
  Cloud,
  Send,
  Wifi,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Play,
  Pause,
  RefreshCw,
  Code2,
  Radio,
  Cpu,
} from 'lucide-react';
import { useMine } from '../context/MineContext';

export const BlynkMqttConsole: React.FC = () => {
  const {
    thresholds,
    updateThresholds,
    isLiveBlynkActive,
    setIsLiveBlynkActive,
    isRealHardwareLive,
    blynkStatus,
    lastBlynkMessage,
    triggerBlynkFetch,
    mqttLogs,
    publishMqtt,
  } = useMine();

  const [activeTab, setActiveTab] = useState<'blynk' | 'mqtt'>('blynk');
  const [tokenInput, setTokenInput] = useState<string>(thresholds.blynkToken);
  const [customTopic, setCustomTopic] = useState<string>('get/ds');
  const [customPayload, setCustomPayload] = useState<string>('temperature ');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleConnectAndPoll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanToken = tokenInput.trim();
    if (!cleanToken) return;
    await updateThresholds({ blynkToken: cleanToken });
    setIsLiveBlynkActive(true);
    await triggerBlynkFetch(cleanToken);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const urlV2 = `https://blr1.blynk.cloud/external/api/get?token=${tokenInput.trim() || '{device_token}'}&V2`;
  const urlV3 = `https://blr1.blynk.cloud/external/api/get?token=${tokenInput.trim() || '{device_token}'}&V3`;
  const urlV1 = `https://blr1.blynk.cloud/external/api/get?token=${tokenInput.trim() || '{device_token}'}&V1`;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm space-y-4">
      {/* Real Data vs Simulator Live Status Banner */}
      <div
        className={`p-3 rounded-lg border font-mono text-xs flex flex-wrap items-center justify-between gap-2 ${
          isRealHardwareLive
            ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300 shadow-md shadow-emerald-900/20'
            : 'bg-amber-950/30 border-amber-500/60 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {isRealHardwareLive ? (
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
          ) : (
            <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <div>
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <span>{isRealHardwareLive ? 'REAL HARDWARE CONNECTED' : 'MINE SIMULATOR ACTIVE'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 border border-current">
                {isRealHardwareLive ? 'LIVE BLYNK CLOUD DATA' : 'SAMPLE SIMULATION'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {isRealHardwareLive
                ? 'Aapke real ESP/NodeMCU sensors ka live data (V2 Temp, V3 Humidity) Blynk Cloud se aa raha hai!'
                : 'Abhi baseline simulation chal rahi hai. Real hardware data pane ke liye niche apna Blynk Token dalein.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (isRealHardwareLive) {
              triggerBlynkFetch(tokenInput);
            } else {
              handleConnectAndPoll();
            }
          }}
          className={`px-3 py-1.5 rounded font-bold text-xs transition flex items-center gap-1.5 ${
            isRealHardwareLive
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${blynkStatus === 'polling' ? 'animate-spin' : ''}`} />
          <span>{isRealHardwareLive ? 'Sync Real Sensors' : 'Connect Real Hardware'}</span>
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('blynk')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition ${
              activeTab === 'blynk'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>BLYNK IoT REST API (V2 / V3)</span>
          </button>

          <button
            onClick={() => setActiveTab('mqtt')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition ${
              activeTab === 'mqtt'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>MQTT CLIENT (get/ds)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className={`w-2 h-2 rounded-full ${isRealHardwareLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
          <span>{isRealHardwareLive ? 'Real Cloud Stream' : 'Gateway Standby'}</span>
        </div>
      </div>

      {/* Tab 1: Blynk IoT Gateway */}
      {activeTab === 'blynk' && (
        <div className="space-y-4">
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-cyan-400" />
                BLYNK BLR1 CLOUD GATEWAY CONFIGURATION
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLiveBlynkActive(!isLiveBlynkActive)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition ${
                    isLiveBlynkActive
                      ? 'bg-cyan-500 text-slate-950 animate-pulse'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isLiveBlynkActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isLiveBlynkActive ? 'AUTO-POLLING (ACTIVE)' : 'START AUTO-POLL'}</span>
                </button>

                <button
                  onClick={() => triggerBlynkFetch(tokenInput)}
                  disabled={blynkStatus === 'polling'}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
                >
                  <RefreshCw className={`w-3 h-3 ${blynkStatus === 'polling' ? 'animate-spin' : ''}`} />
                  <span>POLL V2 &amp; V3 NOW</span>
                </button>
              </div>
            </div>

            {/* Token Input Form */}
            <form onSubmit={handleConnectAndPoll} className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="flex-1">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Apna Blynk Device Auth Token Yahan Paste Karein ({'{device_token}'}):
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. 7abcD1234xyz..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div className="sm:self-end flex gap-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  Connect &amp; Fetch
                </button>
              </div>
            </form>

            {/* Configured API URLs for user */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800">
                <div className="truncate mr-2">
                  <span className="text-cyan-400 font-bold mr-2">[TEMP V2]:</span>
                  <span className="text-slate-300 text-[11px] select-all">{urlV2}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(urlV2, 'v2')}
                  className="text-slate-400 hover:text-white p-1 rounded transition shrink-0"
                  title="Copy URL"
                >
                  {copiedUrl === 'v2' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800">
                <div className="truncate mr-2">
                  <span className="text-cyan-400 font-bold mr-2">[HUMIDITY V3]:</span>
                  <span className="text-slate-300 text-[11px] select-all">{urlV3}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(urlV3, 'v3')}
                  className="text-slate-400 hover:text-white p-1 rounded transition shrink-0"
                  title="Copy URL"
                >
                  {copiedUrl === 'v3' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800">
                <div className="truncate mr-2">
                  <span className="text-amber-400 font-bold mr-2">[MQ8 GAS V1]:</span>
                  <span className="text-slate-300 text-[11px] select-all">{urlV1}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(urlV1, 'v1')}
                  className="text-slate-400 hover:text-white p-1 rounded transition shrink-0"
                  title="Copy URL"
                >
                  {copiedUrl === 'v1' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Gateway Status Output */}
            <div className="mt-3 p-2.5 rounded bg-slate-900/90 border border-slate-800 flex items-start gap-2">
              {isRealHardwareLive ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : blynkStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Cloud className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-[11px] text-slate-300 font-mono">{lastBlynkMessage}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Interval: {thresholds.pollingIntervalSec}s | Agar aapka physical microcontroller unpowered ya offline hai, toh dashboard seamlessly realistic values simulate karta hai.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: MQTT Client & Console */}
      {activeTab === 'mqtt' && (
        <div className="space-y-4">
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-amber-400" />
                MQTT TELEMETRY DISPATCH CONSOLE
              </span>
              <span className="text-[11px] text-slate-400">Broker: mqtt://blr1.blynk.cloud:1883</span>
            </div>

            {/* Quick Action Code Buttons for Requested Commands */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => publishMqtt('get/ds', 'temperature ')}
                className="p-3 rounded bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-amber-400 text-left transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-amber-400 font-bold text-xs">PUBLISH TEMPERATURE</span>
                  <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition" />
                </div>
                <code className="text-[11px] text-slate-300 font-mono block bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  mqtt.publish("get/ds", "temperature ")
                </code>
              </button>

              <button
                onClick={() => publishMqtt('get/ds', 'Humidity')}
                className="p-3 rounded bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-cyan-400 text-left transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-cyan-400 font-bold text-xs">PUBLISH HUMIDITY</span>
                  <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition" />
                </div>
                <code className="text-[11px] text-slate-300 font-mono block bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  mqtt.publish("get/ds", "Humidity")
                </code>
              </button>
            </div>

            {/* Custom MQTT Dispatcher */}
            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-800">
              <div className="w-full sm:w-1/3">
                <label className="block text-[10px] text-slate-400 mb-0.5">Topic:</label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-slate-400 mb-0.5">Payload:</label>
                <input
                  type="text"
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                />
              </div>
              <div className="sm:self-end">
                <button
                  onClick={() => publishMqtt(customTopic, customPayload)}
                  className="w-full sm:w-auto px-4 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  Send MQTT
                </button>
              </div>
            </div>

            {/* Rolling MQTT Message Ledger */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Recent Broker Events</span>
                <span>{mqttLogs.length} Transactions</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded p-2 max-h-40 overflow-y-auto space-y-1 text-[11px]">
                {mqttLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between font-mono py-0.5 border-b border-slate-900/60 last:border-0">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                      <span className="text-amber-400 font-semibold">[{log.direction}]</span>
                      <span className="text-cyan-300">{log.topic}</span>
                      <span className="text-slate-300">"{log.payload}"</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 px-1 rounded bg-emerald-500/10 shrink-0">
                      ACK 200
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
