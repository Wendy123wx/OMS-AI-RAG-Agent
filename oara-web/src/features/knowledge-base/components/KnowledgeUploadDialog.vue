<script setup lang="ts">
// P09-02（C05）知识库文件上传弹窗：类型/大小/重复文档三类校验，均拦截并提示且不生成记录（PRD 16）
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadUserFile } from 'element-plus'

import { useKnowledgeBaseStore } from '@/stores/knowledgeBase'
import { AppError } from '@/utils/http'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'uploaded'): void
}>()

const knowledgeBaseStore = useKnowledgeBaseStore()

// R5 保守默认：仅支持 PDF/Word，单文件不超过 20MB
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx']
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const fileList = ref<UploadUserFile[]>([])
const selectedFile = ref<File | null>(null)
const validationError = ref<string | null>(null)

const isUploading = computed(() => knowledgeBaseStore.isUploading)
const canSubmit = computed(() => Boolean(selectedFile.value) && !validationError.value)

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      resetForm()
    }
  },
)

function resetForm(): void {
  fileList.value = []
  selectedFile.value = null
  validationError.value = null
}

function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

// PRD 5.10.3：类型/大小/重复文档三类拦截，判定失败均不生成记录
function validateFile(file: File): string | null {
  if (!ALLOWED_EXTENSIONS.includes(getFileExtension(file.name))) {
    return '不支持该文件格式，仅支持 PDF/Word'
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return '文件超过大小限制（默认20MB）'
  }
  // 重复文档校验：文件名完全一致判定（R5 保守默认），已「处理失败」的同名文件允许重新上传
  const isDuplicate = knowledgeBaseStore.documents.some(
    (document) => document.fileName === file.name && document.status !== 'failed',
  )
  if (isDuplicate) {
    return '知识库中已存在同名文件，请勿重复上传'
  }
  return null
}

function handleFileChange(uploadFile: UploadFile): void {
  const rawFile = uploadFile.raw
  fileList.value = [uploadFile]
  if (!rawFile) {
    selectedFile.value = null
    validationError.value = '文件读取失败，请重新选择'
    return
  }
  selectedFile.value = rawFile
  validationError.value = validateFile(rawFile)
}

function handleFileRemove(): void {
  resetForm()
}

// ERR-03：用户可见提示不展示后端异常堆栈/英文原文，仅透出已归一化的业务提示文案
function extractErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  return '上传失败，请稍后重试'
}

async function handleSubmit(): Promise<void> {
  if (!selectedFile.value) {
    validationError.value = '请先选择要上传的文件'
    return
  }
  const error = validateFile(selectedFile.value)
  if (error) {
    validationError.value = error
    return
  }

  try {
    // R6 保守默认：校验通过后创建「解析中」记录，提交后立即关闭弹窗，由列表页异步更新处理结果
    await knowledgeBaseStore.uploadDocument(selectedFile.value)
    ElMessage.success('上传成功，已提交解析入库')
    resetForm()
    visible.value = false
    emit('uploaded')
  } catch (submitError) {
    validationError.value = extractErrorMessage(submitError)
  }
}

function handleCancel(): void {
  resetForm()
  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="上传知识库文件"
    width="480px"
    class="knowledge-upload-dialog"
    :close-on-click-modal="false"
    @close="resetForm"
  >
    <el-upload
      class="knowledge-upload-dialog__upload"
      drag
      :auto-upload="false"
      :limit="1"
      :file-list="fileList"
      accept=".pdf,.doc,.docx"
      @change="handleFileChange"
      @remove="handleFileRemove"
    >
      <div class="knowledge-upload-dialog__hint">将文件拖到此处，或<em>点击选择文件</em></div>
    </el-upload>
    <p class="knowledge-upload-dialog__constraint">仅支持 PDF、Word 格式，单个文件不超过 20MB</p>
    <el-alert
      v-if="validationError"
      class="knowledge-upload-dialog__error"
      type="error"
      :title="validationError"
      show-icon
      :closable="false"
    />
    <template #footer>
      <div class="knowledge-upload-dialog__actions">
        <el-button class="knowledge-upload-dialog__cancel" @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          class="knowledge-upload-dialog__confirm"
          :disabled="!canSubmit"
          :loading="isUploading"
          @click="handleSubmit"
        >
          确定上传
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.knowledge-upload-dialog {
  &__upload {
    width: 100%;
  }

  &__hint {
    padding: var(--space-lg) 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);

    em {
      color: var(--color-primary);
      font-style: normal;
    }
  }

  &__constraint {
    margin: var(--space-sm) 0 0 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-placeholder);
  }

  &__error {
    margin-top: var(--space-sm);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
  }
}
</style>
