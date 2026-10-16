 **后端完整开发规范**

OARA（OMS 智能问答系统）
后端技术栈：NestJS (Node.js) 网关服务 + 独立 Python AI 服务；Nest 职责：鉴权、权限、限流、traceId、参数校验、请求转发、SSE 透传；**Nest 禁止实现 LLM、FunctionCalling、RAG 核心 AI 逻辑**，AI 能力全部下沉至 Python AI 服务。

## 0. 文档信息

| 项目 | 内容 |
| --- | --- |
| 文档名称 | OARA（OMS 智能问答系统）后端开发规范 |
| 版本 | V1.1 |
| 生效范围 | NestJS 网关代码 `aigc/backend-gateway/`（`src/`、`prisma/`、`test/`、`scripts/`），包含业务模块、AI 代理转发模块、权限模块。`aigc/api-contracts/`、`aigc/auto-test/` 为前后端与测试共用目录，本规范只约束其放置位置及网关对契约的引用方式，不把二者归入网关目录。覆盖人工开发者与 AI 编码智能体两类执行主体 |
| 适用技术栈 | NestJS + Node.js + TypeScript (strict)；ORM：Prisma；缓存 Redis；HTTP 客户端 undici；SSE 流式透传；校验 class-validator；鉴权 JWT；日志 Winston；熔断重试 opossum；数据库 MySQL |
| 状态 | 生效 |
| 创建日期 | 2026-10-16 |
| 更新日期 | 2026-10-16 |
| 依据 | `docs/prd/01-OARA-PRD.md`、`docs/prd/02-领域模型.md`、`aigc/api-contracts/` 接口契约 |

### 修改记录

| 日期 | 版本 | 修改人 | 修改内容 |
| --- | --- | --- | --- |
| 2026-10-16 | V1.0 | 后端架构组 | 首版发布，覆盖全部章节、Nest 网关专项、SSE 透传专项，面向 AI 编码智能体 |
| 2026-10-16 | V1.1 | 后端架构组 | 按当前仓库校正目录：网关限定为 `aigc/backend-gateway/`；`api-contracts/`、`auto-test/` 改为与前端、网关平级的共用目录；去掉网关内 `docs/`；补充 `aigc/ai-service/` 边界；修正本文件引用路径 |

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

本规范禁止 "尽量"" 合理 ""美观" 等无法判定的表述。每条规则必须满足以下三者之一：

1. 可由 ESLint / TSConfig / Nest CLI 静态检测；
2. 可由文件结构、命名正则、行数等脚本检测；
3. 若无法自动化，必须给出人工评审可逐项打勾的判定标准（是 / 否二值）。

---

## 2. 项目目录规范

目录以当前仓库为准：应用代码在 `aigc/`（已有 `aigc/frontend/`），产品与规范文档在仓库根 `docs/`（已有 `prd/`、`rules/`、`meeting/`、`tasks/`）。网关只新增 `aigc/backend-gateway/`。`api-contracts/`、`auto-test/` 供前端、网关、测试共同使用，与 `frontend/`、`backend-gateway/` 平级，禁止放入网关目录。

### DIR-01（MUST）目录结构固定，新增顶级目录须经架构评审

```
aigc/
├── frontend/                       # 已有 Vue 前端；内部结构见 docs/rules/frontend/frontend-spec.md
├── backend-gateway/                # NestJS 网关，本规范的代码根
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── common/                 # 全局过滤器、守卫、拦截器、管道、异常过滤器
│   │   └── modules/                # 按领域划分，一个领域一个 Module
│   ├── test/                       # Nest 单元 / e2e，只覆盖网关自身
│   ├── prisma/                     # Prisma schema、数据库迁移脚本
│   ├── scripts/                    # 网关运维、初始化脚本
│   ├── .env / .env.development / .env.production
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
├── ai-service/                     # 独立 Python AI 服务（LLM、FunctionCalling、RAG）；本规范不展开其内部目录
├── api-contracts/                  # 共用契约：TS 类型、DTO、枚举、路由、错误码；禁止放入 backend-gateway
└── auto-test/                      # 共用 API 自动化测试，由智能体生成，人工不维护；禁止放入 backend-gateway
```

