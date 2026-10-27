import { cn } from "@/lib/utils";
import { cnNum } from "@/lib/format";
import {
  BREAK_MINUTES,
  FOCUS_CHOICES,
  formatClock,
  type useTimer,
} from "./useTimer";

interface TimerViewProps {
  timer: ReturnType<typeof useTimer>;
  tasks: { id: number; title: string }[];
  today: { tomatoes: number; seconds: number };
}

/** 一至十 */
const CN_TEN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

const YIJI = {
  idle: { yi: "起课", ji: "迁延" },
  focus: { yi: "专注", ji: "分心" },
  paused: { yi: "小歇", ji: "忘归" },
  break: { yi: "起身", ji: "恋战" },
} as const;

/** 逐字定宽的倒计时(宋体数字不等宽,以格锁定) */
function Clock({ text }: { text: string }) {
  return (
    <div className="flex items-baseline">
      {text.split("").map((c, i) => (
        <span
          key={i}
          className={cn(
            "inline-block text-center",
            c === ":" ? "w-[0.34em]" : "w-[0.6em]",
          )}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

/** 今日历页:巨大套印倒计时 + 宜忌 + 印章钮 */
export function TimerView({ timer, tasks, today }: TimerViewProps) {
  const { state, remainingSeconds, progress, actions } = timer;
  const idle = state.phase === "idle";
  const break_ = state.phase === "break";
  const paused = state.paused;

  const boundTask = tasks.find((t) => t.id === state.taskId);
  const yiji = break_ ? YIJI.break : paused ? YIJI.paused : idle ? YIJI.idle : YIJI.focus;

  const nth = today.tomatoes + 1;
  const phaseLabel = idle
    ? `起课 · ${boundTask?.title ?? "自在课"}`
    : break_
      ? `小憩 · ${cnNum(BREAK_MINUTES)}分钟`
      : `专注 · ${boundTask?.title ?? "自在课"} · 第${cnNum(nth)}炷`;

  const burningPct = Math.min(10, Math.max(1, Math.ceil(progress * 10)));
  const statusText = idle
    ? `时长${cnNum(state.focusMinutes)}分钟 · 按「坐」起课`
    : break_
      ? paused
        ? "小憩暂停 · 按「续」续憩"
        : `宜起身行走 · 已过${CN_TEN[burningPct - 1]}成`
      : paused
        ? "朱批暂歇 · 按「续」续课"
        : `时长${cnNum(state.focusMinutes)}分钟 · 已燃${CN_TEN[burningPct - 1]}成`;

  const ghost = idle
    ? "3px 3px 0 rgba(194,58,43,.18)"
    : break_
      ? "3px 3px 0 rgba(49,96,107,.4)"
      : "3px 3px 0 rgba(194,58,43,.38)";

  const accent = break_ ? "var(--azurite)" : "var(--cinnabar)";
  const sealLabel = idle ? "坐" : paused ? "续" : "止";

  return (
    <div className="animate-in-up flex h-full">
      <div className="flex min-w-0 flex-1 flex-col pl-14 pr-2 pt-7">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "text-[14px] font-bold tracking-[0.28em]",
              break_ ? "text-azurite" : "text-cinnabar-deep",
            )}
          >
            {phaseLabel}
          </span>
          {paused && (
            <span className="animate-zhu-flash border border-cinnabar px-1.5 py-px text-[11px] font-bold tracking-[0.2em] text-cinnabar-deep">
              歇
            </span>
          )}
        </div>

        <div
          className="mt-2.5 select-none text-[118px] font-black leading-none text-foreground"
          style={{ textShadow: ghost }}
        >
          <Clock text={formatClock(remainingSeconds)} />
        </div>

        <div className="mt-4 flex items-center gap-10">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "px-2 py-0.5 text-[19px] font-black tracking-[0.1em] text-primary-foreground",
                break_ ? "bg-azurite" : "bg-cinnabar",
              )}
            >
              宜
            </span>
            <span className="text-[22px] font-black tracking-[0.28em]">
              {yiji.yi}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="bg-ink px-2 py-0.5 text-[19px] font-black tracking-[0.1em] text-primary-foreground">
              忌
            </span>
            <span className="text-[22px] font-black tracking-[0.28em]">
              {yiji.ji}
            </span>
          </div>
          {!idle && !paused && (
            <div
              className={cn(
                "text-[19px] font-black tracking-[0.22em]",
                break_ ? "text-azurite" : "text-cinnabar-deep",
              )}
            >
              已{break_ ? "过" : "燃"}
              {CN_TEN[burningPct - 1]}成
            </div>
          )}
        </div>

        <div className="mt-3.5 text-[13px] tracking-[0.22em] text-muted-foreground">
          {statusText}
        </div>

        {idle && (
          <div className="mt-4 flex gap-2.5">
            {FOCUS_CHOICES.map((m) => (
              <button
                key={m}
                onClick={() => actions.setFocusMinutes(m)}
                className={cn(
                  "border px-3 py-1.5 text-[13px] tracking-[0.15em] transition-colors",
                  state.focusMinutes === m
                    ? "border-cinnabar bg-cinnabar font-bold text-primary-foreground"
                    : "border-ink/40 text-muted-foreground hover:border-cinnabar/70 hover:text-foreground",
                )}
              >
                {m} 分
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-8 pb-5">
          {!idle && (
            <button
              onClick={actions.reset}
              className="text-[13px] tracking-[0.3em] text-muted-foreground transition-colors hover:text-cinnabar-deep"
            >
              弃课
            </button>
          )}
          <button
            onClick={() => {
              if (idle) actions.start(state.taskId);
              else if (paused) actions.resume();
              else actions.pause();
            }}
            className="flex h-[74px] w-[74px] -rotate-2 items-center justify-center rounded-[5px] font-brush text-[34px] font-bold text-primary-foreground transition-transform duration-150 hover:scale-105 active:scale-95"
            style={{
              background: accent,
              boxShadow:
                "inset 0 0 0 2.5px rgba(247,235,203,.55), 0 2px 6px rgba(34,28,21,.3)",
            }}
          >
            {sealLabel}
          </button>
          {!idle && (
            <button
              onClick={() => void actions.skip()}
              className="text-[13px] tracking-[0.3em] text-muted-foreground transition-colors hover:text-cinnabar-deep"
            >
              截课
            </button>
          )}
        </div>
      </div>

      <aside className="w-[264px] shrink-0 pr-8 pt-10">
        <h2
          className={cn(
            "border-b-2 border-ink pb-2 text-[16px] font-black tracking-[0.38em]",
            break_ ? "text-azurite" : "text-cinnabar-deep",
          )}
        >
          今日宜{tasks.length > 0 && ` · ${tasks.length} 事`}
        </h2>
        {tasks.length === 0 ? (
          <p className="mt-4 text-[12px] leading-[2] tracking-[0.08em] text-muted-foreground">
            今日尚无日课
            <br />
            可径自起课
          </p>
        ) : (
          <ul className="mt-0.5">
            {tasks.slice(0, 3).map((t) => {
              const active = t.id === state.taskId;
              return (
                <li
                  key={t.id}
                  onClick={() => idle && actions.setTaskId(active ? null : t.id)}
                  title={idle ? "点选以绑定此课" : t.title}
                  className={cn(
                    "flex items-center gap-2.5 border-b border-ink/15 py-3.5 text-[15px] tracking-[0.04em]",
                    idle && "cursor-pointer",
                    active ? "font-bold text-foreground" : "text-muted-foreground",
                    idle && !active && "hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-[9px] w-[9px] shrink-0 rounded-full border-2",
                      break_ ? "border-azurite" : "border-cinnabar",
                      active && (break_ ? "bg-azurite" : "bg-cinnabar"),
                    )}
                  />
                  <span className="truncate">{t.title}</span>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>
  );
}
