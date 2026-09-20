<script setup lang="ts">
// P08 修改密码弹窗（T09）
// 契约：仅暴露 v-model，供 WorkbenchShellView/AdminShellView 头像下拉引用，不修改壳层文件本身逻辑（集成契约 §3.5）
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

import { useAuthStore } from '@/stores'
import { AppError } from '@/utils/http'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const authStore = useAuthStore()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// 只读用户名，来自 useAuthStore().currentUser（PRD 5.8.1）
const username = computed(() => authStore.currentUser?.username ?? '')

interface ChangePasswordFormModel {
  originalPassword: string
  newPassword: string
  confirmPassword: string
}

const formRef = ref<FormInstance>()
const isSubmitting = ref(false)

const formModel = reactive<ChangePasswordFormModel>({
  originalPassword: '',
  newPassword: '',
  confirmPassword: '',
})

function validateConfirmPassword(
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void,
): void {
  if (value !== formModel.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
    return
  }
  callback()
}

// PRD 未规定新密码强度要求，保守默认沿用登录密码长度约定（≥8位），见任务风险与待确认默认
const rules: FormRules<ChangePasswordFormModel> = {
  originalPassword: [{ required: true, message: '请输入原始密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '新密码长度不少于8位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

function resetForm(): void {
  formModel.originalPassword = ''
  formModel.newPassword = ''
  formModel.confirmPassword = ''
  formRef.value?.clearValidate()
}

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      resetForm()
    }
  },
)

// ERR-03：用户可见提示不展示后端异常堆栈/英文原文，仅透出已归一化的业务提示文案
function extractErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  return '修改失败，请稍后重试'
}

async function handleSubmit(): Promise<void> {
  const form = formRef.value
  if (!form) {
    return
  }
  let isValid = false
  try {
    isValid = await form.validate()
  } catch {
    isValid = false
  }
  if (!isValid) {
    return
  }

  isSubmitting.value = true
  try {
    // 提交调用 useAuthStore().changePassword，签名不变（集成契约 §3.2）
    await authStore.changePassword(formModel.originalPassword, formModel.newPassword)
    ElMessage.success('密码修改成功')
    // 修改成功不强制退出登录（PRD 5.8.1），仅关闭弹窗回到触发页
    visible.value = false
  } catch (error) {
    ElMessage.error(extractErrorMessage(error))
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel(): void {
  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="修改密码"
    width="420px"
    class="change-password-dialog"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="rules"
      label-width="88px"
      class="change-password-dialog__form"
    >
      <el-form-item label="用户名" class="change-password-dialog__username-item">
        <el-input
          :model-value="username"
          readonly
          class="change-password-dialog__username-input"
        />
      </el-form-item>
      <el-form-item label="原始密码" prop="originalPassword">
        <el-input
          v-model="formModel.originalPassword"
          type="password"
          show-password
          autocomplete="new-password"
          placeholder="请输入原始密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="formModel.newPassword"
          type="password"
          show-password
          autocomplete="new-password"
          placeholder="请输入新密码"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formModel.confirmPassword"
          type="password"
          show-password
          autocomplete="new-password"
          placeholder="请再次输入新密码"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="change-password-dialog__actions">
        <el-button class="change-password-dialog__cancel" @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          class="change-password-dialog__submit"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.change-password-dialog {
  &__form {
    padding-top: var(--space-sm);
  }

  &__username-input {
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
  }
}
</style>
