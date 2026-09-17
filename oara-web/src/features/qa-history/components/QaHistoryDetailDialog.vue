<script setup lang="ts">
// P03-02（C01）历史记录详情弹窗：本人视角完整问答详情（PRD 5.4）。
// 知识库类来源可点击，委托全局 C06（AnswerSourceDetailDialog）展示命中片段；订单类来源不可点击（PRD 5.3.5）。
// 不新建除 C06 外的来源详情组件（DIR-02）：本弹窗内联展示问题/时间/来源/答案，来源点击统一交给 C06。
import { computed, ref, watch } from 'vue'

import AnswerSourceDetailDialog from '@/components/AnswerSourceDetailDialog.vue'
import { useQaHistoryStore } from '@/stores/qaHistory'
import type { SourceReference } from '@/types/qa'

interface Props {
  modelValue: boolean
  recordId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const qaHistoryStore = useQaHistoryStore()

const isSourceDialogVisible = ref(false)
const selectedSource = ref<SourceReference | null>(null)

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// AGENT-03 同理：异常态答复来源为空，不展示来源区块（领域模型 3.3 不变量5）
const isSourceSectionVisible = computed(() => {
  const detail = qaHistoryStore.currentDetail
  return Boolean(detail) && detail?.resultType !== 'exception' && (detail?.sources.length ?? 0) > 0
})

watch(
  () => [props.modelValue, props.recordId] as const,
  ([isVisible, recordId]) => {
    if (isVisible && recordId) {
      qaHistoryStore.fetchHistoryDetail(recordId).catch(() => {
        // 详情加载失败时保持 currentDetail 为空，模板走"未找到详情"分支，不展示虚假内容
      })
    }
    if (!isVisible) {
      qaHistoryStore.clearCurrentDetail()
    }
  },
  { immediate: true },
)

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

function isKnowledgeSource(source: SourceReference): boolean {
  return source.kind === 'knowledge_document'
}

function openSourceDetail(source: SourceReference): void {
  if (!isKnowledgeSource(source)) {
    return
  }
  selectedSource.value = source
  isSourceDialogVisible.value = true
}

function handleClose(): void {
  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="历史记录详情"
    width="600px"
    class="qa-history-detail-dialog"
  >
    <div v-loading="qaHistoryStore.isLoading" class="qa-history-detail-dialog__body">
      <template v-if="qaHistoryStore.currentDetail">
        <section class="qa-history-detail-dialog__section">
          <h3 class="qa-history-detail-dialog__label">问题</h3>
          <p class="qa-history-detail-dialog__question">{{ qaHistoryStore.currentDetail.question }}</p>
        </section>

        <section class="qa-history-detail-dialog__section">
          <h3 class="qa-history-detail-dialog__label">记录时间</h3>
          <p>{{ formatRecordedAt(qaHistoryStore.currentDetail.recordedAt) }}</p>
        </section>

        <section v-if="isSourceSectionVisible" class="qa-history-detail-dialog__section">
          <h3 class="qa-history-detail-dialog__label">来源路径</h3>
          <ul class="qa-history-detail-dialog__source-list">
            <li v-for="source in qaHistoryStore.currentDetail.sources" :key="source.locator">
              <el-link
                v-if="isKnowledgeSource(source)"
                type="primary"
                :underline="false"
                @click="openSourceDetail(source)"
              >
                {{ source.documentName ?? source.locator }}
              </el-link>
              <span v-else class="qa-history-detail-dialog__source-text">{{ source.locator }}</span>
            </li>
          </ul>
        </section>

        <section class="qa-history-detail-dialog__section">
          <h3 class="qa-history-detail-dialog__label">完整答案</h3>
          <p class="qa-history-detail-dialog__answer">{{ qaHistoryStore.currentDetail.answer }}</p>
        </section>
      </template>
      <el-empty v-else-if="!qaHistoryStore.isLoading" description="未找到该记录详情" />
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>

  <AnswerSourceDetailDialog v-model="isSourceDialogVisible" :source="selectedSource" />
</template>

<style scoped lang="scss">
.qa-history-detail-dialog {
  &__body {
    min-height: 120px;
  }

  &__section {
    margin-bottom: var(--space-md);
  }

  &__label {
    margin: 0 0 var(--space-xs) 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  &__question,
  &__answer {
    margin: 0;
    font-size: var(--font-size-md);
    color: var(--color-text-primary);
    white-space: pre-wrap;
  }

  &__source-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__source-text {
    color: var(--color-text-secondary);
  }
}
</style>
