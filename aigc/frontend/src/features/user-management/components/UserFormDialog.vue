<script setup lang="ts">
// P04-03（C02）新增/编辑用户弹窗（T05）：同一组件按 mode 区分字段可编辑性（PRD 6.1）
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

import { useUserManagementStore } from '@/stores'
import type { UserAccountVo } from '@/types/user'

interface Props {
  modelValue: boolean
  mode: 'create' | 'edit'
  user: UserAccountVo | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submitted'): void
}>()

const store = useUserManagementStore()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const dialogTitle = computed(() => (props.mode === 'create' ? '新增用户' : '编辑用户'))
const isCreateMode = computed(() => props.mode === 'create')

interface UserFormModel {
  username: string
  email: string
  avatar: string
  initialPassword: string
}

const formRef = ref<FormInstance>()
const isSubmitting = ref(false)
const isAvatarReading = ref(false)
const formModel = reactive<UserFormModel>({
  username: '',
  email: '',
  avatar: '',
  initialPassword: '',
})

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_AVATAR_BYTES = 2 * 1024 * 1024

function validateUsernameUnique(
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void,
): void {
  if (!isCreateMode.value) {
    callback()
    return
  }
  const trimmed = value?.trim() ?? ''
  const exists = store.users.some((item) => item.username === trimmed)
  if (trimmed && exists) {
    callback(new Error('用户名已存在，请更换后重试'))
    return
  }
  callback()
}

function validateEmailFormat(
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void,
): void {
  if (value && !EMAIL_PATTERN.test(value)) {
    callback(new Error('邮箱格式不正确'))
    return
  }
  callback()
}

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { validator: validateUsernameUnique, trigger: 'blur' },
  ],
  email: [{ validator: validateEmailFormat, trigger: 'blur' }],
  initialPassword: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 8, message: '初始密码长度不少于8位', trigger: 'blur' },
  ],
}

watch(
  () => props.modelValue,
  (isVisible) => {
    if (!isVisible) {
      return
    }
    formModel.username = props.mode === 'edit' ? props.user?.username ?? '' : ''
    formModel.email = props.user?.email ?? ''
    formModel.avatar = props.user?.avatar ?? ''
    formModel.initialPassword = ''
    formRef.value?.clearValidate()
  },
)

function handleAvatarChange(uploadFile: UploadFile): void {
  const raw = uploadFile.raw
  if (!raw) {
    return
  }
  if (!raw.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return
  }
  if (raw.size > MAX_AVATAR_BYTES) {
    ElMessage.error('头像图片不能超过 2MB')
    return
  }
  isAvatarReading.value = true
  const reader = new FileReader()
  reader.onload = () => {
    formModel.avatar = typeof reader.result === 'string' ? reader.result : ''
    isAvatarReading.value = false
  }
  reader.onerror = () => {
    ElMessage.error('头像读取失败，请重试')
    isAvatarReading.value = false
  }
  reader.readAsDataURL(raw)
}

async function handleSubmit(): Promise<void> {
  const form = formRef.value
  if (!form) {
    return
  }
  const isValid = await form.validate().catch(() => false)
  if (!isValid) {
    return
  }
  isSubmitting.value = true
  try {
    if (props.mode === 'create') {
      await store.createUser({
        username: formModel.username.trim(),
        email: formModel.email.trim() || undefined,
        avatar: formModel.avatar.trim() || undefined,
        initialPassword: formModel.initialPassword,
      })
      ElMessage.success('新增用户成功')
    } else if (props.user) {
      await store.updateUser(props.user.accountId, {
        email: formModel.email.trim() || undefined,
        avatar: formModel.avatar.trim() || undefined,
      })
      ElMessage.success('保存成功')
    }
    visible.value = false
    emit('submitted')
  } catch (error) {
    ElMessage.error(error instanceof Error && error.message ? error.message : '提交失败，请稍后重试')
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
    :title="dialogTitle"
    width="480px"
    class="user-form-dialog"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="formModel" :rules="formRules" label-width="90px">
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formModel.username"
          :disabled="!isCreateMode"
          placeholder="请输入登录用户名"
          maxlength="32"
        />
      </el-form-item>
      <el-form-item label="用户邮箱" prop="email">
        <el-input v-model="formModel.email" placeholder="选填" maxlength="64" />
      </el-form-item>
      <el-form-item label="用户头像" prop="avatar">
        <div class="user-form-dialog__avatar-field">
          <el-upload
            class="user-form-dialog__avatar-upload"
            :show-file-list="false"
            :auto-upload="false"
            accept="image/png,image/jpeg,image/webp,image/gif"
            :disabled="isSubmitting || isAvatarReading"
            @change="handleAvatarChange"
          >
            <div class="user-form-dialog__avatar" role="button" aria-label="点击上传用户头像">
              <img
                v-if="formModel.avatar"
                :src="formModel.avatar"
                alt="用户头像预览"
                class="user-form-dialog__avatar-image"
              />
              <el-icon v-else class="user-form-dialog__avatar-plus" :size="28"><Plus /></el-icon>
            </div>
          </el-upload>
          <p class="user-form-dialog__avatar-hint">点击上传，预览按 1:1 展示</p>
        </div>
      </el-form-item>
      <el-form-item v-if="isCreateMode" label="初始密码" prop="initialPassword">
        <el-input
          v-model="formModel.initialPassword"
          type="text"
          autocomplete="new-password"
          placeholder="至少8位，创建后用户可直接登录"
          maxlength="32"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button class="user-form-dialog__cancel" @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="isSubmitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.user-form-dialog {
  &__cancel {
    margin-right: var(--space-sm);
  }

  &__avatar-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  &__avatar-upload {
    width: 96px;
  }

  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 96px;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    cursor: pointer;
    color: var(--color-text-placeholder);
    background-color: var(--color-bg-page);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    transition:
      border-color var(--transition-base) var(--ease-standard),
      color var(--transition-base) var(--ease-standard);

    &:hover {
      color: var(--color-primary);
      border-color: var(--color-primary);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  }

  &__avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    aspect-ratio: 1 / 1;
  }

  &__avatar-plus {
    pointer-events: none;
  }

  &__avatar-hint {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }
}
</style>
