import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { setupRouterGuards } from './guards'

// 路由表按集成契约 §3.1 固定，弹窗（G01/G02/C01~C06/P08）不进入路由表
export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginShellView.vue'),
    meta: { roles: [] },
  },
  {
    path: '/workbench',
    name: 'WorkbenchShell',
    component: () => import('@/views/WorkbenchShellView.vue'),
    redirect: '/workbench/chat',
    meta: { roles: ['user', 'admin'] },
    children: [
      {
        path: 'chat',
        name: 'AgentChat',
        component: () => import('@/features/agent-chat/views/AgentChatView.vue'),
        meta: { roles: ['user', 'admin'] },
      },
      {
        path: 'history',
        name: 'QaHistory',
        component: () => import('@/features/qa-history/views/QaHistoryListView.vue'),
        meta: { roles: ['user', 'admin'] },
      },
    ],
  },
  {
    path: '/admin',
    name: 'AdminShell',
    component: () => import('@/views/AdminShellView.vue'),
    redirect: '/admin/users',
    meta: { roles: ['admin'] },
    children: [
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/features/user-management/views/UserListView.vue'),
        meta: { roles: ['admin'] },
      },
      {
        path: 'users/operations',
        name: 'AdminAuditLog',
        component: () => import('@/features/audit-log/views/AuditLogListView.vue'),
        meta: { roles: ['admin'] },
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/features/dashboard/views/DashboardView.vue'),
        meta: { roles: ['admin'] },
      },
      {
        path: 'query-logs',
        name: 'AdminQueryLogs',
        component: () => import('@/features/query-log/views/QueryLogListView.vue'),
        meta: { roles: ['admin'] },
      },
      {
        path: 'knowledge-base',
        name: 'AdminKnowledgeBase',
        component: () => import('@/features/knowledge-base/views/KnowledgeBaseListView.vue'),
        meta: { roles: ['admin'] },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { roles: [] },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

setupRouterGuards(router)

export default router
