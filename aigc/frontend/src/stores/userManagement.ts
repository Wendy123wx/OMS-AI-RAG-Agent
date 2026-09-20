import { defineStore } from 'pinia'

import * as userManagementApi from '@/api/userManagement'
import type { CreateUserParams, UpdateUserParams, UserAccountVo } from '@/types/user'

export interface UserManagementState {
  users: UserAccountVo[]
  isLoading: boolean
}

export const useUserManagementStore = defineStore('userManagement', {
  state: (): UserManagementState => ({
    users: [],
    isLoading: false,
  }),
  actions: {
    async fetchUsers(options?: { silent?: boolean }): Promise<void> {
      const silent = options?.silent ?? this.users.length > 0
      if (!silent) {
        this.isLoading = true
      }
      try {
        const res = await userManagementApi.fetchUsers()
        this.users = res.data.map((item) => ({ ...item }))
      } finally {
        this.isLoading = false
      }
    },
    async createUser(params: CreateUserParams): Promise<void> {
      await userManagementApi.createUser(params)
      await this.fetchUsers({ silent: true })
    },
    async updateUser(accountId: string, params: UpdateUserParams): Promise<void> {
      await userManagementApi.updateUser(accountId, params)
      await this.fetchUsers({ silent: true })
    },
    async disableUser(accountId: string): Promise<void> {
      await userManagementApi.disableUser(accountId)
      await this.fetchUsers({ silent: true })
    },
    async restoreUser(accountId: string): Promise<void> {
      await userManagementApi.restoreUser(accountId)
      await this.fetchUsers({ silent: true })
    },
    async deleteUser(accountId: string): Promise<void> {
      await userManagementApi.deleteUser(accountId)
      await this.fetchUsers({ silent: true })
    },
  },
})
