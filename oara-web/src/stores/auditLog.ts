import { defineStore } from 'pinia'

import * as auditLogApi from '@/api/auditLog'
import type { AccountOperationRecordVo } from '@/types/account-operation'

export interface AuditLogState {
  records: AccountOperationRecordVo[]
  isLoading: boolean
}

export const useAuditLogStore = defineStore('auditLog', {
  state: (): AuditLogState => ({
    records: [],
    isLoading: false,
  }),
  actions: {
    async fetchOperationRecords(): Promise<void> {
      this.isLoading = true
      try {
        const res = await auditLogApi.fetchOperationRecords()
        this.records = res.data
      } finally {
        this.isLoading = false
      }
    },
  },
})
