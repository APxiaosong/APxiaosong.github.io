// 从 remixicon.css 解析出图标名到字符的对照表，只在构建时使用，不会发送到浏览器
import remixCss from 'remixicon/fonts/remixicon.css?raw';

const glyphs = new Map(
  Array.from(remixCss.matchAll(/\.ri-([\w-]+):before \{ content: "\\(\w+)"; \}/g), ([, name, hex]) => [
    name,
    String.fromCodePoint(Number.parseInt(hex, 16)),
  ]),
);

/** 返回图标在字体中的字符；图标名不存在时抛出错误，使构建失败 */
export function iconGlyph(name: string): string {
  const glyph = glyphs.get(name);
  if (!glyph) throw new Error(`Remix Icon 中没有名为 "${name}" 的图标`);
  return glyph;
}
