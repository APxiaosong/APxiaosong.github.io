// 页面组件加载器

const Components = {
    // 导航栏HTML（首页版本，透明背景）
    getNavbar(options = {}) {
        const isHome = options.isHome || false;
        const activePage = options.activePage || '';
        const navClass = isHome ? 'navbar' : 'navbar scrolled';
        const logoHref = isHome ? '#home' : 'index.html';

        const getActiveClass = (page) => activePage === page ? ' active' : '';
        const getParentActive = (pages) => pages.includes(activePage) ? ' active' : '';

        return `
    <nav class="${navClass}" id="navbar">
        <div class="nav-container">
            <a href="${logoHref}" class="nav-logo">
                <img src="https://s2.loli.net/2025/06/12/qCLiGk4BdamZvXW.png" alt="传奇建造队">
            </a>
            <button class="nav-toggle" id="navToggle" aria-label="菜单">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav-menu" id="navMenu">
                <li><a href="index.html" class="nav-link${getActiveClass('home')}" data-i18n="nav.home">首页</a></li>
                <li class="nav-item has-dropdown">
                    <a href="#" class="nav-link${getParentActive(['about-game', 'about-team'])}" data-i18n="nav.about">关于</a>
                    <div class="dropdown-menu">
                        <a href="about-game.html" data-i18n="nav.aboutGame">废品机械师</a>
                        <a href="about-team.html" data-i18n="nav.aboutTeam">传奇建造队</a>
                    </div>
                </li>
                <li class="nav-item has-dropdown">
                    <a href="#" class="nav-link${getParentActive(['mod', 'get'])}" data-i18n="nav.mod">模组</a>
                    <div class="dropdown-menu">
                        <a href="mod.html" data-i18n="nav.modIntro">模组</a>
                        <a href="get.html" data-i18n="nav.download">下载</a>
                    </div>
                </li>
                <li class="nav-item has-dropdown">
                    <a href="#" class="nav-link${getParentActive(['community', 'gallery', 'workshop', 'faq'])}" data-i18n="nav.community">社区</a>
                    <div class="dropdown-menu">
                        <a href="community.html" data-i18n="nav.updates">动态</a>
                        <a href="gallery.html" data-i18n="nav.gallery">画廊</a>
                        <a href="workshop.html" data-i18n="nav.workshop">创意工坊</a>
                        <a href="faq.html" data-i18n="nav.faq">常见问题</a>
                    </div>
                </li>
                <li class="nav-item has-dropdown">
                    <a href="#" class="nav-link${getParentActive(['tutorials', 'tutorial-library'])}" data-i18n="nav.tutorials">教程</a>
                    <div class="dropdown-menu">
                        <a href="tutorials.html" data-i18n="nav.tutorials">教程</a>
                        <a href="tutorial-library.html" data-i18n="nav.tutorialLib">教程库</a>
                    </div>
                </li>
                <li><a href="contact.html" class="nav-link${getActiveClass('contact')}" data-i18n="nav.feedback">反馈</a></li>
            </ul>
            <div class="nav-actions">
                <button class="nav-action-btn" id="langToggle" aria-label="切换语言">EN</button>
                <button class="nav-action-btn" id="themeToggle" aria-label="切换主题">
                    <i class="ri-sun-line"></i>
                </button>
            </div>
        </div>
    </nav>`;
    },

    // 页脚HTML
    getFooter() {
        return `
    <footer class="footer">
        <div class="footer-container">
            <div class="footer-main">
                <div class="footer-brand">
                    <img src="https://s2.loli.net/2025/06/12/qCLiGk4BdamZvXW.png" alt="传奇建造队" class="footer-logo">
                    <p class="footer-tagline" data-i18n="footer.tagline">重塑创造边界</p>
                </div>
                <div class="footer-links">
                    <div class="footer-col">
                        <h4 data-i18n="footer.about">关于</h4>
                        <a href="about-game.html" data-i18n="nav.aboutGame">废品机械师</a>
                        <a href="about-team.html" data-i18n="nav.aboutTeam">传奇建造队</a>
                    </div>
                    <div class="footer-col">
                        <h4 data-i18n="footer.mod">模组</h4>
                        <a href="mod.html" data-i18n="footer.modIntro">模组介绍</a>
                        <a href="get.html" data-i18n="nav.download">下载</a>
                    </div>
                    <div class="footer-col">
                        <h4 data-i18n="footer.community">社区</h4>
                        <a href="community.html" data-i18n="nav.updates">动态</a>
                        <a href="gallery.html" data-i18n="nav.gallery">画廊</a>
                        <a href="workshop.html" data-i18n="nav.workshop">创意工坊</a>
                        <a href="faq.html" data-i18n="nav.faq">常见问题</a>
                        <a href="tutorials.html" data-i18n="nav.tutorials">教程</a>
                        <a href="tutorial-library.html" data-i18n="nav.tutorialLib">教程库</a>
                    </div>
                    <div class="footer-col">
                        <h4 data-i18n="footer.resources">资源</h4>
                        <a href="https://store.steampowered.com/app/387990/Scrap_Mechanic/" target="_blank" rel="noopener" data-i18n="footer.steamStore">Steam 商店</a>
                        <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3309460746" target="_blank" rel="noopener" data-i18n="footer.workshop">创意工坊</a>
                        <a href="https://steamcommunity.com/groups/ltsandbox" target="_blank" rel="noopener" data-i18n="footer.steamGroup">社区组</a>
                        <a href="contact.html" data-i18n="nav.feedback">反馈</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p data-i18n="footer.copyright">&copy; 2025 传奇建造队 Legend Team. All rights reserved.</p>
                <p class="footer-credits" data-i18n="footer.credits">鸣谢：典狱长ZANE、APxiaosong</p>
                <p class="footer-disclaimer" data-i18n="footer.disclaimer">本站为玩家社区，与 Axolot Games 无关。"Scrap Mechanic"及相关素材为 Axolot Games 所有。用户作品版权归原作者所有，部分图片引用自 Steam 及哔哩哔哩。</p>
            </div>
        </div>
    </footer>`;
    },

    // 返回顶部按钮
    getBackToTop() {
        return `
    <button class="back-to-top" data-i18n-aria="common.backToTop" aria-label="返回顶部">
        <i class="ri-arrow-up-s-line"></i>
    </button>`;
    },

    // 页面加载器
    getLoader() {
        return `
    <div class="page-loader">
        <div class="loader-logo-wrapper">
            <img src="https://s2.loli.net/2025/12/02/Je7Cx96BAoYqKfu.png" alt="Loading" class="loader-logo">
        </div>
        <span class="loader-text" data-i18n="common.loading">正在加载中……</span>
    </div>`;
    },

    // 隐藏页面加载器
    hideLoader() {
        const pageLoader = document.querySelector('.page-loader');
        if (!pageLoader || pageLoader.dataset.handled) return;
        pageLoader.dataset.handled = 'true';

        const logo = document.querySelector('.nav-logo img');
        const loaderLogo = document.querySelector('.loader-logo');

        // 等 DOM + Logo 加载完就隐藏 loader
        Promise.all([
            new Promise(r => document.readyState === 'loading'
                ? document.addEventListener('DOMContentLoaded', r)
                : r()),
            new Promise(r => !logo || logo.complete ? r() : logo.addEventListener('load', r)),
            new Promise(r => !loaderLogo || loaderLogo.complete ? r() : loaderLogo.addEventListener('load', r))
        ]).then(() => {
            pageLoader.classList.add('hidden');
        });
    },

    // 初始化页面组件
    init(options = {}) {
        const footerOnly = options.footerOnly || false;
        const firstScript = document.body.querySelector('script');

        // 注入 favicon
        if (!document.querySelector('link[rel="icon"]')) {
            const favicon = document.createElement('link');
            favicon.rel = 'icon';
            favicon.type = 'image/png';
            favicon.href = 'https://s2.loli.net/2025/12/03/xeUrThPmK35WBjG.png';
            document.head.appendChild(favicon);
        }

        if (!footerOnly) {
            // 插入加载器
            document.body.insertAdjacentHTML('afterbegin', this.getLoader());
            // 插入导航栏（在加载器后面）
            const loader = document.querySelector('.page-loader');
            loader.insertAdjacentHTML('afterend', this.getNavbar(options));
            // 立即启动 loader 隐藏逻辑（不等后面的数据 JS）
            this.hideLoader();
        }

        // 插入页脚和返回顶部按钮（在脚本标签前面）
        firstScript.insertAdjacentHTML('beforebegin', this.getFooter());
        firstScript.insertAdjacentHTML('beforebegin', this.getBackToTop());
    }
};
