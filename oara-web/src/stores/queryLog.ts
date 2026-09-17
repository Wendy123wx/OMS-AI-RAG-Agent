import { defineStore } from 'pinia'

import * as queryLogApi from '@/api/queryLog'
import type {
  HotKeywordVo,
  QueryRecordDetailVo,
  QueryRecordListItemVo,
} from '@/types/query-record'

export interface QueryLogState {
  records: QueryRecordListItemVo[]
  currentDetail: QueryRecordDetailVo | null
  hotKeywords: HotKeywordVo[]
  keyword: string
  isLoading: boolean
}

export const useQueryLogStore = defineStore('queryLog', {
  state: (): QueryLogState => ({
    records: [],
    currentDetail: null,
    hotKeywords: [],
    keyword: '',
    isLoading: false,
  }),
  actions: {
    async fetchQueryLogs(): Promise<void> {
      this.isLoading = true
      try {
        const res = await queryLogApi.fetchQueryLogs(this.keyword || undefined)
        this.records = res.data
      } finally {
        this.isLoading = false
      }
    },
    async searchByKeyword(keyword: string): Promise<void> {
      this.keyword = keyword
      await this.fetchQueryLogs()
    },
    async fetchQueryLogDetail(recordId: string): Promise<void> {
      this.isLoading = true
      try {
        const res = await queryLogApi.fetchQueryLogDetail(recordId)
        this.currentDetail = res.data
      } finally {
        this.isLoading = false
      }
    },
    async fetchHotKeywords(): Promise<void> {
      const res = await queryLogApi.fetchHotKeywords()
      this.hotKeywords = res.data
    },
    clearCurrentDetail(): void {
      this.currentDetail = null
    },
  },
})
