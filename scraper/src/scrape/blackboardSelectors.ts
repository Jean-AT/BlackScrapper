type BlackboardSelectors = {
  assignmentRowSelector: string | null;
  assignmentTitleSelector: string | null;
  assignmentCourseSelector: string | null;
  assignmentDueDateSelector: string | null;
  assignmentStatusSelector: string | null;
  gradeRowSelector: string | null;
  gradeTitleSelector: string | null;
  gradeCourseSelector: string | null;
  gradeScoreSelector: string | null;
  gradeMaxScoreSelector: string | null;
  gradePercentageSelector: string | null;
};

function readEnv(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : null;
}

export function getBlackboardSelectors(): BlackboardSelectors {
  return {
    assignmentRowSelector: readEnv('BLACKBOARD_ASSIGNMENT_ROW_SELECTOR'),
    assignmentTitleSelector: readEnv('BLACKBOARD_ASSIGNMENT_TITLE_SELECTOR'),
    assignmentCourseSelector: readEnv('BLACKBOARD_ASSIGNMENT_COURSE_SELECTOR'),
    assignmentDueDateSelector: readEnv('BLACKBOARD_ASSIGNMENT_DUE_DATE_SELECTOR'),
    assignmentStatusSelector: readEnv('BLACKBOARD_ASSIGNMENT_STATUS_SELECTOR'),
    gradeRowSelector: readEnv('BLACKBOARD_GRADE_ROW_SELECTOR'),
    gradeTitleSelector: readEnv('BLACKBOARD_GRADE_TITLE_SELECTOR'),
    gradeCourseSelector: readEnv('BLACKBOARD_GRADE_COURSE_SELECTOR'),
    gradeScoreSelector: readEnv('BLACKBOARD_GRADE_SCORE_SELECTOR'),
    gradeMaxScoreSelector: readEnv('BLACKBOARD_GRADE_MAX_SCORE_SELECTOR'),
    gradePercentageSelector: readEnv('BLACKBOARD_GRADE_PERCENTAGE_SELECTOR')
  };
}
