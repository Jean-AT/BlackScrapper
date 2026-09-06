export type BlackboardAssignment = {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'overdue' | 'unknown';
  sourceUrl: string;
  scrapedAt: string;
  syncRunId: string;
};

export type BlackboardGrade = {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  sourceUrl: string;
  scrapedAt: string;
  syncRunId: string;
};

export type BlackboardScrapeResult = {
  userId: string;
  assignments: BlackboardAssignment[];
  grades: BlackboardGrade[];
  syncRun: {
    id: string;
    status: 'success' | 'error';
    startedAt: string;
    finishedAt: string;
    itemsScraped: number;
    errorMessage?: string;
  };
  page: {
    title: string;
    sourceUrl: string;
  };
};
