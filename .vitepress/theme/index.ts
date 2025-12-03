// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
// 导入默认样式和自定义样式
import './style.css'
import './style/index.css'
// 导入烟花效果脚本
import Fireworks from './fireworks'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // 仅在浏览器环境中初始化烟花效果（避免SSR错误）
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      setTimeout(() => {
        new Fireworks()
      }, 100)
    }
  }
} satisfies Theme
