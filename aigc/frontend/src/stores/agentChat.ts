import { defineStore } from 'pinia'

import * as qaApi from '@/api/qa'
import { QA_ASK_STREAM_URL } from '@/api/qa'
import { useSseStream, type SseFrame, type UseSseStreamReturn } from '@/composables/useSseStream'
import type {
  AnswerExceptionKind,
  GenerationStatus,
  QaInteraction,
  QaMessageVo,
  QaSession,
  SourceReference,
} from '@/types/qa'

import { useAuthStore } from './auth'

export interface AgentChatState {
  session: QaSession | null
  messages: QaMessageVo[]
  status: GenerationStatus | 'idle'
}

// AGENT-10：上下文边界，超过 10 轮先压缩、压缩后仍超限再清空（领域模型：有效上下文 = 最近10轮 + 压缩摘要）
const MAX_CONTEXT_TURNS = 10
// AGENT-08：前端兜底问题长度上限
const MAX_QUESTION_LENGTH = 2000
// AGENT-07：终止生成后消息在 UI 上保留的最长时长
const CANCELLED_MESSAGE_TTL = 3000

// ERR-04：问答异常必须使用 PRD 5.3.4 规定的固定文案，禁止展示原始错误堆栈
const EXCEPTION_MESSAGES: Record<AnswerExceptionKind, string> = {
  unrelated: '系统提示：该问题暂时无法回答',
  kb_miss: '未找到相关业务文档，请尝试换个问法或联系管理员补充知识库。',
  kb_service_error: '文档检索暂时不可用，请稍后重试。',
  order_no_result: '未查询到相关订单信息，请核对订单号后重试。',
  order_call_failed: '订单查询暂时不可用，请稍后重试。',
  generation_failed: '答案生成失败，请稍后重试。',
}

function createMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createInteractionId(): string {
  return `itc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function interactionsToMessages(interactions: QaInteraction[]): QaMessageVo[] {
  const result: QaMessageVo[] = []
  for (const interaction of interactions) {
    result.push({
      id: `${interaction.interactionId}-q`,
      role: 'user',
      status: 'done',
      content: interaction.question,
      sources: [],
      createdAt: new Date(interaction.submittedAt).getTime(),
    })
    result.push({
      id: `${interaction.interactionId}-a`,
      role: 'assistant',
      status: interaction.status === 'error' ? 'error' : 'done',
      content: interaction.answer ?? '',
      sources: interaction.sources,
      createdAt: new Date(interaction.completedAt ?? interaction.submittedAt).getTime(),
    })
  }
  return result
}

// 以下为本 Store 私有的非响应式运行态（不属于契约 state 字段，仅用于承载单一活跃流式请求的
// AbortController 与定时器句柄，STATE-04：异步流程闭环在 action 内完成）
let activeStream: UseSseStreamReturn | null = null
let cancelledMessageTimer: ReturnType<typeof setTimeout> | null = null

// useAgentChatStore（AGENT-04 单一状态机字段；T03 补全内部实现，签名不变）
export const useAgentChatStore = defineStore('agentChat', {
  state: (): AgentChatState => ({
    session: null,
    messages: [],
    status: 'idle',
  }),
  getters: {
    isStreaming(state): boolean {
      return state.status === 'pending' || state.status === 'streaming'
    },
    canSend(state): boolean {
      return (
        state.status === 'idle' ||
        state.status === 'done' ||
        state.status === 'cancelled' ||
        state.status === 'error'
      )
    },
  },
  actions: {
    async startSession(): Promise<void> {
      try {
        const res = await qaApi.fetchCurrentSession()
        this.session = res.data
      } catch {
        const res = await qaApi.createSession()
        this.session = res.data
      }
      this.messages = interactionsToMessages(this.session?.interactions ?? [])
      this.status = 'idle'
    },

    async newSession(): Promise<void> {
      const res = await qaApi.createSession()
      this.session = res.data
      this.messages = []
      this.status = 'idle'
    },

    async sendQuestion(text: string): Promise<void> {
      const trimmed = text.trim()
      if (!trimmed || !this.canSend) {
        return
      }
      const question = trimmed.slice(0, MAX_QUESTION_LENGTH)

      if (!this.session) {
        await this.startSession()
      }
      if (!this.session) {
        return
      }
      const sessionId = this.session.sessionId

      const submittedAt = new Date().toISOString()
      const userMessageId = createMessageId()
      const assistantMessageId = createMessageId()

      this.messages.push({
        id: userMessageId,
        role: 'user',
        status: 'done',
        content: question,
        sources: [],
        createdAt: Date.now(),
      })
      this.messages.push({
        id: assistantMessageId,
        role: 'assistant',
        status: 'pending',
        content: '',
        sources: [],
        createdAt: Date.now(),
      })
      this.status = 'pending'

      // AGENT-09.4 / SSE-04：乱序帧进入等待缓冲区，按 seq 顺序拼接
      const frameBuffer = new Map<number, SseFrame>()
      let expectedSeq = 1
      // PERF-05：增量文本先写入非响应式缓冲，按帧批量 flush，避免逐字符触发响应式更新
      let pendingDelta = ''
      let flushHandle: number | null = null

      const findAssistantMessage = (): QaMessageVo | undefined =>
        this.messages.find((message) => message.id === assistantMessageId)

      const flushPendingDelta = (): void => {
        if (!pendingDelta) {
          return
        }
        const message = findAssistantMessage()
        if (message) {
          message.content += pendingDelta
        }
        pendingDelta = ''
      }

      const scheduleFlush = (): void => {
        if (flushHandle !== null) {
          return
        }
        flushHandle = requestAnimationFrame(() => {
          flushHandle = null
          flushPendingDelta()
        })
      }

      const finalizeInteraction = (
        resultType: 'normal' | 'exception',
        exceptionKind?: AnswerExceptionKind,
      ): void => {
        const message = findAssistantMessage()
        if (!this.session || !message) {
          return
        }
        const interaction: QaInteraction = {
          interactionId: createInteractionId(),
          question,
          answer: message.content,
          sources: message.sources,
          status: message.status,
          resultType,
          exceptionKind,
          submittedAt,
          completedAt: new Date().toISOString(),
        }
        this.session.interactions.push(interaction)

        // AGENT-10：满 10 轮先压缩，压缩后仍超限再清空，均以 system-notice 呈现
        const turnCount = this.session.interactions.length
        if (turnCount > MAX_CONTEXT_TURNS) {
          if (!this.session.compressedContext) {
            this.compressContext()
          } else {
            this.resetContext()
          }
        }
      }

      const applyFrame = (frame: SseFrame): void => {
        if (frame.type === 'chunk') {
          const data = frame.data as { delta?: string }
          if (this.status === 'pending') {
            this.status = 'streaming'
            const message = findAssistantMessage()
            if (message) {
              message.status = 'streaming'
            }
          }
          pendingDelta += data.delta ?? ''
          scheduleFlush()
        } else if (frame.type === 'source') {
          const data = frame.data as { sources?: SourceReference[] }
          const message = findAssistantMessage()
          if (message && data.sources) {
            message.sources = data.sources
          }
        } else if (frame.type === 'done') {
          flushPendingDelta()
          const message = findAssistantMessage()
          if (message) {
            message.status = 'done'
          }
          this.status = 'done'
          finalizeInteraction('normal')
        } else if (frame.type === 'error') {
          flushPendingDelta()
          const data = frame.data as { exceptionKind?: AnswerExceptionKind }
          const exceptionKind = data.exceptionKind ?? 'generation_failed'
          const message = findAssistantMessage()
          if (message) {
            message.status = 'error'
            // ERR-04/AGENT-03：异常态使用固定文案，不展示虚假来源
            message.content = EXCEPTION_MESSAGES[exceptionKind]
            message.sources = []
          }
          this.status = 'error'
          finalizeInteraction('exception', exceptionKind)
        }
      }

      const processOrderedFrame = (frame: SseFrame): void => {
        if (frame.seq < expectedSeq) {
          return
        }
        if (frame.seq > expectedSeq) {
          frameBuffer.set(frame.seq, frame)
          return
        }
        applyFrame(frame)
        expectedSeq += 1
        while (frameBuffer.has(expectedSeq)) {
          const buffered = frameBuffer.get(expectedSeq)
          if (!buffered) {
            break
          }
          frameBuffer.delete(expectedSeq)
          applyFrame(buffered)
          expectedSeq += 1
        }
      }

      const stream = useSseStream({
        onFrame: processOrderedFrame,
        onError: (error) => {
          flushPendingDelta()
          const message = findAssistantMessage()
          if (message) {
            message.status = 'error'
            // SSE-06：网络中断不自动重连重放，仅提示已中断并保留已生成部分内容
            message.content = message.content
              ? `${message.content}\n\n（回答已中断，请重新提问）`
              : '答案生成失败，请稍后重试。'
          }
          this.status = 'error'
          console.error('问答流式请求异常', error)
        },
      })
      activeStream = stream

      const authStore = useAuthStore()
      const requestBody: Record<string, unknown> = {
        sessionId,
        question,
      }

      try {
        await stream.start(QA_ASK_STREAM_URL, requestBody, authStore.token)
      } finally {
        if (activeStream === stream) {
          activeStream = null
        }
      }
    },

    cancelBeforeSend(): void {
      // AGENT-07：发送前取消不涉及网络请求，仅确保状态回到 idle，输入框清空由组件负责
      if (this.canSend) {
        this.status = 'idle'
      }
    },

    stopGeneration(): void {
      if (!this.isStreaming) {
        return
      }
      activeStream?.abort()
      activeStream = null

      const message = this.messages.find(
        (item) =>
          item.role === 'assistant' && (item.status === 'pending' || item.status === 'streaming'),
      )
      this.status = 'cancelled'

      if (message) {
        message.status = 'cancelled'
        const targetId = message.id
        if (cancelledMessageTimer) {
          clearTimeout(cancelledMessageTimer)
        }
        // AGENT-07：终止生成的消息标记 cancelled 并在 3 秒内从会话列表移除，不写入历史/查询记录
        cancelledMessageTimer = setTimeout(() => {
          this.messages = this.messages.filter((item) => item.id !== targetId)
          cancelledMessageTimer = null
        }, CANCELLED_MESSAGE_TTL)
      }
    },

    compressContext(): void {
      if (!this.session) {
        return
      }
      const turnCount = this.session.interactions.length
      const keepCount = Math.min(MAX_CONTEXT_TURNS, turnCount)
      const compressedCount = turnCount - keepCount
      if (compressedCount > 0) {
        this.session.compressedContext = {
          summary: `已自动整理最近 ${compressedCount} 轮较早对话为摘要，作为后续问答的压缩上下文`,
          coveredTurnCount:
            (this.session.compressedContext?.coveredTurnCount ?? 0) + compressedCount,
        }
        this.session.interactions = this.session.interactions.slice(turnCount - keepCount)
      }
      this.messages.push({
        id: createMessageId(),
        role: 'system-notice',
        status: 'done',
        content: '以上对话已整理为摘要，继续提问',
        sources: [],
        createdAt: Date.now(),
      })
    },

    resetContext(): void {
      if (this.session) {
        this.session.interactions = []
        this.session.compressedContext = undefined
      }
      this.messages.push({
        id: createMessageId(),
        role: 'system-notice',
        status: 'done',
        content: '对话上下文已重置，请重新描述您的问题。',
        sources: [],
        createdAt: Date.now(),
      })
    },
  },
})
