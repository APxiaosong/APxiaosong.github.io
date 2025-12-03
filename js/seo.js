const SEO = {
    baseUrl: 'https://www.legendbuild.cn',
    siteName: '传奇建造队 | Legend Team',
    defaultImage: 'https://images.steamusercontent.com/ugc/15611781624322465302/325176B2667614E7097C32B0C86DD6516C042BC1/',

    pages: {
        'index': {
            zh: { title: '传奇建造队 | Legend Team', desc: '传奇建造队 - 废品机械师游戏中最具影响力的中国玩家团队，提供Steam创意工坊排名第一的传奇Mod' },
            en: { title: 'Legend Team | Scrap Mechanic Mod', desc: 'Legend Team - The most influential Chinese player community for Scrap Mechanic, providing the #1 ranked Legend Mod on Steam Workshop' }
        },
        'mod': {
            zh: { title: '传奇Mod | 传奇建造队', desc: '传奇Mod - Steam创意工坊综合排行榜第一的废品机械师模组，包含材质方块、几何体、武器、载具零件等丰富内容' },
            en: { title: 'Legend Mod | Legend Team', desc: 'Legend Mod - #1 ranked Scrap Mechanic mod on Steam Workshop, featuring material blocks, geometric shapes, weapons, vehicle parts and more' }
        },
        'about-team': {
            zh: { title: '传奇建造队 | Legend Team', desc: '传奇建造队 - 2016年成立的废品机械师中国玩家社区，拥有3000+成员' },
            en: { title: 'About Legend Team', desc: 'Legend Team - Chinese Scrap Mechanic player community founded in 2016 with 3000+ members' }
        },
        'about-game': {
            zh: { title: '废品机械师 | 传奇建造队', desc: '废品机械师 - 物理沙盒建造生存游戏，发挥创意建造各种机械装置' },
            en: { title: 'Scrap Mechanic | Legend Team', desc: 'Scrap Mechanic - A physics sandbox building survival game where creativity builds machines' }
        },
        'get': {
            zh: { title: '获取 | 传奇建造队', desc: '传奇Mod下载中心 - Steam创意工坊订阅与实用工具' },
            en: { title: 'Download | Legend Team', desc: 'Legend Mod Download Center - Steam Workshop subscription and useful tools' }
        },
        'community': {
            zh: { title: '社区 | 传奇建造队', desc: '加入传奇建造队社区 - 与志同道合的废品机械师玩家交流创意' },
            en: { title: 'Community | Legend Team', desc: 'Join Legend Team community - Connect with fellow Scrap Mechanic players' }
        },
        'gallery': {
            zh: { title: '画廊 | 传奇建造队', desc: '传奇建造队画廊 - 废品机械师玩家作品展示' },
            en: { title: 'Gallery | Legend Team', desc: 'Legend Team Gallery - Scrap Mechanic player creations showcase' }
        },
        'workshop': {
            zh: { title: '创意工坊 | 传奇建造队', desc: '传奇建造队创意工坊 - 社区玩家精选蓝图作品' },
            en: { title: 'Workshop | Legend Team', desc: 'Legend Team Workshop - Community player blueprint creations' }
        },
        'tutorials': {
            zh: { title: '教程 | 传奇建造队', desc: '传奇建造队教程与资讯 - 掌握核心技巧，释放创造潜能' },
            en: { title: 'Tutorials | Legend Team', desc: 'Legend Team tutorials - Master core skills and unleash your creativity' }
        },
        'tutorial-library': {
            zh: { title: '教程库 | 传奇建造队', desc: '废品机械师教程库 - 新手入门到高级建造技巧视频合集' },
            en: { title: 'Tutorial Library | Legend Team', desc: 'Scrap Mechanic tutorial library - From beginner to advanced building techniques' }
        },
        'faq': {
            zh: { title: '常见问题 | 传奇建造队', desc: '传奇Mod常见问题解答 - 安装、使用、故障排除指南' },
            en: { title: 'FAQ | Legend Team', desc: 'Legend Mod FAQ - Installation, usage, and troubleshooting guide' }
        },
        'contact': {
            zh: { title: '反馈 | 传奇建造队', desc: '联系传奇建造队 - 您的反馈是我们前进的动力' },
            en: { title: 'Feedback | Legend Team', desc: 'Contact Legend Team - Your feedback drives us forward' }
        }
    },

    init(pageId) {
        const lang = (localStorage.getItem('lang') || 'zh-CN').startsWith('en') ? 'en' : 'zh';
        const data = this.pages[pageId]?.[lang] || this.pages['index'][lang];
        const path = window.location.pathname === '/' ? '/' : window.location.pathname;
        const url = this.baseUrl + path.replace('/index.html', '/');

        // Canonical
        this._addLink('canonical', url);

        // Hreflang
        this._addLink('alternate', url, 'zh-CN');
        this._addLink('alternate', url, 'en');
        this._addLink('alternate', url, 'x-default');

        // Open Graph
        this._addMeta('og:type', 'website', true);
        this._addMeta('og:site_name', this.siteName, true);
        this._addMeta('og:title', data.title, true);
        this._addMeta('og:description', data.desc, true);
        this._addMeta('og:url', url, true);
        this._addMeta('og:image', this.defaultImage, true);
        this._addMeta('og:locale', lang === 'zh' ? 'zh_CN' : 'en_US', true);

        // Twitter Card
        this._addMeta('twitter:card', 'summary_large_image');
        this._addMeta('twitter:title', data.title);
        this._addMeta('twitter:description', data.desc);
        this._addMeta('twitter:image', this.defaultImage);

        // JSON-LD
        this._addJsonLd();
    },

    _addMeta(name, content, isProperty) {
        const meta = document.createElement('meta');
        meta[isProperty ? 'setAttribute' : 'name'] && (isProperty ? meta.setAttribute('property', name) : meta.name = name);
        if (isProperty) meta.setAttribute('property', name);
        else meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
    },

    _addLink(rel, href, hreflang) {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        if (hreflang) link.hreflang = hreflang;
        document.head.appendChild(link);
    },

    _addJsonLd() {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Organization",
                    "@id": this.baseUrl + "/#organization",
                    "name": "传奇建造队",
                    "alternateName": "Legend Team",
                    "url": this.baseUrl,
                    "logo": "https://s2.loli.net/2025/06/12/qCLiGk4BdamZvXW.png",
                    "email": "smlegendmod@163.com",
                    "foundingDate": "2016-04-02"
                },
                {
                    "@type": "WebSite",
                    "@id": this.baseUrl + "/#website",
                    "url": this.baseUrl,
                    "name": "传奇建造队",
                    "alternateName": "Legend Team",
                    "publisher": { "@id": this.baseUrl + "/#organization" },
                    "inLanguage": ["zh-CN", "en"]
                }
            ]
        });
        document.head.appendChild(script);
    }
};
