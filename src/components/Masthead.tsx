import { useMemo } from "react";
import solarLunar from "solarlunar-es";
import { cn } from "@/lib/utils";
import { greeting } from "@/lib/format";
import { useToday } from "@/lib/useToday";

export type ViewId = "timer" | "tasks" | "stats";

interface MastheadProps {
  view: ViewId;
  onChange: (view: ViewId) => void;
}

const ITEMS: { id: ViewId; label: string }[] = [
  { id: "timer", label: "今日" },
  { id: "tasks", label: "日课" },
  { id: "stats", label: "检历" },
];

const COMING = "手账";

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];

/** 刊头:纸底朱丝栏,朱红只作一线与选中一竖 */
export function Masthead({ view, onChange }: MastheadProps) {
  const now = useToday();
  const lunar = useMemo(
    () =>
      // 重载含时间戳入参(返回 number),年月日入参必返回历法对象,此处收窄
      solarLunar.solar2lunar(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
      ) as { gzYear: string; monthCn: string; dayCn: string },
    [now],
  );

  return (
    <header
      className="relative z-20 flex h-[78px] shrink-0 items-center gap-5 bg-masthead px-7"
      style={{ borderBottom: "1.5px solid var(--masthead-rule)" }}
    >
      <div className="text-masthead-fg">
        <div className="text-[26px] font-black leading-none tracking-[0.26em]">
          坐香历
        </div>
        <div
          className="mt-1.5 text-[10px] tracking-[0.42em]"
          style={{ color: "var(--masthead-sub)" }}
        >
          逐日一页 · 朱批记课
        </div>
      </div>

      <div
        className="pl-5 text-[12px] leading-[1.8] tracking-[0.08em]"
        style={{
          borderLeft: "1px solid var(--masthead-hair)",
          color: "var(--masthead-sub)",
        }}
      >
        <div className="text-[15px] font-bold tracking-[0.12em]">
          {lunar.gzYear}年 {lunar.monthCn}{lunar.dayCn}
        </div>
        <div>
          {now.getFullYear()}年{now.getMonth() + 1}月{now.getDate()}日 星期
          {WEEK[now.getDay()]} · {greeting()}
        </div>
      </div>

      <nav className="ml-auto flex items-center gap-7">
        {ITEMS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "relative pb-1 text-[13px] tracking-[0.28em] transition-colors",
              view === id
                ? "font-bold text-cinnabar"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {view === id && (
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-0.5 h-px bg-cinnabar"
              />
            )}
          </button>
        ))}
        <button
          disabled
          title="开发中"
          className="cursor-not-allowed text-[13px] tracking-[0.28em] text-muted-foreground/45"
        >
          {COMING}
        </button>
      </nav>
    </header>
  );
}
