# Tasks by Phase

## Phase 0 - Repo setup
- Create the base project structure.
- Define the `scraper/`, `web/`, and `docs/` folders.
- Initialize Node.js and React configuration.
- Prepare the Firebase project.

## Phase 1 - Local scraper
- Launch a visible Chromium window with Puppeteer.
- Implement active waiting for manual login.
- Detect the correct screen after MFA.
- Inspect the Blackboard HTML.
- Extract assignments, due dates, and grades.
- Convert the output into normalized JSON.

## Phase 2 - Firestore
- Define the collection schema.
- Build the write layer from the scraper.
- Store courses, assignments, grades, and sync runs.
- Verify that writes stay within the free tier.

## Phase 3 - React frontend
- Create the React app.
- Connect reads to Firestore.
- Build the pending assignments dashboard.
- Build the grades view.
- Build the last sync status panel.

## Phase 4 - Minimum quality
- Add validation before saving data.
- Handle network errors and expired sessions.
- Test DOM changes and fragile selectors.
- Make sure the frontend degrades gracefully when there is no data.

## Phase 5 - Deployment
- Configure Firebase Hosting.
- Publish the frontend.
- Verify a custom domain if needed.
- Document the local execution flow.

## Definition of done for MVP
- The user runs a manual local sync.
- The data reaches Firestore.
- The React dashboard shows the status without errors.
- Sync history is stored.
