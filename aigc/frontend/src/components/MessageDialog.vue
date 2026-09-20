<script setup lang="ts">
// G02 通用提示弹窗（集成契约 §3.4）
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  content: string
  confirmText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '提示',
  confirmText: '知道了',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

function handleConfirm(): void {
  visible.value = false
  emit('confirm')
}
</script>

<template>
  <el-dialog v-model="visible" :title="props.title" width="380px" class="message-dialog">
    <p class="message-dialog__content">{{ props.content }}</p>
    <template #footer>
      <el-button type="primary" class="message-dialog__confirm" @click="handleConfirm">
        {{ props.confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.message-dialog {
  &__content {
    margin: 0;
    font-size: var(--font-size-md);
    color: var(--color-text-primary);
  }
}
</style>
