import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'
import type { UserAccount } from '@/types/qa'

export function login(params: {
  username: string
  password: string
}): Promise<ApiResponse<{ token: string; user: UserAccount }>> {
  return http
    .post<ApiResponse<{ token: string; user: UserAccount }>>('/auth/login', params)
    .then((response) => response.data)
}

export function logout(): Promise<ApiResponse<null>> {
  return http.post<ApiResponse<null>>('/auth/logout').then((response) => response.data)
}

export function changePassword(params: {
  originalPassword: string
  newPassword: string
}): Promise<ApiResponse<null>> {
  return http
    .post<ApiResponse<null>>('/auth/change-password', params)
    .then((response) => response.data)
}

export function fetchCurrentUser(): Promise<ApiResponse<UserAccount>> {
  return http.get<ApiResponse<UserAccount>>('/auth/current-user').then((response) => response.data)
}
