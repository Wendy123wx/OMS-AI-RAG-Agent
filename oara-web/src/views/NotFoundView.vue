<script setup lang="ts">
// 404 兜底页
</script>

<template>
  <div class="not-found">
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
  min-height: 100vh;

  &__code {
    font-size: var(--font-size-xl);
    color: var(--color-text-primary);
  }

  &__hint {
    color: var(--color-text-secondary);
  }
}
</style>
