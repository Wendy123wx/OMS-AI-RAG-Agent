# 前端开发规范（OARA 项目）

## 0. 文档信息

| 项目 | 内容 |
| --- | --- |
| 文档名称 | OARA（OMS 智能问答系统）前端开发规范 |
| 版本 | V1.0 |
| 生效范围 | 本仓库全部前端代码（`src/` 下所有目录），含普通业务页面与 AI 智能体交互页面（问答平台 P02、历史记录 P03-01/P03-02 等 SSE 流式/多轮对话场景）；覆盖人工开发者与 AI 编码智能体两类执行主体 |
| 适用技术栈 | Vue 3（`<script setup>` + Composition API）、TypeScript（strict）、Vite；状态管理 Pinia；路由 Vue Router 4；HTTP 客户端 Axios；流式通信 `fetch` + `ReadableStream`/`AbortController`；UI 组件库 Element Plus（如团队已另行选型，只需替换 §7.1，其余规则不变）；样式方案 SCSS + BEM；代码规范工具 ESLint + Prettier + Stylelint；单测 Vitest |
| 状态 | 生效 |
| 创建日期 | 2026-09-11 |
| 更新日期 | 2026-09-11 |
| 依据 | `docs/prd/01-OARA-PRD.md`、`docs/prd/02-领域模型.md`、`docs/prd/03-frontend-prd.md`、`docs/prd/03-pages/*` |

### 修改记录

| 日期 | 版本 | 修改人 | 修改内容 |
| --- | --- | --- | --- |
| 2026-09-11 | V1.0 | 前端架构组 | 首版发布，覆盖全部章节及 AI 智能体前端专项规范 |

---

## 1. 总则

### 1.1 规则等级定义

本规范中每条规则标注一个等级，含义如下：

| 等级 | 含义 | 违反后果 |
| --- | --- | --- |
| **MUST** | 强制规则，无例外 | 代码评审必须拒绝合并（Block） |
| **MUST NOT** | 强制禁止，无例外 | 代码评审必须拒绝合并（Block） |
| **SHOULD** | 强烈建议，偏离需在 PR 描述中说明理由 | 评审可要求补充说明，不自动 Block |

### 1.2 规则编号

每条规则带唯一编号（如 `DIR-01`），供代码评审意见、Lint 注释、AI 智能体自检时引用。编号不可复用或重排。

### 1.3 可校验性声明

本规范禁止"尽量""合理""美观"等无法判定的表述。每条规则必须满足以下三者之一：

1. 可由 ESLint/Stylelint/TSConfig 等工具静态检测；
2. 可由文件结构、命名正则、行数等脚本化脚本检测；
3. 若无法自动化，必须给出人工评审可逐项打勾的判定标准（是/否二值）。

---

## 2. 项目目录规范

### DIR-01（MUST）目录结构固定如下，新增顶级目录须经架构评审

```
src/
├── api/            # 接口请求函数，按业务模块分文件，如 api/qa.ts、api/user.ts
├── assets/         # 静态资源（图片、字体），不含可复用样式变量
├── components/     # 全局通用组件（跨 ≥2 个业务模块复用）
├── composables/    # 全局可复用组合式函数（use 前缀）
├── features/       # 按业务模块划分的功能目录，模块内自带 components/composables/types
│   ├── auth/               # 对应 P01 登录页
│   ├── agent-chat/         # 对应 P02 问答平台页（SSE 流式对话）
│   ├── qa-history/         # 对应 P03-01/P03-02 历史记录
│   ├── user-management/    # 对应 P04-01/P04-02
│   ├── audit-log/          # 对应 P05 操作记录
│   ├── dashboard/          # 对应 P06 统计看板
│   ├── query-log/          # 对应 P07-01/P07-02
│   └── account/            # 对应 P08 修改密码
├── router/         # 路由定义与路由守卫
├── stores/         # Pinia store，按领域划分（见 §6）
├── styles/         # 全局样式变量、mixin、重置样式
├── types/          # 全局共享类型（领域模型对应类型见 §4.2）
├── utils/          # 无副作用纯工具函数
└── views/          # 路由级页面壳层（登录页容器/问答平台壳层/管理后台壳层，对应总览 §3）
```

- **判定标准**：`src/` 下不存在未列出的顶级目录；`features/*` 子目录名与页面架构总览模块一一对应。

### DIR-02（MUST）业务组件、逻辑、类型、样式必须归属唯一 `features/<module>`，禁止跨模块目录相互 deep import

- **反例**：`features/qa-history` 中出现 `import X from '@/features/agent-chat/components/MessageBubble.vue'`。
- **正例**：将 `MessageBubble.vue` 提升到 `src/components/`（全局通用组件目录）后被两个模块引用。
- **校验方式**：ESLint `import/no-restricted-paths` 规则，禁止 `features/*` 互相引用私有路径。

### DIR-03（MUST）路径引用统一使用别名 `@/`，禁止 `../../../` 三级以上相对路径

- **校验方式**：ESLint 规则 `no-restricted-imports` + 正则 `^(\.\.\/){3,}` 触发报错。

