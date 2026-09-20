import { defineStore } from 'pinia'

import * as dashboardApi from '@/api/dashboard'
import type { UsageStatisticsSnapshot } from '@/types/query-record'

export interface DashboardState {
  snapshot: UsageStatisticsSnapshot | null
  isLoading: boolean
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    snapshot: null,
    isLoading: false,
  }),
  actions: {
    async fetchUsageStatistics(): Promise<void> {
      this.isLoading = true
      try {
        const res = await dashboardApi.fetchUsageStatistics()
        this.snapshot = res.data
      } finally {
        this.isLoading = false
      }
    },
  },
})
