import Database from "@tauri-apps/plugin-sql";
import type { FocusSession, Task } from "./types";

/**
 * 数据访问层:只依赖 Tauri SQL 插件,不依赖任何 UI,
 * 业务逻辑保持纯 TS,便于将来安卓端复用。
 */

let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:app.db");
  }
  return db;
}

export async function listTasks(): Promise<Task[]> {
  const d = await getDb();
  const rows = await d.select<
    {
      id: number;
      title: string;
      status: Task["status"];
      created_at: string;
      completed_at: string | null;
      focus_seconds: number;
    }[]
  >(
    `SELECT t.id, t.title, t.status, t.created_at, t.completed_at,
            CAST(COALESCE(SUM(CASE WHEN fs.mode = 'focus' AND fs.status = 'completed'
                             THEN fs.actual_seconds ELSE 0 END), 0) AS INTEGER) AS focus_seconds
     FROM tasks t
     LEFT JOIN focus_sessions fs ON fs.task_id = t.id
     GROUP BY t.id
     ORDER BY CASE t.status WHEN 'todo' THEN 0 ELSE 1 END, t.created_at DESC`,
  );
  return rows;
}

export async function createTask(title: string): Promise<void> {
  const d = await getDb();
  await d.execute(
    "INSERT INTO tasks (title, status, created_at) VALUES ($1, 'todo', $2)",
    [title.trim(), new Date().toISOString()],
  );
}

export async function setTaskDone(id: number, done: boolean): Promise<void> {
  const d = await getDb();
  await d.execute(
    "UPDATE tasks SET status = $1, completed_at = $2 WHERE id = $3",
    [done ? "done" : "todo", done ? new Date().toISOString() : null, id],
  );
}

export async function updateTaskTitle(id: number, title: string): Promise<void> {
  const t = title.trim();
  if (!t) return;
  const d = await getDb();
  await d.execute("UPDATE tasks SET title = $1 WHERE id = $2", [t, id]);
}

export async function deleteTask(id: number): Promise<void> {
  const d = await getDb();
  // SQLite 外键约束默认未启用,先手动断开会话引用,避免悬空 task_id 污染统计
  await d.execute("UPDATE focus_sessions SET task_id = NULL WHERE task_id = $1", [id]);
  await d.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

export interface DailyFocus {
  /** 本地日期,YYYY-MM-DD */
  day: string;
  seconds: number;
  tomatoes: number;
}

/** 最近 days 天(含今天)每日完成专注聚合,按本地时区切天 */
export async function listDailyFocus(days: number): Promise<DailyFocus[]> {
  const d = await getDb();
  return d.select<DailyFocus[]>(
    `SELECT date(started_at, 'localtime') AS day,
            CAST(SUM(actual_seconds) AS INTEGER) AS seconds,
            COUNT(*) AS tomatoes
     FROM focus_sessions
     WHERE mode = 'focus' AND status = 'completed'
       AND date(started_at, 'localtime') >= date('now', 'localtime', $1)
     GROUP BY day
     ORDER BY day`,
    [`-${days - 1} days`],
  );
}

export async function insertFocusSession(
  session: Omit<FocusSession, "id">,
): Promise<void> {
  const d = await getDb();
  await d.execute(
    `INSERT INTO focus_sessions
       (task_id, mode, started_at, ended_at, planned_seconds, actual_seconds, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      session.task_id,
      session.mode,
      session.started_at,
      session.ended_at,
      session.planned_seconds,
      session.actual_seconds,
      session.status,
    ],
  );
}
