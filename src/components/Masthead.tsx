import { useMemo } from "react";
import solarLunar from "solarlunar-es";
import { cn } from "@/lib/utils";
import { greeting } from "@/lib/format";

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

/** 历书刊头:朱红横栏,干支农历与公历并置,铅字页签导航 */
export function Masthead({ view, onChange }: MastheadProps) {
  const now = useMemo(() => new Date(), []);
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
    <header className="z-20 flex h-[78px] shrink-0 items-center gap-5 bg-cinnabar px-7 shadow-[inset_0_-2px_0_var(--cinnabar-deep)]">
      <div className="text-primary-foreground">
        <div className="text-[26px] font-black leading-none tracking-[0.26em]">
          坐香历
        </div>
        <div className="mt-1.5 text-[10px] tracking-[0.42em] text-[#faf0d5]">
          逐日一页 · 朱批记课
        </div>
      </div>

      <div className="border-l border-[#f7ebcb66] pl-5 text-[12px] leading-[1.8] tracking-[0.08em] text-[#faf0d5]">
        <div className="text-[15px] font-bold tracking-[0.12em]">
          {lunar.gzYear}年 {lunar.monthCn}{lunar.dayCn}
        </div>
        <div>
          {now.getFullYear()}年{now.getMonth() + 1}月{now.getDate()}日 星期
          {WEEK[now.getDay()]} · {greeting()}
        </div>
      </div>

      <nav className="ml-auto flex items-center gap-2">
        {ITEMS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "border px-3.5 py-1.5 text-[13px] tracking-[0.22em] transition-colors",
              view === id
                ? "border-[#f7ebcb] bg-[#f7ebcb] font-bold text-cinnabar"
                : "border-[#f7ebcb73] text-[#f7ebcb] hover:border-[#f7ebcb]",
            )}
          >
            {label}
          </button>
        ))}
        <button
          disabled
          title="开发中"
          className="cursor-not-allowed border border-[#f7ebcb66] px-3.5 py-1.5 text-[13px] tracking-[0.22em] text-[#f7ebcb8c]"
        >
          {COMING}
        </button>
      </nav>
    </header>
  );
}
