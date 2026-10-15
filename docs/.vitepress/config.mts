import { defineConfig, type DefaultTheme } from 'vitepress'

// 站点信息：
// - sitemap 暂未启用：域名尚未备案，待阿里云 ESA 绑定自定义域名后，
//   补充 sitemap: { hostname: 'https://<你的域名>' }。
// - base 默认 '/'（域名根路径部署）；若日后挂到子路径，需同步修改
//   basic/settlement 页内 iframe 的 src（/files/...）。

const basicSidebar: DefaultTheme.SidebarItem[] = [
  { text: '总览', link: '/basic/' },
  { text: '玩法', link: '/basic/gameplay' },
  { text: '判定', link: '/basic/judgement' },
  { text: '界面', link: '/basic/ui' },
  { text: '谱面与曲目', link: '/basic/chart' },
  { text: '结算', link: '/basic/settlement' },
  { text: '设置系统', link: '/basic/settings' },
  { text: 'Ranking Score', link: '/basic/rks' },
  { text: '课题模式', link: '/basic/course' },
  { text: '其他系统', link: '/basic/others' },
]

const unlockSidebar: DefaultTheme.SidebarItem[] = [
  { text: '解锁规则与导航', link: '/unlock/' },
  { text: '主线第五章', link: '/unlock/chapter5' },
  { text: '主线第六章', link: '/unlock/chapter6' },
  { text: '主线第七章', link: '/unlock/chapter7' },
  { text: '主线第八章', link: '/unlock/chapter8' },
  { text: '主线第九章（上）', link: '/unlock/chapter9-1' },
  { text: '主线第九章（下）', link: '/unlock/chapter9-2' },
  { text: '支线章节 SS2-4', link: '/unlock/side-stories' },
  { text: '精选集与外传 AT', link: '/unlock/collections' },
  { text: '单曲 Random 差分', link: '/unlock/random' },
]

const faqSidebar: DefaultTheme.SidebarItem[] = [
  { text: '常见问题', link: '/faq/' },
  { text: '多指练习与进阶', link: '/faq/advanced' },
]

export default defineConfig({
  lang: 'zh-CN',
  title: 'Phigros 入门指南',
  description:
    'Phigros 入门指南与帮助中心：游戏基础、主线/AT 解锁教程、音游名词（术语）解释与常见问题 Q&A',
  head: [['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]],
  lastUpdated: true,
  markdown: {
    math: true,
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '游戏基础', link: '/basic/', activeMatch: '/basic/' },
      { text: '解锁教程', link: '/unlock/', activeMatch: '/unlock/' },
      { text: '术语解释', link: '/terms/', activeMatch: '/terms/' },
      { text: '常见问题', link: '/faq/', activeMatch: '/faq/' },
    ],

    sidebar: {
      '/basic/': [{ text: '游戏基础', link: '/basic/', items: basicSidebar, collapsed: false }],
      '/unlock/': [{ text: '解锁教程', link: '/unlock/', items: unlockSidebar, collapsed: false }],
      '/terms/': [{ text: '术语解释', link: '/terms/' }],
      '/faq/': faqSidebar,
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '未找到相关结果',
            resetButtonTitle: '清除查询',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/Temmie0125/phi-guide-docs' }],

    footer: {
      message: '本文禁止转载或摘编',
      copyright: 'Copyright © 2026 Temmie0125',
    },

    outline: { level: [2, 3], label: '本页目录' },
    lastUpdated: { text: '最后更新于' },
    docFooter: { prev: '上一页', next: '下一页' },
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    editLink: {
      pattern: 'https://github.com/Temmie0125/phi-guide-docs/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
  },
})
