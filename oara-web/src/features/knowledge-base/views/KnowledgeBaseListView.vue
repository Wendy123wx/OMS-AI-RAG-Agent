<script setup lang="ts">
// P09-01 知识库管理列表页：文件名/上传时间/处理状态展示，处理失败可查看具体原因（PRD 15）
// 仅承接列表查看与上传入口，不承接任何“答案来源点击”入口（不引用 C06，见 AGENT-03 反例说明）
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'

import MessageDialog from '@/components/MessageDialog.vue'
import KnowledgeUploadDialog from '../components/KnowledgeUploadDialog.vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBase'
import type { KnowledgeDocumentVo, ProcessingStatus } from '@/types/knowledge-document'

const knowledgeBaseStore = useKnowledgeBaseStore()

const currentPage = ref(1)
// R1 保守默认：一次性加载全部 Mock 数据 + 前端分页（每页20条）
const pageSize = 20

const isLoading = computed(() => knowledgeBaseStore.isLoading)
const documents = computed(() => knowledgeBaseStore.documents)
const isEmpty = computed(() => !isLoading.value && knowledgeBaseStore.isEmpty)

// R7 保守默认：按上传时间倒序（最新在前）
const sortedDocuments = computed(() =>
  [...documents.value].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  ),
)
const totalCount = computed(() => sortedDocuments.value.length)
const pagedDocuments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedDocuments.value.slice(start, start + pageSize)
})

function handlePageChange(page: number): void {
  currentPage.value = page
}

function formatDateTime(iso: string): string {
  return iso.slice(0, 19).replace('T', ' ')
}

function formatFileSize(bytes: number): string {
  if (bytes <= 0) {
    return '-'
  }
  const megaBytes = bytes / (1024 * 1024)
  return `${megaBytes.toFixed(2)}MB`
}

const STATUS_TAG_TYPE: Record<ProcessingStatus, 'info' | 'success' | 'danger'> = {
  parsing: 'info',
  indexed: 'success',
  failed: 'danger',
}

const STATUS_TEXT: Record<ProcessingStatus, string> = {
  parsing: '解析中',
  indexed: '已入库',
  failed: '处理失败',
}

function statusTagType(status: ProcessingStatus): 'info' | 'success' | 'danger' {
  return STATUS_TAG_TYPE[status]
}

function statusText(status: ProcessingStatus): string {
  return STATUS_TEXT[status]
}

const isUploadDialogVisible = ref(false)

function handleOpenUpload(): void {
  isUploadDialogVisible.value = true
}

function handleUploaded(): void {
  currentPage.value = 1
}

const isFailureReasonDialogVisible = ref(false)
const failureReasonContent = ref('')

function handleViewFailureReason(document: KnowledgeDocumentVo): void {
  failureReasonContent.value = document.failureReason ?? '处理失败，未提供具体原因'
  isFailureReasonDialogVisible.value = true
}

// PRD 5.10.4：处理完成前须支持异步呈现结果，此处用轮询刷新替代真实后端推送
let pollingTimer: ReturnType<typeof setInterval> | null = null

function stopPolling(): void {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

function startPolling(): void {
  stopPolling()
  pollingTimer = setInterval(() => {
    if (!knowledgeBaseStore.hasProcessingDocuments) {
      return
    }
    knowledgeBaseStore.fetchDocuments().catch(() => {
      // 轮询失败不打断页面，等待下一次轮询重试
    })
  }, 3000)
}

onMounted(() => {
  knowledgeBaseStore.fetchDocuments().catch(() => {
    ElMessage.error('知识库文件列表加载失败，请重试')
  })
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="knowledge-base-list-view">
    <div class="knowledge-base-list-view__header">
      <h2 class="knowledge-base-list-view__title">知识库管理</h2>
      <el-button
        type="primary"
        class="knowledge-base-list-view__upload-entry"
        :icon="Upload"
        @click="handleOpenUpload"
      >
        上传文件
      </el-button>
    </div>

    <div v-loading="isLoading" class="knowledge-base-list-view__table">
      <el-empty v-if="isEmpty" description="尚无已上传知识库文件" />
      <template v-else>
        <div class="knowledge-base-list-view__table-wrap">
          <el-table :data="pagedDocuments" row-key="documentId" height="100%" style="width: 100%">
            <el-table-column prop="fileName" label="文件名" min-width="240" />
            <el-table-column label="上传时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.uploadedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="文件大小" width="120">
              <template #default="{ row }">
                {{ formatFileSize(row.fileSizeBytes) }}
              </template>
            </el-table-column>
            <el-table-column prop="uploaderUsername" label="上传人" width="140" />
            <el-table-column label="处理状态" width="140">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" disable-transitions>
                  {{ statusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'failed'"
                  type="danger"
                  link
                  @click="handleViewFailureReason(row)"
                >
                  查看原因
                </el-button>
                <span v-else class="knowledge-base-list-view__no-action">-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-pagination
          class="knowledge-base-list-view__pagination"
          :current-page="currentPage"
          :page-size="pageSize"
          :total="totalCount"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </template>
    </div>

    <KnowledgeUploadDialog v-model="isUploadDialogVisible" @uploaded="handleUploaded" />

    <MessageDialog
      v-model="isFailureReasonDialogVisible"
      title="处理失败原因"
      :content="failureReasonContent"
    />
  </div>
</template>

<style scoped lang="scss">
.knowledge-base-list-view {
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  min-height: 0;
  height: 100%;

  &__header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-md);
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
  }

  &__table {
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    min-height: 0;
    padding: var(--space-md);
    background-color: var(--color-bg-card);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);

    :deep(.el-table) {
      width: 100%;
    }

    :deep(.el-empty) {
      flex: 1 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__table-wrap {
    flex: 1 0 0;
    min-height: 0;
  }

  &__no-action {
    color: var(--color-text-placeholder);
  }

  &__pagination {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    margin-top: auto;
    padding-top: var(--space-md);
  }
}
</style>
