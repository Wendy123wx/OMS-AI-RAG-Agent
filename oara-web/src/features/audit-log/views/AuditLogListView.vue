<script setup lang="ts">
// P05 操作记录列表页（T06）
// 只读列表：展示管理员对普通用户执行的禁用/恢复正常/删除操作留痕，供事后追溯（PRD 5.5.3）。
// 页面无编辑/删除入口（验收标准2）。
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

import { useAuditLogStore } from '@/stores/auditLog'
import type { AccountOperationType } from '@/types/account-operation'

const router = useRouter()
const auditLogStore = useAuditLogStore()

const OPERATION_TYPE_TEXT_MAP: Record<AccountOperationType, string> = {
  disable: '禁用',
  restore: '恢复正常',
  delete: '删除',
}

const OPERATION_TYPE_TAG_TYPE_MAP: Record<AccountOperationType, 'warning' | 'success' | 'danger'> = {
  disable: 'warning',
  restore: 'success',
  delete: 'danger',
}

function getOperationTypeText(operationType: AccountOperationType): string {
  return OPERATION_TYPE_TEXT_MAP[operationType]
}

function getOperationTypeTagType(operationType: AccountOperationType): 'warning' | 'success' | 'danger' {
  return OPERATION_TYPE_TAG_TYPE_MAP[operationType]
}

const records = computed(() => auditLogStore.records)
const isLoading = computed(() => auditLogStore.isLoading)
const isEmpty = computed(() => !isLoading.value && records.value.length === 0)

function goBackToUserManagement(): void {
  router.push({ name: 'AdminUsers' })
}

onMounted(async () => {
  try {
    await auditLogStore.fetchOperationRecords()
  } catch (error) {
    // ERR-01：不留空 catch，记录用于排查，用户侧以空列表兜底展示
    console.error(error)
  }
})
</script>

<template>
  <div class="audit-log-list-view">
    <header class="audit-log-list-view__header">
      <h2 class="audit-log-list-view__title">操作记录</h2>
      <el-button class="audit-log-list-view__back-btn" :icon="ArrowLeft" @click="goBackToUserManagement">
        返回用户管理
      </el-button>
    </header>

    <div class="audit-log-list-view__card">
      <el-skeleton v-if="isLoading" :rows="5" animated />

      <el-empty v-else-if="isEmpty" description="暂无操作记录" />

      <el-table
        v-else
        class="audit-log-list-view__table"
        :data="records"
        row-key="operationId"
      >
        <el-table-column label="操作类型" width="140">
          <template #default="{ row }">
            <el-tag :type="getOperationTypeTagType(row.operationType)" size="small">
              {{ getOperationTypeText(row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标用户">
          <template #default="{ row }">
            {{ row.target.username }}
          </template>
        </el-table-column>
        <el-table-column label="操作时间" prop="operatedAt" width="220" />
        <el-table-column label="操作人" prop="operatorUsername" width="160" />
      </el-table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.audit-log-list-view {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-md);
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-lg);
  }

  &__card {
    padding: var(--space-md);
    background-color: var(--color-bg-card);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  &__table {
    width: 100%;
  }
}
</style>
