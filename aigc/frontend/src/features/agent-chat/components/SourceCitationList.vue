<script setup lang="ts">
// AGENT-03：来源展示——知识库类来源可点击打开全局 C06（AnswerSourceDetailDialog），
// 订单类来源仅展示查单说明、不可点击。仅在 status === 'done' 且来源非空时由父组件渲染本组件。
import { computed } from 'vue'
import { Link } from '@element-plus/icons-vue'

import type { SourceReference } from '@/types/qa'

interface Props {
  sources: SourceReference[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'openSource', source: SourceReference): void
}>()

interface SourceCitationItem {
  key: string
  source: SourceReference
  isClickable: boolean
  label: string
}

const items = computed<SourceCitationItem[]>(() =>
  props.sources.map((source) => {
    const isClickable = source.kind === 'knowledge_document'
    const label = isClickable ? (source.documentName ?? source.locator) : source.locator
    return {
      key: `${source.kind}-${source.locator}-${source.documentName ?? ''}`,
      source,
      isClickable,
      label,
    }
  }),
)

function handleClick(item: SourceCitationItem): void {
  if (!item.isClickable) {
    return
  }
  emit('openSource', item.source)
}
</script>

<template>
  <div class="source-citation-list">
    <span class="source-citation-list__label">来源：</span>
    <template v-for="item in items" :key="item.key">
      <button
        v-if="item.isClickable"
        type="button"
        class="source-citation-list__link"
        @click="handleClick(item)"
      >
        <el-icon :size="12"><Link /></el-icon>
        {{ item.label }}
      </button>
      <span v-else class="source-citation-list__plain">{{ item.label }}</span>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles/mixins';

.source-citation-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
  font-size: var(--font-size-xs);

  &__label {
    color: var(--color-text-secondary);
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    color: var(--color-primary);
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background-color var(--transition-base) var(--ease-standard);

    @include mixins.focus-ring;

    &:hover {
      background-color: var(--color-bg-page);
      text-decoration: underline;
    }
  }

  &__plain {
    color: var(--color-text-secondary);
  }
}
</style>
