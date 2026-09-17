// 查询记录（管理员视角）Mock（T08 补全搜索与高频词逻辑）
import type { ApiResponse } from '@/types/api'
import type {
  HotKeywordVo,
  QueryRecordDetailVo,
  QueryRecordListItemVo,
} from '@/types/query-record'
import type { RegisterMockRoute } from '@/mocks/types'

// PRD 5.7：管理员全体普通用户查询记录投影（管理员本人提问不计入，故全部为普通用户）
export const MOCK_QUERY_LOG_RECORDS: QueryRecordListItemVo[] = [
  {
    recordId: 'qr-001',
    askerUsername: 'zhangwei',
    questionSummary: '订单发货时效咨询',
    recordedAt: '2026-09-17T09:12:00.000Z',
    sourceLocatorSummary: '知识库 / 发货时效说明.pdf',
  },
  {
    recordId: 'qr-002',
    askerUsername: 'lina',
    questionSummary: '如何查询我的退款进度',
    recordedAt: '2026-09-17T08:40:00.000Z',
    sourceLocatorSummary: '订单系统实时查询',
  },
  {
    recordId: 'qr-003',
    askerUsername: 'wangfang',
    questionSummary: '退货运费由谁承担',
    recordedAt: '2026-09-16T15:22:00.000Z',
    sourceLocatorSummary: '知识库 / 退货政策.pdf',
  },
  {
    recordId: 'qr-004',
    askerUsername: 'zhaoqiang',
    questionSummary: '发票信息填写错误怎么修改',
    recordedAt: '2026-09-16T11:05:00.000Z',
    sourceLocatorSummary: '知识库 / 发票开具与修改流程.pdf',
  },
  {
    recordId: 'qr-005',
    askerUsername: 'chenjing',
    questionSummary: '订单号 20260910088 物流轨迹查询',
    recordedAt: '2026-09-16T09:47:00.000Z',
    sourceLocatorSummary: '订单系统实时查询',
  },
  {
    recordId: 'qr-006',
    askerUsername: 'liuyang',
    questionSummary: '会员积分可以怎么使用',
    recordedAt: '2026-09-15T20:10:00.000Z',
    sourceLocatorSummary: '知识库 / 会员积分规则.pdf',
  },
  {
    recordId: 'qr-007',
    askerUsername: 'zhoumin',
    questionSummary: '今天天气怎么样',
    recordedAt: '2026-09-15T18:33:00.000Z',
    sourceLocatorSummary: '',
  },
  {
    recordId: 'qr-008',
    askerUsername: 'wuchao',
    questionSummary: '订单取消后多久到账',
    recordedAt: '2026-09-15T14:18:00.000Z',
    sourceLocatorSummary: '知识库 / 订单取消与退款时效.pdf',
  },
  {
    recordId: 'qr-009',
    askerUsername: 'zhangwei',
    questionSummary: '订单号 20260908021 是否已发货',
    recordedAt: '2026-09-15T10:02:00.000Z',
    sourceLocatorSummary: '订单系统实时查询',
  },
  {
    recordId: 'qr-010',
    askerUsername: 'lina',
    questionSummary: '如何申请开具增值税专用发票',
    recordedAt: '2026-09-14T21:47:00.000Z',
    sourceLocatorSummary: '知识库 / 发票开具与修改流程.pdf',
  },
  {
    recordId: 'qr-011',
    askerUsername: 'wangfang',
    questionSummary: '退货商品需要保留原包装吗',
    recordedAt: '2026-09-14T16:29:00.000Z',
    sourceLocatorSummary: '知识库 / 退货政策.pdf',
  },
  {
    recordId: 'qr-012',
    askerUsername: 'zhaoqiang',
    questionSummary: '知识库检索暂不可用示例',
    recordedAt: '2026-09-14T09:55:00.000Z',
    sourceLocatorSummary: '',
  },
  {
    recordId: 'qr-013',
    askerUsername: 'chenjing',
    questionSummary: '订单号 20260905077 没有查询到结果',
    recordedAt: '2026-09-13T22:16:00.000Z',
    sourceLocatorSummary: '',
  },
  {
    recordId: 'qr-014',
    askerUsername: 'liuyang',
    questionSummary: '发货后多久可以收到货',
    recordedAt: '2026-09-13T13:40:00.000Z',
    sourceLocatorSummary: '知识库 / 发货时效说明.pdf',
  },
  {
    recordId: 'qr-015',
    askerUsername: 'zhoumin',
    questionSummary: '退款进度一直显示处理中正常吗',
    recordedAt: '2026-09-13T08:21:00.000Z',
    sourceLocatorSummary: '订单系统实时查询',
  },
  {
    recordId: 'qr-016',
    askerUsername: 'wuchao',
    questionSummary: '会员积分过期规则是什么',
    recordedAt: '2026-09-12T19:58:00.000Z',
    sourceLocatorSummary: '知识库 / 会员积分规则.pdf',
  },
  {
    recordId: 'qr-017',
    askerUsername: 'zhangwei',
    questionSummary: '退货申请提交后多久处理',
    recordedAt: '2026-09-12T15:12:00.000Z',
    sourceLocatorSummary: '知识库 / 退货政策.pdf',
  },
  {
    recordId: 'qr-018',
    askerUsername: 'lina',
    questionSummary: '订单号 20260901012 当前物流状态',
    recordedAt: '2026-09-12T10:03:00.000Z',
    sourceLocatorSummary: '订单系统实时查询',
  },
  {
    recordId: 'qr-019',
    askerUsername: 'wangfang',
    questionSummary: '发票丢失可以补开吗',
    recordedAt: '2026-09-11T20:44:00.000Z',
    sourceLocatorSummary: '知识库 / 发票开具与修改流程.pdf',
  },
  {
    recordId: 'qr-020',
    askerUsername: 'zhaoqiang',
    questionSummary: '订单取消规则详细说明',
    recordedAt: '2026-09-11T14:27:00.000Z',
    sourceLocatorSummary: '知识库 / 订单取消与退款时效.pdf',
  },
  {
    recordId: 'qr-021',
    askerUsername: 'chenjing',
    questionSummary: '退货运费险如何生效',
    recordedAt: '2026-09-11T09:09:00.000Z',
    sourceLocatorSummary: '知识库 / 退货政策.pdf',
  },
  {
    recordId: 'qr-022',
    askerUsername: 'liuyang',
    questionSummary: '发货时效说明中的偏远地区范围',
    recordedAt: '2026-09-10T17:35:00.000Z',
    sourceLocatorSummary: '知识库 / 发货时效说明.pdf',
  },
]

