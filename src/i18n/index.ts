export const langs = ['zh', 'en'] as const;
export type Lang = (typeof langs)[number];

// 双语字段：数据文件和页面文案中需要按语言切换的值都使用这个结构
export type Localized<T = string> = Record<Lang, T>;

export const pick = <T>(value: Localized<T>, lang: Lang): T => value[lang];

/** 返回绑定了语言的取值函数，组件里写作 const t = translator(lang); t(copy.title) */
export const translator =
  (lang: Lang) =>
  <T>(value: Localized<T>): T =>
    value[lang];

/** 中文是默认语言，网址不带前缀；英文网址以 /en/ 开头 */
export const defaultLang: Lang = 'zh';

export const htmlLang: Localized = { zh: 'zh-CN', en: 'en' };
export const ogLocale: Localized = { zh: 'zh_CN', en: 'en_US' };

export const otherLang = (lang: Lang): Lang => (lang === 'zh' ? 'en' : 'zh');

/** [...lang] 页面的 getStaticPaths：同一个页面文件生成中文和英文两个页面 */
export function getLangPaths() {
  return langs.map((lang) => ({ params: { lang: lang === defaultLang ? undefined : lang } }));
}

const LANG_PREFIX = /^\/en(?=[/#?]|$)/;

/** 根据页面网址判断语言，在任何组件里都可以用 getLang(Astro.url) 取得 */
export function getLang(url: URL): Lang {
  return LANG_PREFIX.test(url.pathname) ? 'en' : 'zh';
}

/**
 * 把站内路径转换到指定语言，路径可以带 #锚点。
 * 输入既可以是中文路径，也可以是英文路径：localizePath('/mod.html', 'en') 得到 '/en/mod.html'，
 * localizePath('/en/#feedback', 'zh') 得到 '/#feedback'。
 */
export function localizePath(path: string, lang: Lang): string {
  let neutral = path.replace(LANG_PREFIX, '');
  if (!neutral.startsWith('/')) neutral = `/${neutral}`;
  return lang === defaultLang ? neutral : `/${lang}${neutral}`;
}

/** 当前页面去掉语言前缀后的路径，首页统一为 '/'，用于导航高亮 */
export function pageKey(url: URL): string {
  return localizePath(url.pathname, defaultLang).replace(/index\.html$/, '');
}

/** 当前页面在指定语言下的路径，首页不带 index.html */
export function pagePath(url: URL, lang: Lang = getLang(url)): string {
  return localizePath(pageKey(url), lang);
}

/** 当前页面另一种语言的路径，用于语言切换 */
export function alternatePath(url: URL): string {
  return pagePath(url, otherLang(getLang(url)));
}

/** 站内路径在各语言下的版本及其 hreflang，最后一项 x-default 指向默认语言，用于 <head> 和站点地图 */
export function hreflangLinks(path: string): { hreflang: string; path: string }[] {
  return [
    ...langs.map((lang) => ({ hreflang: htmlLang[lang], path: localizePath(path, lang) })),
    { hreflang: 'x-default', path: localizePath(path, defaultLang) },
  ];
}
