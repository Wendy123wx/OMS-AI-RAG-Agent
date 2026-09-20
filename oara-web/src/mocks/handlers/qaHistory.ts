// 历史记录 Mock（T04）：按当前登录用户 accountId 过滤，仅返回本人记录（PRD 9.4.15）。
// accountId 从请求头 Authorization（格式 `Bearer mock-token-<accountId>`，见 src/mocks/handlers/auth.ts）解析，
// 模拟真实后端「按鉴权上下文过滤本人数据」的行为。
import type { InternalAxiosRequestConfig } from 'axios'

import type { ApiResponse } from '@/types/api'
import type { AnswerResultType, SourceReference } from '@/types/qa'
import type { QueryRecordDetailVo, QueryRecordListItemVo } from '@/types/query-record'
import type { RegisterMockRoute } from '@/mocks/types'

export interface QaHistorySeed {
  recordId: string
  accountId: string
  question: string
  answer: string
  sources: SourceReference[]
  recordedAt: string
  resultType: AnswerResultType
}

const QUESTION_SUMMARY_MAX_LENGTH = 30

export const MOCK_HISTORY_SEEDS: QaHistorySeed[] = [
  {
    recordId: 'qh-1001',
    accountId: 'acc-user-001',
    question: '退货政策中，超过多少天不支持无理由退货？',
    answer:
      '根据《售后服务手册》第3章规定，自签收之日起超过15天的商品不再支持无理由退货，但如商品存在质量问题，仍可在保修期内申请售后。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库/售后服务手册/第3章-退换货政策.pdf#p12',
        documentName: '售后服务手册.pdf',
        hitSnippet: { content: '自签收之日起15天内，商品未使用、包装完好的，支持无理由退货……' },
      },
    ],
    recordedAt: '2026-09-15T09:20:00.000Z',
    resultType: 'normal',
  },
  {
    recordId: 'qh-1002',
    accountId: 'acc-user-001',
    question: '订单号 OMS20260910083211 目前是什么状态？',
    answer: '订单 OMS20260910083211 当前状态为「已发货」，物流单号 SF1029384756，预计3天内送达。',
    sources: [{ kind: 'order_query', locator: '订单系统实时查询' }],
    recordedAt: '2026-09-16T14:05:00.000Z',
    resultType: 'normal',
  },
  {
    recordId: 'qh-1003',
    accountId: 'acc-user-001',
    question: '今天北京天气怎么样？',
    answer: '很抱歉，该问题与订单管理系统的业务范围无关，暂无法为您解答，建议咨询天气相关服务。',
    sources: [],
    recordedAt: '2026-09-16T15:40:00.000Z',
    resultType: 'exception',
  },
  {
    recordId: 'qh-1004',
    accountId: 'acc-user-001',
    question: '保修期内的商品维修需要哪些凭证材料？',
    answer:
      '需提供购买凭证（发票或订单截图）及保修卡，如商品序列号可核验则无需额外材料，详见《售后服务手册》第5章"维修申请材料清单"。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库/售后服务手册/第5章-维修申请材料清单.pdf#p28',
        documentName: '售后服务手册.pdf',
        hitSnippet: { content: '维修申请材料清单：购买凭证、保修卡、商品序列号（如有）……' },
      },
      {
        kind: 'knowledge_document',
        locator: '知识库/常见问题FAQ.pdf#p4',
        documentName: '常见问题FAQ.pdf',
        hitSnippet: { content: '常见问题：保修期内维修是否收费？答：保修期内非人为损坏免费维修。' },
      },
    ],
    recordedAt: '2026-09-14T10:00:00.000Z',
    resultType: 'normal',
  },
  {
    recordId: 'qh-2001',
    accountId: 'acc-admin-001',
    question: '订单号 OMS20260901001122 的收货地址在哪个仓库分区？',
    answer: '订单 OMS20260901001122 收货地址归属华东仓分区，当前状态为「待出库」。',
    sources: [{ kind: 'order_query', locator: '订单系统实时查询' }],
    recordedAt: '2026-09-13T11:15:00.000Z',
    resultType: 'normal',
  },
  {
    recordId: 'qh-2002',
    accountId: 'acc-admin-001',
    question: '知识库中是否有关于跨境订单关税说明的文档？',
    answer: '暂未在知识库中检索到与跨境订单关税相关的文档，建议联系业务负责人补充该类知识文档。',
    sources: [],
    resultType: 'exception',
    recordedAt: '2026-09-12T08:30:00.000Z',
  },
]

function truncateSummary(text: string): string {
  return text.length > QUESTION_SUMMARY_MAX_LENGTH
    ? `${text.slice(0, QUESTION_SUMMARY_MAX_LENGTH)}…`
    : text
}

function summarizeSourceLocators(seed: QaHistorySeed): string {
  if (seed.resultType === 'exception' || seed.sources.length === 0) {
    return ''
  }
  return seed.sources.map((source) => source.documentName ?? source.locator).join('、')
}

function toListItem(seed: QaHistorySeed): QueryRecordListItemVo {
  return {
    recordId: seed.recordId,
    questionSummary: truncateSummary(seed.question),
    recordedAt: seed.recordedAt,
    sourceLocatorSummary: summarizeSourceLocators(seed),
  }
}

export function appendQaHistoryRecord(seed: QaHistorySeed): void {
  MOCK_HISTORY_SEEDS.push(seed)
}

function toDetail(seed: QaHistorySeed): QueryRecordDetailVo {
  return {
    recordId: seed.recordId,
    question: seed.question,
    answer: seed.answer,
    sources: seed.sources,
    recordedAt: seed.recordedAt,
    resultType: seed.resultType,
  }
}

const ACCOUNT_ID_PATTERN = /^Bearer mock-token-(.+)$/

function extractAccountId(config: InternalAxiosRequestConfig): string | null {
  const authHeader = config.headers?.Authorization
  if (typeof authHeader !== 'string') {
    return null
  }
  const matched = ACCOUNT_ID_PATTERN.exec(authHeader)
  return matched ? matched[1] : null
}

export function registerQaHistoryMocks(register: RegisterMockRoute): void {
  register('GET', /\/qa-history\/list$/, (config) => {
    const accountId = extractAccountId(config)
    const records = MOCK_HISTORY_SEEDS.filter((seed) => seed.accountId === accountId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
      .map(toListItem)
    const response: ApiResponse<QueryRecordListItemVo[]> = {
      code: 0,
      message: 'ok',
      data: records,
      traceId: 'mock-trace',
    }
    return response
  })

  register('GET', /\/qa-history\/detail\/.+$/, (config) => {
    const accountId = extractAccountId(config)
    const recordId = (config.url ?? '').split('/').pop() ?? ''
    const seed = MOCK_HISTORY_SEEDS.find(
      (item) => item.recordId === recordId && item.accountId === accountId,
    )
    if (!seed) {
      return { code: 40404, message: '记录不存在或无权查看', data: null, traceId: 'mock-trace' }
    }
    const response: ApiResponse<QueryRecordDetailVo> = {
      code: 0,
      message: 'ok',
      data: toDetail(seed),
      traceId: 'mock-trace',
    }
    return response
  })
}
