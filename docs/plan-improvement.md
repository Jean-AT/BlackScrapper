# MVP Improvement Plan

## Goal
Build a centralized dashboard for Blackboard UPC that lets the user review pending assignments, due dates, and grades without having to open the institutional portal every time.

## Locked Decisions
- Frontend: React
- Scraper: Node.js + Puppeteer
- Database: Firebase Firestore
- Hosting: Firebase Hosting
- Scope: one account, manual sync, assignments and grades
- History: store both the current state and every sync run

## Main Assumption
Login to Blackboard and Microsoft is done manually in a visible browser window. The script only waits, detects the authenticated state, and then extracts data from the DOM.

## MVP Success Criteria
- The user can run a local sync manually.
- The scraper can enter Blackboard with human assistance once per run.
- The extracted data is normalized and stored in Firestore.
- The React app reads Firestore and shows:
  - pending assignments
  - due dates
  - grades
  - last sync status
- The full flow works without a complex intermediate backend.

## Risks and Mitigations
- Blackboard DOM changes
  - Mitigation: page-specific selectors and an adapter layer.
- Incomplete or inconsistent data
  - Mitigation: validate before writing to Firestore.
- Too many Firestore reads
  - Mitigation: keep the document model simple and the queries limited.
- MFA lockouts
  - Mitigation: do not automate credentials or login, only use a visible local session.

## Expected Outcome
A project base that is ready to iterate on, with a clear scraping, persistence, and UI structure, while staying within Firebase's free tier.
