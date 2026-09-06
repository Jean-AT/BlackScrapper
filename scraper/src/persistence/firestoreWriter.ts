import admin from 'firebase-admin';
import type { BlackboardScrapeResult } from '../types.js';
import { getScraperConfig } from '../config.js';

let appInitialized = false;

function ensureFirebaseAdmin() {
  if (appInitialized) {
    return admin.firestore();
  }

  const config = getScraperConfig();

  if (config.firestoreEmulatorHost) {
    process.env.FIRESTORE_EMULATOR_HOST = config.firestoreEmulatorHost;
  }

  const usingEmulator = Boolean(config.firestoreEmulatorHost);

  if (usingEmulator) {
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: config.projectId ?? 'blackscrapper-local'
      });
    }

    appInitialized = true;
    return admin.firestore();
  }

  if (!config.projectId || !config.clientEmail || !config.privateKey) {
    return null;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.projectId,
      clientEmail: config.clientEmail,
      privateKey: config.privateKey
    })
  });

  appInitialized = true;
  return admin.firestore();
}

export async function writeScrapeToFirestore(result: BlackboardScrapeResult) {
  const db = ensureFirebaseAdmin();

  if (!db) {
    return { mode: 'mock' as const };
  }

  const batch = db.batch();

  const userRef = db.collection('users').doc(result.userId);
  batch.set(
    userRef,
    {
      id: result.userId,
      lastSyncAt: result.syncRun.finishedAt
    },
    { merge: true }
  );

  for (const course of result.courses) {
    batch.set(db.collection('courses').doc(course.id), {
      ...course,
      userId: result.userId
    });
  }

  const syncRunRef = db.collection('sync_runs').doc(result.syncRun.id);
  batch.set(syncRunRef, {
    userId: result.userId,
    ...result.syncRun
  });

  for (const assignment of result.assignments) {
    batch.set(db.collection('assignments').doc(assignment.id), {
      ...assignment,
      userId: result.userId
    });
  }

  for (const grade of result.grades) {
    batch.set(db.collection('grades').doc(grade.id), {
      ...grade,
      userId: result.userId
    });
  }

  await batch.commit();

  return { mode: 'firestore' as const };
}
