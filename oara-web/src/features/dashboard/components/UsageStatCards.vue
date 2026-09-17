<script setup lang="ts">
// P06 核心指标卡片：提问总量 / 回答异常量 / 活跃用户数（PRD 08 §5.3、§9、§10）
import { computed } from 'vue'

import type { UsageStatisticsSnapshot } from '@/types/query-record'

interface Props {
  snapshot: UsageStatisticsSnapshot | null
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

interface StatCardItem {
  key: string
  label: string
  value: number
}

const statCards = computed<StatCardItem[]>(() => [
  {
    key: 'total-question-count',
    label: '提问总量',
    value: props.snapshot?.totalQuestionCount ?? 0,
  },
  {
    key: 'exception-answer-count',
    label: '回答异常量',
    value: props.snapshot?.exceptionAnswerCount ?? 0,
  },
  {
    key: 'active-user-count',
    label: '活跃用户数',
    value: props.snapshot?.activeUserCount ?? 0,
  },
])
</script>

<template>
  <div class="usage-stat-cards">
    <el-skeleton v-if="isLoading" :rows="2" animated class="usage-stat-cards__skeleton" />
    <div v-else class="usage-stat-cards__grid">
      <div v-for="item in statCards" :key="item.key" class="usage-stat-cards__card">
        <p class="usage-stat-cards__label">{{ item.label }}</p>
        <p class="usage-stat-cards__value">{{ item.value }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.usage-stat-cards {
  &__skeleton {
    padding: var(--space-md);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-md);
  }

  &__card {
    padding: var(--space-lg);
    background-color: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  &__label {
    margin: 0 0 var(--space-sm) 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  &__value {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-text-primary);
  }
}
</style>
