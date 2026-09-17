<script setup lang="ts">
// 问答平台壳层：顶栏标题 + Tab（工作台/历史记录/管理后台）+ 头像下拉（集成契约 §3.5）
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ChangePasswordDialog } from '@/features/account'
import { useAuthStore } from '@/stores/auth'

type WorkbenchTab = 'chat' | 'history' | 'admin'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isChangePasswordDialogVisible = ref(false)

const isAdmin = computed(() => authStore.role === 'admin')
const username = computed(() => authStore.currentUser?.username ?? '')
const avatarInitial = computed(() => username.value.slice(0, 1).toUpperCase())

const activeTab = computed<WorkbenchTab>({
  get: () => (route.name === 'QaHistory' ? 'history' : 'chat'),
  set: (tab) => {
    if (tab === 'history') {
      router.push({ name: 'QaHistory' })
    } else if (tab === 'admin') {
      router.push({ name: 'AdminShell' })
    } else {
      router.push({ name: 'AgentChat' })
    }
  },
})

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
  <div class="workbench-shell">
    <header class="workbench-shell__header">
      <h1 class="workbench-shell__title">问答平台</h1>
      <el-tabs v-model="activeTab" class="workbench-shell__tabs">
        <el-tab-pane label="工作台" name="chat" />
        <el-tab-pane label="历史记录" name="history" />
        <el-tab-pane v-if="isAdmin" label="管理后台" name="admin" />
      </el-tabs>
      <el-dropdown class="workbench-shell__user" trigger="click" @command="handleDropdownCommand">
        <span class="workbench-shell__user-trigger">
          <el-avatar :size="32" class="workbench-shell__avatar">{{ avatarInitial }}</el-avatar>
          <span class="workbench-shell__username">{{ username }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </header>
    <main class="workbench-shell__content">
      <router-view />
    </main>
    <ChangePasswordDialog v-model="isChangePasswordDialogVisible" />
  </div>
</template>

<style scoped lang="scss">
.workbench-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__header {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    padding: 0 var(--space-md);
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
    white-space: nowrap;
  }

  &__tabs {
    flex: 1;
  }

  &__user {
    margin-left: auto;
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

  &__content {
    flex: 1;
    overflow: auto;
  }
}
</style>
