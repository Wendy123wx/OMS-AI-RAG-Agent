import type { InternalAxiosRequestConfig } from 'axios'

import type { ApiResponse } from '@/types/api'

export type MockHandler = (
  config: InternalAxiosRequestConfig,
) => Promise<ApiResponse<unknown>> | ApiResponse<unknown>

export type RegisterMockRoute = (method: string, pattern: RegExp, handler: MockHandler) => void
