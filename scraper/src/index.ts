import { launchBrowser } from './scrape/launchBrowser.js';
import { waitForAuthenticatedSession } from './scrape/waitForAuthenticatedSession.js';
import { extractBlackboardData } from './scrape/extractBlackboardData.js';
import { persistSyncRun } from './persistence/persistSyncRun.js';
import { dumpDiagnostics } from './scrape/dumpDiagnostics.js';

async function main() {
  const startupUrl = process.env.BLACKBOARD_START_URL ?? 'https://blackboard.upc.edu.pe/';
  const debugDumpDir = process.env.BLACKBOARD_DEBUG_DUMP_DIR;
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.goto(startupUrl, {
      waitUntil: 'domcontentloaded'
    });

    await waitForAuthenticatedSession(page);
    const data = await extractBlackboardData(page);
    await persistSyncRun(data);

    if (debugDumpDir) {
      const dump = await dumpDiagnostics({
        outputDir: debugDumpDir,
        page,
        result: data
      });

      console.log(`Debug dump written to ${dump.folder}`);
    }

    console.log(
      `Sync completed: ${data.assignments.length} assignments and ${data.grades.length} grades from ${data.page.title}`
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('Scraper failed');
  console.error(error);
  process.exitCode = 1;
});
