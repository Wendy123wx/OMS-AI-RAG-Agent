// 智能问答上下文类型（TS-04：字段命名与 docs/prd/02-领域模型.md 第2/3节聚合逐一对齐）

export type Role = 'user' | 'admin'
export type AccountStatus = 'normal' | 'disabled'

export interface UserAccount {
  accountId: string
  username: string
  email?: string
  avatar?: string
  role: Role
  status: AccountStatus
  createdAt: string
  updatedAt: string
}

export type AnswerSourceKind = 'knowledge_document' | 'order_query'

export interface HitSnippet {
  content: string
}

export interface SourceReference {
  kind: AnswerSourceKind
  locator: string // 文档检索路径 / "订单系统实时查询"
  documentName?: string // 仅 kind = knowledge_document 时存在
  hitSnippet?: HitSnippet // 仅 kind = knowledge_document 时存在
}

export type GenerationStatus = 'pending' | 'streaming' | 'done' | 'cancelled' | 'error'
export type AnswerResultType = 'normal' | 'exception'
export type AnswerExceptionKind =
  | 'unrelated'
  | 'kb_miss'
  | 'kb_service_error'
  | 'order_no_result'
  | 'order_call_failed'
  | 'generation_failed'

export interface QaInteraction {
  interactionId: string
  question: string
  answer?: string
  sources: SourceReference[]
  status: GenerationStatus
  resultType?: AnswerResultType
  exceptionKind?: AnswerExceptionKind
  submittedAt: string
  completedAt?: string
}

export interface CompressedContext {
  summary: string
  coveredTurnCount: number
}

export interface QaSession {
  sessionId: string
  interactions: QaInteraction[]
  compressedContext?: CompressedContext
  createdAt: string
}

// 渲染层专用模型（AGENT-01），组件 Props 只消费本类型，不直接用 QaInteraction
export interface QaMessageVo {
  id: string
  role: 'user' | 'assistant' | 'system-notice'
  status: GenerationStatus
  content: string
  sources: SourceReference[]
  createdAt: number
}
