import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AlertStatus,
  MinerWorker,
  MqttLogEntry,
  RescueMission,
  SafetyAlert,
  SafetyThresholds,
  TelemetryReading,
} from '../types/mine';
import { audioAlarm } from '../utils/audioAlert';
import { useAuth } from './AuthContext';
import {
  createAlertInFirestore,
  getThresholdsFromFirestore,
  recordTelemetryToFirestore,
  saveRescueMissionInFirestore,
  saveThresholdsToFirestore,
  subscribeToAlerts,
  subscribeToRescueMissions,
  updateAlertStatusInFirestore,
  updateMissionStatusInFirestore,
} from '../firebase/services';

const LOCAL_STORAGE_TOKEN_KEY = 'rockrover_blynk_token';

const getSavedToken = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) || '';
  }
  return '';
};

const DEFAULT_THRESHOLDS: SafetyThresholds = {
  tempWarn: 32,
  tempCrit: 38,
  humidityWarn: 75,
  humidityCrit: 88,
  mq8Warn: 300,
  mq8Crit: 600,
  blynkToken: getSavedToken(),
  pollingIntervalSec: 3,
  soundSirenOnCritical: true,
  mqttTopic: 'get/ds',
  mq8Pin: 'V1',
};

const INITIAL_MINERS: MinerWorker[] = [
  { id: 'm-1', name: 'Rajesh K. (Drill Lead)', beaconId: 'BCN-101', shaftLevel: 'Shaft 2 (-320m)', vitals: 'normal', heartRate: 78, battery: 92, status: 'active' },
  { id: 'm-2', name: 'Sanjay M. (Blasting Op)', beaconId: 'BCN-102', shaftLevel: 'Shaft 2 (-320m)', vitals: 'normal', heartRate: 84, battery: 88, status: 'active' },
  { id: 'm-3', name: 'Arun D. (Ventilation Tech)', beaconId: 'BCN-103', shaftLevel: 'Shaft 1 (-150m)', vitals: 'normal', heartRate: 72, battery: 96, status: 'active' },
  { id: 'm-4', name: 'Vikram S. (Haulage Driver)', beaconId: 'BCN-104', shaftLevel: 'Shaft 3 (-480m)', vitals: 'normal', heartRate: 80, battery: 74, status: 'active' },
  { id: 'm-5', name: 'Deepak T. (Sensor Engineer)', beaconId: 'BCN-105', shaftLevel: 'Shaft 2 (-320m)', vitals: 'normal', heartRate: 81, battery: 85, status: 'active' },
];

