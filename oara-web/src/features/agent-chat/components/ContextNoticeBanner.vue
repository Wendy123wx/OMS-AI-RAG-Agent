<script setup lang="ts">
// AGENT-10：上下文压缩/重置提示，role === 'system-notice' 消息的可感知呈现，
// 禁止静默清空前端消息列表。
interface Props {
  content: string
}

defineProps<Props>()
</script>

<template>
  <div class="context-notice-banner">
    <span class="context-notice-banner__icon">i</span>
    <span class="context-notice-banner__text">{{ content }}</span>
  </div>
</template>

<style scoped lang="scss">
.context-notice-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  margin: var(--space-sm) auto;
  padding: var(--space-xs) var(--space-md);
  width: fit-content;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  background-color: var(--color-bg-page);
  border-radius: var(--radius-lg);

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: var(--color-bg-card);
    font-style: normal;
    background-color: var(--color-info);
    border-radius: 50%;
  }
}
</style>
