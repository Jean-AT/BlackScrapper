import { launchBrowser } from './scrape/launchBrowser.js';
import { waitForAuthenticatedSession } from './scrape/waitForAuthenticatedSession.js';
import { extractBlackboardData } from './scrape/extractBlackboardData.js';
import { persistSyncRun } from './persistence/persistSyncRun.js';

async function main() {
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.goto('https://blackboard.upc.edu.pe/', {
      waitUntil: 'domcontentloaded'
    });

    await waitForAuthenticatedSession(page);
    const data = await extractBlackboardData(page);
    await persistSyncRun(data);

    console.log(
      `Sync completed: ${data.assignments.length} assignments and ${data.grades.length} grades`
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
