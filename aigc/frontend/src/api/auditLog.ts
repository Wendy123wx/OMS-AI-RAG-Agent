import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'
import type { AccountOperationRecordVo } from '@/types/account-operation'

export function fetchOperationRecords(): Promise<ApiResponse<AccountOperationRecordVo[]>> {
  return http
    .get<ApiResponse<AccountOperationRecordVo[]>>('/audit-log')
    .then((response) => response.data)
}
