# OARA 智能问答系统 —— 前端（oara-web）

## 1. 项目简介

OARA（OMS 智能问答系统）前端，基于以下 PRD 文档实现：

- `docs/prd/01-OARA-PRD.md`（产品总纲）
- `docs/prd/02-领域模型.md`（领域模型：`QaSession`/`QaInteraction`/`SourceReference`/`KnowledgeDocument` 等）
- `docs/prd/03-frontend-prd.md`（前端产品需求）
- `docs/prd/03-pages/*.md`（17 个子页面级 PRD，覆盖登录、问答平台、历史记录、用户管理、操作记录、统计看板、查询记录、知识库管理、修改密码及通用组件）

面向 OMS 运营/客服人员提供基于知识库的智能问答能力，支持流式对话、来源追溯、历史留痕、以及面向管理员的用户/知识库/统计后台管理。

## 2. 技术栈

- Vue 3（`<script setup lang="ts">` + Composition API）
- TypeScript（`strict: true`）
- Vite 6
- Pinia 2 + `pinia-plugin-persistedstate`（仅持久化 `token`/`currentUser` 等鉴权字段）
- Vue Router 4（`meta.roles` + 全局导航守卫做角色分流）
- Element Plus（UI 组件库）
- Axios（唯一 HTTP 实例，统一拦截器）
- `fetch` + `ReadableStream` + `AbortController`（问答流式通信，非原生 `EventSource`）
- `marked` + `DOMPurify`（Markdown 渲染 + XSS 净化）
- ESLint + Prettier + Stylelint（静态检查）
- Vitest（单元测试）

## 3. Node 版本与包管理器

- Node.js：建议 ≥ 18.18，推荐 20 LTS 或更高（本项目验证环境为 v22.23.2）
- 包管理器：**pnpm**（仓库含 `pnpm-lock.yaml`，请勿混用 npm/yarn 安装依赖）

## 4. 安装与启动命令

```bash
cd oara-web
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器（默认 http://localhost:5173，端口被占用时自动切换，如 5174）
pnpm build            # 生产构建（先执行 vue-tsc --noEmit 类型检查，再 vite build）
pnpm preview           # 本地预览生产构建产物
pnpm typecheck         # 单独执行类型检查
pnpm lint              # ESLint 检查并自动修复
pnpm lint:style        # Stylelint 检查并自动修复
pnpm test              # 运行 Vitest 单元测试
```

## 5. 环境变量说明

复制 `.env.example` 为 `.env.development`（仓库已提供 `.env.development`，可直接使用）：

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `VITE_USE_MOCK` | 是否启用前端 Mock（`true` 时通过 `src/mocks` 拦截请求，无需真实后端） | `true` |
| `VITE_API_BASE_URL` | 后端 API 基础路径（`VITE_USE_MOCK=false` 时生效） | `/api` |
| `VITE_QA_ASK_STREAM_URL` | 问答流式接口地址（供 `composables/useSseStream.ts` 使用） | `/api/qa/ask` |

生产构建时请将 `VITE_USE_MOCK` 设为 `false` 并配置真实后端地址；请勿在 `.env` 文件中提交任何密钥/敏感信息。

## 6. 默认体验账号（Mock）

| 角色 | 用户名 | 密码 | 可见范围 |
| --- | --- | --- | --- |
| 普通用户 | `user` | `12345678` | 工作台（问答平台、历史记录）、修改密码 |
| 管理员 | `admin` | `12345678` | 工作台 + 管理后台（用户管理、操作记录、统计看板、查询记录、知识库管理） |

## 7. 页面与路由对照表

| 页面 | 路由 name | 路径 | 角色 |
| --- | --- | --- | --- |
| P01 登录页 | `Login` | `/login` | 公开 |
| P02 问答平台（工作台壳层子路由） | `AgentChat` | `/workbench/chat` | user, admin |
| P03-01 历史记录列表 | `QaHistory` | `/workbench/history` | user, admin |
| P04-01 用户管理列表（管理后台） | `AdminUsers` | `/admin/users` | admin |
| P05 操作记录列表 | `AdminAuditLog` | `/admin/users/operations` | admin |
| P06 统计看板 | `AdminDashboard` | `/admin/dashboard` | admin |
| P07-01 查询记录列表 | `AdminQueryLogs` | `/admin/query-logs` | admin |
| P09-01 知识库管理列表 | `AdminKnowledgeBase` | `/admin/knowledge-base` | admin |
| 404 兜底页 | `NotFound` | `/:pathMatch(.*)*` | 公开 |

