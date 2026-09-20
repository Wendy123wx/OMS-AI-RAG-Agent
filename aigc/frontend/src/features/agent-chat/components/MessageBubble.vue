<script setup lang="ts">
// 单条问答消息气泡（role: user | assistant）。system-notice 由 MessageList 路由到
// ContextNoticeBanner，本组件不处理该角色。
import { computed } from 'vue'
import { ChatDotRound, UserFilled } from '@element-plus/icons-vue'

import type { QaMessageVo, SourceReference } from '@/types/qa'

import MessageContent from './MessageContent.vue'
import SourceCitationList from './SourceCitationList.vue'
import TypingIndicator from './TypingIndicator.vue'

interface Props {
  message: QaMessageVo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'openSource', source: SourceReference): void
}>()

const isUserMessage = computed(() => props.message.role === 'user')
const isPending = computed(() => props.message.status === 'pending')
const isCancelled = computed(() => props.message.status === 'cancelled')
// AGENT-03：来源仅在 status === 'done' 且非空时展示，异常态不展示任何来源（含虚假来源）
const hasSources = computed(
  () => props.message.status === 'done' && props.message.sources.length > 0,
)
function handleOpenSource(source: SourceReference): void {
  emit('openSource', source)
}
</script>

<template>
  <div
    class="message-bubble"
    :class="{
      'message-bubble--user': isUserMessage,
      'message-bubble--assistant': !isUserMessage,
    }"
  >
    <div class="message-bubble__avatar">
      <el-icon :size="16">
        <UserFilled v-if="isUserMessage" />
        <ChatDotRound v-else />
      </el-icon>
    </div>
    <div class="message-bubble__panel">
      <!-- SEC-02：用户输入原文回显必须走默认文本插值自动转义，禁止 v-html -->
      <p v-if="isUserMessage" class="message-bubble__user-text">{{ message.content }}</p>
      <TypingIndicator v-else-if="isPending" />
      <p v-else-if="isCancelled" class="message-bubble__cancelled">已终止生成</p>
      <template v-else>
        <MessageContent :content="message.content" />
        <SourceCitationList
          v-if="hasSources"
          :sources="message.sources"
          @open-source="handleOpenSource"
        />
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.message-bubble {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);

  &__avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--color-bg-card);
    font-size: var(--font-size-xs);
    background-color: var(--color-info);
    border-radius: 50%;
  }

  &__panel {
    max-width: 72%;
    padding: var(--space-sm) var(--space-md);
    background-color: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  &__cancelled {
    margin: 0;
    color: var(--color-text-placeholder);
    font-size: var(--font-size-sm);
  }

  &__user-text {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: 1.6;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  &--user {
    flex-direction: row-reverse;

    .message-bubble__avatar {
      background-color: var(--color-primary);
    }

    .message-bubble__panel {
      background-color: var(--color-primary-light);
      border-color: var(--color-primary-light);
    }
  }
}
</style>
