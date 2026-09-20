// 用户管理 Mock（T05 补齐完整增删改与操作记录联动）
import type { InternalAxiosRequestConfig } from 'axios'

import type { ApiResponse } from '@/types/api'
import type { CreateUserParams, UpdateUserParams, UserAccountVo } from '@/types/user'
import type { AccountOperationRecordVo, AccountOperationType } from '@/types/account-operation'
import type { RegisterMockRoute } from '@/mocks/types'

import { MOCK_ACCOUNTS } from './auth'
import { MOCK_OPERATION_RECORDS } from './auditLog'

// 普通用户账号内存数据（仅普通用户，PRD 9.5.19 不含管理员账号管理）
export const MOCK_USERS: UserAccountVo[] = [
  {
    accountId: 'mock-user-seed-001',
    username: 'zhangsan',
    email: 'zhangsan@oara.local',
    avatar: '',
    role: 'user',
    status: 'normal',
    createdAt: '2026-02-01T02:00:00.000Z',
    updatedAt: '2026-02-01T02:00:00.000Z',
  },
  {
    accountId: 'mock-user-seed-002',
    username: 'lisi',
    email: 'lisi@oara.local',
    avatar: '',
    role: 'user',
    status: 'disabled',
    createdAt: '2026-02-02T03:00:00.000Z',
    updatedAt: '2026-02-05T06:00:00.000Z',
  },
  {
    accountId: 'mock-user-seed-003',
    username: 'wangwu',
    email: '',
    avatar: '',
    role: 'user',
    status: 'normal',
    createdAt: '2026-02-03T01:30:00.000Z',
    updatedAt: '2026-02-03T01:30:00.000Z',
  },
]

let mockIdSeq = 0
function nextMockId(prefix: string): string {
  mockIdSeq += 1
  return `${prefix}-${Date.now()}-${mockIdSeq}`
}

function isUsernameTaken(username: string): boolean {
  return (
    MOCK_USERS.some((item) => item.username === username) ||
    MOCK_ACCOUNTS.some((item) => item.username === username)
  )
}

// 从鉴权头解析当前操作人（Mock 层模拟后端从 token 识别操作人，供操作记录联动使用）
function resolveOperatorUsername(config: InternalAxiosRequestConfig): string {
  const headers = config.headers as unknown as Record<string, unknown> | undefined
  const authHeader = headers?.Authorization
  if (typeof authHeader === 'string') {
    const match = /^Bearer mock-token-(.+)$/.exec(authHeader)
    if (match) {
      const account = MOCK_ACCOUNTS.find((item) => item.accountId === match[1])
      if (account) {
        return account.username
      }
    }
  }
  return 'admin'
}

// 与 src/mocks/handlers/auditLog.ts 共享同一份内存数组（§3.6），本模块只追加记录，不改变其结构
function recordOperation(
  operationType: AccountOperationType,
  target: UserAccountVo,
  operatorUsername: string,
): void {
  const record: AccountOperationRecordVo = {
    operationId: nextMockId('op'),
    operationType,
    target: { accountId: target.accountId, username: target.username },
    operatorUsername,
    operatedAt: new Date().toISOString(),
  }
  MOCK_OPERATION_RECORDS.push(record)
}

// 从形如 /users/{accountId}/{suffix} 的路径中提取 accountId
function extractAccountIdBeforeSuffix(url: string, suffix: string): string {
  const cleaned = url.replace(new RegExp(`/${suffix}$`), '')
  const segments = cleaned.split('/')
  return segments[segments.length - 1] ?? ''
}

export function registerUserManagementMocks(register: RegisterMockRoute): void {
  register('GET', /\/users$/, () => {
    const response: ApiResponse<UserAccountVo[]> = {
      code: 0,
      message: 'ok',
      data: MOCK_USERS.map((item) => ({ ...item })),
      traceId: 'mock-trace',
    }
    return response
  })

  register('POST', /\/users$/, (config) => {
    const body = JSON.parse((config.data as string) ?? '{}') as CreateUserParams
    const username = (body.username ?? '').trim()
    const initialPassword = body.initialPassword ?? ''

    if (!username) {
      return { code: 40011, message: '用户名不能为空', data: null, traceId: 'mock-trace' }
    }
    if (!initialPassword || initialPassword.length < 8) {
      return {
        code: 40012,
        message: '初始密码不能为空，且长度不少于8位',
        data: null,
        traceId: 'mock-trace',
      }
    }
    if (isUsernameTaken(username)) {
      return { code: 40901, message: '用户名已存在，请更换后重试', data: null, traceId: 'mock-trace' }
    }

    const now = new Date().toISOString()
    const created: UserAccountVo = {
      accountId: nextMockId('mock-user'),
      username,
      email: body.email?.trim() || undefined,
      avatar: body.avatar?.trim() || undefined,
      role: 'user',
      status: 'normal',
      createdAt: now,
      updatedAt: now,
    }
    MOCK_USERS.push(created)
    const response: ApiResponse<UserAccountVo> = {
      code: 0,
      message: 'ok',
      data: created,
      traceId: 'mock-trace',
    }
    return response
  })

  register('PUT', /\/users\/.+$/, (config) => {
    const accountId = (config.url ?? '').split('/').pop() ?? ''
    const body = JSON.parse((config.data as string) ?? '{}') as UpdateUserParams
    const target = MOCK_USERS.find((item) => item.accountId === accountId)
    if (!target) {
      return { code: 40404, message: '用户不存在或已被删除', data: null, traceId: 'mock-trace' }
    }
    target.email = body.email?.trim() || undefined
    target.avatar = body.avatar?.trim() || undefined
    target.updatedAt = new Date().toISOString()
    const response: ApiResponse<UserAccountVo> = {
      code: 0,
      message: 'ok',
      data: target,
      traceId: 'mock-trace',
    }
    return response
  })

  register('POST', /\/users\/.+\/disable$/, (config) => {
    const accountId = extractAccountIdBeforeSuffix(config.url ?? '', 'disable')
    const target = MOCK_USERS.find((item) => item.accountId === accountId)
    if (!target) {
      return { code: 40404, message: '用户不存在或已被删除', data: null, traceId: 'mock-trace' }
    }
    target.status = 'disabled'
    target.updatedAt = new Date().toISOString()
    recordOperation('disable', target, resolveOperatorUsername(config))
    return { code: 0, message: 'ok', data: null, traceId: 'mock-trace' }
  })

  register('POST', /\/users\/.+\/restore$/, (config) => {
    const accountId = extractAccountIdBeforeSuffix(config.url ?? '', 'restore')
    const target = MOCK_USERS.find((item) => item.accountId === accountId)
    if (!target) {
      return { code: 40404, message: '用户不存在或已被删除', data: null, traceId: 'mock-trace' }
    }
    target.status = 'normal'
    target.updatedAt = new Date().toISOString()
    recordOperation('restore', target, resolveOperatorUsername(config))
    return { code: 0, message: 'ok', data: null, traceId: 'mock-trace' }
  })

  register('DELETE', /\/users\/.+$/, (config) => {
    const accountId = (config.url ?? '').split('/').pop() ?? ''
    const index = MOCK_USERS.findIndex((item) => item.accountId === accountId)
    if (index === -1) {
      return { code: 40404, message: '用户不存在或已被删除', data: null, traceId: 'mock-trace' }
    }
    const [target] = MOCK_USERS.splice(index, 1)
    recordOperation('delete', target, resolveOperatorUsername(config))
    return { code: 0, message: 'ok', data: null, traceId: 'mock-trace' }
  })
}
