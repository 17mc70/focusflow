import { formatDuration } from "@/lib/format";

interface FooterBarProps {
  today: { tomatoes: number; seconds: number };
  /** 每次功成 +1,驱动最新一笔朱批重画;0 表示本会话尚未有功成,不播动画 */
  celebrateKey: number;
}

/** 「正」的五笔笔顺坐标(34×34 视窗) */
const ZHENG_STROKES = [
  "M5 7 H29", // 一 横
  "M9 7 V27", // 丨 竖
  "M9 17 H25", // 一 中横
  "M21 17 V27", // 丨 中竖
  "M5 27 H29", // 一 底横
];

/** 乌墨页脚:今日课数 + 朱批正字(五笔一正) + 功成朱印 */
export function FooterBar({ today, celebrateKey }: FooterBarProps) {
  const n = today.tomatoes;
  const fulls = Math.floor(n / 5);
  const rem = n % 5;
  // 最新一笔落在哪一组、哪一笔(无新笔时为 -1)
  const lastGroup = n > 0 ? Math.floor((n - 1) / 5) : -1;
  const lastStroke = n > 0 ? (n - 1) % 5 : -1;
  const groups = fulls + (rem > 0 ? 1 : 0);

  return (
    <footer className="flex h-[66px] shrink-0 items-center gap-4 bg-ink-bar px-7 text-[#e6d5b0]">
      <div className="text-[13px] tracking-[0.05em]">
        今日已课{" "}
        <b className="text-[17px] font-bold text-primary-foreground">{n}</b> 炷
        · 计{" "}
        <b className="text-[17px] font-bold text-primary-foreground">
          {formatDuration(today.seconds)}
        </b>
      </div>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: groups }, (_, g) => (
          <svg key={g} width="30" height="30" viewBox="0 0 34 34" className="shrink-0">
            {ZHENG_STROKES.slice(0, g === groups - 1 && rem > 0 ? rem : 5).map(
              (d, i) => {
                const isNewest =
                  celebrateKey > 0 && g === lastGroup && i === lastStroke;
                return (
                  <path
                    key={isNewest ? `${g}-${i}-${celebrateKey}` : `${g}-${i}`}
                    d={d}
                    stroke="#d05540"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="48"
                    className={isNewest ? "animate-zhu-draw" : undefined}
                  />
                );
              },
            )}
          </svg>
        ))}
        {n === 0 ? (
          <span className="text-[12px] tracking-[0.2em] text-[#cbb98f]">
            尚未落笔
          </span>
        ) : (
          <span className="ml-1 text-[11px] tracking-[0.2em] text-[#e6d5b099]">
            五笔一正
          </span>
        )}
      </div>

      {n > 0 && (
        <div
          key={celebrateKey > 0 ? `stamp-${n}` : "stamp-static"}
          className={
            celebrateKey > 0
              ? "ml-auto flex h-[46px] w-[46px] animate-stamp-in items-center justify-center border-[2.5px] border-[#d05540] font-brush text-[17px] font-bold tracking-[0.1em] text-[#e0563f]"
              : "ml-auto flex h-[46px] w-[46px] items-center justify-center border-[2.5px] border-[#d05540] font-brush text-[17px] font-bold tracking-[0.1em] text-[#e0563f]"
          }
          style={{ transform: "rotate(3deg)" }}
          title={`今日功成 ${n} 炷`}
        >
          功成
        </div>
      )}
    </footer>
  );
}
