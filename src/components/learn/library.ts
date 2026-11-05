import { pages } from '@/config/site';
import { localizePath, type Lang } from '@/i18n';

/** 教程库筛选分类使用的网址参数 */
export const libraryParam = 'category';

/** 教程库筛选到某个分类后的地址，例如 /tutorial-library.html?category=track */
export const libraryCategoryPath = (category: string, lang: Lang): string =>
  localizePath(`${pages.library}?${libraryParam}=${category}`, lang);