### DIR-04（MUST）每个 `features/<module>` 目录须包含 `index.ts` 作为对外唯一导出入口，模块内部文件不得被外部直接 import

- **校验方式**：ESLint `import/no-internal-modules`，仅允许 `@/features/<module>` 或 `@/features/<module>/index`。

---

## 3. 命名规范

### NAME-01（MUST）文件命名

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| Vue 组件文件 | PascalCase，多单词 | `MessageBubble.vue`、`SourceCitationList.vue` |
| 组合式函数文件 | camelCase，以 `use` 开头 | `useSseStream.ts`、`useAgentChatSession.ts` |
| 普通 `.ts` 文件（api/utils/types） | kebab-case | `qa-session.ts`、`format-date.ts` |
| 样式文件 | kebab-case | `chat-bubble.scss` |

- **反例**：`SseStream.ts`（非组件却用 PascalCase）、`use_agent_chat.ts`（下划线）。
- **校验方式**：ESLint `unicorn/filename-case` 按上表分文件类型配置正则。

### NAME-02（MUST）变量与函数使用 camelCase；常量使用 `SCREAMING_SNAKE_CASE`；类型/接口/组件名使用 PascalCase

- **正例**：`const MAX_CONTEXT_ROUNDS = 10`；`interface QaInteraction {}`；`function sendQuestion() {}`
- **反例**：`const maxContextRounds = 10`（作为不可变业务常量却用 camelCase）；`interface qaInteraction {}`
- **校验方式**：ESLint `@typescript-eslint/naming-convention`。

### NAME-03（MUST）布尔类型变量/Props 必须以 `is`/`has`/`can`/`should` 开头

- **正例**：`isStreaming`、`hasSource`、`canCancel`
- **反例**：`streaming: boolean`、`sourceVisible: boolean`
- **校验方式**：ESLint `@typescript-eslint/naming-convention` 中为 `boolean` 类型单独配置 `prefix` 规则。

### NAME-04（MUST）事件命名：组件 `emits` 声明用 camelCase，模板中绑定用 kebab-case

- **正例**：`defineEmits<{ (e: 'sendQuestion', text: string): void }>()`，父组件中 `<Chat @send-question="onSend" />`
- **校验方式**：ESLint `vue/custom-event-name-casing` + `vue/attribute-hyphenation`。

### NAME-05（MUST NOT）禁止无意义命名（`data`、`temp`、`obj`、`flag`、`a1`、单字母变量，循环下标 `i/j` 除外）

- **校验方式**：人工评审逐行检查；PR 评审 Checklist 第 1 项（见 §14.2）。

### NAME-06（MUST）类型/接口命名不加 `I`/`T` 前缀，使用业务语义后缀区分层次：`XxxDto`（接口出参原始结构）、`XxxVo`（前端渲染用视图对象）、`XxxParams`（请求参数）

- **正例**：`QaInteractionDto`、`QaInteractionVo`、`SendQuestionParams`
- **反例**：`IQaInteraction`、`TQaInteraction`
- **校验方式**：ESLint `@typescript-eslint/naming-convention` 禁止 `I[A-Z]`/`T[A-Z]` 前缀正则。

---

## 4. TypeScript 类型规范

### TS-01（MUST）`tsconfig.json` 必须开启 `"strict": true`，且不得在配置中关闭 `strictNullChecks`/`noImplicitAny`

- **校验方式**：CI 中执行脚本读取 `tsconfig.json` 校验字段值，任一为 `false` 则失败。

### TS-02（MUST NOT）禁止显式声明 `any`；确需绕过类型检查时必须使用 `unknown` + 类型收窄，或添加 `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 原因`注释说明原因

- **反例**：`function handle(payload: any) {}`
- **正例**：`function handle(payload: unknown) { if (isQaEvent(payload)) { ... } }`
- **校验方式**：ESLint `@typescript-eslint/no-explicit-any: error`。

### TS-03（MUST）接口返回数据、Pinia state、组件 Props/Emits 必须显式声明类型，禁止依赖类型推断作为公开契约

- **正例**：`const { data } = await axios.get<ApiResponse<QaInteractionDto[]>>('/api/qa/history')`
- **反例**：`const { data } = await axios.get('/api/qa/history')`（`data` 类型为 `any`）
- **校验方式**：ESLint `@typescript-eslint/explicit-function-return-type`（仅对 `api/**`、`stores/**` 目录启用）。

### TS-04（MUST）领域模型对应的前端类型必须与 `docs/prd/02-领域模型.md` 中定义的聚合/值对象字段一致命名，新增字段须在 PR 中注明来源 PRD 章节

- **判定标准**：`src/types/qa.ts` 中 `QaSession`、`QaInteraction`、`SourceReference`、`CompressedContext` 字段名与领域模型文档章节 2/3 定义逐项对照，缺失或新增字段需在 PR 描述标注对应 PRD 编号。

### TS-05（SHOULD）优先使用联合类型字面量代替 `enum`，枚举值需要在多处引用时改用 `as const` 对象

