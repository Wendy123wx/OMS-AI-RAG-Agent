<script setup lang="ts">
// P03-01 历史记录列表页：展示当前登录用户本人的历史问答记录（PRD 9.4.15）。
import { computed, onMounted, ref } from 'vue'

import { useQaHistoryStore } from '@/stores/qaHistory'
import QaHistoryDetailDialog from '../components/QaHistoryDetailDialog.vue'

const PAGE_SIZE = 20

const qaHistoryStore = useQaHistoryStore()

const isDetailDialogVisible = ref(false)
const activeRecordId = ref<string | null>(null)
const currentPage = ref(1)

// STATE-04：异步加载由 Store action 完成，组件只调用 action 不直接请求
onMounted(() => {
  qaHistoryStore.fetchHistoryList().catch(() => {
    // 加载失败时保留空列表，交由 isEmpty 分支呈现空状态，不做静默吞异常
  })
})

// COMP-04：派生渲染数据提升为 computed，模板不写复杂条件表达式
// R7：列表默认按 recordedAt 倒序（最新在前）
const sortedRecords = computed(() =>
  [...qaHistoryStore.records].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  ),
)

const isEmpty = computed(() => !qaHistoryStore.isLoading && sortedRecords.value.length === 0)

const pagedRecords = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return sortedRecords.value.slice(start, start + PAGE_SIZE)
})

function formatRecordedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

function handlePageChange(page: number): void {
  currentPage.value = page
}

function openDetail(recordId: string): void {
  activeRecordId.value = recordId
  isDetailDialogVisible.value = true
}
</script>

<template>
  <div class="qa-history-list-view">
    <h2 class="qa-history-list-view__title">历史记录</h2>

    <div v-if="qaHistoryStore.isLoading && sortedRecords.length === 0" class="qa-history-list-view__loading">
      <el-skeleton :rows="6" animated />
    </div>

    <el-empty v-else-if="isEmpty" description="暂无历史记录" class="qa-history-list-view__empty" />

    <template v-else>
      <ul class="qa-history-list-view__list">
        <li v-for="record in pagedRecords" :key="record.recordId" class="qa-history-list-view__item">
          <div class="qa-history-list-view__item-main">
            <p class="qa-history-list-view__question">{{ record.questionSummary }}</p>
            <div class="qa-history-list-view__meta">
              <span class="qa-history-list-view__source">
                来源：{{ record.sourceLocatorSummary || '无' }}
              </span>
              <span class="qa-history-list-view__time">{{ formatRecordedAt(record.recordedAt) }}</span>
            </div>
          </div>
          <el-button type="primary" link @click="openDetail(record.recordId)">查看</el-button>
        </li>
      </ul>

      <el-pagination
        v-if="sortedRecords.length > PAGE_SIZE"
        class="qa-history-list-view__pagination"
        :current-page="currentPage"
        :page-size="PAGE_SIZE"
        :total="sortedRecords.length"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </template>

    <QaHistoryDetailDialog v-model="isDetailDialogVisible" :record-id="activeRecordId" />
  </div>
</template>

<style scoped lang="scss">
.qa-history-list-view {
  padding: var(--space-md);

  &__title {
    margin: 0 0 var(--space-md) 0;
    font-size: var(--font-size-lg);
  }

  &__loading {
    padding: var(--space-md) 0;
  }

  &__empty {
    padding: var(--space-xl) 0;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-md);
    background-color: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  &__item-main {
    flex: 1;
    min-width: 0;
  }

  &__question {
    margin: 0 0 var(--space-xs) 0;
    font-size: var(--font-size-md);
    color: var(--color-text-primary);
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--space-md);
  }
}
</style>
