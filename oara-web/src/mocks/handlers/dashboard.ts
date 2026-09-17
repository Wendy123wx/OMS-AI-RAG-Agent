// 统计看板 Mock（T07 补齐真实指标计算）
import type { ApiResponse } from '@/types/api'
import type { DailyQuestionCount, UsageStatisticsSnapshot } from '@/types/query-record'
import type { RegisterMockRoute } from '@/mocks/types'

// 近7天提问量样例数据（第1项对应7天前，最后1项对应今天）
const DAILY_TREND_SAMPLE_COUNTS = [12, 18, 9, 25, 31, 22, 17]

function buildLast7DaysTrend(): DailyQuestionCount[] {
  const today = new Date()
  const trend: DailyQuestionCount[] = []
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const day = date.toISOString().slice(0, 10)
    const count = DAILY_TREND_SAMPLE_COUNTS[6 - offset] ?? 0
    trend.push({ day, count })
  }
  return trend
}

function buildMockUsageSnapshot(): UsageStatisticsSnapshot {
  const last7DaysTrend = buildLast7DaysTrend()
  const totalQuestionCount = last7DaysTrend.reduce((sum, item) => sum + item.count, 0)
  return {
    totalQuestionCount,
    exceptionAnswerCount: 6,
    last7DaysTrend,
    activeUserCount: 14,
    snapshotAt: new Date().toISOString(),
  }
}

export function registerDashboardMocks(register: RegisterMockRoute): void {
  register('GET', /\/dashboard\/usage-statistics$/, () => {
    const response: ApiResponse<UsageStatisticsSnapshot> = {
      code: 0,
      message: 'ok',
      data: buildMockUsageSnapshot(),
      traceId: 'mock-trace',
    }
    return response
  })
}