仓库根另有 `docs/`（文档）和 `test/`（现有智能体提示词，不是网关测试，也不是 `auto-test/`）。这两处保持现状，网关代码、契约、API 自动化测试都不得写入其中。

- **判定标准**：
  1. `aigc/backend-gateway/` 根目录不存在上表未列出的顶级目录；尤其禁止出现 `api-contracts/`、`auto-test/`、`docs/`。
  2. 业务代码全部放置在 `aigc/backend-gateway/src/modules/`。
  3. `api-contracts/`、`auto-test/` 只允许位于 `aigc/api-contracts/`、`aigc/auto-test/`。
  4. LLM、FunctionCalling、RAG 代码只允许位于 `aigc/ai-service/`，禁止出现在 `aigc/backend-gateway/`。

### DIR-02（MUST）业务模块按领域划分，一个领域一个 Module，禁止按技术层（controller/service）横向拆分顶层文件夹

- **正例**：`aigc/backend-gateway/src/modules/ai-proxy/`、`aigc/backend-gateway/src/modules/auth/`
- **反例**：`aigc/backend-gateway/src/controllers/`、`aigc/backend-gateway/src/services/` 顶层目录
- **校验方式**：脚本扫描 `aigc/backend-gateway/src/` 的直接子目录，禁止存在 `controllers/`、`services/`。

### DIR-03（MUST）全局切面（过滤器、守卫、拦截器、管道、异常过滤器）统一放在 `aigc/backend-gateway/src/common/`，业务模块内禁止新增全局作用域的守卫 / 拦截器

- **判定标准**：`aigc/backend-gateway/src/modules/**` 内不包含 `@Injectable()` 全局作用域守卫、拦截器；模块内部件仅允许 `provider` 限定为模块作用域。

### DIR-04（MUST）`aigc/api-contracts/` 作为前后端与 `auto-test/` 的单一契约源，DTO、请求参数、响应类型、业务错误码统一在此定义；网关业务模块内部禁止重复定义对外 API 入参 / 出参类型，也禁止把契约文件复制进网关目录

- **引用方式**：网关 `tsconfig.json` 用路径别名 `@contracts/*` 指向 `../api-contracts/*`。Controller、Service 只从 `@contracts` 导入对外类型。
- **校验方式**：ESLint 禁止在 `aigc/backend-gateway/src/modules/**` 内定义用于 Controller 对外暴露的 DTO；目录脚本确认不存在 `aigc/backend-gateway/api-contracts/`。

### DIR-05（MUST NOT）模块之间禁止直接跨模块导入 Service，必须通过导出 Module 的公开接口暴露能力；私有服务仅模块内部可访问

- **反例**：`ai-proxy`模块直接 import `auth`模块内部 AuthService
- **正例**：`auth.module`导出 AuthService，ai-proxy 模块导入 AuthModule，依赖注入使用
- **校验方式**：ESLint import 限制规则，禁止导入模块深层私有路径。

### DIR-06（MUST）网关内部路径引用统一使用别名 `@/`（指向 `aigc/backend-gateway/src/`），禁止 `../../../` 三级及以上相对路径。引用 `aigc/api-contracts/` 只用 `@contracts/`，禁止用相对路径跨出网关目录

- **校验方式**：ESLint 规则 `no-restricted-imports`，相对路径正则 `^(\.\.\/){3,}` 报错；出现 `../api-contracts` 同样报错。

---

## 3. 命名规范

### NAME-01（MUST）文件命名

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| Controller / Service / Guard / Filter / Interceptor / Pipe | kebab-case | `ai-proxy.controller.ts`、`trace.interceptor.ts` |
| Module 文件 | kebab-case | `ai-proxy.module.ts` |
| DTO / 类型文件 | kebab-case | `qa-ask.dto.ts` |
| 测试文件 | 同源文件名后缀 `.spec.ts` | `ai-proxy.controller.spec.ts` |

- **反例**：`AiProxyController.ts`（文件 PascalCase）。
- **校验方式**：ESLint `unicorn/filename-case` 按上表分文件类型配置正则。

