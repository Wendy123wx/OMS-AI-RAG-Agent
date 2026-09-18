<script setup lang="ts">
// 404 兜底页
import { WarningFilled } from '@element-plus/icons-vue'
</script>

<template>
  <div class="not-found">
    <el-icon class="not-found__icon" :size="56"><WarningFilled /></el-icon>
    <h1 class="not-found__code">404</h1>
    <p class="not-found__hint">页面不存在</p>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 100vh;

  &__icon {
    color: var(--color-text-placeholder);
  }

  &__code {
    margin: 0;
    font-size: var(--font-size-xl);
    color: var(--color-text-primary);
  }

  &__hint {
    margin: 0;
    color: var(--color-text-secondary);
  }
}
</style>
