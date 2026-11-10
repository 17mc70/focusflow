import { formatDuration } from "@/lib/format";
import { THEMES, type ThemeId } from "@/lib/useTheme";

interface FooterBarProps {
  today: { tomatoes: number; seconds: number };
  /** 每次功成 +1,驱动最新一笔朱批重画;0 表示本会话尚未有功成,不播动画 */
  celebrateKey: number;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
}

/** 「正」的五笔笔顺坐标(34×34 视窗) */
const ZHENG_STROKES = [
  "M5 7 H29", // 一 横
  "M9 7 V27", // 丨 竖
  "M9 17 H25", // 一 中横
  "M21 17 V27", // 丨 中竖
  "M5 27 H29", // 一 底横
];

/** 页脚:浅纸底,朱笔正字记功,只留一线分隔 */
export function FooterBar({ today, celebrateKey, theme, onThemeChange }: FooterBarProps) {
  const n = today.tomatoes;
  const fulls = Math.floor(n / 5);
  const rem = n % 5;
  // 最新一笔落在哪一组、哪一笔(无新笔时为 -1)
  const lastGroup = n > 0 ? Math.floor((n - 1) / 5) : -1;
  const lastStroke = n > 0 ? (n - 1) % 5 : -1;
  const groups = fulls + (rem > 0 ? 1 : 0);

  return (
    <footer
      className="flex h-[66px] shrink-0 items-center gap-4 bg-footer px-7 text-[13px] tracking-[0.05em] text-footer-fg"
      style={{ borderTop: "1px solid var(--footer-hair)" }}
    >
      <div>
        今日已课{" "}
        <b
          className="text-[17px] font-bold tabular-nums"
          style={{ color: "var(--footer-strong)" }}
        >
          {n}
        </b>{" "}
        炷 · 计{" "}
        <b
          className="text-[17px] font-bold tabular-nums"
          style={{ color: "var(--footer-strong)" }}
        >
          {formatDuration(today.seconds)}
        </b>
      </div>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: groups }, (_, g) => (
          <svg key={g} width="26" height="26" viewBox="0 0 34 34" className="shrink-0">
            {ZHENG_STROKES.slice(0, g === groups - 1 && rem > 0 ? rem : 5).map(
              (d, i) => {
                const isNewest =
                  celebrateKey > 0 && g === lastGroup && i === lastStroke;
                return (
                  <path
                    key={isNewest ? `${g}-${i}-${celebrateKey}` : `${g}-${i}`}
                    d={d}
                    stroke="var(--zhu-red)"
                    strokeWidth="3.5"
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
          <span className="ml-1 text-[12px] tracking-[0.2em] text-footer-fg/70">
            尚未落笔
          </span>
        ) : (
          <span className="ml-1 text-[11px] tracking-[0.2em] text-footer-fg/60">
            五笔一正
          </span>
        )}
      </div>

      {n > 0 && (
        <div
          key={celebrateKey > 0 ? `stamp-${n}` : "stamp-static"}
          className={
            celebrateKey > 0
              ? "flex h-[44px] w-[44px] animate-stamp-in items-center justify-center font-brush text-[16px] font-bold tracking-[0.1em]"
              : "flex h-[44px] w-[44px] items-center justify-center font-brush text-[16px] font-bold tracking-[0.1em]"
          }
          style={{
            transform: "rotate(3deg)",
            color: "var(--footer-strong)",
            border: "1.5px solid var(--footer-strong)",
          }}
          title={`今日功成 ${n} 炷`}
        >
          功成
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => onThemeChange(t.id)}
            title={`换纸：${t.label}`}
            className="text-[11px] tracking-[0.2em] transition-colors"
            style={{
              color:
                theme === t.id ? "var(--footer-strong)" : "var(--footer-fg)",
              opacity: theme === t.id ? 1 : 0.55,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </footer>
  );
}
