import type { BlackboardScrapeResult } from '../types.js';

export async function persistSyncRun(result: BlackboardScrapeResult) {
  const payload = {
    syncRun: result.syncRun,
    assignments: result.assignments,
    grades: result.grades
  };

  console.log('Persisting sync payload');
  console.log(JSON.stringify(payload, null, 2));
}
