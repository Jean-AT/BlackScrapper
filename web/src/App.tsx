import { useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { sampleDashboardData } from './data/sampleData';

export default function App() {
  const dashboard = useMemo(() => sampleDashboardData, []);

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Blackboard UPC centralizer</p>
        <h1>Assignments, grades, and sync status in one place.</h1>
        <p className="lede">
          A local Puppeteer scraper feeds Firestore, and this React dashboard
          keeps the academic snapshot organized.
        </p>
      </header>

      <Dashboard data={dashboard} />
    </main>
  );
}
