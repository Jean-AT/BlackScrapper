# BlackScrapper

BlackScrapper is a local-first MVP for collecting Blackboard UPC assignments and grades into a React dashboard backed by Firebase.

## Structure
- `scraper/` - Node.js + Puppeteer local scraper
- `web/` - React frontend
- `docs/` - project documentation

## Local development
Run the full local stack with the Firestore emulator, web app, and scraper:

```bash
npm run dev:local
```

This starts:
- Firestore emulator on `127.0.0.1:8080`
- React app in emulator mode
- scraper in emulator mode

The scraper opens Chromium, waits for manual Blackboard login, then extracts and writes data to the local emulator.

## Current status
The repository contains the initial scaffold, extraction pipeline, Firestore model, and local emulator workflow. The next step is to tune the Blackboard selectors against the live UPC pages.
