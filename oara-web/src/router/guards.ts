import type { Router } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types/qa'

declare module 'vue-router' {
  interface RouteMeta {
    roles: Role[]
  }
}

// 路由守卫（SEC-05）：仅作体验层拦截，最终数据访问权限以后端接口鉴权结果为准
export function setupRouterGuards(router: Router): void {
  router.beforeEach((to) => {
    const authStore = useAuthStore()
    const requiredRoles = to.meta.roles ?? []

    if (to.name === 'Login') {
      if (authStore.isAuthenticated) {
        return { name: 'AgentChat' }
      }
      return true
    }

    if (requiredRoles.length === 0) {
      return true
    }

    if (!authStore.isAuthenticated) {
      return { name: 'Login' }
    }

    if (authStore.role && !requiredRoles.includes(authStore.role)) {
      return { name: 'AgentChat' }
    }

    return true
  })
}