### NAME-02（MUST）类名（Controller、Service、Guard、DTO）使用 PascalCase；变量与函数使用 camelCase；常量使用 `SCREAMING_SNAKE_CASE`；接口 / 类型 PascalCase

- **正例**：`AiProxyController`、`const MAX_STREAM_TIMEOUT = 120000`、`interface QaAskParams {}`
- **反例**：`aiProxyController`、`const maxStreamTimeout = 120000`业务常量
- **校验方式**：ESLint `@typescript-eslint/naming-convention`。

### NAME-03（MUST NOT）禁止无意义命名（`data`、`temp`、`obj`、`flag`、单字母变量，循环下标 i/j 除外）

- **校验方式**：人工评审逐行检查；PR 评审 Checklist 项。

### NAME-04（MUST）数据库表、字段命名：下划线小写 `snake_case`，Prisma 模型内映射保持与数据库一致；代码内部实体属性使用 camelCase

- **正例**：DB 字段 `created_at`，Prisma 实体 `createdAt`

### NAME-05（MUST）接口路由命名：全部小写，kebab-case，资源名词优先

- **正例**：`POST /api/qa/ask`、`GET /api/qa/history`
- **反例**：`/api/Qa/Ask`、`/api/getQaHistory`

---

## 4. TypeScript 类型规范

### TS-01（MUST）`tsconfig.json` 必须开启 `"strict": true`，不得关闭 `strictNullChecks`/`noImplicitAny`

- **校验方式**：CI 脚本读取 tsconfig 校验字段，任一 false 则 CI 失败。

### TS-02（MUST NOT）禁止显式声明 `any`；确需绕过类型检查时必须使用 `unknown` + 类型收窄，添加注释说明原因 `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 原因`

- **校验方式**：ESLint `@typescript-eslint/no-explicit-any: error`。

### TS-03（MUST）Controller 入参、返回体、Prisma 查询结果必须显式声明类型，禁止依赖隐式推断作为对外契约

- **校验方式**：ESLint `@typescript-eslint/explicit-function-return-type` 对 controller、service 启用。

### TS-04（MUST）领域模型类型必须对齐 `docs/prd/02-领域模型.md`，字段命名一一对应；新增 / 修改字段必须在 PR 标注 PRD 章节

- **判定标准**：`aigc/api-contracts/` 内 DTO、Vo、Params 与领域模型逐项比对。

### TS-05（SHOULD）优先使用联合字面量类型代替 enum；需要多处引用常量集合时使用 `as const` 对象

- **正例**：

```
export const QA_INTERACTION_STATUS = {
  PENDING: 'pending',
  STREAMING: 'streaming',
  DONE: 'done',
  CANCELLED: 'cancelled',
  ERROR: 'error',
} as const
export type QaInteractionStatus = typeof QA_INTERACTION_STATUS[keyof typeof QA_INTERACTION_STATUS]
```

- **校验方式**：ESLint `no-restricted-syntax` 限制数字枚举。

### TS-06（MUST）所有对外 API 响应统一包裹为 `ApiResponse<T>` 泛型，禁止裸类型直接返回

```
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  traceId: string
}
```

- **校验方式**：人工评审 controller 返回结构。

---

## 5. Nest 模块 & Controller 规范

### NEST-01（MUST）Controller 仅负责：路由定义、DTO 校验、注入服务调用、SSE 流转发；**禁止业务逻辑、数据库操作、AI 逻辑写在 Controller 内**

- **判定标准**：controller 中不存在复杂 if 判断、prisma 调用、LLM 调用。

### NEST-02（MUST）所有入参校验统一使用 class-validator + class-transformer，禁止在业务代码手写参数 if 判断校验

- **校验方式**：ESLint 扫描 controller，禁止手写参数校验逻辑。

### NEST-03（MUST）路由必须增加 `@ApiOperation`、`@ApiResponse` 注解；接口文档信息写在 controller 装饰器

### NEST-04（MUST）JWT 鉴权守卫全局启用；所有管理后台接口必须附加角色守卫校验；鉴权校验放在守卫，禁止在 service 内写鉴权逻辑

