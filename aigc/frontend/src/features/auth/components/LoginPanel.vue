<script setup lang="ts">
// P01 账号密码登录面板（T02）：账号密码 Tab 内容区，由 LoginShellView（T01）承载 Tab 结构
import { Lock, User } from '@element-plus/icons-vue'

import { useLogin } from '../composables/useLogin'

const { username, password, isSubmitting, errorMessage, submit } = useLogin()

function handleSubmit(): void {
  void submit()
}
</script>

<template>
  <div class="login-panel">
    <form class="login-panel__form" @submit.prevent="handleSubmit">
      <div class="login-panel__field">
        <label class="login-panel__label" for="login-panel-username">账号</label>
        <el-input
          id="login-panel-username"
          v-model="username"
          class="login-panel__input"
          placeholder="请输入账号"
          autocomplete="username"
          :disabled="isSubmitting"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="login-panel__field">
        <label class="login-panel__label" for="login-panel-password">密码</label>
        <el-input
          id="login-panel-password"
          v-model="password"
          type="password"
          class="login-panel__input"
          placeholder="请输入密码"
          autocomplete="current-password"
          show-password
          :disabled="isSubmitting"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </div>
      <p v-if="errorMessage" class="login-panel__error" role="alert">{{ errorMessage }}</p>
      <el-button
        class="login-panel__submit"
        type="primary"
        native-type="submit"
        :loading="isSubmitting"
      >
        登录
      </el-button>
    </form>
    <div class="login-panel__hint">
      <p class="login-panel__hint-title">测试账号</p>
      <p class="login-panel__hint-item">管理员账号：admin / 12345678</p>
      <p class="login-panel__hint-item">普通用户账号：user / 12345678</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-panel {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-lg);
  width: 100%;
  max-width: 320px;
  margin: 0 auto;

  &__form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  &__label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  &__error {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-danger);
  }

  &__submit {
    width: 100%;
  }

  &__hint {
    padding: var(--space-md);
    background-color: var(--color-bg-page);
    border-radius: var(--radius-md);
  }

  &__hint-title {
    margin: 0 0 var(--space-xs);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__hint-item {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
}
</style>
