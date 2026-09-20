// Mock 适配器入口（§3.6）：在 http 实例上挂一层「按 URL 前缀分发到 handlers」的适配器，
// 不引入 MSW 等新依赖，保持 API-01 唯一 Axios 实例约束。
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'

import { registerAuthMocks } from './handlers/auth'
import { registerQaMocks } from './handlers/qa'
import { registerQaHistoryMocks } from './handlers/qaHistory'
import { registerUserManagementMocks } from './handlers/userManagement'
import { registerAuditLogMocks } from './handlers/auditLog'
import { registerDashboardMocks } from './handlers/dashboard'
import { registerQueryLogMocks } from './handlers/queryLog'
import { registerKnowledgeBaseMocks } from './handlers/knowledgeBase'
import type { MockHandler } from './types'

interface MockRoute {
  method: string
  pattern: RegExp
  handler: MockHandler
}

const routes: MockRoute[] = []

export function registerMockRoute(method: string, pattern: RegExp, handler: MockHandler): void {
  routes.push({ method: method.toUpperCase(), pattern, handler })
}

function buildResponse<T>(
  config: InternalAxiosRequestConfig,
  data: ApiResponse<T>,
): AxiosResponse<ApiResponse<T>> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  }
}

async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const method = (config.method ?? 'get').toUpperCase()
  const url = (config.url ?? '').split('?')[0]
  const matched = routes.find((route) => route.method === method && route.pattern.test(url))
  if (!matched) {
    return Promise.reject(new Error(`未找到匹配的 Mock 路由: ${method} ${url}`))
  }
  const data = await matched.handler(config)
  // 模拟网络延迟，避免 Loading 态一闪而过
  await new Promise((resolve) => setTimeout(resolve, 200))
  return buildResponse(config, data)
}

let isSetup = false

export function setupMocks(): void {
  if (isSetup) {
    return
  }
  isSetup = true
  http.defaults.adapter = mockAdapter
  registerAuthMocks(registerMockRoute)
  registerQaMocks(registerMockRoute)
  registerQaHistoryMocks(registerMockRoute)
  registerUserManagementMocks(registerMockRoute)
  registerAuditLogMocks(registerMockRoute)
  registerDashboardMocks(registerMockRoute)
  registerQueryLogMocks(registerMockRoute)
  registerKnowledgeBaseMocks(registerMockRoute)
}
