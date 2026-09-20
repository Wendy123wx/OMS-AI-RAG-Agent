import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'
import type { KnowledgeDocumentVo } from '@/types/knowledge-document'

export function fetchKnowledgeDocuments(): Promise<ApiResponse<KnowledgeDocumentVo[]>> {
  return http
    .get<ApiResponse<KnowledgeDocumentVo[]>>('/knowledge-base/documents')
    .then((response) => response.data)
}

export function uploadKnowledgeDocument(file: File): Promise<ApiResponse<KnowledgeDocumentVo>> {
  const formData = new FormData()
  formData.append('file', file)
  return http
    .post<ApiResponse<KnowledgeDocumentVo>>('/knowledge-base/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      // API-04：文件上传接口超时覆盖为 60s（大文件解析场景，原因：默认 10s 不足以覆盖上传耗时）
      timeout: 60_000,
    })
    .then((response) => response.data)
}
