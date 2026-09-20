import type { UserAccount } from '@/types/qa'

// UserAccountVo 与 UserAccount 字段一致（TS-04），作为用户管理模块的视图对象别名
export type UserAccountVo = UserAccount

export interface CreateUserParams {
  username: string
  email?: string
  avatar?: string
  initialPassword: string
}

export interface UpdateUserParams {
  email?: string
  avatar?: string
}
