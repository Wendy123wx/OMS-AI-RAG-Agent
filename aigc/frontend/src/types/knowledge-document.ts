export type KnowledgeFileType = 'pdf' | 'word'
export type ProcessingStatus = 'parsing' | 'indexed' | 'failed'

export interface KnowledgeDocumentVo {
  documentId: string
  fileName: string
  fileType: KnowledgeFileType
  fileSizeBytes: number
  uploaderUsername: string
  uploadedAt: string
  status: ProcessingStatus
  failureReason?: string
}
