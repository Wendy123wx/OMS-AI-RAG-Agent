<script setup lang="ts">
// G01 通用确认弹窗（集成契约 §3.4）：不含任何业务字段，供任意模块以受控 v-model 复用
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  content: string
  confirmText?: string
  cancelText?: string
  isConfirmLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认',
  confirmText: '确认',
  cancelText: '取消',
  isConfirmLoading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

function handleConfirm(): void {
  emit('confirm')
}

function handleCancel(): void {
  visible.value = false
  emit('cancel')
}
</script>

<template>
  <el-dialog v-model="visible" :title="props.title" width="420px" class="confirm-dialog">
    <p class="confirm-dialog__content">{{ props.content }}</p>
    <template #footer>
      <el-button class="confirm-dialog__cancel" @click="handleCancel">
        {{ props.cancelText }}
      </el-button>
      <el-button
        type="primary"
        class="confirm-dialog__confirm"
        :loading="props.isConfirmLoading"
        @click="handleConfirm"
      >
        {{ props.confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.confirm-dialog {
  &__content {
    margin: 0;
    font-size: var(--font-size-md);
    color: var(--color-text-primary);
  }
}
</style>
