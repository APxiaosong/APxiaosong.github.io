# 传奇建造队官网

> 《废品机械师》玩家社区官网，纯静态，部署于 GitHub Pages

## 设计定位

- **风格**: 专业企业官网感，黑金配色，直角/锐利风格
- **配色**: `#2C2C27`(背景) `#FF9300`(强调) `#FFFFFF`/`#D7D7D7`(文字)
- **原则**: 不使用emoji，图标用 Remix Icon，移动端适配，中英双语

## 目录结构

```
├── index.html              # 首页
├── about-game.html         # 游戏介绍
├── about-team.html         # 团队介绍
├── mod.html                # Mod详情
├── download.html           # 下载中心
├── community.html          # 动态
├── gallery.html            # 画廊
├── faq.html                # 常见问题
├── tutorials.html          # 教程精选
├── tutorial-library.html   # 教程库
├── contact.html            # 反馈
├── css/style.css           # 样式
└── js/
    ├── main.js             # 主逻辑
    ├── i18n.js             # 国际化
    ├── components.js       # 公共组件
    ├── tutorial-data.js    # 教程数据管理器
    ├── faq-data.js         # FAQ数据
    ├── gallery-data.js     # 画廊数据管理器
    ├── workshop-data.js    # 创意工坊数据管理器
    ├── gallery/            # 艺术作品数据（按作者）
    │   ├── gallery-qingguangying.js
    │   ├── gallery-dianyuzhangzane.js
    │   ├── gallery-apxiaosong.js
    │   ├── gallery-baiyuanhuchui.js
    │   └── gallery-mingmei8.js
    ├── workshop/           # 创意工坊数据（按作者）
    │   ├── workshop-dianyuzhangzane.js
    │   ├── workshop-baiyuanhuchui.js
    │   ├── workshop-gangbi.js
    │   ├── workshop-neza-nezha.js
    │   └── workshop-miaozi.js
    ├── tutorial/           # 教程数据（按UP主）
    │   ├── tutorial-davidsirius.js
    │   └── tutorial-jingwuwei.js
    └── lang/zh-CN.js|en.js # 语言包
```

## 核心模块

### 组件系统 (`js/components.js`)

```html
<script src="js/components.js"></script>
<script>Components.init({ activePage: 'faq' });</script>
```

参数: `activePage`(高亮导航) | `isHome`(首页透明导航) | `footerOnly`(仅页脚)

### 国际化 (`js/i18n.js`)

```html
<span data-i18n="nav.home">首页</span>
<input data-i18n-placeholder="search.placeholder">
```

添加翻译: 在 `zh-CN.js` 和 `en.js` 中添加相同键值对

### 数据文件

| 文件 | 结构 |
|------|------|
| `gallery/gallery-*.js` | `GalleryData.register('id', { name, works: [{ title, image }] })` |
| `workshop/workshop-*.js` | `WorkshopData.register('id', { name, works: [{ title, description, image, link }] })` |
| `tutorial/tutorial-*.js` | `TutorialData.register('id', { name, videos: [{ 标题, 链接, 封面, 简介 }] })` |
| `faq-data.js` | `{ id, question, questionEn, answer, answerEn }` |

## 新增页面

1. 复制现有页面，更新 `<title>` 和 `<meta>`
2. 添加脚本初始化:
   ```html
   <script src="js/components.js"></script>
   <script>Components.init({ activePage: 'xxx' });</script>
   <script src="js/i18n.js"></script>
   <script src="js/lang/zh-CN.js"></script>
   <script src="js/lang/en.js"></script>
   <script src="js/main.js"></script>
   ```
3. 添加国际化文本到语言包

## 数据抓取脚本

位于 `scripts/` 目录：

| 脚本 | 用途 |
|------|------|
| `steam_screenshots_to_gallery.py` | 抓取 Steam 截图/艺术作品，生成 gallery-*.js |
| `steam_workshop_to_gallery.py` | 抓取 Steam 创意工坊作品，生成 workshop-*.js |
| `bilibili_to_tutorial_data.py` | 抓取 B站视频列表，生成 tutorial-*.js |

脚本在 Blender 4.5+ 中运行（利用 bpy 模块的网络功能）

---
*更新: 2025-12-01*
