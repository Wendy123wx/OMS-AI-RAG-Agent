// 身份与访问上下文 Mock（T00 建骨架；T02 补齐完整登录交互文案）
import type { ApiResponse } from '@/types/api'
import type { UserAccount } from '@/types/qa'
import type { RegisterMockRoute } from '@/mocks/types'

// 默认测试账号（PRD 5.1）：管理员 admin / 普通用户 user，密码均为 12345678
export const MOCK_ACCOUNTS: UserAccount[] = [
  {
    accountId: 'acc-admin-001',
    username: 'admin',
    email: 'admin@oara.local',
    role: 'admin',
    status: 'normal',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    accountId: 'acc-user-001',
    username: 'user',
    email: 'user@oara.local',
    role: 'user',
    status: 'normal',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

const MOCK_PASSWORD = '12345678'

let currentAccountId: string | null = null

export function registerAuthMocks(register: RegisterMockRoute): void {
  register('POST', /\/auth\/login$/, (config) => {
    const body = JSON.parse((config.data as string) ?? '{}') as {
      username?: string
      password?: string
    }
    const account = MOCK_ACCOUNTS.find((item) => item.username === body.username)
    if (!account) {
      return { code: 40401, message: '账号不存在', data: null, traceId: 'mock-trace' }
    }
    if (account.status === 'disabled') {
      return { code: 40301, message: '账号已禁用，请联系管理员', data: null, traceId: 'mock-trace' }
    }
    if (body.password !== MOCK_PASSWORD) {
      return { code: 40001, message: '密码错误', data: null, traceId: 'mock-trace' }
    }
    currentAccountId = account.accountId
    const response: ApiResponse<{ token: string; user: UserAccount }> = {
      code: 0,
      message: 'ok',
      data: { token: `mock-token-${account.accountId}`, user: account },
      traceId: 'mock-trace',
    }
    return response
  })

  register('POST', /\/auth\/logout$/, () => {
    currentAccountId = null
    return { code: 0, message: 'ok', data: null, traceId: 'mock-trace' }
  })

  register('POST', /\/auth\/change-password$/, (config) => {
    const body = JSON.parse((config.data as string) ?? '{}') as {
      originalPassword?: string
      newPassword?: string
    }
    if (body.originalPassword !== MOCK_PASSWORD) {
      return { code: 40002, message: '原密码错误', data: null, traceId: 'mock-trace' }
    }
    return { code: 0, message: 'ok', data: null, traceId: 'mock-trace' }
  })

  register('GET', /\/auth\/current-user$/, () => {
    const account = MOCK_ACCOUNTS.find((item) => item.accountId === currentAccountId)
    if (!account) {
      return { code: 40101, message: '未登录', data: null, traceId: 'mock-trace' }
    }
    const response: ApiResponse<UserAccount> = {
      code: 0,
      message: 'ok',
      data: account,
      traceId: 'mock-trace',
    }
    return response
  })
}
