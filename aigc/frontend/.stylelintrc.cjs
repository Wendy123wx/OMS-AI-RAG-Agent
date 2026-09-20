/* eslint-env node */
module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recommended-vue'],
  overrides: [
    {
      // stylelint-config-recommended-vue 内部 extends stylelint-config-recommended，
      // 会在 extends 顺序中覆盖 standard-scss 对 at-rule-no-unknown 的关闭，
      // 需在 .vue 文件中显式改回 SCSS 感知版本，否则 @use/@include 会被误判为未知规则
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
      rules: {
        'at-rule-no-unknown': null,
        'scss/at-rule-no-unknown': true,
      },
    },
    {
      // 设计变量源文件本身允许定义十六进制颜色字面量，供其余文件通过变量引用（STYLE-05 约束的是使用方而非定义方）
      files: ['src/styles/variables.scss'],
      rules: {
        'color-no-hex': null,
      },
    },
  ],
  rules: {
    // STYLE-04: 禁止 !important
    'declaration-no-important': true,
    // STYLE-03: BEM 命名
    'selector-class-pattern': [
      '^[a-z]([a-z0-9-]+)?(__[a-z0-9-]+)?(--[a-z0-9-]+)?$',
      { message: '类名须符合 BEM 规范（STYLE-03）：block__element--modifier' },
    ],
    // STYLE-05: 禁止硬编码十六进制颜色
    'color-no-hex': [true, { message: '颜色须使用 styles/variables.scss 中的设计变量（STYLE-05）' }],
    'scss/at-import-partial-extension': null,
  },
  ignoreFiles: ['**/dist/**', '**/node_modules/**', 'src/styles/reset.scss'],
}
