/**
 * 触屏上在元素上左右滑动时调用 onStep：向左滑传入 1（下一张），向右滑传入 -1（上一张）。
 * 横向手势由脚本处理，纵向滚动和双指缩放仍交给浏览器；鼠标拖动不算滑动。
 */
export function onSwipe(element: HTMLElement, onStep: (direction: 1 | -1) => void) {
  // 浏览器接管横向手势时只派发 pointercancel，不派发 pointerup
  element.style.touchAction = 'pan-y pinch-zoom';
  let start: { x: number; y: number } | null = null;

  element.addEventListener('pointerdown', (event) => {
    start = event.pointerType === 'mouse' ? null : { x: event.clientX, y: event.clientY };
  });

  element.addEventListener('pointercancel', () => {
    start = null;
  });

  element.addEventListener('pointerup', (event) => {
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) onStep(dx < 0 ? 1 : -1);
  });
}