export const MOCK_QUERY_LOG_DETAILS: Record<string, QueryRecordDetailVo> = {
  'qr-001': {
    recordId: 'qr-001',
    question: '我的订单一直没有发货，一般发货时效是多久？',
    answer:
      '正常情况下，订单在支付成功后 48 小时内安排发货；如遇促销活动或偏远地区，发货时效可能延长至 72 小时。请留意订单详情页的物流状态更新。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 发货时效说明.pdf / 第2章',
        documentName: '发货时效说明.pdf',
        hitSnippet: {
          content: '常规商品下单后 48 小时内发货；大促期间或偏远地区可延长至 72 小时发货。',
        },
      },
    ],
    recordedAt: '2026-09-17T09:12:00.000Z',
    resultType: 'normal',
  },
  'qr-002': {
    recordId: 'qr-002',
    question: '我申请的退款现在到什么进度了？',
    answer: '已为您查询到该笔退款正在财务审核中，预计 1-3 个工作日内退回原支付账户。',
    sources: [
      {
        kind: 'order_query',
        locator: '订单系统实时查询',
      },
    ],
    recordedAt: '2026-09-17T08:40:00.000Z',
    resultType: 'normal',
  },
  'qr-003': {
    recordId: 'qr-003',
    question: '如果我要退货，运费是我自己出还是商家承担？',
    answer:
      '非质量问题退货，运费由买家承担；若商品存在质量问题或与描述不符，运费由商家承担，请在申请退货时选择对应原因以便系统判定。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 退货政策.pdf / 第1章',
        documentName: '退货政策.pdf',
        hitSnippet: {
          content: '非质量问题退货运费由买家承担；质量问题或描述不符退货运费由商家承担。',
        },
      },
    ],
    recordedAt: '2026-09-16T15:22:00.000Z',
    resultType: 'normal',
  },
  'qr-004': {
    recordId: 'qr-004',
    question: '发票上的公司名称填错了，能修改吗？',
    answer:
      '发票信息在开具前均可修改；若已开具，需在 7 个自然日内联系客服申请换开，超期无法修改。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 发票开具与修改流程.pdf / 第3章',
        documentName: '发票开具与修改流程.pdf',
        hitSnippet: {
          content: '发票开具前可自助修改；已开具发票需在 7 个自然日内联系客服申请换开。',
        },
      },
    ],
    recordedAt: '2026-09-16T11:05:00.000Z',
    resultType: 'normal',
  },
  'qr-005': {
    recordId: 'qr-005',
    question: '订单号 20260910088 现在到哪个物流环节了？',
    answer: '该订单已发出，当前物流状态为「运输中」，预计 2 天内送达。',
    sources: [
      {
        kind: 'order_query',
        locator: '订单系统实时查询',
      },
    ],
    recordedAt: '2026-09-16T09:47:00.000Z',
    resultType: 'normal',
  },
  'qr-006': {
    recordId: 'qr-006',
    question: '我的会员积分可以用来干什么？',
    answer: '会员积分可用于抵扣订单金额（100 积分=1元）或兑换积分商城内的指定商品。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 会员积分规则.pdf / 第1章',
        documentName: '会员积分规则.pdf',
        hitSnippet: { content: '积分可按 100 积分=1 元抵扣订单金额，或在积分商城兑换商品。' },
      },
    ],
    recordedAt: '2026-09-15T20:10:00.000Z',
    resultType: 'normal',
  },
  'qr-007': {
    recordId: 'qr-007',
    question: '今天天气怎么样？',
    answer: '系统提示：该问题暂时无法回答',
    sources: [],
    recordedAt: '2026-09-15T18:33:00.000Z',
    resultType: 'exception',
  },
  'qr-008': {
    recordId: 'qr-008',
    question: '订单取消之后退款多久能到账？',
    answer: '订单取消后系统会自动发起退款，一般 1-3 个工作日内原路退回，遇节假日可能延迟。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 订单取消与退款时效.pdf / 第2章',
        documentName: '订单取消与退款时效.pdf',
        hitSnippet: { content: '订单取消后自动发起退款，1-3 个工作日内原路退回。' },
      },
    ],
    recordedAt: '2026-09-15T14:18:00.000Z',
    resultType: 'normal',
  },
  'qr-009': {
    recordId: 'qr-009',
    question: '订单号 20260908021 是否已经发货了？',
    answer: '该订单已完成发货，物流公司已揽收，正在等待运输更新。',
    sources: [
      {
        kind: 'order_query',
        locator: '订单系统实时查询',
      },
    ],
    recordedAt: '2026-09-15T10:02:00.000Z',
    resultType: 'normal',
  },
  'qr-010': {
    recordId: 'qr-010',
    question: '怎么申请开具增值税专用发票？',
    answer: '请在订单详情页选择「申请开票」，填写单位纳税人识别号等信息后提交，系统会在 3 个工作日内开具。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 发票开具与修改流程.pdf / 第1章',
        documentName: '发票开具与修改流程.pdf',
        hitSnippet: { content: '订单详情页「申请开票」填写纳税人识别号，3 个工作日内开具。' },
      },
    ],
    recordedAt: '2026-09-14T21:47:00.000Z',
    resultType: 'normal',
  },
  'qr-011': {
    recordId: 'qr-011',
    question: '退货的商品必须保留原包装吗？',
    answer: '建议保留原包装及吊牌，以便顺利通过质检；无原包装可能影响退货审核结果。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 退货政策.pdf / 第2章',
        documentName: '退货政策.pdf',
        hitSnippet: { content: '建议保留原包装及吊牌以顺利通过退货质检，否则可能影响审核结果。' },
      },
    ],
    recordedAt: '2026-09-14T16:29:00.000Z',
    resultType: 'normal',
  },
  'qr-012': {
    recordId: 'qr-012',
    question: '帮我查一下最新上架的商品知识文档',
    answer: '文档检索暂时不可用，请稍后重试。',
    sources: [],
    recordedAt: '2026-09-14T09:55:00.000Z',
    resultType: 'exception',
  },
  'qr-013': {
    recordId: 'qr-013',
    question: '订单号 20260905077 查不到物流信息',
    answer: '未查询到相关订单信息，请核对订单号后重试。',
    sources: [],
    recordedAt: '2026-09-13T22:16:00.000Z',
    resultType: 'exception',
  },
  'qr-014': {
    recordId: 'qr-014',
    question: '一般发货之后多久可以收到货？',
    answer: '发货后普通地区 1-3 天送达，偏远地区可能需要 3-5 天，具体以物流公司时效为准。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 发货时效说明.pdf / 第3章',
        documentName: '发货时效说明.pdf',
        hitSnippet: { content: '发货后普通地区 1-3 天送达，偏远地区约 3-5 天。' },
      },
    ],
    recordedAt: '2026-09-13T13:40:00.000Z',
    resultType: 'normal',
  },
  'qr-015': {
    recordId: 'qr-015',
    question: '我的退款一直显示处理中，正常吗？',
    answer: '当前退款状态为「处理中」，属正常流程，预计 1-3 个工作日内完成，请耐心等待。',
    sources: [
      {
        kind: 'order_query',
        locator: '订单系统实时查询',
      },
    ],
    recordedAt: '2026-09-13T08:21:00.000Z',
    resultType: 'normal',
  },
  'qr-016': {
    recordId: 'qr-016',
    question: '会员积分有过期时间吗？',
    answer: '会员积分自获得之日起 12 个月内有效，超期未使用将自动清零，请留意及时兑换。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 会员积分规则.pdf / 第2章',
        documentName: '会员积分规则.pdf',
        hitSnippet: { content: '积分自获得起 12 个月内有效，超期自动清零。' },
      },
    ],
    recordedAt: '2026-09-12T19:58:00.000Z',
    resultType: 'normal',
  },
  'qr-017': {
    recordId: 'qr-017',
    question: '提交退货申请后大概多久会处理？',
    answer: '退货申请提交后，系统将在 1 个工作日内完成审核，审核通过后请按提示寄回商品。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 退货政策.pdf / 第3章',
        documentName: '退货政策.pdf',
        hitSnippet: { content: '退货申请提交后 1 个工作日内完成审核。' },
      },
    ],
    recordedAt: '2026-09-12T15:12:00.000Z',
    resultType: 'normal',
  },
  'qr-018': {
    recordId: 'qr-018',
    question: '订单号 20260901012 现在到哪了？',
    answer: '该订单已送达当地配送站点，预计今日内完成派送。',
    sources: [
      {
        kind: 'order_query',
        locator: '订单系统实时查询',
      },
    ],
    recordedAt: '2026-09-12T10:03:00.000Z',
    resultType: 'normal',
  },
  'qr-019': {
    recordId: 'qr-019',
    question: '发票丢失了还能补开一张吗？',
    answer: '电子发票可在订单详情页重新下载；纸质发票丢失需联系客服申请补开，补开周期约 5 个工作日。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 发票开具与修改流程.pdf / 第4章',
        documentName: '发票开具与修改流程.pdf',
        hitSnippet: { content: '电子发票可重新下载；纸质发票丢失需联系客服补开，约 5 个工作日。' },
      },
    ],
    recordedAt: '2026-09-11T20:44:00.000Z',
    resultType: 'normal',
  },
  'qr-020': {
    recordId: 'qr-020',
    question: '订单取消有什么具体规则？',
    answer: '订单在「待发货」状态前可自助取消；已发货订单需走退货流程，无法直接取消。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 订单取消与退款时效.pdf / 第1章',
        documentName: '订单取消与退款时效.pdf',
        hitSnippet: { content: '「待发货」状态前可自助取消；已发货订单需走退货流程。' },
      },
    ],
    recordedAt: '2026-09-11T14:27:00.000Z',
    resultType: 'normal',
  },
  'qr-021': {
    recordId: 'qr-021',
    question: '购买的退货运费险怎么生效？',
    answer: '下单时勾选「退货运费险」，发生非质量问题退货时可自动理赔运费，赔付金额原路退回。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 退货政策.pdf / 第4章',
        documentName: '退货政策.pdf',
        hitSnippet: { content: '下单勾选退货运费险，非质量问题退货可自动理赔运费。' },
      },
    ],
    recordedAt: '2026-09-11T09:09:00.000Z',
    resultType: 'normal',
  },
  'qr-022': {
    recordId: 'qr-022',
    question: '发货时效说明里提到的偏远地区具体包含哪些？',
    answer: '偏远地区指新疆、西藏、青海、内蒙古等地区，具体以物流合作方公示范围为准。',
    sources: [
      {
        kind: 'knowledge_document',
        locator: '知识库 / 发货时效说明.pdf / 第4章',
        documentName: '发货时效说明.pdf',
        hitSnippet: { content: '偏远地区指新疆、西藏、青海、内蒙古等地区，以物流合作方公示范围为准。' },
      },
    ],
    recordedAt: '2026-09-10T17:35:00.000Z',
    resultType: 'normal',
  },
}

