import { defineStore } from 'pinia'

import * as authApi from '@/api/auth'
import type { Role, UserAccount } from '@/types/qa'

export interface AuthState {
  token: string | null
  currentUser: UserAccount | null
  isLoading: boolean
}

// useAuthStore（唯一鉴权 Store，T01/T02/T09 使用，禁止新建第二个鉴权 Store，见集成契约 §3.2）
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    currentUser: null,
    isLoading: false,
  }),
  getters: {
    isAuthenticated(state): boolean {
      return Boolean(state.token)
    },
    role(state): Role | null {
      return state.currentUser?.role ?? null
    },
  },
  actions: {
    async login(username: string, password: string): Promise<void> {
      this.isLoading = true
      try {
        const res = await authApi.login({ username, password })
        this.token = res.data.token
        this.currentUser = res.data.user
      } finally {
        this.isLoading = false
      }
    },
    async logout(): Promise<void> {
      await authApi.logout()
      this.token = null
      this.currentUser = null
    },
    async changePassword(originalPassword: string, newPassword: string): Promise<void> {
      await authApi.changePassword({ originalPassword, newPassword })
    },
    async fetchCurrentUser(): Promise<void> {
      const res = await authApi.fetchCurrentUser()
      this.currentUser = res.data
    },
  },
  // STATE-05：仅持久化鉴权必要字段，会话消息内容禁止持久化
  persist: {
    key: 'oara-auth',
    storage: localStorage,
    pick: ['token', 'currentUser.accountId', 'currentUser.role', 'currentUser.username'],
  },
})