- **正例**：
  ```ts
  export const QA_INTERACTION_STATUS = {
    PENDING: 'pending',
    STREAMING: 'streaming',
    DONE: 'done',
    CANCELLED: 'cancelled',
    ERROR: 'error',
  } as const
  export type QaInteractionStatus = typeof QA_INTERACTION_STATUS[keyof typeof QA_INTERACTION_STATUS]
  ```
- **反例**：`enum QaInteractionStatus { Pending, Streaming, Done }`（数字枚举，序列化/日志中丢失语义）
- **校验方式**：ESLint `no-restricted-syntax` 禁止 `TSEnumDeclaration`（数字枚举），字符串枚举需团队评审豁免。

### TS-06（MUST）所有 API 响应统一包裹为 `ApiResponse<T>` 泛型，禁止在业务代码中直接使用未包装的裸类型

```ts
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  traceId: string
}
```

- **校验方式**：`api/**` 目录下函数返回类型人工评审是否形如 `Promise<ApiResponse<T>>` 或已在 §8 拦截器中解包为约定的 `Result<T>`。

---

## 5. 组件设计规范

### COMP-01（MUST）所有组件使用 `<script setup lang="ts">` 语法，禁止 Options API

- **校验方式**：ESLint `vue/component-api-style: ['error', ['script-setup']]`。

### COMP-02（MUST）Props/Emits 必须使用类型化声明 `defineProps<T>()`/`defineEmits<T>()`，禁止运行时声明 `defineProps({...})`（除需要 `default` 复杂对象时用 `withDefaults`）

- **正例**：
  ```ts
  interface Props {
    message: QaInteractionVo
    isStreaming?: boolean
  }
  const props = withDefaults(defineProps<Props>(), { isStreaming: false })
  ```
- **校验方式**：ESLint `vue/define-props-declaration: ['error', 'type-based']`。

### COMP-03（MUST）单文件组件 `<script>` 部分不超过 300 行（不含类型定义/注释空行），超出必须拆分子组件或抽离 composable

- **校验方式**：CI 脚本统计 `.vue` 文件 `<script>` 代码行数，超限报错并输出文件名。

### COMP-04（MUST）组件 `<template>` 中禁止编写业务逻辑判断（三层以上嵌套三元表达式、内联复杂计算），必须提升为 `computed`

- **反例**：`<span>{{ status === 'done' ? (hasSource ? '已回答（含来源）' : '已回答') : status === 'error' ? '异常' : '生成中' }}</span>`
- **正例**：`<span>{{ statusText }}</span>`（`statusText` 为 `computed`）
- **校验方式**：ESLint `vue/no-complex-conditional-expressions` 等价规则或人工评审 Checklist。

### COMP-05（MUST）组件命名至少两个单词，禁止与原生 HTML 标签同名或单一名词（如 `Card.vue`、`List.vue`）

- **正例**：`SourceCitationList.vue`
- **反例**：`Card.vue`、`Input.vue`
- **校验方式**：ESLint `vue/multi-word-component-names`。

### COMP-06（MUST）跨请求/跨轮次可复用的状态与副作用逻辑必须抽成 `composables/use*.ts`，组件文件本身不直接编写 `fetch`/`EventSource`/`AbortController` 实例化代码（对话流式组件见 §9、§15 专项例外说明其位置）

- **判定标准**：`.vue` 文件内不出现 `new AbortController()`、裸 `fetch(` 调用；统一封装在 `composables/useSseStream.ts` 等文件中。

---

## 6. 状态管理规范

### STATE-01（MUST）状态管理仅使用 Pinia，禁止引入 Vuex 或自建全局 `reactive` 单例作为跨组件状态

- **校验方式**：`package.json` 不含 `vuex` 依赖；ESLint `no-restricted-imports` 禁止 `import ... from 'vuex'`。

### STATE-02（MUST）Store 按领域聚合划分，禁止建立无边界的 `useGlobalStore` 大杂烩

固定 Store 清单（可增不可合并）：`useAuthStore`（`UserAccount`/token）、`useAgentChatStore`（`QaSession`/`QaInteraction`/流式状态）、`useQaHistoryStore`、`useUserManagementStore`、`useDashboardStore`、`useQueryLogStore`。

- **校验方式**：`stores/` 目录文件数与业务模块数比对；新增 Store 文件在 PR 中说明对应领域聚合。

### STATE-03（MUST）派生数据必须使用 `getters`（Store 内 `computed`），禁止在 `state` 中存储可由其他字段计算得出的冗余字段

- **反例**：`state: { messages: [], messageCount: 0 }` 且需手动维护 `messageCount`
- **正例**：`const messageCount = computed(() => messages.value.length)`
- **校验方式**：人工评审 Checklist；Code Review 必查项。

### STATE-04（MUST）异步操作（接口请求、SSE 建流）必须在 Store `actions` 中完成，组件不得直接调用 `api/*` 函数后手动 `commit` 式赋值多个 Store 字段

