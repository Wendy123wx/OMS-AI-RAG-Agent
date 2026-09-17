import type { AnswerResultType, SourceReference } from '@/types/qa'

export interface QueryRecordListItemVo {
  recordId: string
  questionSummary: string
  recordedAt: string
  sourceLocatorSummary: string
  askerUsername?: string // 仅管理员查询记录列表投影含此字段
}

export interface QueryRecordDetailVo {
  recordId: string
  question: string
  answer: string
  sources: SourceReference[]
  recordedAt: string
  resultType: AnswerResultType
}

export interface HotKeywordVo {
  keyword: string
  clickCount: number
  rank: number
  inFirstRow: boolean
}

export interface DailyQuestionCount {
  day: string
  count: number
}

export interface UsageStatisticsSnapshot {
  totalQuestionCount: number
  exceptionAnswerCount: number
  last7DaysTrend: DailyQuestionCount[]
  activeUserCount: number
  snapshotAt: string
}
