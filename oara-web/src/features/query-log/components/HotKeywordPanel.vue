<script setup lang="ts">
// 高频搜索词展示区（PRD 09 §5.2、9.7.27）：前三并列第一排，其余按点击次数降序展示
import { computed } from 'vue'

import type { HotKeywordVo } from '@/types/query-record'

interface Props {
  keywords: HotKeywordVo[]
}

const props = defineProps<Props>()

const firstRowKeywords = computed<HotKeywordVo[]>(() =>
  props.keywords.filter((item) => item.inFirstRow),
)

const restKeywords = computed<HotKeywordVo[]>(() =>
  props.keywords
    .filter((item) => !item.inFirstRow)
    .slice()
    .sort((a, b) => b.clickCount - a.clickCount),
)

const hasKeywords = computed<boolean>(() => props.keywords.length > 0)
</script>

<template>
  <section class="hot-keyword-panel">
    <h3 class="hot-keyword-panel__title">高频搜索词</h3>
    <p v-if="!hasKeywords" class="hot-keyword-panel__empty">暂无高频搜索词数据</p>
    <div v-else class="hot-keyword-panel__body">
      <ul class="hot-keyword-panel__first-row">
        <li
          v-for="item in firstRowKeywords"
          :key="item.keyword"
          class="hot-keyword-panel__chip hot-keyword-panel__chip--top"
        >
          <span class="hot-keyword-panel__chip-rank">第1名</span>
          <span class="hot-keyword-panel__chip-word">{{ item.keyword }}</span>
          <span class="hot-keyword-panel__chip-count">{{ item.clickCount }} 次</span>
        </li>
      </ul>
      <ul class="hot-keyword-panel__rest-row">
        <li v-for="item in restKeywords" :key="item.keyword" class="hot-keyword-panel__chip">
          <span class="hot-keyword-panel__chip-rank">第{{ item.rank }}名</span>
          <span class="hot-keyword-panel__chip-word">{{ item.keyword }}</span>
          <span class="hot-keyword-panel__chip-count">{{ item.clickCount }} 次</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hot-keyword-panel {
  padding: var(--space-md);
  margin-bottom: var(--space-md);
  background-color: var(--color-bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);

  &__title {
    margin: 0 0 var(--space-sm) 0;
    font-size: var(--font-size-md);
    color: var(--color-text-primary);
  }

  &__empty {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  &__first-row,
  &__rest-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__first-row {
    margin-bottom: var(--space-sm);
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-lg);
    background-color: var(--color-bg-page);
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);

    &--top {
      background-color: var(--color-primary-light);
      color: var(--color-bg-card);
    }
  }

  &__chip-rank {
    font-weight: 600;
  }

  &__chip-count {
    color: inherit;
    opacity: 0.85;
  }
}
</style>
