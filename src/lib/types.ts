export type TaskStatus = "todo" | "done";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  created_at: string;
  completed_at: string | null;
  /** 已完成的专注累计秒数(查询时聚合) */
  focus_seconds: number;
}

export type SessionMode = "focus" | "break";
export type SessionStatus = "completed" | "abandoned";

export interface FocusSession {
  id: number;
  task_id: number | null;
  mode: SessionMode;
  started_at: string;
  ended_at: string;
  planned_seconds: number;
  actual_seconds: number;
  status: SessionStatus;
}
