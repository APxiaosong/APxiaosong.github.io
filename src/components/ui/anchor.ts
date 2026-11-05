/** 网址锚点指向的元素。锚点中的中文等字符经过百分号编码，编码格式不正确时按原文查找 */
export function anchorTarget(): HTMLElement | null {
  const hash = location.hash.slice(1);
  try {
    return document.getElementById(decodeURIComponent(hash));
  } catch {
    return document.getElementById(hash);
  }
}