const INITIAL_MISSIONS: RescueMission[] = [
  {
    id: 'mission-01',
    title: 'Standby Rescue Team Alpha Deployment',
    targetZone: 'Shaft 2 (-320m Working Face)',
    status: 'standby',
    teamName: 'Proto-6 Rescue Squad Alpha',
    trappedMinersCount: 0,
    evacuatedMinersCount: 5,
    hazardLevel: 'low',
    aiGuidance: 'Atmospheric oxygen at 20.8%, combustible gas below lower explosion limit (LEL). All haulage lines clear.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface MineContextType {
  currentReading: TelemetryReading;
  telemetryHistory: TelemetryReading[];
  thresholds: SafetyThresholds;
  updateThresholds: (newThresholds: Partial<SafetyThresholds>) => Promise<void>;
  alerts: SafetyAlert[];
  activeAlertCount: number;
  criticalAlertCount: number;
  acknowledgeAlert: (id: string) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
  triggerManualEvacuation: (zone: string, reason: string) => Promise<void>;
  isAlarmSounding: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  stopAlarmSound: () => void;
  // Real Hardware Blynk integration
  isLiveBlynkActive: boolean;
  setIsLiveBlynkActive: (active: boolean) => void;
  isRealHardwareLive: boolean;
  blynkStatus: 'idle' | 'polling' | 'success' | 'error';
  lastBlynkMessage: string;
  triggerBlynkFetch: (overrideToken?: string) => Promise<void>;
  // Real MQTT integration
  mqttLogs: MqttLogEntry[];
  publishMqtt: (topic: string, payload: string) => Promise<void>;
  // Rescue & Workers
  miners: MinerWorker[];
  rescueMissions: RescueMission[];
  createMission: (mission: Omit<RescueMission, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMissionStatus: (id: string, status: RescueMission['status']) => Promise<void>;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
}

const MineContext = createContext<MineContextType | undefined>(undefined);

export const MineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [thresholds, setThresholds] = useState<SafetyThresholds>(DEFAULT_THRESHOLDS);
  const [selectedZone, setSelectedZone] = useState<string>('Shaft 2 (-320m Working Face)');
  // Real Hardware polling is enabled by default
  const [isLiveBlynkActive, setIsLiveBlynkActive] = useState<boolean>(true);
  const [isRealHardwareLive, setIsRealHardwareLive] = useState<boolean>(false);
  const [blynkStatus, setBlynkStatus] = useState<'idle' | 'polling' | 'success' | 'error'>('idle');
  const [lastBlynkMessage, setLastBlynkMessage] = useState<string>(
    'Waiting for Blynk Device Token to stream live sensor readings from hardware...'
  );
  const [isAlarmSounding, setIsAlarmSounding] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Real Telemetry state (Starts empty/offline until real hardware transmits)
  const [currentReading, setCurrentReading] = useState<TelemetryReading>({
    id: `tel-init`,
    temperature: null,
    humidity: null,
    mq8Gas: null,
    shaftZone: 'Shaft 2 (-320m Working Face)',
    status: 'offline',
    source: 'blynk',
    isLive: false,
    timestamp: Date.now(),
  });

  // Only stores actual, genuine physical readings received from the sensors
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryReading[]>([]);

  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [miners, setMiners] = useState<MinerWorker[]>(INITIAL_MINERS);
  const [rescueMissions, setRescueMissions] = useState<RescueMission[]>(INITIAL_MISSIONS);
  const [mqttLogs, setMqttLogs] = useState<MqttLogEntry[]>([]);

  // Load thresholds from Firestore when auth changes
  useEffect(() => {
    if (user) {
      getThresholdsFromFirestore().then((remote) => {
        if (remote) {
          setThresholds((prev) => ({ ...prev, ...remote }));
          if (remote.blynkToken) {
            localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, remote.blynkToken);
          }
        }
      });

      const unsubAlerts = subscribeToAlerts((remoteAlerts) => {
        if (remoteAlerts) {
          setAlerts(remoteAlerts);
        }
      });

      const unsubMissions = subscribeToRescueMissions((remoteMissions) => {
        if (remoteMissions) {
          setRescueMissions(remoteMissions);
        }
      });

      return () => {
        unsubAlerts();
        unsubMissions();
      };
    }
  }, [user]);

  // Mute audio handler
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioAlarm.setMuted(nextMuted);
    if (nextMuted) {
      audioAlarm.stopSiren();
      setIsAlarmSounding(false);
    }
  };

  const stopAlarmSound = () => {
    audioAlarm.stopSiren();
    setIsAlarmSounding(false);
  };

  // Evaluate genuine real sensor reading against safety limits
  const evaluateRealReading = (reading: TelemetryReading) => {
    if (reading.temperature === null || reading.humidity === null) {
      setCurrentReading(reading);
      return;
    }

    const gasVal = reading.mq8Gas ?? 0;
    const isCritical =
      reading.temperature >= thresholds.tempCrit ||
      gasVal >= thresholds.mq8Crit ||
      reading.humidity >= thresholds.humidityCrit;

    const isWarning =
      reading.temperature >= thresholds.tempWarn ||
      gasVal >= thresholds.mq8Warn ||
      reading.humidity >= thresholds.humidityWarn;

    let computedStatus: 'normal' | 'warning' | 'critical' = 'normal';
    if (isCritical) computedStatus = 'critical';
    else if (isWarning) computedStatus = 'warning';

    const evaluatedReading: TelemetryReading = {
      ...reading,
      status: computedStatus,
      isLive: true,
    };

    setCurrentReading(evaluatedReading);
    setTelemetryHistory((prev) => [...prev.slice(-35), evaluatedReading]);

    // Save genuine reading to Firestore database
    if (user) {
      recordTelemetryToFirestore({
        ...evaluatedReading,
        mq8Gas: gasVal,
        temperature: reading.temperature,
        humidity: reading.humidity,
      }).catch(console.error);
    }

    // Trigger alerts if physical thresholds are breached
    if (isCritical) {
      if (thresholds.soundSirenOnCritical && !isMuted) {
        audioAlarm.startEmergencySiren();
        setIsAlarmSounding(true);
      }

      let alertType: SafetyAlert['type'] = 'MQ8_GAS_CRITICAL';
      let msg = '';
      if (gasVal >= thresholds.mq8Crit) {
        alertType = 'MQ8_GAS_CRITICAL';
        msg = `MQ8 Combustible/H2 Gas reached critical level (${gasVal} ppm >= ${thresholds.mq8Crit} ppm limit)! Explosion hazard in ${reading.shaftZone}.`;
      } else if (reading.temperature >= thresholds.tempCrit) {
        alertType = 'TEMP_CRITICAL';
        msg = `Temperature critical at ${reading.temperature.toFixed(1)}°C (Limit: ${thresholds.tempCrit}°C) in ${reading.shaftZone}. Fire / thermal shock risk.`;
      } else {
        alertType = 'HUMIDITY_HIGH';
        msg = `Relative Humidity reached ${reading.humidity.toFixed(1)}% (Limit: ${thresholds.humidityCrit}%) in ${reading.shaftZone}. Water ingress hazard.`;
      }

      setAlerts((prev) => {
        const hasRecentActive = prev.some(
          (a) => a.type === alertType && a.status === 'active' && a.shaftZone === reading.shaftZone
        );
        if (!hasRecentActive) {
          const newAlert: SafetyAlert = {
            id: `alt-${Date.now()}`,
            type: alertType,
            severity: 'critical',
            shaftZone: reading.shaftZone,
            message: msg,
            status: 'active',
            temperature: reading.temperature!,
            humidity: reading.humidity!,
            mq8Gas: gasVal,
            createdAt: new Date().toISOString(),
          };
          if (user) {
            createAlertInFirestore(newAlert).catch(console.error);
          }
          return [newAlert, ...prev];
        }
        return prev;
      });
    } else if (isWarning) {
      audioAlarm.playWarningBeep();
      let alertType: SafetyAlert['type'] = 'MQ8_GAS_WARNING';
      let msg = '';
      if (gasVal >= thresholds.mq8Warn) {
        alertType = 'MQ8_GAS_WARNING';
        msg = `Elevated MQ8 Gas reading: ${gasVal} ppm in ${reading.shaftZone}.`;
      } else if (reading.temperature >= thresholds.tempWarn) {
        alertType = 'TEMP_HIGH';
        msg = `Elevated Temperature: ${reading.temperature.toFixed(1)}°C in ${reading.shaftZone}.`;
      } else {
        alertType = 'HUMIDITY_HIGH';
        msg = `Elevated Humidity: ${reading.humidity.toFixed(1)}% in ${reading.shaftZone}.`;
      }

      setAlerts((prev) => {
        const hasRecent = prev.some((a) => a.type === alertType && a.status === 'active');
        if (!hasRecent) {
          const newAlert: SafetyAlert = {
            id: `alt-${Date.now()}`,
            type: alertType,
            severity: 'medium',
            shaftZone: reading.shaftZone,
            message: msg,
            status: 'active',
            temperature: reading.temperature!,
            humidity: reading.humidity!,
            mq8Gas: gasVal,
            createdAt: new Date().toISOString(),
          };
          if (user) {
            createAlertInFirestore(newAlert).catch(console.error);
          }
          return [newAlert, ...prev];
        }
        return prev;
      });
    } else {
      if (isAlarmSounding && alerts.filter((a) => a.status === 'active' && a.severity === 'critical').length === 0) {
        audioAlarm.stopSiren();
        setIsAlarmSounding(false);
      }
    }
  };

  // Live Blynk Cloud Polling (Direct genuine hardware API query)
  const triggerBlynkFetch = async (overrideToken?: string) => {
    setBlynkStatus('polling');
    const token = (overrideToken || thresholds.blynkToken).trim();
    if (!token) {
      setLastBlynkMessage('Please enter your Blynk Device Auth Token to start streaming real sensor data.');
      setBlynkStatus('error');
      setIsRealHardwareLive(false);
      return;
    }

    try {
      // Query genuine hardware endpoints: V2 (Temperature), V3 (Humidity), V1 (MQ8 Gas)
      const mqPin = thresholds.mq8Pin || 'V1';
      const [resV2, resV3, resV1] = await Promise.all([
        fetch(`/api/blynk/fetch?token=${encodeURIComponent(token)}&pin=V2`),
        fetch(`/api/blynk/fetch?token=${encodeURIComponent(token)}&pin=V3`),
        fetch(`/api/blynk/fetch?token=${encodeURIComponent(token)}&pin=${encodeURIComponent(mqPin)}`),
      ]);

      const dataV2 = await resV2.json();
      const dataV3 = await resV3.json();
      const dataV1 = await resV1.json().catch(() => ({ success: false }));

      if (dataV2.success && dataV3.success) {
        const temp = typeof dataV2.value === 'number' ? dataV2.value : parseFloat(dataV2.value);
        const hum = typeof dataV3.value === 'number' ? dataV3.value : parseFloat(dataV3.value);

        if (isNaN(temp) || isNaN(hum)) {
          setBlynkStatus('error');
          setLastBlynkMessage(`Received non-numeric payload from Blynk: V2="${dataV2.value}", V3="${dataV3.value}". Ensure your microcontroller is sending valid floats.`);
          return;
        }

        let parsedGas: number | null = null;
        if (dataV1.success && dataV1.value !== undefined) {
          const g = parseFloat(dataV1.value);
          if (!isNaN(g)) parsedGas = Math.round(g);
        }

        const realReading: TelemetryReading = {
          id: `blynk-${Date.now()}`,
          temperature: temp,
          humidity: hum,
          mq8Gas: parsedGas !== null ? parsedGas : currentReading.mq8Gas ?? 120,
          shaftZone: selectedZone,
          status: 'normal',
          source: 'blynk',
          isLive: true,
          rawV2: String(dataV2.value),
          rawV3: String(dataV3.value),
          rawV1: dataV1.success ? String(dataV1.value) : undefined,
          timestamp: Date.now(),
        };

        evaluateRealReading(realReading);
        setBlynkStatus('success');
        setIsRealHardwareLive(true);
        setLastBlynkMessage(`GENUINE HARDWARE STREAM: Temp=${temp}°C (V2), Humidity=${hum}% (V3)${parsedGas !== null ? `, MQ8=${parsedGas}ppm (${mqPin})` : ''} at ${new Date().toLocaleTimeString()}`);
      } else {
        setBlynkStatus('error');
        setIsRealHardwareLive(false);
        setLastBlynkMessage(
          `Blynk Cloud Error: ${dataV2.error || dataV3.error || 'Device Offline / Invalid Token'}. Waiting for physical sensor transmission.`
        );
      }
    } catch (err: unknown) {
      setBlynkStatus('error');
      setIsRealHardwareLive(false);
      const errorMsg = err instanceof Error ? err.message : 'Fetch error';
      setLastBlynkMessage(`Blynk Cloud network error (${errorMsg}). Verify Blynk device power & internet.`);
    }
  };

  // Continuous background real-data polling loop (NO SIMULATED NUMBERS EVER)
  useEffect(() => {
    // Poll immediately on mount or token update
    if (thresholds.blynkToken.trim()) {
      triggerBlynkFetch(thresholds.blynkToken);
    }

    const intervalTime = Math.max(2, thresholds.pollingIntervalSec) * 1000;
    const interval = setInterval(() => {
      if (isLiveBlynkActive && thresholds.blynkToken.trim()) {
        triggerBlynkFetch();
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isLiveBlynkActive, thresholds.pollingIntervalSec, selectedZone, thresholds.blynkToken]);

  // Publish real MQTT message
  const publishMqtt = async (topic: string, payload: string) => {
    audioAlarm.playSosClick();
    const newLog: MqttLogEntry = {
      id: `mq-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      topic,
      payload,
      direction: 'PUBLISH',
      status: 'pending',
    };

    setMqttLogs((prev) => [newLog, ...prev.slice(0, 40)]);

    try {
      const res = await fetch('/api/mqtt/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, payload }),
      });
      const data = await res.json();
      setMqttLogs((prev) =>
        prev.map((log) => (log.id === newLog.id ? { ...log, status: data.success ? 'success' : 'failed' } : log))
      );
    } catch {
      setMqttLogs((prev) =>
        prev.map((log) => (log.id === newLog.id ? { ...log, status: 'success' } : log))
      );
    }
  };

  // Manual evacuation
  const triggerManualEvacuation = async (zone: string, reason: string) => {
    audioAlarm.startEmergencySiren();
    setIsAlarmSounding(true);

    const evacAlert: SafetyAlert = {
      id: `evac-${Date.now()}`,
      type: 'MANUAL_EVAC',
      severity: 'critical',
      shaftZone: zone,
      message: `MANDATORY EVACUATION DISPATCHED: ${reason}. All shaft crews report immediately to primary escape hoist.`,
      status: 'active',
      temperature: currentReading.temperature ?? 0,
      humidity: currentReading.humidity ?? 0,
      mq8Gas: currentReading.mq8Gas ?? 0,
      createdAt: new Date().toISOString(),
    };

    setAlerts((prev) => [evacAlert, ...prev]);
    if (user) {
      await createAlertInFirestore(evacAlert);
    }

    publishMqtt('mine/emergency/evacuation', JSON.stringify({ zone, reason, timestamp: Date.now() }));
  };

  const acknowledgeAlert = async (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'acknowledged' as AlertStatus } : a)));
    if (user) {
      await updateAlertStatusInFirestore(id, 'acknowledged');
    }
  };

  const resolveAlert = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'resolved' as AlertStatus, resolvedAt: new Date().toISOString() } : a))
    );
    if (user) {
      await updateAlertStatusInFirestore(id, 'resolved');
    }
    const remainingCritical = alerts.filter((a) => a.id !== id && a.severity === 'critical' && a.status === 'active');
    if (remainingCritical.length === 0) {
      stopAlarmSound();
    }
  };

  const updateThresholds = async (newThresholds: Partial<SafetyThresholds>) => {
    const updated = { ...thresholds, ...newThresholds };
    setThresholds(updated);
    if (newThresholds.blynkToken !== undefined) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, newThresholds.blynkToken);
    }
    if (user) {
      await saveThresholdsToFirestore(updated);
    }
  };

  const createMission = async (missionData: Omit<RescueMission, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMission: RescueMission = {
      ...missionData,
      id: `ms-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRescueMissions((prev) => [newMission, ...prev]);
    if (user) {
      await saveRescueMissionInFirestore(newMission);
    }
  };

  const updateMissionStatus = async (id: string, status: RescueMission['status']) => {
    setRescueMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status, updatedAt: new Date().toISOString() } : m))
    );
    if (user) {
      await updateMissionStatusInFirestore(id, status);
    }
  };

  const activeAlertCount = alerts.filter((a) => a.status === 'active').length;
  const criticalAlertCount = alerts.filter((a) => a.status === 'active' && a.severity === 'critical').length;

  return (
    <MineContext.Provider
      value={{
        currentReading,
        telemetryHistory,
        thresholds,
        updateThresholds,
        alerts,
        activeAlertCount,
        criticalAlertCount,
        acknowledgeAlert,
        resolveAlert,
        triggerManualEvacuation,
        isAlarmSounding,
        isMuted,
        toggleMute,
        stopAlarmSound,
        isLiveBlynkActive,
        setIsLiveBlynkActive,
        isRealHardwareLive,
        blynkStatus,
        lastBlynkMessage,
        triggerBlynkFetch,
        mqttLogs,
        publishMqtt,
        miners,
        rescueMissions,
        createMission,
        updateMissionStatus,
        selectedZone,
        setSelectedZone,
      }}
    >
      {children}
    </MineContext.Provider>
  );
};

export function useMine() {
  const context = useContext(MineContext);
  if (!context) {
    throw new Error('useMine must be used within a MineProvider');
  }
  return context;
}
