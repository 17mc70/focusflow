# 坐香历

桌面的老黄历番茄钟：一张红头竹纸历书，选时长起课专注，一炷功成以朱批「正」字记在页脚。

- **今日**：118px 套印倒计时、宜忌铅字、印章主钮（坐/止/续）、右侧「今日宜」任务列
- **日课**：任务增删改、勾选功成、双击改名，每条累计专注时长
- **检历**：近十四日排成同尺寸历页缩样，逐日可比
- 手账页为刊头禁用占位，未实现

技术栈：Tauri 2 + React 19 + TypeScript + Vite + Tailwind 4 + shadcn。数据存本地 SQLite（`tauri-plugin-sql`），无账号、无网络请求、无遥测。

## 运行

```bash
npm install
npm run tauri dev   # 真实桌面窗口，需 Rust 与 MSVC Build Tools
npm run dev         # 仅前端预览 http://localhost:1420
```

仅前端预览时没有数据库、窗口、通知与托盘，相关调用静默降级，界面可用但数据不落盘。

## 验证

```bash
npm run build              # tsc + vite build
cd src-tauri && cargo check
```

## 文档

- [DESIGN.md](DESIGN.md) — 视觉与交互规范（历书世界、色板、字号阶、组件口径），改界面前先读
- [PRODUCT.md](PRODUCT.md) — 产品定位、用户、能力与约束
- [AGENTS.md](AGENTS.md) — 给下一次会话或接手者的最小上下文

## 数据

SQLite 文件 `app.db` 由 Tauri 数据目录承载，表 `tasks` 与 `focus_sessions`，建表迁移写在 `src-tauri/src/lib.rs`。计时状态另存于 `localStorage`（键 `ff-timer-state`），重启可恢复进行中的一段。

打包产物名为 `FocusFlow`（`src-tauri/tauri.conf.json` 的 `productName`），窗口标题与界面品牌为「坐香」「坐香历」。

## 许可

[MIT](LICENSE) © 2026 谷凉
