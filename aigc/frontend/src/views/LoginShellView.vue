<script setup lang="ts">
// 登录页容器（P01）：承载顶栏 Tab 结构，Tab 内容委托 @/features/auth 的 LoginPanel（集成契约 §3.5）
import { ref } from 'vue'
import { Grid } from '@element-plus/icons-vue'

import { LoginPanel } from '@/features/auth'

type LoginTab = 'dingtalk' | 'account'

const activeTab = ref<LoginTab>('account')
</script>

<template>
  <div class="login-shell">
    <div class="login-shell__panel">
      <h1 class="login-shell__title">OMS智能问答系统</h1>
      <el-tabs v-model="activeTab" class="login-shell__tabs" stretch>
        <el-tab-pane label="钉钉登录" name="dingtalk">
          <div class="login-shell__dingtalk">
            <div class="login-shell__qr-placeholder">
              <el-icon :size="32"><Grid /></el-icon>
              <span>二维码占位区</span>
            </div>
            <p class="login-shell__dingtalk-tip">钉钉扫码登录功能开发中，请使用账号密码登录</p>
          </div>
        </el-tab-pane>
        <el-tab-pane label="账号密码登录" name="account">
          <LoginPanel />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-lg);
  background-color: var(--color-bg-page);

  &__panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 420px;
    max-width: 100%;
    padding: var(--space-xl);
    background-color: var(--color-bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
  }

  &__title {
    margin: 0 0 var(--space-lg) 0;
    font-size: var(--font-size-xl);
    color: var(--color-text-primary);
    text-align: center;
  }

  &__tabs {
    width: 100%;

    :deep(.el-tabs__header) {
      margin: 0 0 var(--space-lg);
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    :deep(.el-tabs__content),
    :deep(.el-tab-pane) {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }

  &__dingtalk {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: var(--space-lg) 0;
    text-align: center;
  }

  &__qr-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    width: 180px;
    height: 180px;
    margin-bottom: var(--space-md);
    color: var(--color-text-placeholder);
    background-color: var(--color-bg-page);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
  }

  &__dingtalk-tip {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    text-align: center;
  }
}
</style>
