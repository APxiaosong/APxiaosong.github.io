/**
 * /llms.txt：供大语言模型阅读的站点简介，Markdown 格式。
 * 模组的版本和统计数字、社群信息、页面列表都在构建时从数据和 config/site.ts 生成。
 * 反馈渠道只给出首页反馈区块的链接，与页面上不出现完整邮箱地址的做法保持一致。
 */
import type { APIRoute } from 'astro';
import { homeLink, links, navGroups, pages, qqGroups, type NavLink } from '@/config/site';
import { getMod } from '@/data/mod';
import { localizePath } from '@/i18n';
import { formatDate, formatNumber } from '@/i18n/format';
import { ui } from '@/i18n/ui';

export const GET: APIRoute = ({ site }) => {
  const absolute = (path: string) => new URL(path, site).href;
  const english = (path: string) => absolute(localizePath(path, 'en'));
  const page = ({ label, href }: NavLink) => `${label.en}: [中文](${absolute(href)}) · [English](${english(href)})`;
  const mod = getMod();

  const lines = [
    `# ${ui.site.name.en} (${ui.site.name.zh})`,
    '',
    `> ${ui.site.description.en}`,
    '',
    'The team was founded on April 2, 2016. This website is published in Chinese and English: Chinese pages are at the site root, and English pages are under /en/.',
    '',
    '## New Legend Mod (传奇模组)',
    '',
    `A comprehensive building mod for Scrap Mechanic, published on the Steam Workshop as "${mod.name}".`,
    '',
    `- Current version: ${mod.version}, updated ${formatDate(mod.updatedAt, 'en')}`,
    `- Items: ${formatNumber(mod.itemCount)}`,
    `- Steam Workshop subscribers: ${formatNumber(mod.subscriptions)}`,
    `- [Steam Workshop page](${links.modWorkshop})`,
    `- [Changelog](${english(pages.news)})`,
    '',
    '## Community',
    '',
    `- QQ groups: ${qqGroups.map((group) => group.number).join(', ')}`,
    `- [Steam group](${links.steamGroup})`,
    `- [Feedback and contact](${english(pages.feedback)})`,
    '',
    '## Pages',
    '',
    `- ${page(homeLink)}`,
    ...navGroups.flatMap((group) => [`- ${group.label.en}`, ...group.items.map((item) => `  - ${page(item)}`)]),
    '',
  ];

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
