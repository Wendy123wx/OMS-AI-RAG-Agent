<script setup lang="ts">
// P10 / C06 答案来源详情弹窗（集成契约 §3.4）——唯一全局来源详情组件。
// 约束：禁止 import useKnowledgeBaseStore 或 @/features/knowledge-base/*；不发起任何网络请求，
// 只读渲染触发页传入的知识库类来源快照（AGENT-03）。
import { computed } from 'vue'

import type { SourceReference } from '@/types/qa'

interface Props {
  modelValue: boolean
  source: SourceReference | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="答案来源详情"
    width="560px"
    class="answer-source-detail-dialog"
  >
    <div v-if="props.source" class="answer-source-detail-dialog__body">
      <p class="answer-source-detail-dialog__field">
        <span class="answer-source-detail-dialog__label">文件名：</span>
        <span>{{ props.source.documentName }}</span>
      </p>
      <p class="answer-source-detail-dialog__field">
        <span class="answer-source-detail-dialog__label">检索路径：</span>
        <span>{{ props.source.locator }}</span>
      </p>
      <p class="answer-source-detail-dialog__field answer-source-detail-dialog__field--snippet">
        <span class="answer-source-detail-dialog__label">命中片段：</span>
      </p>
      <p class="answer-source-detail-dialog__snippet-content">
        {{ props.source.hitSnippet?.content }}
      </p>
    </div>
    <template #footer>
      <el-button type="primary" @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.answer-source-detail-dialog {
  &__field {
    margin: 0 0 var(--space-sm) 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  &__label {
    color: var(--color-text-secondary);
  }

  &__snippet-content {
    margin: 0;
    padding: var(--space-md);
    background-color: var(--color-bg-page);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    white-space: pre-wrap;
  }
}
</style>
