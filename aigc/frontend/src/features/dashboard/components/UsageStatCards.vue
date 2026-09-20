<script setup lang="ts">
// P06 核心指标卡片：提问总量 / 回答异常量 / 活跃用户数（PRD 08 §5.3、§9、§10）
import { computed } from 'vue'
import { Document, UserFilled, WarningFilled } from '@element-plus/icons-vue'

import type { UsageStatisticsSnapshot } from '@/types/query-record'

interface Props {
  snapshot: UsageStatisticsSnapshot | null
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

type StatCardTone = 'primary' | 'warning' | 'success'

interface StatCardItem {
  key: string
  label: string
  value: number
  icon: typeof Document
  tone: StatCardTone
}

const statCards = computed<StatCardItem[]>(() => [
  {
    key: 'total-question-count',
    label: '提问总量',
    value: props.snapshot?.totalQuestionCount ?? 0,
    icon: Document,
    tone: 'primary',
  },
  {
    key: 'exception-answer-count',
    label: '回答异常量',
    value: props.snapshot?.exceptionAnswerCount ?? 0,
    icon: WarningFilled,
    tone: 'warning',
  },
  {
    key: 'active-user-count',
    label: '活跃用户数',
    value: props.snapshot?.activeUserCount ?? 0,
    icon: UserFilled,
    tone: 'success',
  },
])
</script>

<template>
  <div class="usage-stat-cards">
    <el-skeleton v-if="isLoading" :rows="2" animated class="usage-stat-cards__skeleton" />
    <div v-else class="usage-stat-cards__grid">
      <div v-for="item in statCards" :key="item.key" class="usage-stat-cards__card">
        <div class="usage-stat-cards__icon" :class="`usage-stat-cards__icon--${item.tone}`">
          <el-icon :size="20"><component :is="item.icon" /></el-icon>
        </div>
        <div>
          <p class="usage-stat-cards__label">{{ item.label }}</p>
          <p
            class="usage-stat-cards__value"
            :class="{ 'usage-stat-cards__value--warning': item.tone === 'warning' }"
          >
            {{ item.value }}
          </p>
        </div>
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
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-lg);
    background-color: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    transition: box-shadow var(--transition-base) var(--ease-standard);

    &:hover {
      box-shadow: var(--shadow-md);
    }
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;

    &--primary {
      color: var(--color-primary);
      background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
    }

    &--warning {
      color: var(--color-warning);
      background-color: color-mix(in srgb, var(--color-warning) 12%, transparent);
    }

    &--success {
      color: var(--color-success);
      background-color: color-mix(in srgb, var(--color-success) 12%, transparent);
    }
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

    &--warning {
      color: var(--color-warning);
    }
  }
}
</style>
