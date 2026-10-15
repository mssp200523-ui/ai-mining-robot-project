import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { RescueMission, SafetyAlert, SafetyThresholds, TelemetryReading } from '../types/mine';

// Test connection on boot per Firebase guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, checking network connection.');
      return false;
    }
    // Document might just not exist, which is fine
    return true;
  }
}

// User Profile
export async function syncUserProfile(user: { uid: string; email?: string | null; displayName?: string | null }) {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        userId: user.uid,
        email: user.email || 'officer@mine.local',
        displayName: user.displayName || 'Mine Safety Officer',
        role: 'safety_officer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(userRef, {
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Telemetry Persistence
export async function recordTelemetryToFirestore(reading: TelemetryReading): Promise<void> {
  if (reading.temperature === null || reading.humidity === null) return;
  const path = `telemetry/${reading.id}`;
  try {
    const docRef = doc(db, 'telemetry', reading.id);
    await setDoc(docRef, {
      id: reading.id,
      temperature: Number(reading.temperature.toFixed(2)),
      humidity: Number(reading.humidity.toFixed(2)),
      mq8Gas: reading.mq8Gas !== null ? Number(reading.mq8Gas.toFixed(1)) : 0,
      shaftZone: reading.shaftZone,
      source: reading.source,
      status: reading.status,
      createdAt: new Date(reading.timestamp).toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Safety Alerts
export async function createAlertInFirestore(alert: SafetyAlert): Promise<void> {
  const path = `alerts/${alert.id}`;
  try {
    const docRef = doc(db, 'alerts', alert.id);
    await setDoc(docRef, {
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      shaftZone: alert.shaftZone,
      message: alert.message,
      status: alert.status,
      temperature: Number(alert.temperature.toFixed(2)),
      humidity: Number(alert.humidity.toFixed(2)),
      mq8Gas: Number(alert.mq8Gas.toFixed(1)),
      createdAt: alert.createdAt,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAlertStatusInFirestore(alertId: string, status: 'acknowledged' | 'resolved'): Promise<void> {
  const path = `alerts/${alertId}`;
  try {
    const docRef = doc(db, 'alerts', alertId);
    const updateData: Record<string, string> = { status };
    if (status === 'resolved') {
      updateData.resolvedAt = new Date().toISOString();
    }
    await updateDoc(docRef, updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeToAlerts(callback: (alerts: SafetyAlert[]) => void): () => void {
  const path = 'alerts';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const alerts: SafetyAlert[] = [];
        snapshot.forEach((docSnap) => {
          alerts.push(docSnap.data() as SafetyAlert);
        });
        callback(alerts);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Safety Thresholds Configuration
export async function getThresholdsFromFirestore(): Promise<Partial<SafetyThresholds> | null> {
  const path = 'configs/mine_thresholds';
  try {
    const snap = await getDoc(doc(db, 'configs', 'mine_thresholds'));
    if (snap.exists()) {
      return snap.data() as Partial<SafetyThresholds>;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveThresholdsToFirestore(thresholds: SafetyThresholds): Promise<void> {
  const path = 'configs/mine_thresholds';
  try {
    await setDoc(doc(db, 'configs', 'mine_thresholds'), {
      id: 'mine_thresholds',
      tempWarn: thresholds.tempWarn,
      tempCrit: thresholds.tempCrit,
      humidityWarn: thresholds.humidityWarn,
      humidityCrit: thresholds.humidityCrit,
      mq8Warn: thresholds.mq8Warn,
      mq8Crit: thresholds.mq8Crit,
      blynkToken: thresholds.blynkToken,
      pollingIntervalSec: thresholds.pollingIntervalSec,
      soundSirenOnCritical: thresholds.soundSirenOnCritical,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Rescue Missions
export function subscribeToRescueMissions(callback: (missions: RescueMission[]) => void): () => void {
  const path = 'rescueMissions';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(20));
    return onSnapshot(
      q,
      (snapshot) => {
        const missions: RescueMission[] = [];
        snapshot.forEach((docSnap) => {
          missions.push(docSnap.data() as RescueMission);
        });
        callback(missions);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveRescueMissionInFirestore(mission: RescueMission): Promise<void> {
  const path = `rescueMissions/${mission.id}`;
  try {
    await setDoc(doc(db, 'rescueMissions', mission.id), mission);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateMissionStatusInFirestore(missionId: string, status: RescueMission['status']): Promise<void> {
  const path = `rescueMissions/${missionId}`;
  try {
    await updateDoc(doc(db, 'rescueMissions', missionId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
