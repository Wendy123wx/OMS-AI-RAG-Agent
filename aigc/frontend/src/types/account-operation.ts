export type AccountOperationType = 'disable' | 'restore' | 'delete'

export interface TargetUserSnapshot {
  accountId: string
  username: string
}

export interface AccountOperationRecordVo {
  operationId: string
  operationType: AccountOperationType
  target: TargetUserSnapshot
  operatorUsername: string
  operatedAt: string
}
