// SSE 流式请求统一封装（SSE-01）。业务组件禁止直接调用 fetch/EventSource 解析流，
// 一律经本 composable 发起。T03（agent-chat）在此基础上补全 Mock 分支（VITE_USE_MOCK）。
import { ref, type Ref } from 'vue'

import { mockAskStream } from '@/mocks/handlers/qa'

// SSE-04：每一帧必须包含 type 与单调递增 seq
export type SseFrameType = 'chunk' | 'source' | 'done' | 'error'

export interface SseFrame {
  type: SseFrameType
  seq: number
  data: unknown
}

export interface UseSseStreamOptions {
  onFrame: (frame: SseFrame) => void
  onError?: (error: Error) => void
  onFinish?: () => void
}

export interface UseSseStreamReturn {
  isStreaming: Ref<boolean>
  start: (url: string, body: Record<string, unknown>, token: string | null) => Promise<void>
  abort: () => void
}

// SSE-03：按 \n\n 分帧后再 JSON.parse，不假设单次 read() 返回完整一帧
function parseFrames(buffer: string): { frames: SseFrame[]; rest: string } {
  const parts = buffer.split('\n\n')
  const rest = parts.pop() ?? ''
  const frames: SseFrame[] = []
  for (const part of parts) {
    const line = part.trim()
    if (!line.startsWith('data:')) {
      continue
    }
    const jsonText = line.slice('data:'.length).trim()
    if (!jsonText) {
      continue
    }
    try {
      frames.push(JSON.parse(jsonText) as SseFrame)
    } catch (error) {
      // ERR-01：禁止空 catch，记录异常帧但不中断整体解析
      console.error('SSE 帧解析失败', error)
    }
  }
  return { frames, rest }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function useSseStream(options: UseSseStreamOptions): UseSseStreamReturn {
  const isStreaming = ref(false)
  let controller: AbortController | null = null

  // Mock 分支：VITE_USE_MOCK === 'true' 时读取 mocks/handlers/qa.ts 的 mockAskStream，
  // 按 SSE-03/04 帧协议模拟分片输出，abort 后立即停止取帧（SSE-05）。
  async function runMockStream(body: Record<string, unknown>, signal: AbortSignal): Promise<void> {
    const question = typeof body.question === 'string' ? body.question : ''
    for await (const frame of mockAskStream(question)) {
      if (signal.aborted) {
        return
      }
      options.onFrame(frame)
      // 模拟网络分片延迟，避免一次性同步吐出全部帧
      await delay(60)
      if (signal.aborted) {
        return
      }
    }
  }

  async function runRealStream(
    url: string,
    body: Record<string, unknown>,
    token: string | null,
    signal: AbortSignal,
  ): Promise<void> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal,
    })
    if (!response.body) {
      throw new Error('响应缺少可读流')
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    // SSE-06：网络中断禁止自动重连重放，交由调用方决定是否提示中断
    for (;;) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }
      buffer += decoder.decode(value, { stream: true })
      const { frames, rest } = parseFrames(buffer)
      buffer = rest
      frames.forEach((frame) => options.onFrame(frame))
    }
  }

  async function start(
    url: string,
    body: Record<string, unknown>,
    token: string | null,
  ): Promise<void> {
    controller = new AbortController()
    const { signal } = controller
    isStreaming.value = true
    try {
      if (import.meta.env.VITE_USE_MOCK === 'true') {
        await runMockStream(body, signal)
      } else {
        await runRealStream(url, body, token, signal)
      }
      if (!signal.aborted) {
        options.onFinish?.()
      }
    } catch (error) {
      if (signal.aborted) {
        // 用户主动终止，不视为异常（SSE-05），不触发 onError/onFinish
        return
      }
      const normalized = error instanceof Error ? error : new Error('流式请求异常')
      options.onError?.(normalized)
    } finally {
      isStreaming.value = false
    }
  }

  function abort(): void {
    controller?.abort()
    isStreaming.value = false
  }

  return { isStreaming, start, abort }
}
