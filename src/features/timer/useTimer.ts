import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TrayIcon } from "@tauri-apps/api/tray";
import { sendNotification } from "@tauri-apps/plugin-notification";
import { insertFocusSession } from "@/lib/db";

export type Phase = "idle" | "focus" | "break";

export const BREAK_MINUTES = 5;
export const FOCUS_CHOICES = [15, 25, 45] as const;

export interface TimerState {
  phase: Phase;
  paused: boolean;
  focusMinutes: number;
  /** 当前段总时长(秒) */
  plannedSeconds: number;
  /** 当前段开始时间戳(ms),计时基于它推算,切后台/重启不走时 */
  startAt: number | null;
  pausedAccum: number;
  pausedAt: number | null;
  /** 专注段会话开始时间戳,写库用 */
  sessionStartAt: number | null;
  taskId: number | null;
}

const STORAGE_KEY = "ff-timer-state";

const BASE_STATE: TimerState = {
  phase: "idle",
  paused: false,
  focusMinutes: 25,
  plannedSeconds: 25 * 60,
  startAt: null,
  pausedAccum: 0,
  pausedAt: null,
  sessionStartAt: null,
  taskId: null,
};

function loadState(): TimerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return BASE_STATE;
    return { ...BASE_STATE, ...JSON.parse(raw) };
  } catch {
    return BASE_STATE;
  }
}

