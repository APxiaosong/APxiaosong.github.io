import type { Localized } from '@/i18n';
import data from './mod.json';

/** 创意工坊页面上的一张截图，width 和 height 是原图的像素尺寸 */
export interface Screenshot {
  image: string;
  width: number;
  height: number;
}

/** 模组简介中推荐的其他创意工坊物品 */
export interface RelatedItem {
  id: string;
  title: Localized;
  /** 卡片上的类别标签，例如「自定义游戏」 */
  kind: Localized;
  url: string;
  previewUrl: string;
}

/** 创意工坊上的模组信息，时间均为 UTC 的 ISO 8601 字符串 */
export interface Mod {
  id: string;
  name: string;
  version: string;
  /** Steam 不提供物品总数，这个值需要手动维护 */
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  subscriptions: number;
  favorites: number;
  /** 与创意工坊页面上显示的文件大小一致 */
  fileSizeMb: number;
  previewUrl: string;
  /** 按创意工坊页面上的顺序排列 */
  screenshots: Screenshot[];
  related: RelatedItem[];
}

export const getMod = (): Mod => data;
