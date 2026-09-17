// 智能问答上下文 Mock（T03 补全：会话建立 + mockAskStream 分片模拟，覆盖知识库/订单双路径与异常场景）
import type { ApiResponse } from '@/types/api'
import type { AnswerExceptionKind, QaSession, SourceReference } from '@/types/qa'
import type { RegisterMockRoute } from '@/mocks/types'
import type { SseFrame } from '@/composables/useSseStream'

let mockSession: QaSession | null = null

function createEmptySession(): QaSession {
  return {
    sessionId: `mock-session-${Date.now()}`,
    interactions: [],
    createdAt: new Date().toISOString(),
  }
}

export function registerQaMocks(register: RegisterMockRoute): void {
  register('GET', /\/qa\/session$/, () => {
    mockSession = mockSession ?? createEmptySession()
    const response: ApiResponse<QaSession> = {
      code: 0,
      message: 'ok',
      data: mockSession,
      traceId: 'mock-trace',
    }
    return response
  })

  register('POST', /\/qa\/session$/, () => {
    mockSession = createEmptySession()
    const response: ApiResponse<QaSession> = {
      code: 0,
      message: 'ok',
      data: mockSession,
      traceId: 'mock-trace',
    }
    return response
  })
}

function splitIntoChunks(text: string): string[] {
  const chunkSize = 6
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize))
  }
  return chunks
}

const KNOWLEDGE_DOCUMENT_SOURCE: SourceReference = {
  kind: 'knowledge_document',
  locator: '/知识库/OMS操作手册/退换货流程.pdf#第3章',
  documentName: 'OMS操作手册.pdf',
  hitSnippet: {
    content:
      '退换货申请提交后，系统将在1个工作日内完成审核；审核通过的订单，仓库将在2个工作日内完成退货入库并触发退款流程。',
  },
}

const ORDER_QUERY_SOURCE: SourceReference = {
  kind: 'order_query',
  locator: '订单系统实时查询',
}

function isOrderQuestion(question: string): boolean {
  return /订单|物流|快递|发货|运单/.test(question)
}

function isUnrelatedQuestion(question: string): boolean {
  return /天气|笑话|你好啊|唱歌|股票/.test(question)
}

// SSE Mock（按 §9 SSE-03/04 帧协议模拟分片输出，覆盖知识库/订单双路径与 5.3.4 异常场景）
export async function* mockAskStream(question: string): AsyncGenerator<SseFrame> {
  let seq = 1

  if (isUnrelatedQuestion(question)) {
    yield { type: 'error', seq: seq++, data: { exceptionKind: 'unrelated' satisfies AnswerExceptionKind } }
    return
  }

  if (isOrderQuestion(question)) {
    if (/失败|异常|错误/.test(question)) {
      yield {
        type: 'error',
        seq: seq++,
        data: { exceptionKind: 'order_call_failed' satisfies AnswerExceptionKind },
      }
      return
    }
    if (/查不到|不存在|无结果/.test(question)) {
      yield {
        type: 'error',
        seq: seq++,
        data: { exceptionKind: 'order_no_result' satisfies AnswerExceptionKind },
      }
      return
    }
    const answer = `已为您查询订单信息：该订单当前状态为「已发货」，预计1-3个工作日内送达。（模拟数据，问题：${question}）`
    for (const chunk of splitIntoChunks(answer)) {
      yield { type: 'chunk', seq: seq++, data: { delta: chunk } }
    }
    yield { type: 'source', seq: seq++, data: { sources: [ORDER_QUERY_SOURCE] } }
    yield { type: 'done', seq: seq++, data: {} }
    return
  }

  if (/找不到|没有相关|不知道/.test(question)) {
    yield { type: 'error', seq: seq++, data: { exceptionKind: 'kb_miss' satisfies AnswerExceptionKind } }
    return
  }

  const answer = `根据知识库检索结果，关于「${question}」的处理流程如下：\n\n1. 提交申请后系统自动分配至对应审核队列；\n2. 审核通过后进入下一环节处理；\n3. 处理完成后系统会同步通知结果。\n\n如需进一步操作，请参见文档来源。`
  for (const chunk of splitIntoChunks(answer)) {
    yield { type: 'chunk', seq: seq++, data: { delta: chunk } }
  }
  yield { type: 'source', seq: seq++, data: { sources: [KNOWLEDGE_DOCUMENT_SOURCE] } }
  yield { type: 'done', seq: seq++, data: {} }
}
