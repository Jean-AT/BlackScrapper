import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Page } from 'puppeteer';
import type { BlackboardScrapeResult } from '../types.js';

type DumpDiagnosticsOptions = {
  outputDir: string;
  page: Page;
  result: BlackboardScrapeResult;
};

function safeFilePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function dumpDiagnostics({ outputDir, page, result }: DumpDiagnosticsOptions) {
  const runStamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = safeFilePart(result.page.title || 'blackboard');
  const folder = path.resolve(outputDir, `${runStamp}-${baseName}`);

  await mkdir(folder, { recursive: true });

  const htmlPath = path.join(folder, 'page.html');
  const reportPath = path.join(folder, 'report.json');
  const summaryPath = path.join(folder, 'summary.txt');

  const html = await page.content();

  await Promise.all([
    writeFile(htmlPath, html, 'utf8'),
    writeFile(reportPath, JSON.stringify(result, null, 2), 'utf8'),
    writeFile(
      summaryPath,
      [
        `title: ${result.page.title}`,
        `sourceUrl: ${result.page.sourceUrl}`,
        `courses: ${result.courses.length}`,
        `assignments: ${result.assignments.length}`,
        `grades: ${result.grades.length}`,
        `syncRunId: ${result.syncRun.id}`
      ].join('\n'),
      'utf8'
    )
  ]);

  return {
    folder,
    htmlPath,
    reportPath,
    summaryPath
  };
}
