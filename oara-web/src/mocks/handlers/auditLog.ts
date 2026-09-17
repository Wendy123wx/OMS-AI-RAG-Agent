// 操作记录 Mock（T06 补全）
// 与 src/mocks/handlers/userManagement.ts（T05）共享同一份操作记录数据语义：
// T05 在执行禁用/恢复/删除操作时，向本文件导出的 MOCK_OPERATION_RECORDS 数组 push 新记录，
// 即可在本页联动展示，无需修改本文件（DIR-02，数据源对齐不涉及接口签名变更）。
import type { ApiResponse } from '@/types/api'
import type { AccountOperationRecordVo } from '@/types/account-operation'
import type { RegisterMockRoute } from '@/mocks/types'

// 独立占位假数据（T05 未完成时页面仍可独立体验主路径，验收标准3）
export const MOCK_OPERATION_RECORDS: AccountOperationRecordVo[] = [
  {
    operationId: 'op-mock-003',
    operationType: 'delete',
    target: { accountId: 'user-mock-003', username: 'zhangsan' },
    operatorUsername: 'admin',
    operatedAt: '2026-09-15T10:20:00.000Z',
  },
  {
    operationId: 'op-mock-002',
    operationType: 'restore',
    target: { accountId: 'user-mock-002', username: 'lisi' },
    operatorUsername: 'admin',
    operatedAt: '2026-09-12T08:05:00.000Z',
  },
  {
    operationId: 'op-mock-001',
    operationType: 'disable',
    target: { accountId: 'user-mock-002', username: 'lisi' },
    operatorUsername: 'admin',
    operatedAt: '2026-09-10T03:30:00.000Z',
  },
]

export function registerAuditLogMocks(register: RegisterMockRoute): void {
  register('GET', /\/audit-log$/, () => {
    // 默认按操作时间倒序返回（验收标准4），不修改原始数组顺序以免影响其他引用方
    const sorted = [...MOCK_OPERATION_RECORDS].sort(
      (a, b) => new Date(b.operatedAt).getTime() - new Date(a.operatedAt).getTime(),
    )
    const response: ApiResponse<AccountOperationRecordVo[]> = {
      code: 0,
      message: 'ok',
      data: sorted,
      traceId: 'mock-trace',
    }
    return response
  })
}
