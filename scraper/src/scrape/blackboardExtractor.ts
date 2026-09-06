import { createHash } from 'node:crypto';
import type { Page } from 'puppeteer';
import { getScraperConfig } from '../config.js';
import { getBlackboardSelectors } from './blackboardSelectors.js';
import { normalizeText, parsePercentage, parseRatio, safeText } from './textUtils.js';

export type RawAssignment = {
  courseName: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'overdue' | 'unknown';
  sourceUrl: string;
};

export type RawGrade = {
  courseName: string;
  title: string;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  sourceUrl: string;
};

export type RawCourse = {
  courseName: string;
  sourceUrl: string;
};

function buildConfiguredSelectors(selectors: ReturnType<typeof getBlackboardSelectors>) {
  return {
    assignments: selectors.assignmentRowSelector
      ? {
          row: selectors.assignmentRowSelector,
          title: selectors.assignmentTitleSelector,
          course: selectors.assignmentCourseSelector,
          dueDate: selectors.assignmentDueDateSelector,
          status: selectors.assignmentStatusSelector
        }
      : null,
    grades: selectors.gradeRowSelector
      ? {
          row: selectors.gradeRowSelector,
          title: selectors.gradeTitleSelector,
          course: selectors.gradeCourseSelector,
          score: selectors.gradeScoreSelector,
          maxScore: selectors.gradeMaxScoreSelector,
          percentage: selectors.gradePercentageSelector
        }
      : null
  };
}

function isLikelyAssignmentText(text: string) {
  return /(assignment|task|homework|project|quiz|due|deadline)/i.test(text);
}

function isLikelyGradeText(text: string) {
  return /(\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?|\d+(?:\.\d+)?\s*%|grade|score|points)/i.test(text);
}

