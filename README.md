# 传奇建造队官方网站

传奇建造队是《废品机械师》（Scrap Mechanic）的中国玩家团体，也是传奇模组（New Legend Mod）的开发团队。本仓库是团队官网的源代码，网址为 <https://www.legendbuild.cn>。

网站用 [Astro](https://docs.astro.build) 生成纯静态页面，部署在 GitHub Pages 上，不使用 React、Vue 等界面框架。页面支持中文和英文、深色和浅色两套主题，并适配手机屏幕。设计语言见 [DESIGN.md](DESIGN.md)。

## 本地运行

需要 Node.js 22.23.4 或更高版本。

```sh
npm install        # 安装依赖
npm run dev        # 启动开发服务器，默认地址为 http://localhost:4321
npm run check      # 类型检查，提交前应当没有错误
npm run build      # 生成静态网站，输出到 dist/
npm run preview    # 在本地预览 dist/ 中的构建结果
```

## 部署

网站由 GitHub Actions 构建并发布到 GitHub Pages，工作流是 `.github/workflows/deploy.yml`。推送到 `main` 分支时，工作流依次安装依赖、运行类型检查、构建网站，再把 `dist/` 发布出去。工作流没有定时触发，线上网站只在推送之后更新。也可以在仓库的 Actions 页面选择 Deploy 工作流，点击 Run workflow 手动发布一次。

首次使用前，在仓库的 Settings → Pages 中，把 Build and deployment 下的 Source 改为 GitHub Actions，并确认 Custom domain 为 `www.legendbuild.cn`。

日常发布就是把改动推送到 `main` 分支。类型检查或构建失败时不会发布，线上网站保持原样，出错的步骤可以在 Actions 页面查看。工作流使用 Node.js 22。

## 目录结构

```
src/
  pages/
    [...lang]/          页面。每个文件同时生成中文和英文两个页面
    404.astro           GitHub Pages 使用的 404 页面
    sitemap.xml.ts      构建时生成站点地图 /sitemap.xml
    llms.txt.ts         构建时生成供大语言模型阅读的站点简介 /llms.txt
  layouts/
    BaseLayout.astro    全站页面骨架：<head>、导航、页脚、主题初始化、入场动画
  components/
    layout/             导航、页脚、主题切换、语言切换
    ui/                 公共组件，见下文「公共组件」
    home/               首页首屏和反馈区块
    about/ mod/ works/ learn/
                        各领域的页面区块，首页区块以 Home 开头
  config/site.ts        站点常量：页面路径、外部链接、QQ 群、反馈邮箱、导航结构
  i18n/
    index.ts            语言类型和路径函数
    format.ts           日期和数字的格式
    ui.ts               多处共用的界面文字
  data/                 内容数据，说明见 src/data/README.md
  styles/
    tokens.css          设计变量：颜色（深浅两套）、字体、字号、间距、切角、缓动
    global.css          全局基础样式、文字角色类、入场动画
    fonts.css           字体文件的引入
  assets/images/        经 astro:assets 优化后输出的图片
public/                 原样复制到网站根目录的文件，例如 robots.txt 和搜索引擎的站点验证文件
.github/workflows/      发布网站的 GitHub Actions 工作流，见「部署」
```

## 新增页面

页面文件放在 `src/pages/[...lang]/` 下，文件名就是网址。例如 `src/pages/[...lang]/mod.astro` 生成 `/mod.html` 和 `/en/mod.html`。每个页面都需要导出 `getStaticPaths = getLangPaths`，并把内容包在 `BaseLayout` 中：

```astro
---
import scene from '@/assets/images/scene-creative.png';
import PageHero from '@/components/ui/PageHero.astro';
import Section from '@/components/ui/Section.astro';
import SectionHeading from '@/components/ui/SectionHeading.astro';
import { getLang, getLangPaths, translator } from '@/i18n';
import BaseLayout from '@/layouts/BaseLayout.astro';

export const getStaticPaths = getLangPaths;

const t = translator(getLang(Astro.url));

const copy = {
  title: { zh: '教程', en: 'Tutorials' },
  description: { zh: '……', en: '……' },
  lead: { zh: '……', en: '……' },
};
---

<BaseLayout title={t(copy.title)} description={t(copy.description)}>
  <PageHero image={scene} tag="教程 / Tutorials" title={t(copy.title)} subtitle="Featured Guides" lead={t(copy.lead)} watermark="LEARN" />
  <Section>
    <SectionHeading title={t({ zh: '学习路线', en: 'Learning Path' })} data-reveal />
  </Section>
</BaseLayout>
```

`BaseLayout` 的参数：

| 参数 | 说明 |
|---|---|
| `title` | 页面名称，标题栏显示为「页面名称 \| 站点名」。首页不传 |
| `description` | 搜索结果和分享卡片中的描述，不传时使用站点描述 |
| `image` | 分享卡片的图片（`ImageMetadata`），不传时使用模组封面 |
| `noindex` | 不让搜索引擎收录，同时省略 canonical 和语言互链 |

需要被搜索引擎收录的页面，都要在 `src/config/site.ts` 的 `pages` 中登记中文路径，站点地图和 `llms.txt` 根据它列出页面。页面需要出现在导航里时，再在 `navGroups` 中加入链接，链接文字写在 `src/i18n/ui.ts` 的 `nav` 中。页脚复用 `navGroups`，不需要另外修改。

## 多语言

中文是默认语言，网址不带前缀；英文网址以 `/en/` 开头。所有需要按语言切换的值都写成 `Localized` 结构，即 `{ zh: '……', en: '……' }`。

- 只在一个页面或组件中出现的文案，写在那个文件的 frontmatter 里（通常整理成一个 `copy` 对象）。
- 导航、页脚、按钮等多处共用的文字放在 `src/i18n/ui.ts`。
- 内容数据中的双语字段同样使用 `Localized`。

组件不需要从页面接收语言参数，用 `getLang(Astro.url)` 自己取得。站内链接一律通过 `localizePath` 生成，不要手写 `/en/` 前缀。

`src/i18n/index.ts` 提供的函数：

| 函数 | 说明 |
|---|---|
| `getLangPaths()` | 页面的 `getStaticPaths`，生成中文和英文两个页面 |
| `getLang(url)` | 根据网址判断当前语言 |
| `translator(lang)` | 返回取值函数 `t`，`t(copy.title)` 得到当前语言的文字 |
| `pick(value, lang)` | 直接从 `Localized` 中取出指定语言的值 |
| `localizePath(path, lang)` | 把站内路径转换到指定语言，可以带 `#锚点`，例如 `localizePath(pages.feedback, 'en')` 得到 `/en/#feedback` |
| `alternatePath(url)` | 当前页面另一种语言的路径，语言切换使用 |
| `pagePath(url, lang?)` | 当前页面在指定语言下的规范路径，首页不带 `index.html` |
| `pageKey(url)` | 当前页面去掉语言前缀后的路径，导航高亮使用 |
| `hreflangLinks(path)` | 站内路径在各语言下的版本和对应的 `hreflang`，最后一项 `x-default` 指向中文版。页面 `<head>` 中的语言互链和站点地图使用 |

`htmlLang`、`ogLocale` 是两种语言对应的 HTML `lang` 属性值和 Open Graph 语言代码。

日期和数字用 `src/i18n/format.ts` 中的函数输出：

- `formatDate(iso, lang)`：中文写作「2026 年 8 月 30 日」，英文写作「Aug 30, 2026」。数据中的时间是 UTC，这个函数按北京时间计算日期，不要直接调用 `toLocaleDateString`。
- `formatNumber(value)`：带千位分隔符，例如「69,730」，两种语言的写法相同。

## 主题

默认使用深色主题，不跟随系统设置。访客在导航中切换主题后，选择保存在 `localStorage` 的 `theme` 键中（取值为 `dark` 或 `light`），`BaseLayout` 在首次绘制前读取并设置 `<html data-theme>`。

- 组件中的颜色一律引用 `tokens.css` 中的语义变量，浅色主题就会自动生效，不需要为浅色单独写样式。
- 任何元素加上 `data-theme="dark"` 或 `data-theme="light"`，其中的变量就固定为那套主题。页面首屏和反馈区的邮箱卡片用这种方式在两种主题下都保持深色。
- 金底区块用 `Section tone="accent"`，或者在元素上加 `data-surface="accent"`。区块内的文字、分隔线和巨型背景字会自动换成深色。
- `--color-accent` 用于填充（按钮、标签、色块），`--color-accent-text` 用于金色文字。浅色主题下后者会加深，以保证对比度。

## 样式约定

- 组件样式写在组件自己的 `<style>` 中，颜色、字体、切角和缓动都引用 `tokens.css` 中的变量。字号优先使用 `--text-*` 变量；变量没有覆盖的尺寸（例如装饰性大字和个别区块的大标题）写在组件中，标题仍用 `clamp()` 随屏幕宽度变化。
- 断点统一为三个：`1100px` 收窄多栏网格，`900px` 导航折叠为菜单、双栏改为单栏，`600px` 为手机布局（左右留白缩小到 20px）。媒体查询写 `max-width`。
- `global.css` 提供四个文字角色类：`.text-body`（正文）、`.text-label`（Oswald 大写小字，颜色由使用处决定）、`.text-accent`（Spectral 斜体金色副标）、`.text-note`（Spectral 斜体灰色注释）。金色斜体的副标题和引语都加 `.text-accent`，灰色斜体的注释、结果数和署名都加 `.text-note`，组件样式中只写字号和间距；在金底区块中二者都自动变为深色。另有 `.container`（内容宽度和左右留白）和 `.sr-only`（只给读屏软件读的文字）。
- 滚动入场动画：给元素加 `data-reveal` 属性即可，进入视口时淡入上移。一组元素需要错开时，用 `style="--reveal-delay: 120ms"` 设置延迟。系统开启「减弱动态效果」时，所有动画都会关闭。脚本播放的动画和平滑滚动不受样式表控制，需要先用 `src/components/ui/motion.ts` 中的 `prefersReducedMotion()` 判断。
- 设计稿中的 `→`、`▶`、`⌕` 等符号都改用图标，网站中不使用 emoji 和 SVG。

## 字体

字体来自 Fontsource 的 npm 包，在 `src/styles/fonts.css` 中引入，由 Vite 打包成共用的样式表，字体文件随网站一起发布。中文字体使用可变字体，按 unicode-range 分片，浏览器只下载页面上实际出现的字符所在的分片。`astro.config.mjs` 让字体文件一律单独输出，不内联进样式表，否则很少用到的小分片也会随样式表下载。组件中只通过变量指定字体：`--font-body`、`--font-label`、`--font-accent`、`--font-serif`。

全局加载的字体有 Noto Sans SC、Oswald、Spectral 斜体和 Remix Icon 图标字体。Spectral 只用于西文点缀，其中的中文落到 Noto Sans SC 并保持正体；`fonts.css` 直接声明它的西文和扩展西文两个分片，不引入包里的样式表，因为那份样式表会附带浏览器用不到的 woff 后备文件。Noto Sans SC 把弯引号和撇号（U+2018–201F）画成全角字形，所以英文内容的 `--font-body` 最前面加了只覆盖这几个字符的 `Latin Quotes` 字体（字形取自 Oswald），中文内容的引号仍为全角。中文页面里的英文句子加上 `lang="en"` 属性，引号同样会使用西文字形。

衬线中文字体 Noto Serif SC 只用在少数组件上（例如人名），不在全局加载。用到它的组件按下面的写法引入，不要改用静态字重的 `@fontsource/noto-serif-sc` 包或其他文件：

```astro
---
import '@fontsource-variable/noto-serif-sc';
---

<style>
  .name {
    font-family: var(--font-serif);
  }
</style>
```

每个用到衬线体的组件都写这一行 import。多个组件重复引入时，Vite 只打包一次；没有用到衬线体的页面也不会加载它。

## 公共组件

公共组件都在 `src/components/ui/`。除特别说明外，组件会把未声明的属性传给根元素，所以可以直接写 `class`、`id`、`data-reveal`、`aria-*` 等属性，父组件也可以通过 `class` 为它们补充样式。

| 组件 | 用途 | 主要参数 |
|---|---|---|
| `Icon` | Remix Icon 图标，对读屏软件隐藏 | `name`：不带 `ri-` 前缀的图标名，例如 `arrow-right-line`。只有图标的按钮用 `aria-label` 说明含义 |
| `Button` | 切角按钮，传 `href` 时为链接 | `variant`：`primary` 金底、`ghost` 半透明描边、`outline` 金色描边、`dark` 深底金字（只用在金底区块上）；`size`：`md`、`sm`；`icon`、`iconBefore`：文字后、前的图标；`external`：新窗口打开并显示外部链接图标 |
| `ButtonGroup` | 一排按钮，放不下时换行，手机上每个按钮占满整行 | 没有参数。默认间距为 16px，使用处可以通过 `class` 调整间距、对齐和外边距 |
| `ArrowLink` | 带箭头的文字链接 | `href`；`tone`：`accent`、`muted`；`underline`；`external`。不传 `href` 时渲染为 `<span>`，用在可点击的卡片内部 |
| `Tag` | 金底切角标签，例如「关于 / About」 | `size`：`sm`、`md`、`lg`；`dot`：文字前加小方块（首屏使用） |
| `Badge` | 卡片图片上的小号直角标签 | `tone`：`solid`、`outline`、`muted` |
| `Chip` | 切角小标签、关键词、筛选按钮 | `href`：渲染为链接；`pressed`：渲染为切换按钮，脚本修改 `aria-pressed` 即可切换选中样式；`highlight`：金底突出 |
| `Section` | 页面区块：背景、上下留白、内容宽度 | `tone`：`base`、`alt`、`accent`；`space`：`lg`、`md`、`sm`、`none`；`width`：`wide`（1400px）、`narrow`（1100px）；`divider`：顶部分隔线 |
| `SectionHeading` | 区块标题 | `title`；`tag`：上方的标签；`index`：左侧金色大号序号；`note`：右侧 Spectral 斜体注释；`align`：`start`、`center`；`level`：`2`、`3` |
| `Eyebrow` | 区块上方的一行金色小标题，例如「01 · 主推内容 Featured」 | `label`：Oswald 大写文字；`note`：后面的 Spectral 斜体注释 |
| `NumberedIntro` | 左侧大号序号加小方块、右侧放内容的介绍块 | `index`；默认插槽放标签、标题和正文 |
| `PageHero` | 内页首屏，两种主题下都为深色 | `image`；`tag`；`title`；`subtitle`；`lead`；`watermark`：右上角巨型英文字；`variant`：`banner` 横幅、`cover` 接近整屏的封面。插槽：默认插槽在导语下方，按钮放在其中的 `ButtonGroup` 里；`before-title` 在标签和标题之间，`background` 替换背景图 |
| `Watermark` | 背景上的巨型英文字 | `text`；`position`：`top-right`、`bottom-left`。父元素需要 `position: relative` 和 `overflow: hidden` |
| `CtaBand` | 页面末尾的行动号召横条 | `title`；`kicker`：Spectral 斜体引语；`tag`；`tone`；`space`：上下留白，`md`（默认）、`sm`。默认插槽放按钮 |
| `StatBand` | 金底统计带 | `items`：`{ value, label }[]`，`label` 中的 `\n` 会换行 |
| `Card` | 卡片，传 `href` 时整张可点击 | `shape`：`corner` 切右上角（带图卡片）、`notch` 切两角（纯文字卡片）；`badge`：图片左上角的标签；`external`。`media` 插槽放 16:9 图片。可点击的卡片内部不能再放链接 |
| `Notice` | 淡金底提示条 | 默认插槽放提示文字 |
| `Callout` | 虚线框说明块，用于空状态和「持续补充中，欢迎投稿」一类的邀请 | `kicker`：Spectral 斜体引语；`align`：`split` 文字在左、按钮在右，`center` 居中、按钮在文字下方。默认插槽放说明文字，`action` 插槽放按钮 |
| `Filter` | 筛选控件：一组筛选按钮、可选的搜索框和结果数，没有结果时显示空状态。条目的写法见下文 | `target`：条目所在元素的 id；`options`：`{ value, label }[]`，最前面自动加上「全部」；`label`：按钮组给读屏软件的说明；`search`：搜索框的占位文字，不传时没有搜索框；`count`：结果数的文字，其中的 `{n}` 替换为数字；`param`：网址查询参数名，传入后选中项会写进网址，例如 `?category=track`，也可以用这样的网址直接打开筛选后的页面；`empty`：空状态的说明文字 |
| `Lightbox` | 图片灯箱：整屏查看大图，同组图片可以用方向键、按钮或左右滑动切换，按 Esc 或点击图片外的区域关闭。用法见下文 | 没有参数，每个页面放一个 |
| `EmailLink` | 反馈邮箱链接，静态 HTML 中不出现完整地址 | 不传内容时显示邮箱地址；传入内容时，其中带 `data-email-text` 属性的元素会被填入地址 |

### 筛选的条目

`Filter` 只输出控件，条目由页面自己输出，放在 id 为 `target` 的元素里，所以控件和条目可以分处页面的不同位置。条目和分组用以下属性声明：

- `data-filter-value`：条目对应的选项值。一个条目对应多个选项时，用空格分隔，因此选项值中不能有空格。
- `data-filter-text`：搜索时匹配的文字，可以包括页面上没有显示的内容，例如另一种语言的标题。不写时匹配条目中的全部文字。搜索不区分大小写，输入多个关键词时，条目需要包含全部关键词。
- `data-filter-group`：一组条目的容器，例如带标题的一个分组。组内的条目全部被筛掉时，整组隐藏。

```astro
<Filter target="videos" options={categories} search="搜索教程…" count="{n} 个视频" param="category" />
<div id="videos">
  <section data-filter-group>
    <h2>教程</h2>
    <ul>
      <li data-filter-value="track" data-filter-text="履带教程 Track tutorial">…</li>
    </ul>
  </section>
</div>
```

条目被隐藏时设置的是 `hidden` 属性，组件会让它优先于条目自身样式中的 `display`。条目需要滚动入场动画时，把 `data-reveal` 写在条目本身上：筛选后重新出现的条目会直接淡入，不再等待滚动。英文的 `count` 不会随数字变换单复数，宜写成「Results: {n}」这样不受单复数影响的形式。

### 灯箱的触发元素

页面中放一个 `Lightbox`，可以点开的图片写成指向大图的链接，`data-lightbox` 的值是分组名。链接里放缩略图，缩略图必须带 `width` 和 `height`，灯箱据此在大图加载之前确定显示尺寸，并先用已经加载的缩略图占位。缩略图带 `referrerpolicy` 时，大图沿用同样的设置。

```astro
<Lightbox />
<a href={resizeImage(image, 1920)} data-lightbox="screenshots" data-lightbox-title="标题" data-lightbox-note="作者">
  <img src={resizeImage(image, 640)} width="1920" height="1080" alt="标题" loading="lazy" decoding="async" />
</a>
```

- `data-lightbox-title`、`data-lightbox-note`：显示在大图下方的标题和补充说明（例如作者），都可以省略。
- 在灯箱中切换的范围是同一分组里当前可见的链接，按文档顺序排列，被筛选隐藏的图片不参与切换。
- 脚本不可用时，点击链接直接打开大图。

布局组件在 `src/components/layout/`，由 `BaseLayout` 使用，页面不需要直接引用：`Nav`（顶栏和菜单面板）、`Footer`、`ThemeToggle`、`LangSwitch`。

## 领域组件

只服务于某一类页面的区块放在对应领域的目录中。首页的各个区块按内容归入相应的领域，文件名以 `Home` 开头。

| 目录 | 对应页面 | 说明 |
|---|---|---|
| `home/` | 首页 | 首屏 `HomeHero` 和反馈区块 `HomeFeedback`，全站的「反馈」链接都指向后者 |
| `about/` | 关于传奇建造队、废品机械师 | 成员墙、游戏模式、发展历程、运行配置和购买入口的票券 |
| `mod/` | 模组、获取、动态 | 模组介绍的各个区块、截图轮播、更新日志时间线 `Changelog`。相关物品卡片 `RelatedMods` 同时用在获取页 |
| `works/` | 画廊、创意工坊 | 画廊图片 `GalleryTile`、作者章节和作品横条。`filter-limit.ts` 让筛选结果只显示前若干条，画廊的「显示更多」和创意工坊的作品横条都使用它 |
| `learn/` | 精选教程、教程库、常见问题 | 视频卡片、常见问题的手风琴列表 `FaqList`。`library.ts` 生成教程库筛选到某个分类的网址，其他页面链接到教程库的分类时使用 |

## 图标

图标使用 [Remix Icon](https://remixicon.com)，通过 `Icon` 组件输出。组件在构建时从 `remixicon` 包里查出图标对应的字符，图标名写错时构建会报错。页面只加载图标字体文件，不加载 Remix Icon 自带的样式表，所以不要写 `<i class="ri-xxx">`。

## 图片

站点自己的图片放在 `src/assets/images/`，用 `astro:assets` 的 `Image` 组件或 `getImage` 输出，构建时会转换成 WebP 并按需要的宽度生成多个尺寸。首屏图片加 `loading="eager"` 和 `fetchpriority="high"`。

| 文件 | 内容 | 用途 |
|---|---|---|
| `logo.png` | 横排 Logo | 导航、页脚、团队页首屏的背景 |
| `logo-stacked.png` | 两行排版的 Logo | 网站图标、首页结构化数据中的 Logo |
| `scene-creative.png` | 创造模式宣传图 | 首页、废品机械师页、精选教程的首屏，游戏模式卡片 |
| `scene-challenge.png` | 挑战模式宣传图 | 常见问题、动态、404 的首屏，游戏模式卡片 |
| `scene-survival.png` | 生存模式宣传图 | 教程库的首屏，首页的废品机械师区块，游戏模式卡片 |
| `mod-cover.jpg` | 传奇模组封面 | 模组页首屏、首页模组区块、获取页的主推卡片、创意工坊页的官方章节、默认分享图 |
| `scrap-mechanic-logo.png` | 《废品机械师》游戏 Logo | 废品机械师页首屏标题上方 |
| `legend-survival-cover.jpg` | 传奇生存自定义游戏封面 | 获取页首屏 |
| `steam-store-bg.jpg` | Steam 商店页背景 | 画廊、创意工坊的首屏 |

来自 Steam 等外部网站的内容图片（画廊、创意工坊作品等）由数据文件记录地址，处理方式见 `src/data/README.md`。

## 数据

内容数据放在 `src/data/`：`<名称>.json` 存放数据，同名的 `<名称>.ts` 声明类型并导出读取函数。页面和组件只通过 `.ts` 模块读取数据，不直接引用 JSON 文件。

更新数据时，按 [src/data/README.md](src/data/README.md) 中各数据文件的说明从 Steam 等来源取得最新内容，修改 JSON，运行 `npm run check` 和 `npm run build` 确认没有错误后推送到 `main` 分支，网站随后自动发布。模组版本号、订阅数等数字在构建时从数据中读出，页面、站点地图和 `llms.txt` 不需要另外修改。

站点级的固定信息（外部链接、QQ 群、反馈邮箱）不属于内容数据，放在 `src/config/site.ts`。

## 搜索引擎优化

- 每个页面通过 `BaseLayout` 的 `title` 和 `description` 设置标题和描述，两种语言分别撰写，页面之间不重复。`<head>` 中自动输出 canonical、两种语言的互链（包括 `x-default`）和 Open Graph 信息。
- 404 页和 `contact.html` 跳转页带有 `noindex`，不被收录，也不列入站点地图。
- `/sitemap.xml` 由 `src/pages/sitemap.xml.ts` 在构建时生成，列出 `pages` 中登记的全部页面及其语言互链，`public/robots.txt` 指向它。Google Search Console 中登记的也是这个地址。
- `/llms.txt` 由 `src/pages/llms.txt.ts` 在构建时生成，内容是团队、模组、社群和页面列表的简介。
- 首页输出描述团队和网站的结构化数据（`Organization` 和 `WebSite`），常见问题页输出 `FAQPage`。

## 验证

- `npm run check` 没有错误，`npm run build` 没有警告。
- 在开发服务器中检查新增或修改的页面，至少覆盖以下组合：桌面宽度（1440px）和手机宽度（390px），深色和浅色主题（导航中的切换按钮），中文和英文（导航中的语言切换）。
- 对照 DESIGN.md 检查字号、间距、切角、颜色和动效。
