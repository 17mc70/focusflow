import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format";
import type { Task } from "@/lib/types";

interface TasksViewProps {
  tasks: Task[];
  onAdd: (title: string) => void;
  onToggle: (task: Task) => void;
  onRename: (id: number, title: string) => void;
  onRemove: (id: number) => void;
}

/** 日课簿:朱点勾课、底线记入、双击改题 */
export function TasksView({ tasks, onAdd, onToggle, onRename, onRemove }: TasksViewProps) {
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const totalFocus = tasks.reduce((sum, t) => sum + t.focus_seconds, 0);

  return (
    <div className="animate-in-up mx-auto flex h-full w-full max-w-[560px] flex-col gap-5 overflow-y-auto px-8 py-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-black tracking-[0.35em]">日课簿</h1>
        {totalFocus > 0 && (
          <span className="text-xs tracking-[0.15em] text-muted-foreground">
            累计 {formatDuration(totalFocus)}
          </span>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAdd(title);
          setTitle("");
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="今日何课？写罢回车"
          maxLength={100}
          className="w-full border-b border-ink/40 bg-transparent pb-2.5 text-sm tracking-[0.08em] outline-none transition-colors placeholder:text-muted-foreground focus:border-cinnabar"
        />
      </form>

      {tasks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
          <div className="font-brush text-3xl text-[#6f6046]">空</div>
          <p className="text-xs tracking-[0.25em]">日课尚空 · 可径自起课</p>
        </div>
      ) : (
        <ul className="flex flex-col pb-4">
          {tasks.map((t) => {
            const done = t.status === "done";
            return (
              <li
                key={t.id}
                className="group flex items-center gap-3.5 border-b border-ink/15 py-3.5 transition-colors hover:border-ink/35"
              >
                <button
                  onClick={() => onToggle(t)}
                  title={done ? "标记未竟" : "功成"}
                  className={cn(
                    "flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    done
                      ? "border-cinnabar bg-cinnabar"
                      : "border-cinnabar/60 hover:border-cinnabar",
                  )}
                >
                  {done && (
                    <svg width="9" height="7" viewBox="0 0 9 7" className="text-primary-foreground">
                      <path
                        d="M1 3.5 L3.5 6 L8 0.8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  )}
                </button>

                {editingId === t.id ? (
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.currentTarget.value)}
                    onBlur={() => {
                      onRename(t.id, draft);
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onRename(t.id, draft);
                        setEditingId(null);
                      }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="min-w-0 flex-1 border-b border-cinnabar bg-transparent pb-0.5 text-sm tracking-[0.06em] outline-none"
                  />
                ) : (
                  <span
                    onDoubleClick={() => {
                      setEditingId(t.id);
                      setDraft(t.title);
                    }}
                    title="双击可改"
                    className={cn(
                      "min-w-0 flex-1 cursor-text truncate text-sm tracking-[0.06em]",
                      done
                        ? "text-muted-foreground line-through decoration-cinnabar decoration-2"
                        : "text-foreground/90",
                    )}
                  >
                    {t.title}
                  </span>
                )}

                {t.focus_seconds > 0 && (
                  <span className="shrink-0 text-[11px] tracking-[0.1em] text-muted-foreground">
                    {formatDuration(t.focus_seconds)}
                  </span>
                )}
                <button
                  onClick={() => onRemove(t.id)}
                  title="删"
                  className="shrink-0 text-xs text-muted-foreground/0 transition-colors group-hover:text-muted-foreground hover:!text-cinnabar-deep"
                >
                  删
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