// PRD 9.7.27：高频词全量累计、分词统计、前三并列第一排规则
export const MOCK_HOT_KEYWORDS: HotKeywordVo[] = [
  { keyword: '退货', clickCount: 58, rank: 1, inFirstRow: true },
  { keyword: '发货时效', clickCount: 55, rank: 1, inFirstRow: true },
  { keyword: '退款进度', clickCount: 52, rank: 1, inFirstRow: true },
  { keyword: '订单查询', clickCount: 40, rank: 4, inFirstRow: false },
  { keyword: '发票开具', clickCount: 33, rank: 5, inFirstRow: false },
  { keyword: '物流轨迹', clickCount: 25, rank: 6, inFirstRow: false },
  { keyword: '会员积分', clickCount: 18, rank: 7, inFirstRow: false },
]

export function registerQueryLogMocks(register: RegisterMockRoute): void {
  register('GET', /\/query-log$/, (config) => {
    const keyword = ((config.params as Record<string, string> | undefined)?.keyword ?? '').trim()
    const filtered = keyword
      ? MOCK_QUERY_LOG_RECORDS.filter((item) => item.questionSummary.includes(keyword))
      : MOCK_QUERY_LOG_RECORDS
    // PRD 9.7（对齐 R7 保守默认）：列表默认按 recordedAt 倒序
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    )
    const response: ApiResponse<QueryRecordListItemVo[]> = {
      code: 0,
      message: 'ok',
      data: sorted,
      traceId: 'mock-trace',
    }
    return response
  })

  register('GET', /\/query-log\/detail\/.+$/, (config) => {
    const recordId = (config.url ?? '').split('/').pop() ?? ''
    const detail = MOCK_QUERY_LOG_DETAILS[recordId]
    if (!detail) {
      return { code: 40404, message: '记录不存在', data: null, traceId: 'mock-trace' }
    }
    const response: ApiResponse<QueryRecordDetailVo> = {
      code: 0,
      message: 'ok',
      data: detail,
      traceId: 'mock-trace',
    }
    return response
  })

  register('GET', /\/query-log\/hot-keywords$/, () => {
    const response: ApiResponse<HotKeywordVo[]> = {
      code: 0,
      message: 'ok',
      data: MOCK_HOT_KEYWORDS,
      traceId: 'mock-trace',
    }
    return response
  })
}
