<script setup lang="ts">
// P07-02（C04）查询记录详情弹窗（管理员全量视角，与 P03-02/C01 独立维护，不共享 .vue 文件）
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

import AnswerSourceDetailDialog from '@/components/AnswerSourceDetailDialog.vue'
import { useQueryLogStore } from '@/stores/queryLog'
import type { SourceReference } from '@/types/qa'

interface Props {
  modelValue: boolean
  recordId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const queryLogStore = useQueryLogStore()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const detail = computed(() => queryLogStore.currentDetail)
const isLoading = computed(() => queryLogStore.isLoading)

const isSourceDialogVisible = ref(false)
const selectedSource = ref<SourceReference | null>(null)

function openSourceDetail(source: SourceReference): void {
  if (source.kind !== 'knowledge_document') {
    return
  }
  selectedSource.value = source
  isSourceDialogVisible.value = true
}

function formatDateTime(iso: string): string {
  return iso.slice(0, 19).replace('T', ' ')
}

watch(
  () => [props.modelValue, props.recordId] as const,
  ([isVisible, recordId]) => {
    if (isVisible && recordId) {
      queryLogStore.fetchQueryLogDetail(recordId).catch(() => {
        // ERR-01/ERR-03：捕获异常并提示用户友好文案，技术细节由拦截器归一化后不在此重复展示
        ElMessage.error('详情加载失败，请重试')
      })
    }
  },
  { immediate: true },
)

function handleClosed(): void {
  queryLogStore.clearCurrentDetail()
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="查询记录详情"
    width="640px"
    class="query-log-detail-dialog"
    @closed="handleClosed"
  >
    <div v-loading="isLoading" class="query-log-detail-dialog__body">
      <template v-if="detail">
        <p class="query-log-detail-dialog__field">
          <span class="query-log-detail-dialog__label">完整问题：</span>
          <span>{{ detail.question }}</span>
        </p>
        <p class="query-log-detail-dialog__field">
          <span class="query-log-detail-dialog__label">记录时间：</span>
          <span>{{ formatDateTime(detail.recordedAt) }}</span>
        </p>
        <p class="query-log-detail-dialog__field">
          <span class="query-log-detail-dialog__label">来源路径：</span>
          <template v-if="detail.sources.length > 0">
            <span
              v-for="source in detail.sources"
              :key="source.locator"
              class="query-log-detail-dialog__source"
              :class="{
                'query-log-detail-dialog__source--clickable': source.kind === 'knowledge_document',
              }"
              @click="openSourceDetail(source)"
            >
              {{ source.locator }}
            </span>
          </template>
          <span v-else class="query-log-detail-dialog__source-empty">无</span>
        </p>
        <p class="query-log-detail-dialog__field query-log-detail-dialog__field--answer-label">
          <span class="query-log-detail-dialog__label">完整答案：</span>
        </p>
        <p class="query-log-detail-dialog__answer">{{ detail.answer }}</p>
      </template>
      <el-empty v-else-if="!isLoading" description="暂无详情数据" />
    </div>
    <template #footer>
      <el-button type="primary" @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>

  <AnswerSourceDetailDialog v-model="isSourceDialogVisible" :source="selectedSource" />
</template>

<style scoped lang="scss">
.query-log-detail-dialog {
  &__body {
    min-height: 120px;
  }

  &__field {
    margin: 0 0 var(--space-sm) 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);

    &--answer-label {
      margin-bottom: var(--space-xs);
    }
  }

  &__label {
    color: var(--color-text-secondary);
  }

  &__source {
    margin-right: var(--space-sm);
    color: var(--color-text-primary);

    &--clickable {
      color: var(--color-primary);
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__source-empty {
    color: var(--color-text-placeholder);
  }

  &__answer {
    margin: 0;
    padding: var(--space-md);
    background-color: var(--color-bg-page);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    white-space: pre-wrap;
  }
}
</style>
