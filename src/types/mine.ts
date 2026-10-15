export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface TelemetryReading {
  id: string;
  temperature: number | null; // DHT11 °C (V2) - null when waiting for hardware
  humidity: number | null;    // DHT11 % (V3) - null when waiting for hardware
  mq8Gas: number | null;      // MQ8 Gas in ppm (V1) - null when waiting for hardware
  shaftZone: string;          // e.g. "Shaft 2 - Active Mining Face"
  status: 'normal' | 'warning' | 'critical' | 'offline';
  source: 'blynk' | 'mqtt';
  timestamp: number;
  isLive: boolean;
  rawV2?: string;
  rawV3?: string;
  rawV1?: string;
}

export interface SafetyAlert {
  id: string;
  type: 'TEMP_HIGH' | 'TEMP_CRITICAL' | 'MQ8_GAS_WARNING' | 'MQ8_GAS_CRITICAL' | 'HUMIDITY_HIGH' | 'EXPLOSION_HAZARD' | 'MINER_SOS' | 'MANUAL_EVAC';
  severity: AlertSeverity;
  shaftZone: string;
  message: string;
  status: AlertStatus;
  temperature: number;
  humidity: number;
  mq8Gas: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface SafetyThresholds {
  tempWarn: number;      // Default 32°C
  tempCrit: number;      // Default 38°C
  humidityWarn: number;  // Default 75%
  humidityCrit: number;  // Default 88%
  mq8Warn: number;       // Default 300 ppm
  mq8Crit: number;       // Default 600 ppm
  blynkToken: string;
  mq8Pin?: string;       // Default V1
  pollingIntervalSec: number;
  soundSirenOnCritical: boolean;
  mqttTopic: string;
}

export interface RescueMission {
  id: string;
  title: string;
  targetZone: string;
  status: 'standby' | 'dispatched' | 'in_progress' | 'completed';
  teamName: string;
  trappedMinersCount: number;
  evacuatedMinersCount: number;
  hazardLevel: 'low' | 'medium' | 'high' | 'extreme';
  aiGuidance: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiAtmosphereAnalysis {
  hazardScore: number; // 0 - 100
  overallRisk: 'SAFE' | 'ELEVATED' | 'HAZARDOUS' | 'CRITICAL_DANGER';
  summary: string;
  gasExplosionRisk: string;
  thermalStressIndex: string;
  ventilationStatus: string;
  recommendedAction: string;
  evacuationRecommended: boolean;
  safeExitShaft: string;
  keyHazards: string[];
}

export interface MqttLogEntry {
  id: string;
  timestamp: string;
  topic: string;
  payload: string;
  direction: 'PUBLISH' | 'RECEIVED';
  status: 'success' | 'pending' | 'failed';
}

export interface MinerWorker {
  id: string;
  name: string;
  beaconId: string;
  shaftLevel: string;
  vitals: 'normal' | 'distress' | 'critical';
  heartRate: number;
  battery: number;
  status: 'active' | 'evacuating' | 'safe' | 'trapped';
}
