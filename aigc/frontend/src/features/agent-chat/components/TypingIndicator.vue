<script setup lang="ts">
// AGENT-05：pending 态（等待首字节）专用「输入中」动效，与页面级骨架屏 PageSkeleton 严格区分，
// 二者互不引用。
</script>

<template>
  <div class="typing-indicator" role="status" aria-label="生成中">
    <span class="typing-indicator__dot"></span>
    <span class="typing-indicator__dot"></span>
    <span class="typing-indicator__dot"></span>
  </div>
</template>

<style scoped lang="scss">
.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);

  &__dot {
    width: 6px;
    height: 6px;
    background-color: var(--color-text-placeholder);
    border-radius: 50%;
    animation: typing-indicator-bounce 1.2s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

@keyframes typing-indicator-bounce {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }

  40% {
    opacity: 1;
    transform: translateY(-3px);
  }
}
</style>
