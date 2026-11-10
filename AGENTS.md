# AGENTS.md

## 这是什么

「坐香历」——本地桌面番茄钟（包名 `focusflow`，打包产物 `FocusFlow`），中文界面。视觉世界是民间老黄历：竹纸底、朱红刊头、套印重影 118px 倒计时、页脚朱批「正」字记功。无账号、无网络、无遥测。

## 跑起来

```bash
npm run tauri dev          # 真实桌面窗口（需 Rust + MSVC Build Tools）
npm run dev                # 仅前端预览 http://localhost:1420，数据库/窗口/通知/托盘全部静默降级
npm run build              # tsc + vite，前端验证
cd src-tauri && cargo check  # Rust 侧验证
```

## 技术栈

React 19 + TypeScript + Vite + Tailwind 4 + shadcn。数据走 Local SQLite（`tauri-plugin-sql`），通知用 `tauri-plugin-notification`；托盘、关闭即隐藏、SQL 迁移都在 `src-tauri/src/lib.rs`。

## 目录与约定

- `src/features/{timer,tasks,stats}/` —— 一功能一目录，状态由 hook 承载（`useTimer`、`useTasks`）
- `src/lib/db.ts` —— 唯一数据访问层，不依赖 UI；`types.ts` 是数据契约
- `src/components/{Masthead,FooterBar}.tsx` —— 全局常驻刊头/页脚，任何新页活在两界之间
- `src/lib/useTheme.ts` —— 三套纸色主题（月白/天青/素白），即 `html[data-theme]`，存 `localStorage`（`ff-theme`）
- `src/lib/useToday.ts` —— 今日日期，跨零点自动更新；刊头、页脚、检历共用
- 文案一律历书口径：中文数字 `cnNum`、「N 炷」、「已燃 X 成」、四相宜忌词表
- **`DESIGN.md` 是视觉唯一权威**：改界面前先读。不引入环形进度条、百分比时间条、深色底、弥散阴影、非整数 px 字号

## Tauri 权限

`src-tauri/capabilities/default.json` 控制前端能调哪些原生能力。已开的非默认项：

- `sql:allow-execute` —— **写库必需**，`sql:default` 只有读权限，缺了它所有增删改静默失败
- `core:window:allow-set-title` —— 窗口标题倒计时，`core:window:default` 不含此项

补充能力前先确认该权限是否已在插件默认集内：默认集定义在各 `tauri-plugin-*` crate 的 `permissions/default.toml`，本地构建后也会聚合进 `src-tauri/gen/schemas/acl-manifests.json`（该目录由构建生成，不入库）。

## 当前状态与下一步

- 已完成：15/25/45 分三档计时（idle → focus ⇄ paused → break 循环）、暂停/弃课/截课、绑定日课、任务增删改、近十四日检历、托盘常驻、窗口标题实时倒计时、三套纸色主题切换
- 已完成：空格快捷键（起课/暂停/续课）、托盘菜单控计时（暂停·继续 / 截课）、单实例锁、删除日课二次确认、跨零点自动刷新、重启后超时段补结算
- 未做：手账页（刊头禁用占位）、设置页（时长/休息/通知开关）、白噪音
- 计时基于 `startAt` 时间戳推算，切后台或重启不走时；进行中会话存 `localStorage`（`ff-timer-state`）
- 关闭窗口 = 隐藏到托盘、计时继续；退出走托盘菜单。改窗口行为前先确认这是有意设计
- 段结束写库走 `persistSession()`：**先推进状态再异步入库**，写库失败不得阻塞换相（否则会卡在 00:00 反复重试）