export async function extractRawBlackboardData(page: Page): Promise<{
  courses: RawCourse[];
  assignments: RawAssignment[];
  grades: RawGrade[];
}> {
  const selectors = getBlackboardSelectors();
  const pageUrl = page.url();
  const configured = buildConfiguredSelectors(selectors);

  return page.evaluate(
    ({ configuredSelectors, pageUrl }) => {
      type RowRecord = {
        courseName: string;
        title: string;
        dueDate: string;
        status: 'pending' | 'submitted' | 'overdue' | 'unknown';
        sourceUrl: string;
      };

      type GradeRecord = {
        courseName: string;
        title: string;
        score: number | null;
        maxScore: number | null;
        percentage: number | null;
        sourceUrl: string;
      };

      const normalize = (value: string | null | undefined) =>
        (value ?? '').replace(/\s+/g, ' ').trim();

      const isLikelyAssignmentText = (text: string) =>
        /(assignment|task|homework|project|quiz|due|deadline)/i.test(text);

      const isLikelyGradeText = (text: string) =>
        /(\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?|\d+(?:\.\d+)?\s*%|grade|score|points)/i.test(text);

      const textOf = (element: Element | null | undefined) => normalize(element?.textContent);

      const rowText = (row: Element) => textOf(row);

      const deriveCourseName = (row: Element, explicit: string) => {
        if (explicit) {
          return explicit;
        }

        const heading = row.closest('section, article, main')?.querySelector('h1, h2, h3, h4, [role="heading"]');
        return normalize(heading?.textContent) || 'Unknown course';
      };

      const deriveStatus = (explicit: string, fallbackText: string) => {
        const fromExplicit = normalize(explicit).toLowerCase();
        const fallback = normalize(fallbackText).toLowerCase();
        const combined = `${fromExplicit} ${fallback}`;

        if (/(overdue|late|missed)/.test(combined)) {
          return 'overdue' as const;
        }

        if (/(submitted|completed|turned in|done)/.test(combined)) {
          return 'submitted' as const;
        }

        if (/(pending|due|open|to do|in progress)/.test(combined)) {
          return 'pending' as const;
        }

        return 'unknown' as const;
      };

      const parseRatio = (value: string) => {
        const match = normalize(value).match(/(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)/);
        if (!match) {
          return { score: null, maxScore: null };
        }

        return {
          score: Number(match[1]),
          maxScore: Number(match[2])
        };
      };

      const parsePercentage = (value: string) => {
        const match = normalize(value).match(/(-?\d+(?:\.\d+)?)\s*%/);
        return match ? Number(match[1]) : null;
      };

      const scanRow = (row: Element): RowRecord | null => {
        const text = rowText(row);
        if (!text || !isLikelyAssignmentText(text)) {
          return null;
        }

        const cells = Array.from(row.querySelectorAll('td, th, [role="cell"]'));
        const title = normalize(cells[0]?.textContent) || text;
        const dueDate = normalize(cells[1]?.textContent) || normalize(text.match(/(?:due|deadline)[^,;\n]*/i)?.[0]);
        const status = deriveStatus('', text);
        const courseHeading =
          normalize(
            row.closest('section, article, main, [data-testid], [class]')?.querySelector(
              'h1, h2, h3, h4, h5, [role="heading"]'
            )?.textContent
          ) || 'Unknown course';

        return {
          courseName: courseHeading,
          title,
          dueDate: dueDate || 'TBD',
          status,
          sourceUrl: pageUrl
        };
      };

      const scanGrade = (row: Element): GradeRecord | null => {
        const text = rowText(row);
        if (!text || !isLikelyGradeText(text)) {
          return null;
        }

        const cells = Array.from(row.querySelectorAll('td, th, [role="cell"]'));
        const title = normalize(cells[0]?.textContent) || text;
        const ratio = parseRatio(cells[1]?.textContent || text);
        const percentage = parsePercentage(cells[2]?.textContent || text);
        const courseHeading =
          normalize(
            row.closest('section, article, main, [data-testid], [class]')?.querySelector(
              'h1, h2, h3, h4, h5, [role="heading"]'
            )?.textContent
          ) || 'Unknown course';

        return {
          courseName: courseHeading,
          title,
          score: ratio.score,
          maxScore: ratio.maxScore,
          percentage,
          sourceUrl: pageUrl
        };
      };

      const configuredAssignments = configuredSelectors.assignments?.row
        ? Array.from(document.querySelectorAll(configuredSelectors.assignments.row))
            .map((row) => {
              const title = normalize(
                configuredSelectors.assignments?.title
                  ? row.querySelector(configuredSelectors.assignments.title)?.textContent
                  : row.querySelector('td, th, [role="cell"]')?.textContent
              );
              const dueDate = normalize(
                configuredSelectors.assignments?.dueDate
                  ? row.querySelector(configuredSelectors.assignments.dueDate)?.textContent
                  : ''
              );
              const courseName = normalize(
                configuredSelectors.assignments?.course
                  ? row.querySelector(configuredSelectors.assignments.course)?.textContent
                  : ''
              );
              const status = deriveStatus(
                configuredSelectors.assignments?.status
                  ? textOf(row.querySelector(configuredSelectors.assignments.status))
                  : '',
                rowText(row)
              );

              if (!title) {
                return null;
              }

              return {
                courseName: courseName || deriveCourseName(row, ''),
                title,
                dueDate: dueDate || 'TBD',
                status,
                sourceUrl: pageUrl
              };
            })
            .filter((item): item is RowRecord => item !== null)
        : [];

      const configuredGrades = configuredSelectors.grades?.row
        ? Array.from(document.querySelectorAll(configuredSelectors.grades.row))
            .map((row) => {
              const title = normalize(
                configuredSelectors.grades?.title
                  ? row.querySelector(configuredSelectors.grades.title)?.textContent
                  : row.querySelector('td, th, [role="cell"]')?.textContent
              );
              const courseName = normalize(
                configuredSelectors.grades?.course
                  ? row.querySelector(configuredSelectors.grades.course)?.textContent
                  : ''
              );
              const scoreText = normalize(
                configuredSelectors.grades?.score
                  ? row.querySelector(configuredSelectors.grades.score)?.textContent
                  : ''
              );
              const maxScoreText = normalize(
                configuredSelectors.grades?.maxScore
                  ? row.querySelector(configuredSelectors.grades.maxScore)?.textContent
                  : ''
              );
              const percentageText = normalize(
                configuredSelectors.grades?.percentage
                  ? row.querySelector(configuredSelectors.grades.percentage)?.textContent
                  : ''
              );
              const ratio = parseRatio(`${scoreText} / ${maxScoreText}`);
              const percentage = parsePercentage(percentageText);

              if (!title) {
                return null;
              }

              return {
                courseName: courseName || deriveCourseName(row, ''),
                title,
                score: ratio.score,
                maxScore: ratio.maxScore,
                percentage,
                sourceUrl: pageUrl
              };
            })
            .filter((item): item is GradeRecord => item !== null)
        : [];

      const fallbackRows = Array.from(document.querySelectorAll('table tr, [role="row"], li'));
      const fallbackAssignments = fallbackRows.map(scanRow).filter((item): item is RowRecord => item !== null);
      const fallbackGrades = fallbackRows.map(scanGrade).filter((item): item is GradeRecord => item !== null);
      const fallbackCourses = [...fallbackAssignments, ...fallbackGrades].map((item) => ({
        courseName: item.courseName,
        sourceUrl: pageUrl
      }));

      const dedupeAssignments = [...configuredAssignments, ...fallbackAssignments].filter(
        (item, index, array) =>
          array.findIndex(
            (candidate) =>
              candidate.courseName === item.courseName &&
              candidate.title === item.title &&
              candidate.dueDate === item.dueDate
          ) === index
      );

      const dedupeGrades = [...configuredGrades, ...fallbackGrades].filter(
        (item, index, array) =>
          array.findIndex(
            (candidate) =>
              candidate.courseName === item.courseName &&
              candidate.title === item.title &&
              candidate.score === item.score &&
              candidate.maxScore === item.maxScore
          ) === index
      );

      const configuredCourses = [
        ...configuredAssignments.map((item) => ({ courseName: item.courseName, sourceUrl: item.sourceUrl })),
        ...configuredGrades.map((item) => ({ courseName: item.courseName, sourceUrl: item.sourceUrl }))
      ];
      const dedupeCourses = [...configuredCourses, ...fallbackCourses].filter(
        (item, index, array) =>
          array.findIndex(
            (candidate) =>
              candidate.courseName === item.courseName && candidate.sourceUrl === item.sourceUrl
          ) === index
      );

      return {
        courses: dedupeCourses,
        assignments: dedupeAssignments,
        grades: dedupeGrades
      };
    },
    { configuredSelectors: configured, pageUrl }
  );
}

