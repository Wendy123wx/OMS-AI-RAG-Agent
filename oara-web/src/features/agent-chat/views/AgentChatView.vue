<script setup lang="ts">
// P02 问答平台页：回答区域 + 提问区域 + 新建会话 + 答案来源详情弹窗入口（全局 C06）。
import { ref } from 'vue'

// AGENT-03：知识库类来源点击必须打开全局唯一 C06，禁止在本模块内自建同类弹窗（DIR-01/DIR-02）
import AnswerSourceDetailDialog from '@/components/AnswerSourceDetailDialog.vue'
import type { SourceReference } from '@/types/qa'

import MessageList from '../components/MessageList.vue'
import QuestionInput from '../components/QuestionInput.vue'
import { useAgentChatSession } from '../composables/useAgentChatSession'

const { messages, isStreaming, canSend, sendQuestion, cancelBeforeSend, stopGeneration, newSession } =
  useAgentChatSession()

const isSourceDialogVisible = ref(false)
const activeSource = ref<SourceReference | null>(null)

function handleOpenSource(source: SourceReference): void {
  activeSource.value = source
  isSourceDialogVisible.value = true
}

async function handleNewSession(): Promise<void> {
  if (isStreaming.value) {
    return
  }
  await newSession()
}
</script>

<template>
  <div class="agent-chat-view">
    <div class="agent-chat-view__toolbar">
      <span class="agent-chat-view__toolbar-title">当前会话</span>
      <el-button size="small" :disabled="isStreaming" @click="handleNewSession">
        新建会话
      </el-button>
    </div>
    <MessageList :messages="messages" class="agent-chat-view__messages" @open-source="handleOpenSource" />
    <QuestionInput
      :can-send="canSend"
      :is-streaming="isStreaming"
      @send-question="sendQuestion"
      @cancel-before-send="cancelBeforeSend"
      @stop-generation="stopGeneration"
    />
    <AnswerSourceDetailDialog v-model="isSourceDialogVisible" :source="activeSource" />
  </div>
</template>

<style scoped lang="scss">
.agent-chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--color-border);
  }

  &__toolbar-title {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  &__messages {
    flex: 1;
    min-height: 0;
  }
}
</style>
