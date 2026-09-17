// AGENT-11：DOMPurify 必须放行 http/https 链接、剔除 <script>/on* 事件属性/javascript: 协议链接。
// REVIEW-04：SEC-01/AGENT-02 净化管线相关改动需补充 Vitest 用例。
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import MessageContent from './MessageContent.vue'

describe('MessageContent', () => {
  it('剔除 <script> 标签与 onerror 事件属性', () => {
    const wrapper = mount(MessageContent, {
      props: {
        content: '正常文本 <img src="x" onerror="alert(1)" /><script>alert(1)</script>',
      },
    })
    const html = wrapper.html()
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('onerror')
  })

  it('剔除 javascript: 协议链接，仅保留 http/https 链接', () => {
    const wrapper = mount(MessageContent, {
      props: {
        content: '[恶意链接](javascript:alert(1)) 与 [正常链接](https://example.com/doc)',
      },
    })
    const html = wrapper.html()
    expect(html).not.toContain('javascript:')
    expect(html).toContain('https://example.com/doc')
  })

  it('正常 Markdown 内容按 marked 管线渲染为 HTML', () => {
    const wrapper = mount(MessageContent, {
      props: { content: '**加粗内容**' },
    })
    expect(wrapper.html()).toContain('<strong>加粗内容</strong>')
  })
})
