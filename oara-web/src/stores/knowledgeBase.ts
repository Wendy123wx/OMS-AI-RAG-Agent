import { defineStore } from 'pinia'

import * as knowledgeBaseApi from '@/api/knowledgeBase'
import type { KnowledgeDocumentVo } from '@/types/knowledge-document'

export interface KnowledgeBaseState {
  documents: KnowledgeDocumentVo[]
  isLoading: boolean
  isUploading: boolean
}

// useKnowledgeBaseStore（T10；C06 禁止 import 本 Store，见集成契约 §3.4）
export const useKnowledgeBaseStore = defineStore('knowledgeBase', {
  state: (): KnowledgeBaseState => ({
    documents: [],
    isLoading: false,
    isUploading: false,
  }),
  getters: {
    // STATE-03：派生数据用 getters 计算，不在 state 中冗余存储
    isEmpty(state): boolean {
      return state.documents.length === 0
    },
    hasProcessingDocuments(state): boolean {
      return state.documents.some((document) => document.status === 'parsing')
    },
  },
  actions: {
    async fetchDocuments(): Promise<void> {
      this.isLoading = true
      try {
        const res = await knowledgeBaseApi.fetchKnowledgeDocuments()
        this.documents = res.data
      } finally {
        this.isLoading = false
      }
    },
    async uploadDocument(file: File): Promise<void> {
      this.isUploading = true
      try {
        await knowledgeBaseApi.uploadKnowledgeDocument(file)
        await this.fetchDocuments()
      } finally {
        this.isUploading = false
      }
    },
  },
})
