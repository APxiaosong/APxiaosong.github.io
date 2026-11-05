import type { Lang, Localized } from '@/i18n';
import data from './tutorials.json';

export interface TutorialCategory {
  id: string;
  name: Localized;
}

export interface TutorialAuthor {
  id: string;
  name: Localized;
}

/** 视频在某个平台上的发布地址 */
export interface VideoSource {
  platform: 'bilibili' | 'youtube';
  /** B 站为 BV 号，YouTube 为视频 id */
  id: string;
  url: string;
  /** 封面原图；B 站封面用 images.ts 的 resizeImage 缩小，并且须带 referrerpolicy="no-referrer" */
  cover: string;
}

export interface Video {
  /** 有 B 站来源时取其 BV 号，否则取 YouTube 视频 id */
  id: string;
  /** zh 为视频的原标题 */
  title: Localized;
  /** 从视频简介中摘出的有效信息，只有中文；简介里没有可用内容时为 null */
  summary: string | null;
  /** 对应 TutorialAuthor 的 id */
  author: string;
  /** 对应 TutorialCategory 的 id */
  category: string;
  /** tutorial 为教程；showcase 为作品展示、实况与预告 */
  kind: 'tutorial' | 'showcase';
  /** 列在「精选教程」页上 */
  featured: boolean;
  /** 同一视频在各平台的发布地址，至少一个，B 站在前 */
  sources: VideoSource[];
}

/** 平台在页面上显示的名称，两种语言相同 */
export const platformNames: Record<VideoSource['platform'], string> = {
  bilibili: 'Bilibili',
  youtube: 'YouTube',
};

const categoryById = new Map(data.categories.map((c) => [c.id, c]));
const authorById = new Map(data.authors.map((a) => [a.id, a]));

/** 教程库的筛选类别 */
export const getTutorialCategories = (): TutorialCategory[] => data.categories;

export const getTutorialCategory = (id: string): TutorialCategory => categoryById.get(id)!;

export const getTutorialAuthor = (id: string): TutorialAuthor => authorById.get(id)!;

/** 全部视频：官方视频在前，其余按作者分组，组内大致从新到旧 */
export const getVideos = (): Video[] => data.videos as Video[];

/** 列在「精选教程」页上的视频，顺序与 getVideos 相同 */
export const getFeaturedVideos = (): Video[] => getVideos().filter((video) => video.featured);

/** 按语言选择播放来源：中文优先 B 站，英文优先 YouTube，视频只发布在一个平台时就用那一个 */
export const getVideoSource = (video: Video, lang: Lang): VideoSource => {
  const preferred = lang === 'zh' ? 'bilibili' : 'youtube';
  return video.sources.find((source) => source.platform === preferred) ?? video.sources[0];
};