### NEST-05（MUST NOT）Nest 网关内部禁止编写 LLM、RAG、FunctionCalling 等 AI 核心逻辑，仅做转发代理。AI 能力调用请求转发到独立 Python AI 服务

- **判定标准**：`aigc/backend-gateway/src/` 内无任何大模型 prompt 组装、向量检索逻辑；相关逻辑全部在 `aigc/ai-service/`。

### NEST-06（MUST）SSE 流式接口使用 Nest StreamableResponse，转发 Python 服务返回流；必须透传完整 data 帧，不能修改 SSE 帧业务 payload；必须维护 traceId 贯穿整条链路

### NEST-07（MUST）每个接口必须携带 traceId，由全局拦截器统一生成，日志、异常返回、ApiResponse 必须输出 traceId。

---

## 6. Service & 业务逻辑规范

### SVC-01（MUST）业务逻辑全部写在 Service，Controller 仅做调度。

### SVC-02（MUST）Service 按单一职责划分；单个 Service 文件代码行数上限 300 行，超出拆分为多个 Service。

- **校验方式**：CI 脚本统计 ts 行数，超限 CI 告警。

### SVC-03（MUST）数据库操作仅允许在 Service 层调用 PrismaClient；Controller 禁止直接操作 Prisma。

### SVC-04（MUST）外部 HTTP 调用（调用 Python AI 服务）统一封装在专用 proxy service，业务 service 不能直接发起 undici 请求。

### SVC-05（SHOULD）外部远程调用增加熔断、超时、重试策略，使用 opossum；业务错误（4xx）禁止重试；网络异常最多重试 2 次。

### SVC-06（MUST NOT）禁止在 Service 内硬编码密钥、模型地址、超时时间；全部配置读取环境变量，使用 ConfigService。

---

## 7. 数据库 & Prisma 规范

### DB-01（MUST）所有数据库变更必须走 Prisma migration，禁止手动改库。

### DB-02（MUST）禁止 SELECT *，查询必须显式指定字段列表。

- **校验方式**：静态脚本扫描 prisma 查询语句。

### DB-03（MUST）大列表查询必须分页；不允许无分页全表查询。默认分页参数 `page` / `pageSize`，pageSize 上限 100。

### DB-04（MUST）业务表必须包含字段：`id`、`created_at`、`updated_at`、`deleted_at`（软删除）。

### DB-05（MUST NOT）事务跨多个不同数据库；长事务禁止，事务执行时间上限 5s。

### DB-06（MUST）高频查询字段必须建索引；新增索引需要在 PR 说明查询场景。

---

## 8. Redis & 缓存规范

### CACHE-01（MUST）缓存 key 统一命名规范 `oara:{module}:{business}:{id}`，例：`oara:qa:session:1001`

### CACHE-02（MUST）缓存必须设置 TTL，禁止永久 key；敏感会话信息 TTL 对齐会话有效期。

### CACHE-03（MUST NOT）缓存直接存储完整大对象，大对象需要序列化 / 压缩；缓存不可存储数据库唯一真值，数据库为数据源。

### CACHE-04（SHOULD）缓存更新策略优先采用数据库更新后失效缓存，避免缓存更新并发问题。

---

## 9. SSE 流式透传专项规范（AI 问答接口专用）

### SSE-01（MUST）网关仅透传 Python AI 服务的 SSE 流，网关不解析业务 data 内部 JSON，仅透传原始帧。网关只处理链路异常、超时、traceId、CORS。

### SSE-02（MUST）流式接口必须设置服务端超时，默认 120s；超时主动关闭流并返回 error 帧。

### SSE-03（MUST）客户端 abort 断开连接时，网关必须同步向下游 Python AI 服务发送取消请求，释放下游算力。

### SSE-04（MUST）SSE 响应头必须正确设置：`Content-Type: text/event-stream`，`Cache-Control: no-cache`，`Connection: keep-alive`

### SSE-05（MUST NOT）网关修改 SSE 帧内业务字段、seq、type；帧结构 `data: <json>\n\n` 由 Python AI 服务保证。

### SSE-06（MUST）同一用户同一会话同一时刻只允许一条 SSE 流式请求，网关增加会话并发限制，重复请求直接返回 409。

