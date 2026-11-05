import type { Localized } from './index';

/** 多处共用的界面文字。只在一个页面或组件里出现的文案写在那个文件自己的 frontmatter 中。 */
export const ui = {
  site: {
    name: { zh: '传奇建造队', en: 'Legend Build Team' },
    description: {
      zh: '传奇建造队是《废品机械师》的中国玩家团体，也是传奇模组的开发团队。',
      en: 'Legend Build Team is a Chinese Scrap Mechanic community and the team behind the New Legend Mod.',
    },
  },
  nav: {
    home: { zh: '首页', en: 'Home' },
    about: { zh: '关于', en: 'About' },
    team: { zh: '传奇建造队', en: 'Legend Build Team' },
    game: { zh: '废品机械师', en: 'Scrap Mechanic' },
    modGroup: { zh: '模组', en: 'Mod' },
    mod: { zh: '模组', en: 'The Mod' },
    get: { zh: '获取', en: 'Get' },
    community: { zh: '社区', en: 'Community' },
    news: { zh: '动态', en: 'News' },
    gallery: { zh: '画廊', en: 'Gallery' },
    workshop: { zh: '创意工坊', en: 'Workshop' },
    faq: { zh: '常见问题', en: 'FAQ' },
    tutorialsGroup: { zh: '教程', en: 'Tutorials' },
    tutorials: { zh: '教程', en: 'Tutorials' },
    library: { zh: '教程库', en: 'Library' },
    feedback: { zh: '反馈', en: 'Feedback' },
    links: { zh: '链接', en: 'Links' },
    steamGroup: { zh: 'Steam 社区组', en: 'Steam Group' },
    email: { zh: '反馈邮箱', en: 'Email' },
    openMenu: { zh: '打开菜单', en: 'Open menu' },
    closeMenu: { zh: '关闭菜单', en: 'Close menu' },
    mainLabel: { zh: '主导航', en: 'Main navigation' },
  },
  theme: {
    toLight: { zh: '浅色主题', en: 'Light theme' },
    toDark: { zh: '深色主题', en: 'Dark theme' },
  },
  lang: {
    switchLabel: { zh: 'Switch to English', en: '切换到中文' },
    switchShort: { zh: 'EN', en: '中' },
    switchName: { zh: 'English', en: '中文' },
  },
  footer: {
    copyright: { zh: '传奇建造队 · 由热爱驱动', en: 'Legend Build Team · Driven by passion' },
    tagline: { zh: 'Scrap Mechanic · New Legend Mod', en: 'Scrap Mechanic · New Legend Mod' },
  },
  common: {
    skipToContent: { zh: '跳到正文', en: 'Skip to content' },
    newWindow: { zh: '（在新窗口打开）', en: ' (opens in a new window)' },
  },
} satisfies Record<string, Record<string, Localized>>;