function elapsedOf(s: TimerState, now: number): number {
  if (s.startAt == null) return 0;
  const end = s.pausedAt ?? now;
  return Math.max(0, end - s.startAt - s.pausedAccum);
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function notify(title: string, body: string) {
  try {
    sendNotification({ title, body });
  } catch {
    /* 浏览器预览时无通知能力,静默降级 */
  }
}

interface UseTimerOptions {
  /** 一个专注番茄入库后回调(如刷新任务累计) */
  onFocusComplete?: () => void;
}

export function useTimer({ onFocusComplete }: UseTimerOptions = {}) {
  const [state, setState] = useState<TimerState>(loadState);
  const [now, setNow] = useState(() => Date.now());
  const [celebrateKey, setCelebrateKey] = useState(0);
  const completingRef = useRef(false);

  const running = state.phase !== "idle" && !state.paused;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const completeSegment = useCallback(
    async (s: TimerState) => {
      if (completingRef.current) return;
      completingRef.current = true;
      const nowMs = Date.now();
      try {
        if (s.phase === "focus") {
          await insertFocusSession({
            task_id: s.taskId,
            mode: "focus",
            started_at: new Date(s.sessionStartAt ?? nowMs).toISOString(),
            ended_at: new Date(nowMs).toISOString(),
            planned_seconds: s.plannedSeconds,
            actual_seconds: s.plannedSeconds,
            status: "completed",
          });
          notify("一炷功成", "宜小憩片刻");
          setCelebrateKey((k) => k + 1);
          onFocusComplete?.();
          setState({
            ...s,
            phase: "break",
            paused: false,
            plannedSeconds: BREAK_MINUTES * 60,
            startAt: nowMs,
            pausedAccum: 0,
            pausedAt: null,
            sessionStartAt: null,
          });
        } else if (s.phase === "break") {
          await insertFocusSession({
            task_id: null,
            mode: "break",
            started_at: new Date(s.startAt ?? nowMs).toISOString(),
            ended_at: new Date(nowMs).toISOString(),
            planned_seconds: s.plannedSeconds,
            actual_seconds: s.plannedSeconds,
            status: "completed",
          });
          notify("小憩毕", "宜再课一炷");
          setState({
            ...s,
            phase: "idle",
            paused: false,
            plannedSeconds: s.focusMinutes * 60,
            startAt: null,
            pausedAccum: 0,
            pausedAt: null,
            sessionStartAt: null,
          });
        }
      } catch {
        /* 数据库不可用(如浏览器预览)时跳过入库,状态机照常推进 */
      } finally {
        completingRef.current = false;
      }
    },
    [onFocusComplete],
  );

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (
        state.startAt != null &&
        elapsedOf(state, n) >= state.plannedSeconds * 1000
      ) {
        void completeSegment(state);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, state, completeSegment]);

  // 窗口标题与托盘提示实时显示剩余时间,最小化后也能一眼看到
  const lastTitleRef = useRef("");
  useEffect(() => {
    let title = "坐香";
    if (state.phase !== "idle") {
      const remaining = Math.ceil(
        (state.plannedSeconds * 1000 - elapsedOf(state, now)) / 1000,
      );
      const label = state.phase === "break" ? "小憩" : "专注";
      title = `${formatClock(remaining)} · ${label} · 坐香`;
    }
    if (title === lastTitleRef.current) return;
    lastTitleRef.current = title;
    try {
      void getCurrentWindow().setTitle(title);
    } catch {
      /* 浏览器预览时无窗口 API,静默降级 */
    }
    try {
      void TrayIcon.getById("main").then((t) => t?.setTooltip(title));
    } catch {
      /* 浏览器预览时无托盘,静默降级 */
    }
  }, [state, now]);

  const elapsedMs = elapsedOf(state, now);
  const remainingSeconds = Math.max(
    0,
    Math.ceil((state.plannedSeconds * 1000 - elapsedMs) / 1000),
  );
  const progress =
    state.phase === "idle"
      ? 0
      : Math.min(1, elapsedMs / (state.plannedSeconds * 1000));

  return {
    state,
    running,
    remainingSeconds,
    /** 已进行比例 0~1 */
    progress,
    celebrateKey,
    actions: {
      start(taskId: number | null) {
        const n = Date.now();
        setState((s) => ({
          ...s,
          phase: "focus",
          paused: false,
          plannedSeconds: s.focusMinutes * 60,
          startAt: n,
          pausedAccum: 0,
          pausedAt: null,
          sessionStartAt: n,
          taskId,
        }));
      },
      pause() {
        setState((s) =>
          !s.paused && s.phase !== "idle"
            ? { ...s, paused: true, pausedAt: Date.now() }
            : s,
        );
      },
      resume() {
        setState((s) => {
          if (!s.paused || s.pausedAt == null) return s;
          return {
            ...s,
            paused: false,
            pausedAccum: s.pausedAccum + (Date.now() - s.pausedAt),
            pausedAt: null,
          };
        });
      },
      reset() {
        setState((s) => ({
          ...s,
          phase: "idle",
          paused: false,
          plannedSeconds: s.focusMinutes * 60,
          startAt: null,
          pausedAccum: 0,
          pausedAt: null,
          sessionStartAt: null,
        }));
      },
      async skip() {
        const s = state;
        const n = Date.now();
        if (s.phase === "focus") {
          const elapsedSec = Math.round(elapsedOf(s, n) / 1000);
          if (elapsedSec >= 60) {
            try {
              await insertFocusSession({
                task_id: s.taskId,
                mode: "focus",
                started_at: new Date(s.sessionStartAt ?? n).toISOString(),
                ended_at: new Date(n).toISOString(),
                planned_seconds: s.plannedSeconds,
                actual_seconds: elapsedSec,
                status: "abandoned",
              });
              onFocusComplete?.();
            } catch {
              /* 浏览器预览降级 */
            }
          }
          notify("已截课", "此课未竟 · 先歇一歇");
          setState({
            ...s,
            phase: "break",
            paused: false,
            plannedSeconds: BREAK_MINUTES * 60,
            startAt: n,
            pausedAccum: 0,
            pausedAt: null,
            sessionStartAt: null,
          });
        } else if (s.phase === "break") {
          setState({
            ...s,
            phase: "idle",
            paused: false,
            plannedSeconds: s.focusMinutes * 60,
            startAt: null,
            pausedAccum: 0,
            pausedAt: null,
            sessionStartAt: null,
          });
        }
      },
      setFocusMinutes(minutes: number) {
        setState((s) =>
          s.phase === "idle"
            ? { ...s, focusMinutes: minutes, plannedSeconds: minutes * 60 }
            : s,
        );
      },
      setTaskId(taskId: number | null) {
        setState((s) => (s.phase === "idle" ? { ...s, taskId } : s));
      },
    },
  };
}
