<script setup lang="ts">
// 提问区域：问题输入框、发送、发送前取消、生成中终止。
// AGENT-09.1：streaming/pending 期间输入框与发送按钮必须禁用，不做排队等待自动发送设计。
import { computed, ref } from 'vue'
import { Close, CircleClose, Promotion } from '@element-plus/icons-vue'

const MAX_QUESTION_LENGTH = 2000

interface Props {
  canSend: boolean
  isStreaming: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'sendQuestion', text: string): void
  (e: 'cancelBeforeSend'): void
  (e: 'stopGeneration'): void
}>()

const inputText = ref('')

const isInputDisabled = computed(() => props.isStreaming)
const isSendDisabled = computed(
  () => props.isStreaming || !props.canSend || inputText.value.trim().length === 0,
)
const hasDraftText = computed(() => inputText.value.trim().length > 0)

function handleSend(): void {
  if (isSendDisabled.value) {
    return
  }
  const trimmed = inputText.value.trim()
  emit('sendQuestion', trimmed)
  inputText.value = ''
}

function handleCancelBeforeSend(): void {
  // AGENT-07：取消发送直接清空输入框，不写入历史/查询记录
  inputText.value = ''
  emit('cancelBeforeSend')
}

function handleStopGeneration(): void {
  emit('stopGeneration')
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="question-input">
    <el-input
      v-model="inputText"
      type="textarea"
      class="question-input__textarea"
      :rows="3"
      :maxlength="MAX_QUESTION_LENGTH"
      :disabled="isInputDisabled"
      placeholder="请输入您的问题，按 Enter 发送，Shift + Enter 换行"
      @keydown="handleKeydown"
    />
    <div class="question-input__actions">
      <el-button
        v-if="hasDraftText && !isStreaming"
        class="question-input__cancel"
        :icon="Close"
        @click="handleCancelBeforeSend"
      >
        取消
      </el-button>
      <el-button v-if="isStreaming" type="warning" :icon="CircleClose" @click="handleStopGeneration">
        终止生成
      </el-button>
      <el-button v-else type="primary" :icon="Promotion" :disabled="isSendDisabled" @click="handleSend">
        发送
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.question-input {
  display: flex;
  flex-shrink: 0;
  align-items: flex-end;
  gap: var(--space-sm);
  padding: var(--space-md);
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  &__textarea {
    flex: 1;
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    gap: var(--space-sm);
  }
}
</style>
