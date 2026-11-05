// 外部图片的缩略图地址。Steam 与 B 站的图床按宽度等比缩小、不会放大原图，其他来源的图片原样使用。
// B 站图片（*.hdslb.com）按 Referer 防盗链，<img> 必须带 referrerpolicy="no-referrer" 才能加载。

/** 按目标宽度（实际像素，已乘设备像素比）生成缩略图地址，url 须为不带参数的原图地址 */
export function resizeImage(url: string, width: number): string {
  const host = new URL(url).hostname;
  // 缺少 impolicy=Letterbox 时服务器会忽略尺寸参数；只给宽度、不给 imh 才不会补黑边。输出总是 JPEG
  if (host === 'images.steamusercontent.com') return `${url}?imw=${width}&impolicy=Letterbox`;
  if (host.endsWith('.hdslb.com')) return `${url}@${width}w.webp`;
  return url;
}

/** 按一组目标宽度生成 <img> 的 srcset；图床不支持缩放时返回 undefined，只使用 src */
export function resizeSrcset(url: string, widths: number[]): string | undefined {
  if (resizeImage(url, widths[0]) === url) return undefined;
  return widths.map((width) => `${resizeImage(url, width)} ${width}w`).join(', ');
}
