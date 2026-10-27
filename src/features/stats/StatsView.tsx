import { useEffect, useState } from "react";
import { listDailyFocus, type DailyFocus } from "@/lib/db";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

const DAYS = 14;
const CN_WEEK = ["日", "一", "二", "三", "四", "五", "六"];

function localDay(offsetDays: number): { key: string; d: Date } {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return { key: `${d.getFullYear()}-${m}-${day}`, d };
}

/** 检历:近十四日排成同尺寸历页缩样,同基线逐日可比 */
export function StatsView() {
  const [rows, setRows] = useState<DailyFocus[] | null>(null);

  useEffect(() => {
    listDailyFocus(DAYS)
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  if (rows === null) return null;

  const byDay = new Map(rows.map((r) => [r.day, r]));
  const days = Array.from({ length: DAYS }, (_, i) => localDay(DAYS - 1 - i));
  const today = days[days.length - 1].key;
  const todayRow = byDay.get(today) ?? { day: today, seconds: 0, tomatoes: 0 };
  const weekSeconds = days
    .slice(-7)
    .reduce((s, { key }) => s + (byDay.get(key)?.seconds ?? 0), 0);
  const totalSeconds = rows.reduce((s, r) => s + r.seconds, 0);

  if (totalSeconds === 0) {
    return (
      <div className="animate-in-up mx-auto flex h-full w-full max-w-[560px] flex-col items-center justify-center gap-3">
        <div className="font-brush text-3xl text-[#6f6046]">白</div>
        <p className="text-xs tracking-[0.25em] text-muted-foreground">
          检历尚白 · 一炷之后再来看
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in-up mx-auto flex h-full w-full max-w-[680px] flex-col gap-7 overflow-y-auto px-8 py-8">
      <h1 className="text-xl font-black tracking-[0.35em]">检历</h1>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-[11px] tracking-[0.3em] text-muted-foreground">今日炷数</div>
          <div className="mt-2 text-3xl font-black tabular-nums">{todayRow.tomatoes}</div>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.3em] text-muted-foreground">今日专注</div>
          <div className="mt-2 text-3xl font-black tabular-nums">
            {formatDuration(todayRow.seconds)}
          </div>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.3em] text-muted-foreground">近七日</div>
          <div className="mt-2 text-3xl font-black tabular-nums">
            {formatDuration(weekSeconds)}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 text-[11px] tracking-[0.3em] text-muted-foreground">
          近十四日 · 历页缩样
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map(({ key, d }) => {
            const r = byDay.get(key);
            const isToday = key === today;
            return (
              <div
                key={key}
                title={`${key}:${r ? ` ${formatDuration(r.seconds)} · ${r.tomatoes} 炷` : " 无课"}`}
                className={cn(
                  "flex min-h-[96px] flex-col items-center gap-1 rounded-[3px] border px-1.5 py-2.5",
                  isToday
                    ? "border-[1.5px] border-cinnabar bg-paper-raise"
                    : r
                      ? "border-ink/25 bg-paper-raise"
                      : "border-dashed border-ink/20",
                )}
              >
                <span
                  className={cn(
                    "rounded-[2px] px-1.5 py-0.5 text-[10px] tracking-[0.04em]",
                    r || isToday
                      ? "bg-cinnabar text-primary-foreground"
                      : "bg-ink/10 text-muted-foreground",
                  )}
                >
                  {d.getMonth() + 1}/{d.getDate()}
                </span>
                {r ? (
                  <>
                    <span className="mt-1 text-[16px] font-black tabular-nums">
                      {r.tomatoes}
                      <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
                        炷
                      </span>
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {formatDuration(r.seconds)}
                    </span>
                  </>
                ) : (
                  <span className="mt-1 text-[11px] text-muted-foreground">无课</span>
                )}
                <span className="mt-auto pt-1 text-[9px] tracking-[0.15em] text-muted-foreground">
                  周{CN_WEEK[d.getDay()]}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-2.5 flex justify-between text-[11px] tracking-[0.15em] text-muted-foreground">
          <span>{days[0].d.getMonth() + 1}月{days[0].d.getDate()}日</span>
          <span>今日</span>
        </div>
      </div>
    </div>
  );
}
