# Architecture

## Overview
The system is split into three pieces:

1. Local scraper in Node.js + Puppeteer.
2. Persistence in Firestore.
3. Frontend in React deployed on Firebase Hosting.

## Data flow
1. The user runs a local command.
2. Puppeteer opens a visible Chromium window.
3. The user signs in manually to Blackboard and approves MFA.
4. The scraper waits until it detects the dashboard or target section.
5. The scraper reads the DOM and extracts assignments, due dates, and grades.
6. The data is normalized into JSON.
7. The script writes the data to Firestore.
8. The React app reads Firestore and renders the dashboard.

## Components
### 1. Scraper local
- Responsible for assisted authentication and DOM extraction.
- Does not store passwords.
- Does not run in the cloud.
- Must tolerate HTML structure changes.

### 2. Firestore
- Source of truth for extracted data.
- Stores user, course, assignment, grade, and sync-run entities.
- Keeps execution history for debugging.

### 3. Frontend React
- Consumes Firestore in real time or through controlled queries.
- Presents summary and detail views.
- Must handle loading, empty, and error states.

## Suggested project layout
```text
/
  docs/
  scraper/
  web/
```

### Scraper
```text
scraper/
  src/
    auth/
    extractors/
    transforms/
    persistence/
  package.json
```

### Web
```text
web/
  src/
    components/
    pages/
    hooks/
    services/
  package.json
```

## Data contract
The scraper must produce a stable JSON shape with at least:
- `userId`
- `courseId`
- `courseName`
- `itemType`
- `title`
- `dueDate`
- `score`
- `maxScore`
- `status`
- `sourceUrl`
- `scrapedAt`
- `syncRunId`

## Non-goals for the MVP
- No intermediate backend.
- No cloud login automation.
- No multi-user support initially.
- No automatic scheduling at the beginning.

## Future extension points
- Add first-party authentication later if access expands.
- Add queues or jobs if scraping grows.
- Add caching or aggregations if the dashboard needs more performance.
