import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'
import type {
  HotKeywordVo,
  QueryRecordDetailVo,
  QueryRecordListItemVo,
} from '@/types/query-record'

export function fetchQueryLogs(keyword?: string): Promise<ApiResponse<QueryRecordListItemVo[]>> {
  return http
    .get<ApiResponse<QueryRecordListItemVo[]>>('/query-log', { params: { keyword } })
    .then((response) => response.data)
}

export function fetchQueryLogDetail(recordId: string): Promise<ApiResponse<QueryRecordDetailVo>> {
  return http
    .get<ApiResponse<QueryRecordDetailVo>>(`/query-log/detail/${recordId}`)
    .then((response) => response.data)
}

export function fetchHotKeywords(): Promise<ApiResponse<HotKeywordVo[]>> {
  return http
    .get<ApiResponse<HotKeywordVo[]>>('/query-log/hot-keywords')
    .then((response) => response.data)
}