- **判定标准**：`.vue` 文件不直接 `import` `api/**`，改为调用对应 Store action。

### STATE-05（MUST）仅 `token`、`userId`、`role` 等鉴权必要字段允许持久化到 `localStorage`（经 `pinia-plugin-persistedstate` 显式白名单配置）；会话消息内容（`QaInteraction` 列表）禁止持久化到 `localStorage`/`sessionStorage`

- **理由**：对齐 PRD 9.3.13「取消/终止不留痕」及数据安全要求，避免敏感问答内容明文落盘。
- **校验方式**：检查持久化插件 `paths` 白名单配置，人工评审是否新增未授权字段。

---

## 7. 样式规范

### STYLE-01（MUST）UI 组件库固定为 Element Plus；如需替换须经架构评审并同步更新本条

### STYLE-02（MUST）自定义样式必须使用 `<style scoped lang="scss">`，禁止全局无限定选择器（除 `styles/reset.scss` 与设计变量文件）

- **校验方式**：Stylelint 规则禁止在 `.vue` 文件内出现 `<style>`（无 `scoped`）标签；正则扫描 CI 检查。

### STYLE-03（MUST）类名使用 BEM 命名：`block__element--modifier`，`block` 与组件名对应

- **正例**：`.message-bubble__source--collapsed`
- **反例**：`.mb1`、`.red-text`
- **校验方式**：Stylelint `selector-class-pattern` 正则 `^[a-z]([a-z0-9-]+)?(__[a-z0-9-]+)?(--[a-z0-9-]+)?$`。

### STYLE-04（MUST NOT）禁止使用 `!important`，特殊场景需团队评审并在代码行内注释理由

- **校验方式**：Stylelint `declaration-no-important: true`。

### STYLE-05（MUST）颜色、间距、字号必须引用 `styles/variables.scss` 中定义的设计变量或 CSS 自定义属性，禁止魔法数值/十六进制颜色硬编码

- **反例**：`color: #1a73e8; margin-top: 13px;`
- **正例**：`color: var(--color-primary); margin-top: var(--space-md);`
- **校验方式**：Stylelint 自定义规则禁止十六进制颜色字面量（`color-no-hex` 类规则）出现在业务组件样式中。

### STYLE-06（MUST）响应式断点固定为 `sm: 768px`、`md: 1024px`、`lg: 1440px`，通过 SCSS mixin `@include respond(md) { ... }` 使用，禁止直接书写 `@media` 魔法数值

---

## 8. API 请求规范

### API-01（MUST）所有 HTTP 请求必须通过 `src/utils/http.ts` 导出的唯一 Axios 实例发起，禁止在业务代码中 `new Axios()` 或直接使用全局 `axios.get/post`

- **校验方式**：ESLint `no-restricted-imports` 禁止业务文件直接 `import axios from 'axios'`（仅 `utils/http.ts` 白名单）。

### API-02（MUST）请求函数集中在 `src/api/<module>.ts`，函数签名必须显式声明参数与返回类型，禁止在组件/Store 内拼接 URL 字符串发请求

- **正例**：`export function fetchQaHistory(params: QaHistoryParams): Promise<ApiResponse<QaInteractionDto[]>>`

### API-03（MUST）Axios 请求拦截器统一注入鉴权头，响应拦截器统一处理业务错误码，业务代码不得重复处理 `code !== 0` 判断逻辑

- **判定标准**：业务代码中 `.then`/`await` 之后不出现 `if (res.code !== 0)` 之类重复判断，统一由拦截器 `reject` 后交由 §10 错误处理规则消费。

### API-04（MUST）请求超时时间必须显式设置：普通接口 10s，文件/大数据量接口可单独覆盖并在调用处注明原因；禁止使用 Axios 默认的无限等待

### API-05（MUST）对同一交互触发的重复请求（如输入联想、快速连续点击查询）必须使用 `AbortController`/Axios `CancelToken` 取消前一个未完成请求，禁止依赖后端幂等兜底

- **判定标准**：搜索类输入框对应的 composable 内可见 `AbortController` 或等价取消逻辑。

---

## 9. SSE 流式规范（智能问答专用通信层）

> 说明：由于问答流式接口需要携带 `Authorization` 头且为 `POST` 请求，浏览器原生 `EventSource` 不满足需求，统一采用 `fetch` + `ReadableStream` 手动解析实现。

### SSE-01（MUST）流式请求必须通过 `composables/useSseStream.ts` 统一封装发起，禁止在业务组件内直接调用 `fetch` 解析流

### SSE-02（MUST）每次发起流式请求必须创建独立 `AbortController`，并将其保存于对应 `QaInteraction.controller` 或 Store 映射表中，用于用户主动终止

```ts
const controller = new AbortController()
const response = await fetch('/api/qa/ask', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(params),
  signal: controller.signal,
})
```

### SSE-03（MUST）流式数据帧协议固定为 `data: <JSON>\n\n`，解析时必须按 `\n\n` 分帧后再 `JSON.parse`，禁止假设每次 `read()` 返回完整一帧（TCP/HTTP 分片不保证帧完整性）

