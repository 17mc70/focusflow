import { useEffect, useState } from "react";

/** 三套纸色:月白(默认) / 雨过天青 / 素白 */
export const THEMES = [
  { id: "yuebai", label: "月白" },
  { id: "tianqing", label: "天青" },
  { id: "subai", label: "素白" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const STORAGE_KEY = "ff-theme";

function readTheme(): ThemeId {
  const raw = localStorage.getItem(STORAGE_KEY);
  return THEMES.some((t) => t.id === raw) ? (raw as ThemeId) : "yuebai";
}

/** 主题即 html[data-theme],月白为无属性的默认态 */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "yuebai") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
}
