import { useCallback, useEffect, useState } from "react";
import { Masthead, type ViewId } from "@/components/Masthead";
import { FooterBar } from "@/components/FooterBar";
import { TimerView } from "@/features/timer/TimerView";
import { useTimer } from "@/features/timer/useTimer";
import { TasksView } from "@/features/tasks/TasksView";
import { useTasks } from "@/features/tasks/useTasks";
import { StatsView } from "@/features/stats/StatsView";
import { listDailyFocus } from "@/lib/db";

export default function App() {
  const [view, setView] = useState<ViewId>("timer");
  const { tasks, refresh, add, toggle, rename, remove } = useTasks();
  const [today, setToday] = useState<{ tomatoes: number; seconds: number }>({
    tomatoes: 0,
    seconds: 0,
  });

  const refreshToday = useCallback(() => {
    listDailyFocus(1)
      .then((rows) => {
        const t = rows[rows.length - 1];
        setToday(t ?? { tomatoes: 0, seconds: 0 });
      })
      .catch(() => setToday({ tomatoes: 0, seconds: 0 }));
  }, []);

  const timer = useTimer({
    onFocusComplete: () => {
      refresh();
      refreshToday();
    },
  });

  useEffect(() => {
    refreshToday();
  }, [refreshToday, timer.state.phase]);

  const todoTasks = tasks.filter((t) => t.status === "todo");

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Masthead view={view} onChange={setView} />
      <main className="relative flex-1 overflow-hidden">
        {view === "timer" ? (
          <TimerView timer={timer} tasks={todoTasks} today={today} />
        ) : view === "tasks" ? (
          <TasksView
            tasks={tasks}
            onAdd={add}
            onToggle={toggle}
            onRename={rename}
            onRemove={remove}
          />
        ) : (
          <StatsView />
        )}
      </main>
      <FooterBar today={today} celebrateKey={timer.celebrateKey} />
    </div>
  );
}
