import type { Page } from 'puppeteer';
import type { BlackboardScrapeResult } from '../types.js';

export async function extractBlackboardData(page: Page): Promise<BlackboardScrapeResult> {
  const now = new Date().toISOString();
  const syncRunId = crypto.randomUUID();

  const title = await page.title();
  const baseUrl = page.url();

  return {
    userId: 'local-user',
    assignments: [
      {
        id: crypto.randomUUID(),
        courseId: 'course-1',
        courseName: title || 'Blackboard Course',
        title: 'Sample assignment extracted from Blackboard',
        dueDate: now,
        status: 'unknown',
        sourceUrl: baseUrl,
        scrapedAt: now,
        syncRunId
      }
    ],
    grades: [
      {
        id: crypto.randomUUID(),
        courseId: 'course-1',
        courseName: title || 'Blackboard Course',
        title: 'Sample grade extracted from Blackboard',
        score: null,
        maxScore: null,
        percentage: null,
        sourceUrl: baseUrl,
        scrapedAt: now,
        syncRunId
      }
    ],
    syncRun: {
      id: syncRunId,
      status: 'success',
      startedAt: now,
      finishedAt: now,
      itemsScraped: 2
    }
  };
}
