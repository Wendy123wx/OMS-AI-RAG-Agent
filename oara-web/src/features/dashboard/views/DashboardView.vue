<script setup lang="ts">
// P06 统计看板首页：仅展示提问总量/回答异常量/近7天趋势/活跃用户数四项指标（PRD 08 §9、§10）
import { computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

import { useDashboardStore } from '@/stores/dashboard'

import UsageStatCards from '../components/UsageStatCards.vue'
import TrendChart from '../components/TrendChart.vue'

const dashboardStore = useDashboardStore()

const snapshot = computed(() => dashboardStore.snapshot)
const isLoading = computed(() => dashboardStore.isLoading)
const trend = computed(() => snapshot.value?.last7DaysTrend ?? [])

async function loadUsageStatistics(): Promise<void> {
  try {
    await dashboardStore.fetchUsageStatistics()
  } catch (error) {
    // ERR-01/ERR-03：技术细节仅记录日志，用户提示使用固定文案
    console.error(error)
    ElMessage.error('统计数据加载失败，请稍后重试')
  }
}

onMounted(() => {
  void loadUsageStatistics()
})
</script>

<template>
  <div class="dashboard-view">
    <h2 class="dashboard-view__title">统计看板</h2>
    <UsageStatCards class="dashboard-view__stat-cards" :snapshot="snapshot" :is-loading="isLoading" />
    <section class="dashboard-view__trend">
      <h3 class="dashboard-view__trend-title">近7天提问趋势</h3>
      <TrendChart :trend="trend" :is-loading="isLoading" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.dashboard-view {
  &__title {
    margin: 0 0 var(--space-lg) 0;
    font-size: var(--font-size-lg);
  }

  &__stat-cards {
    margin-bottom: var(--space-lg);
  }

  &__trend {
    padding: var(--space-lg);
    background-color: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  &__trend-title {
    margin: 0 0 var(--space-sm) 0;
    font-size: var(--font-size-md);
    color: var(--color-text-primary);
  }
}
</style>