---

## 10. 异常 & 错误处理规范

### ERR-01（MUST）所有异步调用（数据库、HTTP 远程调用）必须捕获异常，禁止空 catch。

- **反例**：`try{ await xxx() }catch(e){}`
- **校验方式**：ESLint `no-empty` 针对 CatchClause 启用。

### ERR-02（MUST）统一全局异常过滤器，所有异常归一化为业务错误码，统一返回 ApiResponse 结构，自动注入 traceId。业务代码禁止手动构造完整返回体。

### ERR-03（MUST）日志区分级别：debug/info/warn/error；生产环境关闭 debug 日志；error 级别日志必须包含 traceId、堆栈。

### ERR-04（MUST NOT）返回给前端的 message 禁止直接抛出原始数据库异常、底层堆栈信息；底层详情仅写入服务端日志。

### ERR-05（MUST）业务错误码统一管理，定义在 `aigc/api-contracts/`，禁止 controller/service 内硬编码错误数字。

---

## 11. 安全规范

### SEC-01（MUST）入参必须校验长度、格式，防 SQL 注入；Prisma 参数化查询天然防护，禁止拼接 SQL 字符串。

### SEC-02（MUST NOT）日志打印完整 token、密码、用户敏感问答内容。

### SEC-03（MUST）接口限流：登录、问答接口配置 IP + 用户维度限流，防止高频刷接口。

### SEC-04（MUST）CORS 配置白名单域名，生产禁止`*`通配符。

### SEC-05（MUST）权限最小原则：接口校验权限，前端路由校验仅体验层，**后端 MUST 校验数据访问权限**，不能信任前端传入的权限标识。

### SEC-06（MUST NOT）环境密钥提交到代码仓库；敏感配置全部通过环境变量注入。

---

## 12. 性能规范

### PERF-01（MUST）数据库查询避免 N+1 问题；Prisma 查询使用 include 预加载关联数据。

### PERF-02（MUST）批量操作禁止循环单条 insert/update，使用 Prisma `createMany`。

### PERF-03（MUST）大查询结果不一次性加载全部到内存，分页 / 流式输出。

### PERF-04（SHOULD）高频接口增加 Redis 缓存；慢 SQL 必须增加索引或者优化查询。

### PERF-05（MUST）同步阻塞代码禁止在主事件循环；重任务交给下游 Python 服务。

---

## 13. Git 提交规范

### GIT-01（MUST）提交信息遵循 Conventional Commits：`<type>(<scope>): <subject>`

type 取值：`feat`/`fix`/`refactor`/`perf`/`style`/`docs`/`test`/`chore`/`build`；scope 使用模块名如`ai-proxy`。

- **正例**：`feat(ai-proxy): SSE流支持客户端abort取消下游请求`

### GIT-02（MUST）单次提交只包含一个逻辑变更，无关改动不能混在一次提交。

### GIT-03（MUST）分支命名格式 `<type>/<module>-<short-desc>`，如 `feat/ai-proxy-sse-cancel`

### GIT-04（MUST NOT）禁止提交 `.env`、构建产物、node_modules、数据库 dump 文件。

### GIT-05（SHOULD）单个 PR 变更文件数不超过 20，净增代码不超过 600 行，超大 PR 建议拆分。

---

## 14. 代码评审规范

### REVIEW-01（MUST）每个 PR 必须至少 1 名非作者评审人 Approve 才可合并。

### REVIEW-02（MUST）评审逐项核对 Checklist，任意项不通过，标记 Block，引用规则编号：

1. 命名规范 NAME 系列是否合规
2. any、空 catch、硬编码密钥（TS-02，ERR-01，SEC-06）
3. 模块分层是否符合 DIR、NEST，AI 逻辑是否写在网关内（NEST-05）
4. SSE 透传、取消、并发控制是否满足 SSE 专项规则
5. DB 查询是否使用 select *，有无无分页查询（DB-02，DB-03）
6. 新增接口权限校验、限流是否完整
7. 单元 /e2e 测试是否覆盖新增分支

### REVIEW-03（MUST）评审意见分级：`[Block]`必须修复（MUST/MUST NOT），`[Suggest]`建议项（SHOULD），禁止模糊无编号评论。

