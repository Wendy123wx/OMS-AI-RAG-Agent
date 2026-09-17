// AGENT-10：上下文压缩/重置必须插入 system-notice 消息，不得静默清空。
// AGENT-07：终止生成的消息标记 cancelled 后须在 3 秒内从消息列表移除，不留痕。
// REVIEW-04：SSE/AGENT 相关改动需补充 Vitest 单测。
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAgentChatStore } from './agentChat'

describe('useAgentChatStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('compressContext 保留最近 10 轮交互并插入 system-notice 摘要消息', () => {
    const store = useAgentChatStore()
    store.session = {
      sessionId: 'session-1',
      userId: 'user-1',
      interactions: Array.from({ length: 12 }, (_, index) => ({
        interactionId: `itc-${index}`,
        question: `问题${index}`,
        answer: `回答${index}`,
        sources: [],
        status: 'done' as const,
        resultType: 'normal' as const,
        submittedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
    }

    store.compressContext()

    expect(store.session.interactions).toHaveLength(10)
    expect(store.session.compressedContext?.coveredTurnCount).toBe(2)
    const noticeMessage = store.messages.at(-1)
    expect(noticeMessage?.role).toBe('system-notice')
    expect(noticeMessage?.content).toBe('以上对话已整理为摘要，继续提问')
  })

  it('resetContext 清空交互与压缩摘要并插入 system-notice 重置消息', () => {
    const store = useAgentChatStore()
    store.session = {
      sessionId: 'session-1',
      userId: 'user-1',
      interactions: [
        {
          interactionId: 'itc-0',
          question: '问题0',
          answer: '回答0',
          sources: [],
          status: 'done',
          resultType: 'normal',
          submittedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      ],
      compressedContext: { summary: '摘要', coveredTurnCount: 10 },
      createdAt: new Date().toISOString(),
    }

    store.resetContext()

    expect(store.session.interactions).toHaveLength(0)
    expect(store.session.compressedContext).toBeUndefined()
    const noticeMessage = store.messages.at(-1)
    expect(noticeMessage?.role).toBe('system-notice')
    expect(noticeMessage?.content).toBe('对话上下文已重置，请重新描述您的问题。')
  })

  it('stopGeneration 将生成中的消息标记 cancelled，并在 3 秒后从消息列表移除', () => {
    vi.useFakeTimers()
    const store = useAgentChatStore()
    store.status = 'streaming'
    store.messages = [
      {
        id: 'msg-user',
        role: 'user',
        status: 'done',
        content: '问题',
        sources: [],
        createdAt: Date.now(),
      },
      {
        id: 'msg-assistant',
        role: 'assistant',
        status: 'streaming',
        content: '部分生成内容',
        sources: [],
        createdAt: Date.now(),
      },
    ]

    store.stopGeneration()

    expect(store.status).toBe('cancelled')
    const assistantMessage = store.messages.find((message) => message.id === 'msg-assistant')
    expect(assistantMessage?.status).toBe('cancelled')

    vi.advanceTimersByTime(3000)

    expect(store.messages.find((message) => message.id === 'msg-assistant')).toBeUndefined()
  })
})