- **反例**：`reader.read().then(({value}) => JSON.parse(decoder.decode(value)))`（未做分帧缓冲，长消息必崩溃）
- **正例**：维护 `buffer` 累积字符串，按 `\n\n` split 后逐帧解析，剩余不完整片段保留到下一次 `read()`。

### SSE-04（MUST）每一帧必须包含 `type` 字段（`chunk` | `source` | `done` | `error`）与单调递增 `seq` 序号；渲染端必须按 `seq` 顺序拼接，收到乱序帧须缓冲等待，不得直接追加导致内容错位

### SSE-05（MUST）用户点击"终止"或路由离开当前会话时必须调用 `controller.abort()`，并将该 `QaInteraction` 标记为 `cancelled`；已渲染的部分回答内容必须在 UI 上移除，不写入历史记录/查询记录（对齐 PRD 9.3.13「取消/终止不留痕」）

- **判定标准**：终止操作触发后，`useAgentChatStore` 中对应消息条目从 `messages` 数组移除或标记为不持久化，且不会调用历史记录写入 API。

### SSE-06（MUST NOT）流式连接中断（网络错误）禁止自动重连并从头重放；必须提示用户"回答已中断"并保留已生成的部分内容，由用户手动选择重新提问

- **理由**：智能问答场景重连重放会产生重复计费/重复写入历史的副作用，且无法保证服务端幂等。

### SSE-07（MUST）单个会话同一时刻只允许一条流式请求处于进行中状态，发送新问题前必须校验 `isStreaming === false`，否则禁用输入框与发送按钮（详见 §15.5 消息队列规则）

---

## 10. 错误处理规范

### ERR-01（MUST）所有异步操作（接口请求、流式解析、路由跳转）必须捕获异常，禁止裸 `catch {}` 空实现

- **反例**：`try { await fetchX() } catch (e) {}`
- **正例**：`try { await fetchX() } catch (e) { reportError(e); showToast('加载失败，请重试') }`
- **校验方式**：ESLint `no-empty` 对 `CatchClause` 单独启用 + 人工评审。

### ERR-02（MUST）统一定义 `AppError` 类型区分错误来源（`network` | `business` | `auth` | `unknown`），Axios 拦截器与 SSE 解析层必须将原始异常归一化为 `AppError` 再向上抛出

### ERR-03（MUST）用户可见错误提示与开发调试信息必须分离：面向用户的 Toast/提示文案不得直接展示后端异常堆栈或英文报错原文，技术细节仅通过 `console.error`/日志上报记录

- **反例**：`ElMessage.error(error.stack)`
- **正例**：`ElMessage.error('网络异常，请稍后重试'); logger.report(error)`

### ERR-04（MUST）问答场景的异常提示必须使用 PRD 5.3.4 规定的固定文案，且异常时不得展示来源引用信息（对齐 PRD 9.3.14「不展示虚假来源」）

- **判定标准**：异常状态渲染分支中不引用 `SourceReference` 相关组件/字段。

### ERR-05（SHOULD）网络类错误允许自动重试，最多 2 次，指数退避（1s、2s），业务类错误（4xx）禁止自动重试

---

## 11. 性能规范

### PERF-01（MUST）路由级组件必须使用动态 `import()` 懒加载，禁止在 `router/index.ts` 顶部静态 import 页面组件

- **正例**：`component: () => import('@/features/agent-chat/views/AgentChatView.vue')`
- **校验方式**：ESLint `import/no-dynamic-require` 反向配合脚本检查 `router` 文件中静态 import 数量。

### PERF-02（MUST）`v-for` 必须绑定稳定业务 `key`（如消息 `id`），禁止使用数组下标 `index` 作为 `key`（消息列表存在插入/移除场景）

- **校验方式**：ESLint `vue/require-v-for-key` + 人工检查 `:key="index"` 反模式。

### PERF-03（MUST）对话消息列表超过 200 条时必须启用虚拟滚动（如 `vue-virtual-scroller`），禁止一次性渲染全部历史消息 DOM 节点

- **判定标准**：`agent-chat`、`qa-history` 详情页列表组件在数据量阈值判断后切换渲染策略。

### PERF-04（MUST）搜索输入框、联想查询必须使用 `debounce`（默认 300ms），禁止每次 `keyup` 直接发起请求

### PERF-05（MUST）流式回答渲染必须使用 `requestAnimationFrame` 或批量合并策略更新 DOM，禁止每收到一个字符/token 就触发一次同步 `reactive` 更新导致高频重渲染

- **反例**：`onChunk(text) { message.content += text }`（逐字符触发响应式更新与重渲染）
- **正例**：将增量文本先写入非响应式缓冲，按帧（≤60fps）批量 flush 到 `reactive` 状态。

### PERF-06（MUST）单个路由 chunk 体积（gzip 后）不超过 500KB，主 vendor chunk 不超过 800KB；超出必须在 PR 中说明原因或进行代码分割

