import type { Lang } from '.';

// 数据中的时间都是 UTC。日期按北京时间计算，否则在 UTC 时区的机器上构建时，部分日期会早一天
const TIME_ZONE = 'Asia/Shanghai';

const numericDate = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

const englishDate = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const groupedNumber = new Intl.NumberFormat('en-US');

/** 中文写作「2026 年 8 月 30 日」，英文写作「Aug 30, 2026」 */
export function formatDate(iso: string, lang: Lang): string {
  const date = new Date(iso);
  if (lang === 'en') return englishDate.format(date);
  const parts = Object.fromEntries(numericDate.formatToParts(date).map((p) => [p.type, p.value]));
  return `${parts.year} 年 ${parts.month} 月 ${parts.day} 日`;
}

/** 带千位分隔符的数字，例如 69,730，中英文写法相同 */
export function formatNumber(value: number): string {
  return groupedNumber.format(value);
}
