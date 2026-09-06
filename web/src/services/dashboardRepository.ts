import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  type Firestore
} from 'firebase/firestore';
import type { DashboardData } from '@/types/dashboard';

export type DashboardSnapshot = {
  data: DashboardData;
  source: 'firestore' | 'sample';
};

export function listenToDashboardData(
  db: Firestore,
  onChange: (snapshot: DashboardSnapshot) => void,
  onError: (error: Error) => void
) {
  const coursesQuery = query(
    collection(db, 'courses'),
    orderBy('courseName', 'asc'),
    limit(20)
  );
  const assignmentsQuery = query(
    collection(db, 'assignments'),
    orderBy('dueDate', 'asc'),
    limit(10)
  );
  const gradesQuery = query(
    collection(db, 'grades'),
    orderBy('scrapedAt', 'desc'),
    limit(10)
  );
  const syncRunsQuery = query(
    collection(db, 'sync_runs'),
    orderBy('startedAt', 'desc'),
    limit(1)
  );

  const state = {
    courses: [] as DashboardData['courses'],
    assignments: [] as DashboardData['assignments'],
    grades: [] as DashboardData['grades'],
    sync: null as DashboardData['sync'] | null
  };

  const emit = () => {
    if (!state.sync) {
      return;
    }

    onChange({
      source: 'firestore',
      data: {
        courses: state.courses,
        assignments: state.assignments,
        grades: state.grades,
        sync: state.sync
      }
    });
  };

  const unsubscribeCourses = onSnapshot(
    coursesQuery,
    (snapshot) => {
      state.courses = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          courseName: String(data.courseName ?? 'Unknown course')
        };
      });
      emit();
    },
    (error) => onError(error as Error)
  );

  const unsubscribeAssignments = onSnapshot(
    assignmentsQuery,
    (snapshot) => {
      state.assignments = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          title: String(data.title ?? 'Untitled assignment'),
          courseName: String(data.courseName ?? 'Unknown course'),
          dueDate: String(data.dueDate ?? 'TBD')
        };
      });
      emit();
    },
    (error) => onError(error as Error)
  );

  const unsubscribeGrades = onSnapshot(
    gradesQuery,
    (snapshot) => {
      state.grades = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          title: String(data.title ?? 'Untitled grade'),
          courseName: String(data.courseName ?? 'Unknown course'),
          score: Number(data.score ?? 0),
          maxScore: Number(data.maxScore ?? 0)
        };
      });
      emit();
    },
    (error) => onError(error as Error)
  );

  const unsubscribeSyncRuns = onSnapshot(
    syncRunsQuery,
    (snapshot) => {
      const latest = snapshot.docs[0]?.data();

      state.sync = latest
        ? {
            status: String(latest.status ?? 'idle') as DashboardData['sync']['status'],
            itemsScraped: Number(latest.itemsScraped ?? 0),
            startedAt: String(latest.startedAt ?? 'TBD'),
            finishedAt: String(latest.finishedAt ?? 'TBD')
          }
        : {
            status: 'idle',
            itemsScraped: 0,
            startedAt: 'TBD',
            finishedAt: 'TBD'
          };
      emit();
    },
    (error) => onError(error as Error)
  );

  return () => {
    unsubscribeCourses();
    unsubscribeAssignments();
    unsubscribeGrades();
    unsubscribeSyncRuns();
  };
}
