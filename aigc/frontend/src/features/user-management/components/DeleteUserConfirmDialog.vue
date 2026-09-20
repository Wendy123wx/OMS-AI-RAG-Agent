<script setup lang="ts">
// P04-02（C03）用户删除确认弹窗（T05）：私有化弹窗，展示目标用户信息与不可恢复提示（PRD 5.5.2）
import { computed } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

import type { UserAccountVo } from '@/types/user'

interface Props {
  modelValue: boolean
  user: UserAccountVo | null
  isConfirmLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
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
  <el-dialog
    v-model="visible"
    title="删除用户"
    width="420px"
    class="delete-user-confirm-dialog"
    :close-on-click-modal="false"
  >
    <div class="delete-user-confirm-dialog__target">
      <span class="delete-user-confirm-dialog__label">待删除账号：</span>
      <span class="delete-user-confirm-dialog__username">{{ props.user?.username ?? '—' }}</span>
    </div>
    <p class="delete-user-confirm-dialog__warning">
      <el-icon class="delete-user-confirm-dialog__warning-icon"><WarningFilled /></el-icon>
      删除后该账号将无法恢复，也无法再登录系统（提示账号不存在）；该用户此前的查询记录仍会保留在查询记录模块中。
    </p>
    <template #footer>
      <el-button class="delete-user-confirm-dialog__cancel" @click="handleCancel">取消</el-button>
      <el-button
        type="danger"
        class="delete-user-confirm-dialog__confirm"
        :loading="props.isConfirmLoading"
        @click="handleConfirm"
      >
        确认删除
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.delete-user-confirm-dialog {
  &__target {
    margin-bottom: var(--space-sm);
    font-size: var(--font-size-md);
    color: var(--color-text-primary);
  }

  &__label {
    color: var(--color-text-secondary);
  }

  &__username {
    font-weight: 600;
  }

  &__warning {
    display: flex;
    align-items: flex-start;
    gap: var(--space-xs);
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-danger);
  }

  &__warning-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__cancel {
    margin-right: var(--space-sm);
  }
}
</style>
