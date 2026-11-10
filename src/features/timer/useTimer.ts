import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TrayIcon } from "@tauri-apps/api/tray";
import { listen } from "@tauri-apps/api/event";
import { sendNotification } from "@tauri-apps/plugin-notification";
import { insertFocusSession } from "@/lib/db";
import type { FocusSession } from "@/lib/types";

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

function loadState(): { state: TimerState; overdue: Omit<FocusSession, "id"> | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: BASE_STATE, overdue: null };
    const { state, session } = settleOverdue({
      ...BASE_STATE,
      ...JSON.parse(raw),
    });
    return { state, overdue: session };
  } catch {
    return { state: BASE_STATE, overdue: null };
  }
}

/**
 * 应用不在时已经走完的段:只补结算这一段本身,然后回到闲置。
 * 不连锁重放 slept-through 的休息/下一炷(那是凭空造数据),
 * 也不播通知与落印——此刻人并不在现场。
 */
function settleOverdue(
  s: TimerState,
): { state: TimerState; session: Omit<FocusSession, "id"> | null } {
  const idle: TimerState = {
    ...s,
    phase: "idle",
    paused: false,
    plannedSeconds: s.focusMinutes * 60,
    startAt: null,
    pausedAccum: 0,
    pausedAt: null,
    sessionStartAt: null,
  };

  if (s.phase === "idle" || s.startAt == null || s.paused) {
    return { state: s, session: null };
  }

  // 段真实结束时刻:起点 + 计划时长 + 累计暂停
  const end = s.startAt + s.plannedSeconds * 1000 + s.pausedAccum;
  if (Date.now() < end) return { state: s, session: null };

  const session: Omit<FocusSession, "id"> =
    s.phase === "focus"
      ? {
          task_id: s.taskId,
          mode: "focus",
          started_at: new Date(s.sessionStartAt ?? s.startAt).toISOString(),
          ended_at: new Date(end).toISOString(),
          planned_seconds: s.plannedSeconds,
          actual_seconds: s.plannedSeconds,
          status: "completed",
        }
      : {
          task_id: null,
          mode: "break",
          started_at: new Date(s.startAt).toISOString(),
          ended_at: new Date(end).toISOString(),
          planned_seconds: s.plannedSeconds,
          actual_seconds: s.plannedSeconds,
          status: "completed",
        };

  return { state: idle, session };
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

/** 段结束写库:失败只丢这一笔记录,绝不影响计时状态推进 */
function persistSession(
  session: Omit<FocusSession, "id">,
  onPersisted?: () => void,
) {
  void insertFocusSession(session)
    .then(() => onPersisted?.())
    .catch(() => {
      /* 数据库不可用(如浏览器预览)时丢弃,状态机照常 */
    });
}

interface UseTimerOptions {
  /** 一个专注番茄入库后回调(如刷新任务累计) */
  onFocusComplete?: () => void;
}

export function useTimer({ onFocusComplete }: UseTimerOptions = {}) {
  const [restored] = useState(loadState);
  const [state, setState] = useState<TimerState>(restored.state);
  const [now, setNow] = useState(() => Date.now());
  const [celebrateKey, setCelebrateKey] = useState(0);
  /** 已结算过的段标识(相 + 起点),防止同一段被连续 tick 重复入库 */
  const completedRef = useRef<string | null>(null);

  // 关闭期间走完的那一段在这里补记一次;回调要等挂载后才能拿到最新的刷新函数
  const overdueRef = useRef(restored.overdue);
  useEffect(() => {
    const session = overdueRef.current;
    if (!session) return;
    overdueRef.current = null;
    persistSession(session, onFocusComplete);
  }, [onFocusComplete]);

  const running = state.phase !== "idle" && !state.paused;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const completeSegment = useCallback(
    (s: TimerState) => {
      const key = `${s.phase}@${s.startAt}`;
      if (completedRef.current === key) return;
      completedRef.current = key;
      const nowMs = Date.now();
      const payload: Omit<FocusSession, "id"> =
        s.phase === "focus"
          ? {
              task_id: s.taskId,
              mode: "focus",
              started_at: new Date(s.sessionStartAt ?? nowMs).toISOString(),
              ended_at: new Date(nowMs).toISOString(),
              planned_seconds: s.plannedSeconds,
              actual_seconds: s.plannedSeconds,
              status: "completed",
            }
          : {
              task_id: null,
              mode: "break",
              started_at: new Date(s.startAt ?? nowMs).toISOString(),
              ended_at: new Date(nowMs).toISOString(),
              planned_seconds: s.plannedSeconds,
              actual_seconds: s.plannedSeconds,
              status: "completed",
            };

      // 先推进状态,再异步入库:写库失败不影响换相,否则会卡在 00:00 反复重试
      if (s.phase === "focus") {
        notify("一炷功成", "宜小憩片刻");
        setCelebrateKey((k) => k + 1);
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

      persistSession(payload, s.phase === "focus" ? onFocusComplete : undefined);
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
        completeSegment(state);
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
      getCurrentWindow()
        .setTitle(title)
        .catch(() => {
          /* 浏览器预览时无窗口 API,静默降级 */
        });
    } catch {
      /* 同步抛错同样降级 */
    }
    try {
      TrayIcon.getById("main")
        .then((t) => t?.setTooltip(title))
        .catch(() => {
          /* 浏览器预览时无托盘,静默降级 */
        });
    } catch {
      /* 浏览器预览时无托盘,静默降级 */
    }
  }, [state, now]);

  // 托盘菜单:窗口藏着时也能暂停/继续、弃课
  const stateRef = useRef(state);
  stateRef.current = state;
  /** 事件回调里取最新的 actions,避免闭包拿到首帧的旧函数 */
  const actionsRef = useRef<{
    togglePause: () => void;
    skip: () => void;
  } | null>(null);
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let disposed = false;
    void Promise.all([
      listen("tray-toggle", () => {
        const s = stateRef.current;
        if (s.phase === "idle") return;
        actionsRef.current?.togglePause();
      }),
      listen("tray-skip", () => {
        if (stateRef.current.phase === "idle") return;
        actionsRef.current?.skip();
      }),
    ])
      .then(([offToggle, offSkip]) => {
        if (disposed) {
          offToggle();
          offSkip();
        } else {
          unlisten = () => {
            offToggle();
            offSkip();
          };
        }
      })
      .catch(() => {
        /* 浏览器预览时无事件通道,静默降级 */
      });
    return () => {
      disposed = true;
      unlisten?.();
    };
  }, []);

  const elapsedMs = elapsedOf(state, now);
  const remainingSeconds = Math.max(
    0,
    Math.ceil((state.plannedSeconds * 1000 - elapsedMs) / 1000),
  );
  const progress =
    state.phase === "idle"
      ? 0
      : Math.min(1, elapsedMs / (state.plannedSeconds * 1000));

  const actions = {
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
    /** 暂停与继续合一,供快捷键与托盘使用 */
    togglePause() {
      setState((s) => {
        if (s.phase === "idle") return s;
        if (s.paused) {
          if (s.pausedAt == null) return s;
          return {
            ...s,
            paused: false,
            pausedAccum: s.pausedAccum + (Date.now() - s.pausedAt),
            pausedAt: null,
          };
        }
        return { ...s, paused: true, pausedAt: Date.now() };
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
    skip() {
      const s = state;
      const n = Date.now();
      if (s.phase === "focus") {
        const elapsedSec = Math.round(elapsedOf(s, n) / 1000);
        if (elapsedSec >= 60) {
          persistSession(
            {
              task_id: s.taskId,
              mode: "focus",
              started_at: new Date(s.sessionStartAt ?? n).toISOString(),
              ended_at: new Date(n).toISOString(),
              planned_seconds: s.plannedSeconds,
              actual_seconds: elapsedSec,
              status: "abandoned",
            },
            onFocusComplete,
          );
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
  };

  actionsRef.current = actions;

  return {
    state,
    running,
    remainingSeconds,
    /** 已进行比例 0~1 */
    progress,
    celebrateKey,
    actions,
  };
}
