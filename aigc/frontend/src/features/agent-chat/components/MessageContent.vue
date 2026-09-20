<script setup lang="ts">
// AGENT-02/SEC-01：唯一 v-html 豁免点。渲染管线固定为
// 原始增量文本 → 按 SSE-03/04 分帧拼接（由 store 完成） → marked 解析 Markdown → DOMPurify 净化 → v-html。
// AGENT-11：DOMPurify 显式限制链接协议为 http/https，禁止 <script>/javascript: 协议/on* 事件属性放行。
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

interface Props {
  content: string
}

const props = defineProps<Props>()

const ALLOWED_TAGS = [
  'p',
  'strong',
  'em',
  'code',
  'pre',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'br',
  'span',
]

const safeHtml = computed<string>(() => {
  const rawHtml = marked.parse(props.content, { async: false }) as string
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:https?:)/i,
  })
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- SEC-01 唯一豁免点：safeHtml 已经 marked+DOMPurify 净化 -->
  <div class="message-content" v-html="safeHtml" />
</template>

<style scoped lang="scss">
.message-content {
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--color-text-primary);
  overflow-wrap: anywhere;
  white-space: normal;

  :deep(p) {
    margin: 0 0 var(--space-sm) 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(pre) {
    padding: var(--space-sm);
    overflow-x: auto;
    background-color: var(--color-bg-page);
    border-radius: var(--radius-sm);
  }

  :deep(code) {
    padding: 0 var(--space-xs);
    background-color: var(--color-bg-page);
    border-radius: var(--radius-sm);
  }

  :deep(a) {
    color: var(--color-primary);
  }
}
</style>
