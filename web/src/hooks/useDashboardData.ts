import { useEffect, useState } from 'react';
import { firestore, firebaseEnabled } from '@/lib/firebase';
import { listenToDashboardData, type DashboardSnapshot } from '@/services/dashboardRepository';
import { sampleDashboardData } from '@/data/sampleData';
import type { DashboardData } from '@/types/dashboard';

type DashboardState = {
  data: DashboardData;
  source: DashboardSnapshot['source'];
  loading: boolean;
  error: string | null;
};

const initialState: DashboardState = {
  data: sampleDashboardData,
  source: 'sample',
  loading: true,
  error: null
};

export function useDashboardData() {
  const [state, setState] = useState<DashboardState>(initialState);

  useEffect(() => {
    if (!firebaseEnabled || !firestore) {
      setState({
        data: sampleDashboardData,
        source: 'sample',
        loading: false,
        error: null
      });
      return;
    }

    const unsubscribe = listenToDashboardData(
      firestore,
      (snapshot) => {
        setState({
          data: snapshot.data,
          source: snapshot.source,
          loading: false,
          error: null
        });
      },
      (error) => {
        setState({
          data: sampleDashboardData,
          source: 'sample',
          loading: false,
          error: error.message
        });
      }
    );

    return unsubscribe;
  }, []);

  return state;
}
