// 知识库管理 Mock（T10 补齐上传校验、重复检测与处理状态流转）
import type { ApiResponse } from '@/types/api'
import type { KnowledgeDocumentVo, KnowledgeFileType } from '@/types/knowledge-document'
import type { RegisterMockRoute } from '@/mocks/types'

import { MOCK_ACCOUNTS } from './auth'

export const MOCK_KNOWLEDGE_DOCUMENTS: KnowledgeDocumentVo[] = []

// R5 保守默认：20MB 上限
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

const ALLOWED_EXTENSION_TO_TYPE: Record<string, KnowledgeFileType> = {
  pdf: 'pdf',
  doc: 'word',
  docx: 'word',
}

const MOCK_FAILURE_REASONS = [
  '文档解析失败：文件内容损坏或格式异常',
  '向量化处理超时，请稍后重试',
  '文档切片失败：文档结构无法识别',
]

function resolveFileType(fileName: string): KnowledgeFileType | null {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  return ALLOWED_EXTENSION_TO_TYPE[extension] ?? null
}

function resolveUploaderUsername(authorizationHeader: unknown): string {
  if (typeof authorizationHeader !== 'string') {
    return 'admin'
  }
  const accountId = authorizationHeader.replace(/^Bearer\s+mock-token-/, '')
  const account = MOCK_ACCOUNTS.find((item) => item.accountId === accountId)
  return account?.username ?? 'admin'
}

// R6 保守默认：校验通过即创建「解析中」记录，延迟后随机转为「已入库」/「处理失败」，由列表页轮询呈现
function scheduleProcessing(documentId: string): void {
  const delay = 3000 + Math.random() * 3000
  setTimeout(() => {
    const target = MOCK_KNOWLEDGE_DOCUMENTS.find((item) => item.documentId === documentId)
    if (!target || target.status !== 'parsing') {
      return
    }
    const isSuccess = Math.random() > 0.2
    if (isSuccess) {
      target.status = 'indexed'
    } else {
      target.status = 'failed'
      target.failureReason =
        MOCK_FAILURE_REASONS[Math.floor(Math.random() * MOCK_FAILURE_REASONS.length)]
    }
  }, delay)
}

export function registerKnowledgeBaseMocks(register: RegisterMockRoute): void {
  register('GET', /\/knowledge-base\/documents$/, () => {
    const response: ApiResponse<KnowledgeDocumentVo[]> = {
      code: 0,
      message: 'ok',
      data: [...MOCK_KNOWLEDGE_DOCUMENTS],
      traceId: 'mock-trace',
    }
    return response
  })

  // POST 侧仍作防御性校验（类型/大小/重复），前端弹窗已在提交前拦截，这里保证 Mock 层不因绕过而生成脏记录
  register('POST', /\/knowledge-base\/documents$/, (config) => {
    const formData = config.data as FormData
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return { code: 40013, message: '未选择有效文件', data: null, traceId: 'mock-trace' }
    }

    const fileType = resolveFileType(file.name)
    if (!fileType) {
      return {
        code: 40010,
        message: '不支持该文件格式，仅支持 PDF/Word',
        data: null,
        traceId: 'mock-trace',
      }
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        code: 40011,
        message: '文件超过大小限制（20MB）',
        data: null,
        traceId: 'mock-trace',
      }
    }

    const isDuplicate = MOCK_KNOWLEDGE_DOCUMENTS.some(
      (item) => item.fileName === file.name && item.status !== 'failed',
    )
    if (isDuplicate) {
      return {
        code: 40012,
        message: '知识库中已存在同名文件，请勿重复上传',
        data: null,
        traceId: 'mock-trace',
      }
    }

    const created: KnowledgeDocumentVo = {
      documentId: `mock-doc-${Date.now()}`,
      fileName: file.name,
      fileType,
      fileSizeBytes: file.size,
      uploaderUsername: resolveUploaderUsername(config.headers?.Authorization),
      uploadedAt: new Date().toISOString(),
      status: 'parsing',
    }
    MOCK_KNOWLEDGE_DOCUMENTS.unshift(created)
    scheduleProcessing(created.documentId)

    const response: ApiResponse<KnowledgeDocumentVo> = {
      code: 0,
      message: 'ok',
      data: created,
      traceId: 'mock-trace',
    }
    return response
  })
}
