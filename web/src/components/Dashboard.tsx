import type { DashboardData } from '@/types/dashboard';

type Props = {
  data: DashboardData;
};

export function Dashboard({ data }: Props) {
  return (
    <section className="dashboard-grid">
      <article className="panel">
        <h2>Pending assignments</h2>
        <ul className="item-list">
          {data.assignments.map((assignment) => (
            <li key={assignment.id} className="item-card">
              <div>
                <strong>{assignment.title}</strong>
                <p>{assignment.courseName}</p>
              </div>
              <span>{assignment.dueDate}</span>
            </li>
          ))}
        </ul>
      </article>

      <article className="panel">
        <h2>Grades</h2>
        <ul className="item-list">
          {data.grades.map((grade) => (
            <li key={grade.id} className="item-card">
              <div>
                <strong>{grade.title}</strong>
                <p>{grade.courseName}</p>
              </div>
              <span>
                {grade.score}/{grade.maxScore}
              </span>
            </li>
          ))}
        </ul>
      </article>

      <article className="panel panel-highlight">
        <h2>Latest sync</h2>
        <dl className="status-grid">
          <div>
            <dt>Status</dt>
            <dd>{data.sync.status}</dd>
          </div>
          <div>
            <dt>Items scraped</dt>
            <dd>{data.sync.itemsScraped}</dd>
          </div>
          <div>
            <dt>Started</dt>
            <dd>{data.sync.startedAt}</dd>
          </div>
          <div>
            <dt>Finished</dt>
            <dd>{data.sync.finishedAt}</dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
