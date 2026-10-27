import { useCallback, useEffect, useState } from "react";
import { createTask, deleteTask, listTasks, setTaskDone, updateTaskTitle } from "@/lib/db";
import type { Task } from "@/lib/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setTasks(await listTasks());
    } catch {
      /* 数据库不可用(如浏览器预览)时保持空列表 */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (title: string) => {
      const t = title.trim();
      if (!t) return;
      try {
        await createTask(t);
        await refresh();
      } catch {
        /* 浏览器预览降级 */
      }
    },
    [refresh],
  );

  const toggle = useCallback(
    async (task: Task) => {
      try {
        await setTaskDone(task.id, task.status !== "done");
        await refresh();
      } catch {
        /* 浏览器预览降级 */
      }
    },
    [refresh],
  );

  const rename = useCallback(
    async (id: number, title: string) => {
      try {
        await updateTaskTitle(id, title);
        await refresh();
      } catch {
        /* 浏览器预览降级 */
      }
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: number) => {
      try {
        await deleteTask(id);
        await refresh();
      } catch {
        /* 浏览器预览降级 */
      }
    },
    [refresh],
  );

  return { tasks, loading, refresh, add, toggle, rename, remove };
}
