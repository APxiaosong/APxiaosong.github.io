import type { Localized } from '@/i18n';
import data from './gallery.json';

/** 画廊作者；与创意工坊作者是同一人时，id 与 workshop.ts 中的成员 id 相同 */
export interface GalleryArtist {
  id: string;
  name: Localized;
}

export interface GalleryItem {
  /** 作者起的标题，没有标题时为 null */
  title: string | null;
  /** 对应 GalleryArtist 的 id */
  artist: string;
  /** 原图地址；Steam 图片已去掉尺寸参数，展示时先经 resizeImage 换成合适的宽度 */
  image: string;
  /** 原图的像素尺寸，画廊按它的比例排版，图片加载之前就预留出位置 */
  width: number;
  height: number;
}

const artistById = new Map(data.artists.map((a) => [a.id, a]));

/** 画廊收录了图片的作者，按 gallery.json 中的顺序排列 */
export const getGalleryArtists = (): GalleryArtist[] => data.artists;

export const getGalleryArtist = (id: string): GalleryArtist => artistById.get(id)!;

/** 人工挑选的精选图片，保持挑选时的顺序 */
export const getGalleryItems = (): GalleryItem[] => data.items;
