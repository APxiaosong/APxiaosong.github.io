import type { Localized } from '@/i18n';
import { ui } from '@/i18n/ui';

/** 站内页面的中文路径。英文路径用 localizePath(pages.xxx, 'en') 得到。 */
export const pages = {
  home: '/',
  team: '/about-team.html',
  game: '/about-game.html',
  mod: '/mod.html',
  get: '/get.html',
  news: '/community.html',
  gallery: '/gallery.html',
  workshop: '/workshop.html',
  faq: '/faq.html',
  tutorials: '/tutorials.html',
  library: '/tutorial-library.html',
  feedback: '/#feedback',
} as const;

export const links = {
  modWorkshop: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3309460746',
  modChangelog: 'https://steamcommunity.com/sharedfiles/filedetails/changelog/3309460746',
  steamGroup: 'https://steamcommunity.com/groups/ltsandbox',
  gameStore: 'https://store.steampowered.com/app/387990/Scrap_Mechanic/',
  // 「4.1.0 履带前瞻」预告片。中文访客多数无法访问 YouTube，中文版指向同一视频在 B 站的版本
  trailer: {
    zh: 'https://www.bilibili.com/video/BV1f18bzuEiQ',
    en: 'https://youtu.be/_e1cA5B9wqw',
  } satisfies Localized,
} as const;

export const qqGroups: { name: Localized; number: string }[] = [
  { name: { zh: '一群', en: 'Group 1' }, number: '537532878' },
  { name: { zh: '二群', en: 'Group 2' }, number: '158484814' },
  { name: { zh: '三群', en: 'Group 3' }, number: '633703984' },
];

/** 反馈邮箱分两段保存，页面上由 EmailLink 组件在浏览器里拼接，静态 HTML 中不出现完整地址 */
export const feedbackEmail = { user: 'smlegendmod', domain: '163.com' } as const;

export interface NavLink {
  label: Localized;
  href: string;
}

export interface NavGroup {
  id: string;
  label: Localized;
  items: NavLink[];
}

/** 顶部导航：首页为单独链接，其余四组带下拉菜单。页脚复用这四组。 */
export const homeLink: NavLink = { label: ui.nav.home, href: pages.home };

export const navGroups: NavGroup[] = [
  {
    id: 'about',
    label: ui.nav.about,
    items: [
      { label: ui.nav.team, href: pages.team },
      { label: ui.nav.game, href: pages.game },
    ],
  },
  {
    id: 'mod',
    label: ui.nav.modGroup,
    items: [
      { label: ui.nav.mod, href: pages.mod },
      { label: ui.nav.get, href: pages.get },
    ],
  },
  {
    id: 'community',
    label: ui.nav.community,
    items: [
      { label: ui.nav.news, href: pages.news },
      { label: ui.nav.gallery, href: pages.gallery },
      { label: ui.nav.workshop, href: pages.workshop },
      { label: ui.nav.faq, href: pages.faq },
    ],
  },
  {
    id: 'tutorials',
    label: ui.nav.tutorialsGroup,
    items: [
      { label: ui.nav.tutorials, href: pages.tutorials },
      { label: ui.nav.library, href: pages.library },
    ],
  },
];
