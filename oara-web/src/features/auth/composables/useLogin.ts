// P01 账号密码登录交互逻辑（T02）：封装表单状态、提交、错误提示，供 LoginPanel.vue 使用（COMP-06）
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { AppError } from '@/utils/http'

const MAX_ACCOUNT_LENGTH = 64
const MAX_PASSWORD_LENGTH = 64

export interface UseLoginResult {
  username: Ref<string>
  password: Ref<string>
  isSubmitting: Ref<boolean>
  errorMessage: Ref<string>
  submit: () => Promise<void>
}

// 登录失败兜底文案（ERR-03：不展示后端异常堆栈/英文原文）
const FALLBACK_ERROR_MESSAGE = '登录失败，请稍后重试'

export function useLogin(): UseLoginResult {
  const authStore = useAuthStore()
  const router = useRouter()

  const username = ref('')
  const password = ref('')
  const isSubmitting = ref(false)
  const errorMessage = ref('')

  async function submit(): Promise<void> {
    if (isSubmitting.value) {
      return
    }

    const trimmedUsername = username.value.trim()
    const trimmedPassword = password.value.trim()
    errorMessage.value = ''

    if (!trimmedUsername || !trimmedPassword) {
      errorMessage.value = '请输入账号和密码'
      return
    }
    if (trimmedUsername.length > MAX_ACCOUNT_LENGTH || trimmedPassword.length > MAX_PASSWORD_LENGTH) {
      errorMessage.value = '账号或密码长度超出限制'
      return
    }

    isSubmitting.value = true
    try {
      await authStore.login(trimmedUsername, trimmedPassword)
      await router.push({ name: 'AgentChat' })
    } catch (error) {
      if (error instanceof AppError) {
        errorMessage.value = error.message
      } else {
        errorMessage.value = FALLBACK_ERROR_MESSAGE
      }
    } finally {
      isSubmitting.value = false
    }
  }

  return { username, password, isSubmitting, errorMessage, submit }
}
