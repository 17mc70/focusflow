import { useCallback, useEffect, useRef, useState } from "react";
import { Masthead, type ViewId } from "@/components/Masthead";
import { FooterBar } from "@/components/FooterBar";
import { TimerView } from "@/features/timer/TimerView";
import { useTimer } from "@/features/timer/useTimer";
import { TasksView } from "@/features/tasks/TasksView";
import { useTasks } from "@/features/tasks/useTasks";
import { StatsView } from "@/features/stats/StatsView";
import { listDailyFocus } from "@/lib/db";
import { useTheme } from "@/lib/useTheme";
import { useToday } from "@/lib/useToday";

export default function App() {
  const [view, setView] = useState<ViewId>("timer");
  const { tasks, refresh, add, toggle, rename, remove } = useTasks();
  const { theme, setTheme } = useTheme();
  const day = useToday();
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
  }, [refreshToday, timer.state.phase, day]);

  // 空格:起课 / 暂停 / 续课。输入框与可编辑区内不抢键
  const timerRef = useRef(timer);
  timerRef.current = timer;
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const el = e.target as HTMLElement | null;
      if (
        el?.isContentEditable ||
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA" ||
        el?.tagName === "SELECT"
      ) {
        return;
      }
      e.preventDefault();
      const { state, actions } = timerRef.current;
      if (state.phase === "idle") actions.start(state.taskId);
      else actions.togglePause();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
      <FooterBar
        today={today}
        celebrateKey={timer.celebrateKey}
        theme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
}
