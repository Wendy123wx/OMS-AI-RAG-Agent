import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'
import type { QaSession } from '@/types/qa'

// 流式提问不经普通 Axios，由 composables/useSseStream.ts 按 §9 直接 fetch 本常量地址
export const QA_ASK_STREAM_URL: string = import.meta.env.VITE_QA_ASK_STREAM_URL

export function fetchCurrentSession(): Promise<ApiResponse<QaSession>> {
  return http.get<ApiResponse<QaSession>>('/qa/session').then((response) => response.data)
}

export function createSession(): Promise<ApiResponse<QaSession>> {
  return http.post<ApiResponse<QaSession>>('/qa/session').then((response) => response.data)
}
