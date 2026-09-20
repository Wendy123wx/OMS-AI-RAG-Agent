// 唯一 Axios 实例（API-01），业务代码禁止 import axios，只允许通过本文件导出的 http 发起请求。
import axios, { AxiosError, type AxiosInstance } from 'axios'

import type { ApiResponse } from '@/types/api'

export type AppErrorSource = 'network' | 'business' | 'auth' | 'unknown'

// ERR-02：统一错误类型，区分错误来源
export class AppError extends Error {
  source: AppErrorSource
  traceId?: string

  constructor(message: string, source: AppErrorSource, traceId?: string) {
    super(message)
    this.name = 'AppError'
    this.source = source
    this.traceId = traceId
  }
}

// API-04：普通接口默认超时 10s
const DEFAULT_TIMEOUT = 10_000

export const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
})

// 持久化状态读取（与 src/stores/auth.ts 的 persist.key === 'oara-auth' 保持一致，STATE-05）。
// 不直接 import useAuthStore() 以避免 http.ts <-> stores/auth.ts <-> api/auth.ts 的循环依赖，
// 而是直接解析 pinia-plugin-persistedstate 落盘的 JSON（形如 { token, currentUser: {...} }）。
function readPersistedToken(): string | null {
  const raw = localStorage.getItem('oara-auth')
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as { token?: string | null }
    return parsed.token ?? null
  } catch (error) {
    console.error('解析本地登录状态失败，鉴权头将不携带 token', error)
    return null
  }
}

// API-03：请求拦截器统一注入鉴权头
http.interceptors.request.use((config) => {
  const token = readPersistedToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// API-03：响应拦截器统一处理业务错误码，业务代码不再重复判断 code !== 0
http.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>
    if (body && typeof body.code === 'number' && body.code !== 0) {
      return Promise.reject(new AppError(body.message || '请求失败', 'business', body.traceId))
    }
    return response
  },
  (error: unknown) => {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return Promise.reject(new AppError('登录状态已失效，请重新登录', 'auth'))
      }
      if (!error.response) {
        return Promise.reject(new AppError('网络异常，请稍后重试', 'network'))
      }
      return Promise.reject(new AppError('请求失败，请稍后重试', 'unknown'))
    }
    return Promise.reject(new AppError('未知错误', 'unknown'))
  },
)

export default http
