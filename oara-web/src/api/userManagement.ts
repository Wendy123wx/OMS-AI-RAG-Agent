import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'
import type { CreateUserParams, UpdateUserParams, UserAccountVo } from '@/types/user'

export function fetchUsers(): Promise<ApiResponse<UserAccountVo[]>> {
  return http.get<ApiResponse<UserAccountVo[]>>('/users').then((response) => response.data)
}

export function createUser(params: CreateUserParams): Promise<ApiResponse<UserAccountVo>> {
  return http.post<ApiResponse<UserAccountVo>>('/users', params).then((response) => response.data)
}

export function updateUser(
  accountId: string,
  params: UpdateUserParams,
): Promise<ApiResponse<UserAccountVo>> {
  return http
    .put<ApiResponse<UserAccountVo>>(`/users/${accountId}`, params)
    .then((response) => response.data)
}

export function disableUser(accountId: string): Promise<ApiResponse<null>> {
  return http
    .post<ApiResponse<null>>(`/users/${accountId}/disable`)
    .then((response) => response.data)
}

export function restoreUser(accountId: string): Promise<ApiResponse<null>> {
  return http
    .post<ApiResponse<null>>(`/users/${accountId}/restore`)
    .then((response) => response.data)
}

export function deleteUser(accountId: string): Promise<ApiResponse<null>> {
  return http.delete<ApiResponse<null>>(`/users/${accountId}`).then((response) => response.data)
}
