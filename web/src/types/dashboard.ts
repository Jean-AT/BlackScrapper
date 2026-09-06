export type Course = {
  id: string;
  courseName: string;
};

export type Assignment = {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
};

export type Grade = {
  id: string;
  title: string;
  courseName: string;
  score: number;
  maxScore: number;
};

export type SyncStatus = {
  status: 'success' | 'warning' | 'error' | 'idle';
  itemsScraped: number;
  startedAt: string;
  finishedAt: string;
};

export type DashboardData = {
  courses: Course[];
  assignments: Assignment[];
  grades: Grade[];
  sync: SyncStatus;
};
