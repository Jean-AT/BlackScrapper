import type { BlackboardScrapeResult } from '../types.js';
import { writeScrapeToFirestore } from './firestoreWriter.js';

export async function persistSyncRun(result: BlackboardScrapeResult) {
  const resultMode = await writeScrapeToFirestore(result);

  console.log(
    resultMode.mode === 'firestore'
      ? 'Persisted sync payload to Firestore'
      : 'Firebase credentials not configured; skipped remote persistence'
  );
}
