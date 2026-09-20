import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'
import type { QueryRecordDetailVo, QueryRecordListItemVo } from '@/types/query-record'

export function fetchHistoryList(): Promise<ApiResponse<QueryRecordListItemVo[]>> {
  return http
    .get<ApiResponse<QueryRecordListItemVo[]>>('/qa-history/list')
    .then((response) => response.data)
}

export function fetchHistoryDetail(recordId: string): Promise<ApiResponse<QueryRecordDetailVo>> {
  return http
    .get<ApiResponse<QueryRecordDetailVo>>(`/qa-history/detail/${recordId}`)
    .then((response) => response.data)
}
