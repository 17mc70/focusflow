import { useEffect, useState } from "react";

const nextMidnight = (from: Date): Date =>
  new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);

/**
 * 今日日期,跨过零点自动更新一次,让刊头农历与「今日已课」不至于停在前一天。
 * 系统休眠时定时器会迟到,醒来后立即补一次。
 */
export function useToday(): Date {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    let timer = 0;

    const schedule = () => {
      const now = new Date();
      timer = window.setTimeout(() => {
        setToday(new Date());
        schedule();
      }, nextMidnight(now).getTime() - now.getTime() + 1000);
    };

    const sync = () => {
      window.clearTimeout(timer);
      setToday(new Date());
      schedule();
    };

    schedule();
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return today;
}