- **校验方式**：CI 中 `vite build` 后解析 `dist/` 产物体积，超阈值 CI 失败。

---

## 12. 安全规范

### SEC-01（MUST NOT）禁止使用 `v-html` 渲染未经净化的内容；智能问答回答内容为 Markdown/富文本时，必须经 `marked`（禁用 `html: true`）渲染后再经 `DOMPurify.sanitize()` 白名单净化，方可用 `v-html` 输出

- **反例**：`<div v-html="answer.content" />`（`content` 为模型原始输出或含用户输入）
- **正例**：
  ```ts
  const safeHtml = computed(() => DOMPurify.sanitize(marked.parse(message.content, { async: false }) as string, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  }))
  ```
- **校验方式**：ESLint `vue/no-v-html` 默认禁止，仅 `MessageContent.vue` 一处白名单豁免（行内注释说明已配合 DOMPurify），CI 脚本扫描其余文件不得出现 `v-html`。

### SEC-02（MUST）用户输入的问题原文回显展示时必须走 Vue 默认文本插值 `{{ }}`（自动转义），禁止对用户输入内容使用 `v-html`

### SEC-03（MUST）鉴权 Token 不得存储在无 `httpOnly` 保护的持久化介质中若后端可支持 `httpOnly` Cookie 方案；若因架构限制必须使用 `localStorage`，则页面必须开启严格 CSP（禁止内联脚本、限制 `script-src`）以降低 XSS 窃取风险，并在 §12.1 附录记录该权衡

### SEC-04（MUST NOT）禁止在生产构建中输出包含 Token、用户敏感信息（手机号、密码、问答内容全文）的 `console.log`；构建脚本必须通过 Terser/ESLint 在生产模式下移除或阻断 `console.*`

- **校验方式**：ESLint 规则 `no-console`（生产环境 CI 配置下 `error` 级别，仅 `console.error`/`console.warn` 白名单）。

### SEC-05（MUST）路由守卫必须对管理后台相关路由（P04-01/P05/P06/P07-01/P07-02）校验当前用户角色为管理员，前端路由守卫仅作为体验层拦截，最终数据访问权限必须以后端接口鉴权结果为准，禁止仅靠前端路由隐藏来"保护"数据

- **判定标准**：`router/index.ts` 中管理后台相关路由存在 `meta.roles: ['admin']` 且全局 `beforeEach` 校验；对应 API 请求不因前端校验通过而省略后端 401/403 处理分支。

### SEC-06（MUST）密码输入框必须设置 `autocomplete="new-password"`（修改密码场景）或 `autocomplete="current-password"`（登录场景），不得使用默认 `autocomplete="off"` 依赖浏览器行为不一致

### SEC-07（MUST）第三方依赖新增或升级前必须执行 `npm audit`/`pnpm audit`，存在 High/Critical 漏洞且无可用修复版本时禁止引入，需在 PR 中说明替代方案或风险接受记录

---

## 13. Git 提交规范

### GIT-01（MUST）提交信息遵循 Conventional Commits：`<type>(<scope>): <subject>`

`type` 取值：`feat`/`fix`/`refactor`/`perf`/`style`/`docs`/`test`/`chore`/`build`；`scope` 建议使用 `features/` 下模块名（如 `agent-chat`）。

- **正例**：`feat(agent-chat): 支持流式回答终止后清除未持久化内容`
- **反例**：`修改了一些东西`、`fix bug`
- **校验方式**：Commitlint（`@commitlint/config-conventional`）作为 `commit-msg` Hook 强制校验。

### GIT-02（MUST）单次提交只包含一个逻辑变更，禁止将无关的样式调整、依赖升级与功能开发混入同一提交

### GIT-03（MUST）分支命名格式 `<type>/<module>-<short-desc>`，如 `feat/agent-chat-sse-abort`

### GIT-04（MUST NOT）禁止提交被 `.gitignore` 排除的构建产物、`.env` 本地密钥文件、`node_modules`

### GIT-05（SHOULD）单个 PR 变更文件数不超过 20 个/净增行数不超过 600 行，超出建议拆分为多个 PR

---

## 14. 代码评审规范

### REVIEW-01（MUST）每个 PR 必须至少 1 名非作者本人的评审人 Approve 才可合并

### REVIEW-02（MUST）评审人必须逐项核对以下 Checklist，任一未通过须在评审意见中标注对应规则编号：

1. 命名是否符合 §3（NAME-01~06）
2. 是否存在 `any`/裸 `v-html`/空 `catch`（TS-02、SEC-01、ERR-01）
3. 新增 Store/API 是否落在既定目录与领域划分（DIR、STATE）
4. 流式/取消相关改动是否覆盖 SSE-05（不留痕）、ERR-04（异常不展示虚假来源）
5. 是否新增未走设计变量的硬编码样式（STYLE-05）
6. 单测是否覆盖新增分支（见 §14.3）

### REVIEW-03（MUST）评审意见分级：`[Block]` 必须修复才能合并（对应 MUST/MUST NOT 违反）、`[Suggest]` 建议性意见（对应 SHOULD），不得混用无标记的模糊评论

