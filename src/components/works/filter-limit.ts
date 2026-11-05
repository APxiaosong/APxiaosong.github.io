/**
 * 在 Filter 的筛选结果中只显示前 step 个条目，其余条目加上 data-overflow 属性，由页面样式隐藏。
 * Filter 每次改变条目的 hidden 属性后重新计算，上限恢复为 step。
 * onChange 收到当前显示的数量和匹配的总数；返回的函数把上限再放宽 step 个，用于「显示更多」。
 */
export function limitFiltered(
  container: HTMLElement,
  step: number,
  onChange?: (shown: number, total: number) => void,
): () => void {
  const items = Array.from(container.querySelectorAll<HTMLElement>('[data-filter-value]'));
  let limit = step;

  function apply() {
    const matched = items.filter((item) => !item.hidden);
    matched.forEach((item, i) => item.toggleAttribute('data-overflow', i >= limit));
    onChange?.(Math.min(limit, matched.length), matched.length);
  }

  new MutationObserver(() => {
    limit = step;
    apply();
  }).observe(container, { subtree: true, attributeFilter: ['hidden'] });
  apply();

  return () => {
    limit += step;
    apply();
  };
}