以下为弹窗/组件，不进入路由表：C01 历史详情、C02 新增编辑用户、C03 删除确认、C04 查询详情、C06/P10 答案来源详情（全局唯一，供 P02/P03-02/P07-02 共用）、P08 修改密码、P09-02 上传弹窗、G01 通用确认弹窗、G02 通用提示弹窗。

## 8. 目录结构说明

```
src/
├── api/            # 接口请求函数，按业务模块分文件（auth.ts、qa.ts、qaHistory.ts 等）
├── assets/         # 静态资源
├── components/     # 全局通用组件：G01 ConfirmDialog、G02 MessageDialog、C06 AnswerSourceDetailDialog
├── composables/    # 全局可复用组合式函数（useSseStream.ts 等）
├── features/       # 按业务模块划分（各自含 views/components/composables/index.ts）
│   ├── auth/               # P01 登录
│   ├── agent-chat/         # P02 问答平台（SSE 流式对话）
│   ├── qa-history/         # P03-01/P03-02 历史记录
│   ├── user-management/    # P04-01/P04-02 用户管理
│   ├── audit-log/          # P05 操作记录
│   ├── dashboard/          # P06 统计看板
│   ├── query-log/          # P07-01/P07-02 查询记录
│   ├── knowledge-base/     # P09-01/P09-02 知识库管理（仅管理员）
│   └── account/            # P08 修改密码
├── router/         # 路由定义（index.ts）与路由守卫（guards.ts）
├── stores/         # Pinia store：auth、agentChat、qaHistory、userManagement、auditLog、dashboard、queryLog、knowledgeBase
├── styles/         # 全局样式变量、mixin、reset
├── types/          # 全局共享类型（qa.ts、knowledge-document.ts、query-record.ts、api.ts 等）
├── utils/          # 无副作用工具函数（http.ts 唯一 Axios 实例等）
├── mocks/          # 前端 Mock 适配器与各模块 handler（仅 VITE_USE_MOCK=true 时启用）
└── views/          # 路由级壳层：LoginShellView、WorkbenchShellView、AdminShellView、NotFoundView
```

## 9. 无后端时 Mock 行为说明

- `VITE_USE_MOCK=true` 时，`src/mocks/index.ts` 挂接到 Axios `adapter`，拦截所有经由 `src/utils/http.ts` 发出的请求，无需真实后端即可体验全部主路径。
- 登录 Mock 校验固定账号（`admin`/`user`，密码均为 `12345678`），成功后返回 `token: mock-token-<accountId>`，前端据此在后续请求 Authorization 头中携带 `Bearer mock-token-<accountId>`，各模块 Mock handler（如历史记录、操作记录）据此按当前登录账号过滤/归属数据。
- 用户管理中的启用/禁用/删除操作会实时写入与「操作记录」共享的内存数组，两页面数据联动为真实调用链路（非静态孤立数据）。
- 知识库上传 Mock 会做类型（仅 PDF/Word）、大小（20MB 上限）、重名校验，通过后进入「解析中」状态，2~3 秒后随机流转为「已入库」或「处理失败」，列表页轮询展示状态变化。
- 问答流式回答通过 Mock 分帧模拟真实 SSE 协议（`type`/`seq`/`data` 帧结构），支持发送中终止（`AbortController.abort()`），终止后消息不写入历史记录。
- 生产环境请将 `VITE_USE_MOCK` 设为 `false` 并接入真实后端，Mock 代码不会被打包进生产逻辑路径（通过 `import.meta.env` 条件判断，仅 dev/test 生效）。

## 10. 已知限制

- 本次交付未接入真实后端，所有数据来自前端 Mock，刷新页面后 Mock 内存态数据（如知识库文档列表、操作记录）会重置为初始种子数据（token/角色等鉴权信息除外，持久化在 `localStorage` 的 `oara-auth` 键下）。
- 对话消息列表超过 200 条时采用「只渲染最近 200 条 + 提示」的降级策略，未引入 `vue-virtual-scroller` 做真正的虚拟滚动（Mock 数据量远低于该阈值，不影响当前体验）。
- 生产构建主 vendor chunk 原始体积（非 gzip）超出 Vite 默认 500KB 告警阈值，但 gzip 后体积（约 367KB）符合规范 PERF-06 的 800KB 上限，不影响实际加载性能，后续可通过 `manualChunks` 进一步拆分。
- 本次验证未使用浏览器自动化工具，未做真实点击级 UI 冒烟测试，仅完成静态代码走查 + 命令级验证（typecheck/lint/test/build/dev 全部实际执行通过）。
