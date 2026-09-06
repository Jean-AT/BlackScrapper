import { Dashboard } from './components/Dashboard';
import { useDashboardData } from './hooks/useDashboardData';
import { firebaseMode } from './lib/firebase';

export default function App() {
  const { data, source, loading, error } = useDashboardData();

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Blackboard UPC centralizer</p>
        <h1>Assignments, grades, and sync status in one place.</h1>
        <p className="lede">
          A local Puppeteer scraper feeds Firestore, and this React dashboard
          keeps the academic snapshot organized.
        </p>
        <div className="hero-badges">
          <span>{loading ? 'Loading data' : `Data source: ${source}`}</span>
          <span>{firebaseMode === 'sample' ? 'Local sample mode' : `${firebaseMode} mode`}</span>
          {error ? <span className="badge-error">{error}</span> : null}
        </div>
      </header>

      <Dashboard data={data} loading={loading} />
    </main>
  );
}
