<script setup lang="ts">
// P04-01 用户管理列表页（T05）：列表展示 + 新增/编辑/禁用/恢复/删除操作，操作后即时刷新（PRD 5.5.1/5.5.2）
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useUserManagementStore } from '@/stores'
import type { UserAccountVo } from '@/types/user'

import UserFormDialog from '../components/UserFormDialog.vue'
import DeleteUserConfirmDialog from '../components/DeleteUserConfirmDialog.vue'

// R1 保守默认：一次性加载全部 Mock 数据 + 前端简单分页，每页20条
const PAGE_SIZE = 20

const router = useRouter()
const store = useUserManagementStore()

const currentPage = ref(1)

const isFormDialogVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formTargetUser = ref<UserAccountVo | null>(null)

const isDeleteDialogVisible = ref(false)
const deleteTargetUser = ref<UserAccountVo | null>(null)
const isDeleting = ref(false)

const totalCount = computed(() => store.users.length)
const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return store.users.slice(start, start + PAGE_SIZE)
})

onMounted(() => {
  void loadUsers()
})

async function loadUsers(): Promise<void> {
  try {
    await store.fetchUsers()
  } catch (error) {
    ElMessage.error(resolveErrorMessage(error, '加载用户列表失败，请稍后重试'))
  }
}

function handlePageChange(page: number): void {
  currentPage.value = page
}

function goToOperationLog(): void {
  router.push('/admin/users/operations')
}

function openCreateDialog(): void {
  formMode.value = 'create'
  formTargetUser.value = null
  isFormDialogVisible.value = true
}

function openEditDialog(user: UserAccountVo): void {
  formMode.value = 'edit'
  formTargetUser.value = user
  isFormDialogVisible.value = true
}

async function handleFormSubmitted(): Promise<void> {
  currentPage.value = 1
  await loadUsers()
}

async function handleToggleStatus(user: UserAccountVo): Promise<void> {
  try {
    if (user.status === 'normal') {
      await store.disableUser(user.accountId)
      ElMessage.success('已禁用该用户')
    } else {
      await store.restoreUser(user.accountId)
      ElMessage.success('已恢复该用户')
    }
  } catch (error) {
    ElMessage.error(resolveErrorMessage(error, '操作失败，请稍后重试'))
  }
}

function openDeleteDialog(user: UserAccountVo): void {
  deleteTargetUser.value = user
  isDeleteDialogVisible.value = true
}

async function handleConfirmDelete(): Promise<void> {
  if (!deleteTargetUser.value) {
    return
  }
  isDeleting.value = true
  try {
    await store.deleteUser(deleteTargetUser.value.accountId)
    ElMessage.success('用户已删除')
    isDeleteDialogVisible.value = false
    deleteTargetUser.value = null
    if (pagedUsers.value.length === 0 && currentPage.value > 1) {
      currentPage.value -= 1
    }
  } catch (error) {
    ElMessage.error(resolveErrorMessage(error, '删除失败，请稍后重试'))
  } finally {
    isDeleting.value = false
  }
}

function resolveErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function avatarFallback(username: string): string {
  return username.slice(0, 1).toUpperCase()
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
</script>

<template>
  <div class="user-list-view">
    <div class="user-list-view__toolbar">
      <h2 class="user-list-view__title">用户管理</h2>
      <div class="user-list-view__actions">
        <el-button class="user-list-view__operation-log" @click="goToOperationLog">
          历史操作
        </el-button>
        <el-button type="primary" @click="openCreateDialog">新增用户</el-button>
      </div>
    </div>

    <el-table
      v-loading="store.isLoading"
      :data="pagedUsers"
      class="user-list-view__table"
      row-key="accountId"
    >
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column label="头像" width="72">
        <template #default="{ row }">
          <el-avatar :size="32" :src="row.avatar || undefined">
            {{ avatarFallback(row.username) }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" min-width="180">
        <template #default="{ row }">{{ row.email || '—' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'normal' ? 'success' : 'danger'" size="small">
            {{ row.status === 'normal' ? '正常' : '已禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="更新时间" width="160">
        <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button
            link
            :type="row.status === 'normal' ? 'warning' : 'success'"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 'normal' ? '禁用' : '恢复' }}
          </el-button>
          <el-button link type="danger" @click="openDeleteDialog(row)">删除</el-button>
        </template>
      </el-table-column>

      <template #empty>
        <el-empty description="暂无普通用户账号" />
      </template>
    </el-table>

    <el-pagination
      v-if="totalCount > 0"
      class="user-list-view__pagination"
      layout="prev, pager, next, total"
      :total="totalCount"
      :page-size="PAGE_SIZE"
      :current-page="currentPage"
      @current-change="handlePageChange"
    />

    <UserFormDialog
      v-model="isFormDialogVisible"
      :mode="formMode"
      :user="formTargetUser"
      @submitted="handleFormSubmitted"
    />

    <DeleteUserConfirmDialog
      v-model="isDeleteDialogVisible"
      :user="deleteTargetUser"
      :is-confirm-loading="isDeleting"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<style scoped lang="scss">
.user-list-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
  }

  &__actions {
    display: flex;
    gap: var(--space-sm);
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
