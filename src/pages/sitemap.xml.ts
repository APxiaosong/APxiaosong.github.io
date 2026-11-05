/**
 * 站点地图 /sitemap.xml。收录 config/site.ts 的 pages 中登记的页面，
 * 每个页面的各语言版本各占一条，并用 xhtml:link 标注全部语言版本。
 */
import type { APIRoute } from 'astro';
import { pages } from '@/config/site';
import { hreflangLinks, langs, localizePath } from '@/i18n';

export const GET: APIRoute = ({ site }) => {
  const absolute = (path: string) => new URL(path, site).href;

  // pages 中的 feedback 是首页的锚点，不是单独的页面
  const urls = Object.values(pages)
    .filter((path) => !path.includes('#'))
    .flatMap((path) => {
      const alternates = hreflangLinks(path)
        .map((link) => `<xhtml:link rel="alternate" hreflang="${link.hreflang}" href="${absolute(link.path)}"/>`)
        .join('\n    ');
      return langs.map((lang) => `  <url>\n    <loc>${absolute(localizePath(path, lang))}</loc>\n    ${alternates}\n  </url>`);
    });

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