### REVIEW-04（MUST）涉及 SSE、AI 代理转发、权限改动，必须补充单元 /e2e 测试，无测试覆盖不予合并。

---

## 15. 单元 & E2E 测试规范

### TEST-01（MUST）Service 核心业务逻辑编写单元测试；Controller 编写 e2e 接口测试。

### TEST-02（MUST）网关测试文件后缀 `.spec.ts`，放在被测文件同目录或 `aigc/backend-gateway/test/`。仓库级 API 自动化测试只放 `aigc/auto-test/`，禁止把网关单测或 e2e 写入 `auto-test/`，也禁止写入仓库根 `test/`。

### TEST-03（MUST）SSE 流式接口必须编写 e2e 测试，覆盖正常流、取消、超时、异常场景。

### TEST-04（MUST NOT）单元测试连接真实生产数据库；使用测试数据库或 mock 对象。

### TEST-05（SHOULD）核心业务分支测试覆盖率 ≥80%。

---

## 16. 附录：规则与工具映射速查表

| 规则编号 | 校验工具 / 方式 |
| --- | --- |
| DIR-01~06 | ESLint import 规则 + CI 目录脚本 |
| NAME-01~05 | ESLint `@typescript-eslint/naming-convention`、`unicorn/filename-case` |
| TS-01~06 | tsconfig 校验脚本、ESLint typescript 规则 |
| NEST-01~07 | ESLint + 人工评审 Checklist |
| SVC-01~06 | 人工评审 + CI 行数统计 |
| DB-01~06 | Prisma migrate 脚本、静态 SQL 扫描脚本 |
| CACHE-01~04 | 人工评审 |
| SSE-01~06 | e2e 测试 + 人工评审 |
| ERR-01~05 | ESLint no-empty + 日志审计脚本 |
| SEC-01~06 | ESLint + 依赖安全扫描 npm audit |
| PERF-01~05 | Prisma 查询静态扫描、慢 SQL 检测 |
| GIT-01~05 | Commitlint + pre-commit hook |
| REVIEW-01~04 | PR 模板 + 人工评审 |
| TEST-01~05 | Jest + e2e 测试脚本，覆盖率统计 |

---

## 17. 智能体开发时读取本规范的使用说明

本节面向执行后端编码任务的 AI 智能体。

1. **加载时机**：任何涉及 `aigc/backend-gateway/` 的代码生成、修改、评审，或决定 `aigc/api-contracts/`、`aigc/auto-test/` 放置位置的任务开始前，必须先读取本文件全文（`docs/rules/backend/structure.md`），不得仅凭历史记忆或通用后端知识生成代码。
2. **优先级**：本规范中标注 **MUST/MUST NOT** 的规则，约束力高于智能体默认代码风格偏好；用户指令与 MUST 规则冲突，智能体必须指出冲突，引用规则编号，等待确认，禁止静默违反。
3. **生成后自检**：代码生成完成，智能体对照 §16 速查表自检，重点：
   - 是否引入 any 类型（TS-02）
   - `api-contracts/`、`auto-test/` 是否放在 `aigc/` 下与网关平级，而未写入 `aigc/backend-gateway/`（DIR-01、DIR-04）
   - Nest 网关是否包含 LLM/RAG AI 业务逻辑（NEST-05）
   - SSE 逻辑是否仅透传、不修改业务帧（SSE-01）
   - 数据库查询是否 SELECT *，是否缺少分页（DB-02，DB-03）
4. **规则引用方式**：PR 描述、评审意见，引用具体规则编号，如`已按SSE-03实现客户端断开同步取消下游请求`，禁止笼统描述 “遵循后端规范”。
5. **规则缺失处理**：场景无对应规则编号，智能体提出建议规则，标注`本规范未覆盖，建议新增规则`，交给人工评审决定是否补充文档，禁止自行创造规则。
6. **版本核对**：智能体核对 §0 版本，若文档更新，重新读取文件，不使用缓存。
7. **变更本规范**：智能体不可自行修改本文档；如需修改，同步更新 §0 修改记录，版本号递增。