import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'
import type { UsageStatisticsSnapshot } from '@/types/query-record'

export function fetchUsageStatistics(): Promise<ApiResponse<UsageStatisticsSnapshot>> {
  return http
    .get<ApiResponse<UsageStatisticsSnapshot>>('/dashboard/usage-statistics')
    .then((response) => response.data)
}
