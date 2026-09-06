import type { Page } from 'puppeteer';

const AUTH_MARKERS = [
  '[data-testid="dashboard"]',
  '.course-stream',
  '#globalNav',
  'body'
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function waitForAuthenticatedSession(page: Page) {
  for (;;) {
    for (const selector of AUTH_MARKERS) {
      const exists = await page.$(selector);
      if (exists) {
        const url = page.url();
        if (!/login|signin|oauth/i.test(url)) {
          return;
        }
      }
    }

    await sleep(1500);
  }
}
