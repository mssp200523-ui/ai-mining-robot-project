import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { MineProvider, useMine } from './context/MineContext';
import { Navbar } from './components/Navbar';
import { TelemetryGauges } from './components/TelemetryGauges';
import { MineShaftMap } from './components/MineShaftMap';
import { BlynkMqttConsole } from './components/BlynkMqttConsole';
import { AlertsPanel } from './components/AlertsPanel';
import { AiSafetyAdvisor } from './components/AiSafetyAdvisor';
import { RescueMissionManager } from './components/RescueMissionManager';
import { ThresholdSettingsModal } from './components/ThresholdSettingsModal';
import { ManualEvacuationModal } from './components/ManualEvacuationModal';
import { ShiftReportModal } from './components/ShiftReportModal';
import {
  ShieldCheck,
  Flame,
  Radio,
  Wifi,
  Cloud,
  FileCheck,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEvacOpen, setIsEvacOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenEvacModal={() => setIsEvacOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Section 1: Real-time Telemetry Sensors (DHT11 Temp/Humidity & MQ8 Gas) */}
        <section aria-label="Sensor Telemetry Gauges">
          <TelemetryGauges />
        </section>

        {/* Section 2: Mine Shaft Map & Blynk / MQTT Integration Hub */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6" aria-label="Shaft Visualizer and IoT Console">
          <div className="lg:col-span-7">
            <MineShaftMap />
          </div>
          <div className="lg:col-span-5">
            <BlynkMqttConsole />
          </div>
        </section>

        {/* Section 3: AI Atmospheric Assessment & Automated Alerts Feed */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6" aria-label="AI Assessment and Safety Alerts">
          <div className="lg:col-span-7">
            <AiSafetyAdvisor />
          </div>
          <div className="lg:col-span-5">
            <AlertsPanel />
          </div>
        </section>

        {/* Section 4: Rescue Team Dispatch & Miner RFID Biometrics */}
        <section aria-label="Rescue Operations">
          <RescueMissionManager />
        </section>
      </main>

      {/* Industrial Footer with Regulatory & Integration summary */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-slate-400 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-bold">ROCK ROVER SAFETY &amp; RESCUE PLATFORM</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">DGMS &amp; MSHA Underground Compliance</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="text-cyan-400 flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5" /> Blynk Cloud: BLR1 Region (V2 Temp / V3 Hum)
            </span>
            <span className="text-amber-400 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" /> MQTT: get/ds
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Google Auth &amp; Firestore Active
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ThresholdSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <ManualEvacuationModal
        isOpen={isEvacOpen}
        onClose={() => setIsEvacOpen(false)}
      />
      <ShiftReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MineProvider>
        <DashboardContent />
      </MineProvider>
    </AuthProvider>
  );
}
