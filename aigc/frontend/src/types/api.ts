// 全局 API 响应包裹类型（TS-06）：所有接口响应统一使用本泛型，禁止裸类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  traceId: string
}
