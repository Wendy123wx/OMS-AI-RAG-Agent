<script setup lang="ts">
// 管理后台壳层：顶栏「返回工作台」+ 左侧菜单四项 + 头像下拉（集成契约 §3.5）
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { ChangePasswordDialog } from '@/features/account'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isChangePasswordDialogVisible = ref(false)

const username = computed(() => authStore.currentUser?.username ?? '')
const avatarInitial = computed(() => username.value.slice(0, 1).toUpperCase())

function handleBackToWorkbench(): void {
  router.push({ name: 'AgentChat' })
}

function handleDropdownCommand(command: unknown): void {
  if (command === 'changePassword') {
    isChangePasswordDialogVisible.value = true
  } else if (command === 'logout') {
    void handleLogout()
  }
}

async function handleLogout(): Promise<void> {
  try {
    await authStore.logout()
  } catch (error) {
    console.error('退出登录请求失败，仍清除本地会话', error)
  } finally {
    router.push({ name: 'Login' })
  }
}
</script>

<template>
  <div class="admin-shell">
    <header class="admin-shell__header">
      <h1 class="admin-shell__title">管理后台</h1>
      <div class="admin-shell__header-actions">
        <el-button class="admin-shell__back" text @click="handleBackToWorkbench">
          ← 返回工作台
        </el-button>
        <el-dropdown class="admin-shell__user" trigger="click" @command="handleDropdownCommand">
          <span class="admin-shell__user-trigger">
            <el-avatar :size="32" class="admin-shell__avatar">{{ avatarInitial }}</el-avatar>
            <span class="admin-shell__username">{{ username }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>
    <div class="admin-shell__body">
      <nav class="admin-shell__menu">
        <router-link class="admin-shell__menu-item" to="/admin/users">用户管理</router-link>
        <router-link class="admin-shell__menu-item" to="/admin/dashboard">统计看板</router-link>
        <router-link class="admin-shell__menu-item" to="/admin/query-logs">查询记录</router-link>
        <router-link class="admin-shell__menu-item" to="/admin/knowledge-base">
          知识库管理
        </router-link>
      </nav>
      <main class="admin-shell__content">
        <router-view />
      </main>
    </div>
    <ChangePasswordDialog v-model="isChangePasswordDialogVisible" />
  </div>
</template>

<style scoped lang="scss">
.admin-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md);
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }

  &__user {
    cursor: pointer;
  }

  &__user-trigger {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  &__avatar {
    background-color: var(--color-primary);
    color: var(--color-bg-card);
  }

  &__username {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  &__body {
    display: flex;
    flex: 1;
  }

  &__menu {
    display: flex;
    flex-direction: column;
    width: 200px;
    padding: var(--space-md);
    border-right: 1px solid var(--color-border);
  }

  &__menu-item {
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-xs);
    color: var(--color-text-secondary);
    text-decoration: none;
    border-radius: var(--radius-sm);

    &:hover {
      color: var(--color-primary);
      background-color: var(--color-bg-page);
    }

    &.router-link-active {
      color: var(--color-primary);
      font-weight: 600;
      background-color: var(--color-bg-page);
    }
  }

  &__content {
    flex: 1;
    padding: var(--space-md);
    overflow: auto;
  }
}
</style>
