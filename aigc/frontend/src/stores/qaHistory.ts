import { defineStore } from 'pinia'

import * as qaHistoryApi from '@/api/qaHistory'
import type { QueryRecordDetailVo, QueryRecordListItemVo } from '@/types/query-record'

export interface QaHistoryState {
  records: QueryRecordListItemVo[]
  currentDetail: QueryRecordDetailVo | null
  isLoading: boolean
}

export const useQaHistoryStore = defineStore('qaHistory', {
  state: (): QaHistoryState => ({
    records: [],
    currentDetail: null,
    isLoading: false,
  }),
  actions: {
    async fetchHistoryList(): Promise<void> {
      this.isLoading = true
      try {
        const res = await qaHistoryApi.fetchHistoryList()
        this.records = res.data
      } finally {
        this.isLoading = false
      }
    },
    async fetchHistoryDetail(recordId: string): Promise<void> {
      this.isLoading = true
      try {
        const res = await qaHistoryApi.fetchHistoryDetail(recordId)
        this.currentDetail = res.data
      } finally {
        this.isLoading = false
      }
    },
    clearCurrentDetail(): void {
      this.currentDetail = null
    },
  },
})
