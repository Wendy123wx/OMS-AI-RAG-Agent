<script setup lang="ts">
// P06 近7天提问趋势：原生 CSS 柱状图实现，不引入图表库依赖（PRD 08 §5.4、§9、§10）
import { computed } from 'vue'

import type { DailyQuestionCount } from '@/types/query-record'

interface Props {
  trend: DailyQuestionCount[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

interface TrendBarItem {
  day: string
  count: number
  heightPercent: number
}

const hasTrendData = computed(() => props.trend.length > 0)

const maxTrendCount = computed(() => {
  if (props.trend.length === 0) {
    return 1
  }
  return Math.max(...props.trend.map((item) => item.count), 1)
})

function formatDayLabel(day: string): string {
  const parts = day.split('-')
  return parts.length === 3 ? `${parts[1]}-${parts[2]}` : day
}

const trendBars = computed<TrendBarItem[]>(() =>
  props.trend.map((item) => ({
    day: formatDayLabel(item.day),
    count: item.count,
    heightPercent: Math.round((item.count / maxTrendCount.value) * 100),
  })),
)
</script>

<template>
  <div class="trend-chart">
    <el-skeleton v-if="isLoading" :rows="4" animated class="trend-chart__skeleton" />
    <el-empty v-else-if="!hasTrendData" description="暂无趋势数据" class="trend-chart__empty" />
    <div v-else class="trend-chart__bars">
      <div v-for="bar in trendBars" :key="bar.day" class="trend-chart__bar-item">
        <span class="trend-chart__bar-count">{{ bar.count }}</span>
        <div class="trend-chart__bar-track">
          <div class="trend-chart__bar-fill" :style="{ height: `${bar.heightPercent}%` }" />
        </div>
        <span class="trend-chart__bar-label">{{ bar.day }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.trend-chart {
  min-height: 200px;

  &__skeleton {
    padding: var(--space-md);
  }

  &__empty {
    padding: var(--space-lg) 0;
  }

  &__bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 200px;
    padding: var(--space-md) var(--space-sm);
    gap: var(--space-sm);
  }

  &__bar-item {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }

  &__bar-count {
    margin-bottom: var(--space-xs);
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }

  &__bar-track {
    display: flex;
    flex: 1;
    align-items: flex-end;
    width: 100%;
    max-width: 32px;
    background-color: var(--color-bg-page);
    border-radius: var(--radius-sm);
  }

  &__bar-fill {
    width: 100%;
    min-height: 2px;
    background-color: var(--color-primary);
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    transition: height 0.2s ease;
  }

  &__bar-label {
    margin-top: var(--space-xs);
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }
}
</style>
