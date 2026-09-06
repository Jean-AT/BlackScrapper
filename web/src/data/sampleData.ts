import type { DashboardData } from '@/types/dashboard';

export const sampleDashboardData: DashboardData = {
  assignments: [
    {
      id: 'a1',
      title: 'Database normalization exercise',
      courseName: 'Database Systems',
      dueDate: '2026-09-12'
    },
    {
      id: 'a2',
      title: 'React quiz reflection',
      courseName: 'Web Development',
      dueDate: '2026-09-14'
    }
  ],
  grades: [
    {
      id: 'g1',
      title: 'Midterm checkpoint',
      courseName: 'Algorithms',
      score: 17,
      maxScore: 20
    },
    {
      id: 'g2',
      title: 'Lab 2',
      courseName: 'Web Development',
      score: 18.5,
      maxScore: 20
    }
  ],
  sync: {
    status: 'success',
    itemsScraped: 14,
    startedAt: '2026-09-06 08:10',
    finishedAt: '2026-09-06 08:12'
  }
};
