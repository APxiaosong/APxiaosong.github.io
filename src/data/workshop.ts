import type { Localized } from '@/i18n';
import data from './workshop.json';

export interface WorkshopCategory {
  id: string;
  name: Localized;
}

export interface WorkshopAuthor {
  id: string;
  name: Localized;
  /** Steam 账号的 SteamID64 */
  steamId: string;
  /** 该成员在 Steam 上的个人创意工坊页面，只列出《废品机械师》的作品 */
  workshopUrl: string;
}

export interface Work {
  /** 创意工坊的物品编号 */
  id: string;
  /** Steam 上的原标题 */
  title: string;
  /** 对应 WorkshopCategory 的 id */
  category: string;
  /** 参与创作的成员 id，Steam 上的上传者排在最前 */
  authors: string[];
  url: string;
  /** 不带尺寸参数的原图地址，缩略图用 images.ts 的 resizeImage 生成 */
  previewUrl: string;
  /** UTC 的 ISO 8601 字符串 */
  createdAt: string;
  updatedAt: string;
}

const categoryById = new Map(data.categories.map((c) => [c.id, c]));
const authorById = new Map(data.authors.map((a) => [a.id, a]));

/** 作品分类，按页面上的展示顺序排列 */
export const getWorkshopCategories = (): WorkshopCategory[] => data.categories;

export const getWorkshopCategory = (id: string): WorkshopCategory => categoryById.get(id)!;

/** 收录了作品的成员 */
export const getWorkshopAuthors = (): WorkshopAuthor[] => data.authors;

export const getWorkshopAuthor = (id: string): WorkshopAuthor => authorById.get(id)!;

/** 全部作品，按发布时间从新到旧排列 */
export const getWorks = (): Work[] => data.works;

/** 某位成员名下的作品，合作作品会同时出现在每位作者名下 */
export const getWorksByAuthor = (authorId: string): Work[] =>
  data.works.filter((work) => work.authors.includes(authorId));
