<script setup lang="ts">
// P07-01 查询记录列表页（管理员全量视角，PRD 09）
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'

import HotKeywordPanel from '../components/HotKeywordPanel.vue'
import QueryLogDetailDialog from '../components/QueryLogDetailDialog.vue'
import { useQueryLogStore } from '@/stores/queryLog'

const queryLogStore = useQueryLogStore()

const searchInput = ref('')
const currentPage = ref(1)
const pageSize = 20

const isLoading = computed(() => queryLogStore.isLoading)
const records = computed(() => queryLogStore.records)
const hotKeywords = computed(() => queryLogStore.hotKeywords)
const activeKeyword = computed(() => queryLogStore.keyword)

const totalCount = computed(() => records.value.length)
const pagedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return records.value.slice(start, start + pageSize)
})

const isEmpty = computed(() => !isLoading.value && records.value.length === 0)
const emptyDescription = computed(() =>
  activeKeyword.value.trim() ? '未搜索到相关查询记录' : '暂无普通用户查询记录',
)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// PERF-04：搜索输入防抖 300ms
function handleSearchInput(value: string): void {
  searchInput.value = value
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
    queryLogStore.searchByKeyword(value.trim()).catch(() => {
      ElMessage.error('搜索失败，请重试')
    })
  }, 300)
}

function handlePageChange(page: number): void {
  currentPage.value = page
}

function formatDateTime(iso: string): string {
  return iso.slice(0, 19).replace('T', ' ')
}

const isDetailDialogVisible = ref(false)
const selectedRecordId = ref<string | null>(null)

function handleView(recordId: string): void {
  selectedRecordId.value = recordId
  isDetailDialogVisible.value = true
}

onMounted(() => {
  queryLogStore.fetchQueryLogs().catch(() => {
    ElMessage.error('查询记录加载失败，请重试')
  })
  queryLogStore.fetchHotKeywords().catch(() => {
    ElMessage.error('高频搜索词加载失败，请重试')
  })
})
</script>

<template>
  <div class="query-log-list-view">
    <h2 class="query-log-list-view__title">查询记录</h2>

    <HotKeywordPanel :keywords="hotKeywords" />

    <div class="query-log-list-view__search">
      <el-input
        :model-value="searchInput"
        placeholder="按问题关键词搜索查询记录"
        clearable
        class="query-log-list-view__search-input"
        @update:model-value="handleSearchInput"
      />
    </div>

    <div v-loading="isLoading" class="query-log-list-view__table">
      <el-empty v-if="isEmpty" :description="emptyDescription" />
      <el-table v-else :data="pagedRecords" row-key="recordId" style="width: 100%">
        <el-table-column prop="askerUsername" label="提问用户" width="140" />
        <el-table-column prop="questionSummary" label="问题摘要" min-width="240" />
        <el-table-column label="记录时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.recordedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="来源路径" min-width="200">
          <template #default="{ row }">
            <span v-if="row.sourceLocatorSummary">{{ row.sourceLocatorSummary }}</span>
            <span v-else class="query-log-list-view__source-empty">无</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row.recordId)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="!isEmpty"
        class="query-log-list-view__pagination"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="totalCount"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>

    <QueryLogDetailDialog v-model="isDetailDialogVisible" :record-id="selectedRecordId" />
  </div>
</template>

<style scoped lang="scss">
.query-log-list-view {
  padding: var(--space-md);

  &__title {
    margin: 0 0 var(--space-md) 0;
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
  }

  &__search {
    margin-bottom: var(--space-md);
  }

  &__search-input {
    max-width: 360px;
  }

  &__table {
    min-height: 200px;
    background-color: var(--color-bg-card);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }

  &__source-empty {
    color: var(--color-text-placeholder);
  }

  &__pagination {
    margin-top: var(--space-md);
    display: flex;
    justify-content: flex-end;
  }
}
</style>
