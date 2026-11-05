import type { Localized } from '@/i18n';
import data from './changelog.json';

export interface ChangelogItem {
  text: Localized;
  /** 从属于本条的子条目，例如本条中新增的各个零件 */
  items?: ChangelogItem[];
}

/** 正文中的一个分组，依次展示标题、说明段落和条目 */
export interface ChangelogSection {
  heading: Localized | null;
  paragraphs: Localized[];
  items: ChangelogItem[];
}

export interface ChangelogEntry {
  /** Steam 上这条记录的编号，数值上等于发布时间的 Unix 时间戳 */
  id: string;
  /** UTC 的 ISO 8601 字符串 */
  publishedAt: string;
  /** 原文没有写明、前后记录也无法确定版本时为 null */
  version: string | null;
  label: Localized;
  title: Localized;
  sections: ChangelogSection[];
}

/** 模组的全部更新记录，按发布时间从新到旧排列 */
export const getChangelog = (): ChangelogEntry[] => data;

/** 记录在动态页上的锚点 id。由 Steam 编号生成，发布后不会改变，外部链接可以长期使用 */
export const changelogAnchor = (entry: ChangelogEntry): string => `log-${entry.id}`;