function stableKey(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => normalizeText(part).toLowerCase())
    .filter(Boolean)
    .join('|');
}

function stableId(parts: Array<string | null | undefined>) {
  return createHash('sha1').update(stableKey(parts)).digest('hex');
}

function toAssignments(rawAssignments: RawAssignment[], userId: string, syncRunId: string) {
  return rawAssignments.map((assignment) => {
    const now = new Date().toISOString();
    const id = stableId([userId, assignment.courseName, assignment.title, assignment.dueDate, assignment.sourceUrl]);

    return {
      id,
      courseId: stableId([userId, assignment.courseName]),
      courseName: safeText(assignment.courseName),
      title: safeText(assignment.title),
      dueDate: safeText(assignment.dueDate, 'TBD'),
      status: assignment.status,
      sourceUrl: assignment.sourceUrl,
      scrapedAt: now,
      syncRunId
    };
  });
}

function toGrades(rawGrades: RawGrade[], userId: string, syncRunId: string) {
  return rawGrades.map((grade) => {
    const now = new Date().toISOString();
    const id = stableId([userId, grade.courseName, grade.title, String(grade.score), String(grade.maxScore), grade.sourceUrl]);

    return {
      id,
      courseId: stableId([userId, grade.courseName]),
      courseName: safeText(grade.courseName),
      title: safeText(grade.title),
      score: grade.score,
      maxScore: grade.maxScore,
      percentage: grade.percentage,
      sourceUrl: grade.sourceUrl,
      scrapedAt: now,
      syncRunId
    };
  });
}

function toCourses(rawCourses: RawCourse[], userId: string, syncRunId: string) {
  return rawCourses.map((course) => {
    const now = new Date().toISOString();
    return {
      id: stableId([userId, course.courseName]),
      courseName: safeText(course.courseName),
      sourceUrl: course.sourceUrl,
      scrapedAt: now,
      syncRunId
    };
  });
}

export async function extractBlackboardData(page: Page) {
  const now = new Date().toISOString();
  const syncRunId = crypto.randomUUID();
  const { userId } = getScraperConfig();
  const pageTitle = await page.title();
  const sourceUrl = page.url();
  const { courses: rawCourses, assignments: rawAssignments, grades: rawGrades } =
    await extractRawBlackboardData(page);
  const courses = toCourses(rawCourses, userId, syncRunId);
  const assignments = toAssignments(rawAssignments, userId, syncRunId);
  const grades = toGrades(rawGrades, userId, syncRunId);
  const itemsScraped = courses.length + assignments.length + grades.length;

  return {
    userId,
    courses,
    assignments,
    grades,
    syncRun: {
      id: syncRunId,
      status: 'success' as const,
      startedAt: now,
      finishedAt: new Date().toISOString(),
      itemsScraped
    },
    page: {
      title: pageTitle,
      sourceUrl
    }
  };
}
