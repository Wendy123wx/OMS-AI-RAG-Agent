/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  plugins: ['@typescript-eslint', 'vue', 'unicorn'],
  ignorePatterns: ['dist', 'node_modules', '*.d.ts'],
  rules: {
    // TS-02: 禁止 any
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    // NAME-06: 类型不加 I/T 前缀
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: { regex: '^I[A-Z]', match: false },
      },
    ],
    // COMP-01: 仅 script setup
    'vue/component-api-style': ['error', ['script-setup']],
    // COMP-02: Props/Emits 类型化声明
    'vue/define-props-declaration': ['error', 'type-based'],
    'vue/define-emits-declaration': ['error', 'type-based'],
    // COMP-05: 组件命名至少两个单词
    'vue/multi-word-component-names': 'error',
    // NAME-04: 事件命名
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/attribute-hyphenation': ['error', 'always'],
    // PERF-02: v-for 必须绑定稳定 key
    'vue/require-v-for-key': 'error',
    // SEC-01: 禁止裸 v-html（MessageContent.vue 单独豁免）
    'vue/no-v-html': 'error',
    // ERR-01: 禁止空 catch
    'no-empty': ['error', { allowEmptyCatch: false }],
    // SEC-04: 生产环境禁止 console（error/warn 白名单）
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    // DIR-03: 禁止三级以上相对路径
    'no-restricted-imports': [
      'error',
      {
        patterns: ['../../../*'],
      },
    ],
    'unicorn/filename-case': 'off',
  },
  overrides: [
    {
      files: ['src/utils/http.ts'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    {
      files: ['**/*.vue'],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
      },
    },
  ],
}
