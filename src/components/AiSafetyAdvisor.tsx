import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  ShieldAlert,
  Wind,
  Flame,
  Thermometer,
  ArrowRight,
  Send,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { useMine } from '../context/MineContext';
import { AiAtmosphereAnalysis } from '../types/mine';

export const AiSafetyAdvisor: React.FC = () => {
  const { currentReading, activeAlertCount, selectedZone } = useMine();

  const [analysis, setAnalysis] = useState<AiAtmosphereAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [chatQuestion, setChatQuestion] = useState<string>('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [askingAssistant, setAskingAssistant] = useState<boolean>(false);

  // Trigger atmospheric analysis when sensor condition shifts significantly
  const runAtmosphericAnalysis = async () => {
    if (currentReading.temperature === null || currentReading.humidity === null) {
      setAnalysis({
        hazardScore: 0,
        overallRisk: 'SAFE',
        summary: 'Awaiting genuine real-time sensor stream from hardware via Blynk Cloud...',
        gasExplosionRisk: 'MQ8 sensor awaiting live signal.',
        thermalStressIndex: 'DHT11 sensor awaiting live signal.',
        ventilationStatus: 'Nominal baseline ventilation.',
        recommendedAction: 'Ensure Blynk token is entered and microcontroller is transmitting.',
        evacuationRecommended: false,
        safeExitShaft: 'Shaft 1 Hoist',
        keyHazards: [],
      });
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: currentReading.temperature,
          humidity: currentReading.humidity,
          mq8Gas: currentReading.mq8Gas ?? 0,
          shaftZone: selectedZone,
          activeAlertsCount: activeAlertCount,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to run AI analysis:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Run on mount
  useEffect(() => {
    runAtmosphericAnalysis();
  }, []);

  // Handle tactical rescue question
  const handleAskAssistant = async (questionToAsk?: string) => {
    const q = questionToAsk || chatQuestion;
    if (!q.trim()) return;
    setAskingAssistant(true);
    setChatResponse(null);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context: `Sector: ${selectedZone}, Temp: ${currentReading.temperature}°C, Humidity: ${currentReading.humidity}%, MQ8: ${currentReading.mq8Gas}ppm, Active Alerts: ${activeAlertCount}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChatResponse(data.answer);
      } else {
        setChatResponse(data.error || 'Assistant unavailable');
      }
    } catch {
      setChatResponse('Connection to tactical AI command timed out. Follow standard MSHA safety guidelines.');
    } finally {
      setAskingAssistant(false);
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'CRITICAL_DANGER':
        return 'text-red-400 bg-red-500/20 border-red-500';
      case 'HAZARDOUS':
        return 'text-orange-400 bg-orange-500/20 border-orange-500';
      case 'ELEVATED':
        return 'text-amber-400 bg-amber-500/20 border-amber-500';
      default:
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm space-y-5">
      {/* AI Atmosphere Risk Assessment Card */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wide">
                  AI UNDERGROUND ATMOSPHERIC ASSESSMENT
                </h2>
                <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Multivariate risk modeling: Combustible Gas + Thermal Index + Airflow
              </p>
            </div>
          </div>

          <button
            onClick={runAtmosphericAnalysis}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{analyzing ? 'ANALYZING...' : 'RE-EVALUATE RISKS'}</span>
          </button>
        </div>

        {analysis ? (
          <div className="space-y-4">
            {/* Top Score Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">ATMOSPHERIC HAZARD SCORE</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono text-3xl font-extrabold text-white">{analysis.hazardScore}</span>
                    <span className="text-xs font-mono text-slate-400">/ 100</span>
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs ${
                    analysis.hazardScore > 70
                      ? 'border-red-500 text-red-400 bg-red-500/10 animate-pulse'
                      : analysis.hazardScore > 40
                      ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                      : 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  }`}
                >
                  {analysis.hazardScore}%
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">RISK CLASSIFICATION</span>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-bold border ${getRiskColor(
                      analysis.overallRisk
                    )}`}
                  >
                    {analysis.overallRisk}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-1.5 truncate">{analysis.summary}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">EVACUATION STATUS</span>
                <div className="mt-1">
                  {analysis.evacuationRecommended ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-red-600 text-white animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" /> EVACUATE SECTOR
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      HOLD POSITION / NORMAL
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-1.5">
                  Safe Route: {analysis.safeExitShaft}
                </p>
              </div>
            </div>

            {/* Detailed Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                  <Flame className="w-4 h-4" />
                  <span>Combustible Gas &amp; Explosion Envelope (MQ8):</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{analysis.gasExplosionRisk}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                  <Thermometer className="w-4 h-4" />
                  <span>Thermal Index &amp; Humidity Stress (DHT11):</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{analysis.thermalStressIndex}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
                  <Wind className="w-4 h-4" />
                  <span>Auxiliary Ventilation &amp; Damper Directives:</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{analysis.ventilationStatus}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Tactical Shift Supervisor Action:</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] font-medium">{analysis.recommendedAction}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-800 rounded-lg">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-amber-400" />
            <p>Initializing Gemini atmospheric risk model...</p>
          </div>
        )}
      </div>

      {/* Tactical Rescue AI Q&A Assistant */}
      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-2 font-mono text-xs font-semibold text-slate-200">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>TACTICAL MINE RESCUE CONSULTANT</span>
          <span className="text-[10px] text-slate-400 font-normal">
            (Ground-truth guidance for emergency response &amp; breathing apparatus protocols)
          </span>
        </div>

        {/* Quick Question Pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            'What is the emergency protocol if MQ8 exceeds 600 ppm?',
            'What is the maximum heat stress duration at 38°C in high humidity?',
            'How to safely deploy auxiliary ventilation without causing methane recirc?',
            'Standard procedure for water ingress in Shaft 2 refuge bay?',
          ].map((promptText, i) => (
            <button
              key={i}
              onClick={() => {
                setChatQuestion(promptText);
                handleAskAssistant(promptText);
              }}
              className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-left"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Query Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAssistant()}
            placeholder="Ask AI mine rescue specialist (e.g., SCBA limits, toxic gas isolation, blast door sealing)..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
          />
          <button
            onClick={() => handleAskAssistant()}
            disabled={askingAssistant || !chatQuestion.trim()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold font-mono text-xs rounded-lg transition flex items-center gap-1.5"
          >
            {askingAssistant ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Consult</span>
          </button>
        </div>

        {/* Assistant Response Box */}
        {chatResponse && (
          <div className="mt-3 p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Rescue Command Guidance:</span>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed whitespace-pre-line">{chatResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};
