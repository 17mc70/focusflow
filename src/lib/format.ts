export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} 秒`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return m > 0 ? `${h} 小时 ${m} 分` : `${h} 小时`;
  return `${m} 分钟`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 11) return "晨安";
  if (h < 14) return "午安";
  if (h < 18) return "午后";
  return "晚安";
}

const CN_DIGITS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

/** 中文数字(历书口径,支持 0~99) */
export function cnNum(n: number): string {
  if (n < 10) return CN_DIGITS[n];
  if (n === 10) return "十";
  if (n < 20) return `十${CN_DIGITS[n % 10]}`;
  if (n < 100) {
    const tens = Math.floor(n / 10);
    return `${CN_DIGITS[tens]}十${n % 10 ? CN_DIGITS[n % 10] : ""}`;
  }
  return String(n);
}
