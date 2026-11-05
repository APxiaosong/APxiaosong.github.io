import type { Localized } from './index';

/** 多处共用的界面文字。只在一个页面或组件里出现的文案写在那个文件自己的 frontmatter 中。 */
export const ui = {
  site: {
    name: { zh: '传奇建造队', en: 'Legend Build Team' },
    // 团队名称下方的副标题
    subtitle: { zh: 'Legend Build Team', en: 'Est. 2016' },
    description: {
      zh: '传奇建造队是《废品机械师》的中国玩家团体，也是传奇模组的开发团队。',
      en: 'Legend Build Team is a Chinese Scrap Mechanic community and the team behind the New Legend Mod.',
    },
  },
  mod: {
    name: { zh: '传奇模组', en: 'New Legend Mod' },
    // 模组标题下方的副标题。英文的名称加副标题就是创意工坊上的全名 New Legend Mod Continuation
    subtitle: { zh: 'New Legend Mod', en: 'Continuation' },
    subscribe: { zh: '前往创意工坊订阅', en: 'Subscribe on the Workshop' },
    details: { zh: '模组详情', en: 'About the Mod' },
  },
  game: {
    // 游戏名称下方的副标题，游戏名称本身见 nav.game
    subtitle: { zh: 'Scrap Mechanic', en: 'By Axolot Games' },
    creativeMode: { zh: '创造模式', en: 'Creative Mode' },
    survivalMode: { zh: '生存模式', en: 'Survival Mode' },
    challengeMode: { zh: '挑战模式', en: 'Challenge Mode' },
  },
  // 区块和内页首屏上方的标签，与导航的分组对应
  tag: {
    about: { zh: '关于 / About', en: 'About' },
    get: { zh: '获取 / Get', en: 'Get' },
    community: { zh: '社区 / Community', en: 'Community' },
    tutorials: { zh: '教程 / Tutorials', en: 'Tutorials' },
  },
  // 统计带的说明文字，\n 处换行
  stats: {
    subscriptions: { zh: 'Steam 创意工坊\n订阅数', en: 'Steam Workshop\nsubscribers' },
    items: { zh: '模组\n物品总数', en: 'Items\nin the Mod' },
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
    filterByCategory: { zh: '按分类筛选', en: 'Filter by category' },
    viewAllWorks: { zh: '在 Steam 查看全部作品', en: 'View all on Steam' },
  },
} satisfies Record<string, Record<string, Localized>>;
