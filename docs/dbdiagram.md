# Database diagram

## Collections

### users
Represents the user of the system.

Fields:
- `id`
- `displayName`
- `email`
- `createdAt`
- `lastSyncAt`

### courses
Courses detected from Blackboard.

Fields:
- `id`
- `userId`
- `code`
- `name`
- `term`
- `sourceUrl`
- `createdAt`

### assignments
Pending items and course activities.

Fields:
- `id`
- `userId`
- `courseId`
- `title`
- `description`
- `dueDate`
- `status`
- `sourceUrl`
- `scrapedAt`
- `syncRunId`

### grades
Grades obtained from Blackboard.

Fields:
- `id`
- `userId`
- `courseId`
- `assignmentId`
- `title`
- `score`
- `maxScore`
- `percentage`
- `gradedAt`
- `sourceUrl`
- `scrapedAt`
- `syncRunId`

### sync_runs
History of each local sync run.

Fields:
- `id`
- `userId`
- `startedAt`
- `finishedAt`
- `status`
- `itemsScraped`
- `assignmentsStored`
- `gradesStored`
- `errorMessage`

## Relationships
```text
users 1 --- n courses
users 1 --- n assignments
users 1 --- n grades
users 1 --- n sync_runs
courses 1 --- n assignments
courses 1 --- n grades
assignments 1 --- n grades
sync_runs 1 --- n assignments
sync_runs 1 --- n grades
```

## Notes
- Firestore does not support real joins, so the structure should optimize reads from the frontend.
- Documents should duplicate useful fields to avoid expensive queries.
- Sync history is used for debugging and lightweight auditing.
