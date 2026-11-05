import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.legendbuild.cn',
  // 页面输出为 /mod.html、/en/mod.html 这样的文件，与旧网站的网址保持一致
  build: { format: 'preserve' },
  devToolbar: { enabled: false },
  vite: {
    build: {
      // 字体分片不内联进样式表，浏览器只下载页面上用到的分片；其他资源仍按默认的 4KB 界限决定是否内联
      assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined),
    },
  },
});
