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
    async fetchUsers(): Promise<void> {
      this.isLoading = true
      try {
        const res = await userManagementApi.fetchUsers()
        this.users = res.data
      } finally {
        this.isLoading = false
      }
    },
    async createUser(params: CreateUserParams): Promise<void> {
      await userManagementApi.createUser(params)
      await this.fetchUsers()
    },
    async updateUser(accountId: string, params: UpdateUserParams): Promise<void> {
      await userManagementApi.updateUser(accountId, params)
      await this.fetchUsers()
    },
    async disableUser(accountId: string): Promise<void> {
      await userManagementApi.disableUser(accountId)
      await this.fetchUsers()
    },
    async restoreUser(accountId: string): Promise<void> {
      await userManagementApi.restoreUser(accountId)
      await this.fetchUsers()
    },
    async deleteUser(accountId: string): Promise<void> {
      await userManagementApi.deleteUser(accountId)
      await this.fetchUsers()
    },
  },
})
