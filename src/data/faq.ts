import type { Localized } from '@/i18n';
import data from './faq.json';

export interface FaqItem {
  /** 页面锚点使用的标识 */
  id: string;
  question: Localized;
  answer: Localized;
  /** 同时列在首页的常见问题区块中 */
  featured: boolean;
}

export interface FaqGroup {
  id: string;
  title: Localized;
  items: FaqItem[];
}

/** 全部常见问题，按分组排列 */
export const getFaqGroups = (): FaqGroup[] => data;
