<script setup lang="ts">
// 回答区域：按时间顺序展示当前会话内多轮问答；system-notice 消息路由到 ContextNoticeBanner。
// PERF-03：消息量过大时退化为只渲染最近 200 条，避免一次性渲染全部历史 DOM 节点。
import { computed, nextTick, ref, watch } from 'vue'
import type { ScrollbarInstance } from 'element-plus'

import type { QaMessageVo, SourceReference } from '@/types/qa'

import ContextNoticeBanner from './ContextNoticeBanner.vue'
import MessageBubble from './MessageBubble.vue'

interface Props {
  messages: QaMessageVo[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'openSource', source: SourceReference): void
}>()

const MAX_RENDERED_MESSAGES = 200

const isTruncated = computed(() => props.messages.length > MAX_RENDERED_MESSAGES)
const visibleMessages = computed(() =>
  isTruncated.value ? props.messages.slice(-MAX_RENDERED_MESSAGES) : props.messages,
)

const scrollbarRef = ref<ScrollbarInstance | null>(null)

function scrollToBottom(): void {
  void nextTick(() => {
    scrollbarRef.value?.setScrollTop(Number.MAX_SAFE_INTEGER)
  })
}

watch(
  () => props.messages,
  () => {
    scrollToBottom()
  },
  { deep: true },
)

function handleOpenSource(source: SourceReference): void {
  emit('openSource', source)
}
</script>

<template>
  <el-scrollbar ref="scrollbarRef" class="message-list">
    <p v-if="isTruncated" class="message-list__truncated-notice">
      仅展示最近 {{ MAX_RENDERED_MESSAGES }} 条消息，更早内容请前往「历史记录」查看
    </p>
    <p v-if="visibleMessages.length === 0" class="message-list__empty">
      向我提问，开始新的对话
    </p>
    <template v-for="message in visibleMessages" :key="message.id">
      <ContextNoticeBanner
        v-if="message.role === 'system-notice'"
        :content="message.content"
      />
      <MessageBubble v-else :message="message" @open-source="handleOpenSource" />
    </template>
  </el-scrollbar>
</template>

<style scoped lang="scss">
.message-list {
  flex: 1;
  min-height: 0;
  padding: var(--space-md);

  &__truncated-notice {
    margin: 0 0 var(--space-sm) 0;
    color: var(--color-text-placeholder);
    font-size: var(--font-size-xs);
    text-align: center;
  }

  &__empty {
    margin-top: var(--space-xl);
    color: var(--color-text-placeholder);
    font-size: var(--font-size-sm);
    text-align: center;
  }
}
</style>