### REVIEW-04（MUST）涉及 §9 SSE 流式、§15 AI 智能体专项规则的改动，必须补充或更新对应 Vitest 单测（帧解析、取消逻辑、XSS 净化用例），无测试覆盖不予合并

---

## 15. AI 智能体前端专项规范（对话交互页面：P02 问答平台 / P03-01/02 历史记录）

> 本章为在 §9（SSE 流式）、§10（错误处理）、§12（安全）通用规则基础上，针对 Agent 对话交互体验的专项加强规则，冲突时以本章更严格的规则为准。

### AGENT-01（MUST）消息数据模型固定字段结构，禁止渲染层直接消费后端原始 DTO

```ts
export interface QaMessageVo {
  id: string                // 前端本地生成的稳定 UUID，与后端 interactionId 分离
  role: 'user' | 'assistant' | 'system-notice'
  status: 'pending' | 'streaming' | 'done' | 'cancelled' | 'error'
  content: string           // 已净化的可渲染内容（assistant 为 sanitize 后 HTML 字符串来源文本）
  sources: SourceReferenceVo[]
  createdAt: number
}
```

- **判定标准**：`agent-chat` 模块内组件 Props 类型均引用 `QaMessageVo`，不直接使用 `QaInteractionDto`。

### AGENT-02（MUST）消息渲染管线固定为：`原始增量文本 → 按 §9 SSE-03/04 分帧拼接 → marked 解析 Markdown → DOMPurify 净化 → v-html 渲染`，四步骤禁止跳过或调换顺序

### AGENT-03（MUST）来源引用（`SourceReference`）仅允许在 `status === 'done'` 且后端明确返回来源数据时渲染；`status === 'error'` 或来源列表为空时必须隐藏来源区块，禁止渲染占位符/示例来源（对齐 PRD 9.3.14）

- **反例**：来源为空时展示"来源：文档库"兜底文案。
- **正例**：来源为空时来源区块整体 `v-if` 为 `false`。

### AGENT-04（MUST）Loading/状态机必须严格按以下有限状态实现，禁止新增未定义状态或用多个布尔值组合模拟状态机

```
idle → pending（已发送，等待首字节） → streaming（持续接收增量） → done
                                              ↘ cancelled（用户终止）
                                              ↘ error（异常终止）
```

- **判定标准**：`useAgentChatSession` composable 导出的状态字段为单一 `status` 联合类型，禁止同时存在 `isLoading`、`isSending`、`isTyping` 等语义重叠的多个布尔值。

### AGENT-05（MUST）`pending` 状态（等待首字节响应）必须展示"输入中"动效（如三点跳动），与整页 Loading（骨架屏，用于路由/历史列表加载）在组件层面严格区分，禁止复用同一 Loading 组件

- **判定标准**：`TypingIndicator.vue`（消息级）与 `PageSkeleton.vue`（页面级）为两个独立组件，互不引用。

### AGENT-06（MUST）流式过程中用户切换 Tab（工作台 ↔ 历史记录）或关闭页面（`beforeunload`）必须触发 §9 SSE-05 的终止逻辑，不得让流式连接在组件卸载后继续在后台写入已卸载的 Store 状态

- **校验方式**：`useAgentChatSession` 在 `onScopeDispose`/组件 `onUnmounted` 钩子中必须调用 `abort()`；单测断言组件卸载后 `AbortController.abort` 被调用。

### AGENT-07（MUST）"取消发送"（发送前，输入框内容未提交）与"终止生成"（已提交、流式中）为两个不同交互，且均不写入 `qa-history` 与 `query-log`：取消发送直接清空输入框；终止生成需将该消息标记 `cancelled` 并在 3 秒内从会话列表移除，UI 上不得残留"已取消"的僵尸消息超过该时长

- **判定标准**：Vitest 用例断言 `cancelled` 消息在定时器触发后从 `messages` 数组中移除。

### AGENT-08（MUST）用户输入内容在发送前必须做长度校验（上限由后端契约约定，默认前端兜底 2000 字符）与首尾空白 trim，禁止空字符串或纯空白提交

### AGENT-09（MUST）消息队列规则：

1. 同一会话 `status !== 'idle' && status !== 'done' && status !== 'cancelled' && status !== 'error'` 时，发送按钮与输入框必须 `disabled`，不得允许并发第二条流式请求（对齐 SSE-07）；
2. 不做"排队等待自动发送"设计——被禁用期间用户的发送动作应被输入框拦截（无法触发提交），而不是静默加入队列后延迟自动发出；
3. 每条消息必须携带前端生成的唯一 `id`（AGENT-01），渲染层按 `id` 去重，防止网络重试或组件重渲染导致同一消息重复出现在列表中；
4. 增量帧必须按 AGENT-02 管线结合 §9 SSE-04 的 `seq` 顺序处理，乱序帧进入等待缓冲区，不得因乱序导致文本错位或渲染中断。

