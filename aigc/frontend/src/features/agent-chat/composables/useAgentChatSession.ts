// P02 问答平台页会话组合式函数：封装 useAgentChatStore 的消费方式，
// 组件本身不直接调用 api/*、不直接持有 AbortController（COMP-06、STATE-04）。
import { computed, onMounted, onUnmounted, type ComputedRef } from 'vue'

import { useAgentChatStore } from '@/stores'
import type { GenerationStatus, QaMessageVo } from '@/types/qa'

// AGENT-08：用户输入内容发送前的兜底长度上限
const MAX_QUESTION_LENGTH = 2000

export interface UseAgentChatSessionReturn {
  messages: ComputedRef<QaMessageVo[]>
  status: ComputedRef<GenerationStatus | 'idle'>
  isStreaming: ComputedRef<boolean>
  canSend: ComputedRef<boolean>
  sendQuestion: (text: string) => Promise<void>
  cancelBeforeSend: () => void
  stopGeneration: () => void
  newSession: () => Promise<void>
}

export function useAgentChatSession(): UseAgentChatSessionReturn {
  const store = useAgentChatStore()

  function abortActiveStreamIfAny(): void {
    if (store.isStreaming) {
      store.stopGeneration()
    }
  }

  onMounted(() => {
    void store.startSession()
  })

  // AGENT-06：路由离开当前会话（组件卸载）或关闭页面时必须终止未完成的流式请求
  window.addEventListener('beforeunload', abortActiveStreamIfAny)

  onUnmounted(() => {
    window.removeEventListener('beforeunload', abortActiveStreamIfAny)
    abortActiveStreamIfAny()
  })

  async function sendQuestion(text: string): Promise<void> {
    const trimmed = text.trim()
    // AGENT-08：禁止空字符串/纯空白提交
    if (!trimmed || !store.canSend) {
      return
    }
    const bounded = trimmed.slice(0, MAX_QUESTION_LENGTH)
    await store.sendQuestion(bounded)
  }

  return {
    messages: computed(() => store.messages),
    status: computed(() => store.status),
    isStreaming: computed(() => store.isStreaming),
    canSend: computed(() => store.canSend),
    sendQuestion,
    cancelBeforeSend: () => store.cancelBeforeSend(),
    stopGeneration: () => store.stopGeneration(),
    newSession: () => store.newSession(),
  }
}