### AGENT-10（MUST）上下文压缩/重置（PRD 9.3.11：超过 10 轮先压缩再清空）触发时，前端必须在回答区域插入一条 `role: 'system-notice'` 的可感知消息（如"以上对话已整理为摘要，继续提问"/"已超出上下文容量，会话已重置"），不得静默清空前端消息列表

- **判定标准**：`useAgentChatStore` 监听会话轮次达到阈值时，`actions.compressContext()`/`actions.resetContext()` 必须各自 `push` 一条 `system-notice` 消息，单测覆盖两条路径。

### AGENT-11（MUST NOT）禁止将模型/后端返回的原始文本中的 `<script>`、`javascript:` 协议链接、`on*=` 事件属性放行到最终 DOM；DOMPurify 配置必须显式设置 `ALLOWED_URI_REGEXP` 限制链接协议为 `https?`

- **校验方式**：单测用例构造含 `<img src=x onerror=alert(1)>`、`[链接](javascript:alert(1))` 的模拟回答内容，断言净化后 DOM 不含可执行脚本/事件属性/非 http(s) 链接。

### AGENT-12（MUST）多轮对话历史在页面刷新后不得从 `localStorage` 恢复（对齐 STATE-05）；如需"刷新后继续当前会话"体验，必须通过后端会话 ID 重新拉取历史，前端不得本地兜底缓存问答正文

---

## 16. 附录：规则与工具映射速查表

| 规则编号 | 校验工具/方式 |
| --- | --- |
| DIR-01~04 | ESLint `import/*` 规则 + CI 目录结构脚本 |
| NAME-01~06 | ESLint `@typescript-eslint/naming-convention`、`unicorn/filename-case`、`vue/custom-event-name-casing` |
| TS-01~06 | `tsconfig.json` 校验脚本、ESLint `@typescript-eslint/*` |
| COMP-01~06 | ESLint `vue/*` 规则族 + CI 行数统计脚本 |
| STATE-01~05 | 依赖清单检查、人工评审 Checklist |
| STYLE-01~06 | Stylelint 规则族 |
| API-01~05 | ESLint `no-restricted-imports` + 人工评审 |
| SSE-01~07 | Vitest 单测（分帧、终止、乱序） |
| ERR-01~05 | ESLint `no-empty`、`no-console` + 人工评审 |
| PERF-01~06 | ESLint `vue/require-v-for-key` + CI 构建体积脚本 |
| SEC-01~07 | ESLint `vue/no-v-html`、`no-console`、`npm audit` + 路由守卫单测 |
| GIT-01~05 | Commitlint + PR 模板 Checklist |
| REVIEW-01~04 | PR 模板 + 人工评审 |
| AGENT-01~12 | Vitest 专项用例 + 人工评审（对照本章判定标准逐条打勾） |

---

## 17. 智能体开发时读取本规范的使用说明

本节面向执行前端编码任务的 AI 智能体（包括但不限于本仓库 `.claude/agents/` 下配置的智能体）。

1. **加载时机**：任何涉及 `src/` 下代码生成、修改、评审的任务开始前，必须先读取本文件全文（`docs/rules/frontend/frontend-spec.md`），不得仅凭历史记忆或通用前端知识生成代码。
2. **优先级**：本规范中标注 **MUST/MUST NOT** 的规则，其约束力高于智能体自身的默认代码风格偏好与通用最佳实践；当用户指令与本规范的 MUST 规则冲突时，智能体必须先向用户明确指出冲突点（引用规则编号）并等待确认，禁止默默违反规则或默默改写用户需求。
3. **生成后自检**：代码生成完成后，智能体必须对照 §16 速查表逐类自检一次，尤其是：
   - 是否引入 `any`（TS-02）；
   - 是否存在裸 `v-html`（SEC-01）；
   - 是否新增未走 §9/§15 统一封装的 `fetch`/`EventSource`（SSE-01）；
   - 涉及取消/终止逻辑是否满足"不留痕"（SSE-05、AGENT-07）。
4. **规则引用方式**：智能体在 PR 描述、评审意见或与用户的说明中，涉及规范相关判断时必须引用具体规则编号（如"已按 AGENT-10 补充上下文压缩提示消息"），不得使用"已遵循前端规范"这类无法定位的笼统表述。
5. **规则缺失处理**：若任务场景本规范未覆盖（无对应规则编号可引用），智能体应按 §1.1 等级定义的最相近类别自行提出建议规则并在交付说明中标注"本规范未覆盖，建议新增规则：……"，交由人工评审决定是否补录本文档，禁止擅自创造规则并声称"符合规范"。
6. **版本核对**：智能体应核对本文件 §0 的"版本"字段与自身记忆/缓存中的版本是否一致；若怀疑规范已更新，必须重新读取文件而非使用缓存内容。
7. **变更本规范**：智能体不得在未经用户明确要求的情况下自行修改本文件内容；确需修改（如新增规则编号、更新技术选型）时，必须同步更新 §0 修改记录表并保持版本号递增（补丁级修订 `V1.0 → V1.1`，破坏性调整 `V1.x → V2.0`）。
