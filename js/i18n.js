// i18n 核心模块
const I18n = {
    currentLang: 'zh-CN',
    translations: {},
    callbacks: [],

    init() {
        // 从 localStorage 读取语言偏好，默认中文
        this.currentLang = localStorage.getItem('lang') || 'zh-CN';
        document.documentElement.lang = this.currentLang === 'zh-CN' ? 'zh-CN' : 'en';
        this.updateToggleBtn();
    },

    setLang(lang) {
        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang === 'zh-CN' ? 'zh-CN' : 'en';
        this.applyTranslations();
        this.updateToggleBtn();
    },

    toggle() {
        this.setLang(this.currentLang === 'zh-CN' ? 'en' : 'zh-CN');
    },

    updateToggleBtn() {
        const btn = document.getElementById('langToggle');
        if (btn) {
            btn.textContent = this.currentLang === 'zh-CN' ? 'EN' : '中';
            btn.setAttribute('aria-label', this.currentLang === 'zh-CN' ? 'Switch to English' : '切换到中文');
        }
    },

    t(key) {
        const lang = this.translations[this.currentLang];
        if (!lang) return key;
        return key.split('.').reduce((o, k) => o?.[k], lang) || key;
    },

    applyTranslations() {
        requestAnimationFrame(() => {
            // 文本内容
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const text = this.t(key);
                if (text !== key) el.textContent = text;
            });

            // placeholder
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                const text = this.t(key);
                if (text !== key) el.placeholder = text;
            });

            // aria-label
            document.querySelectorAll('[data-i18n-aria]').forEach(el => {
                const key = el.getAttribute('data-i18n-aria');
                const text = this.t(key);
                if (text !== key) el.setAttribute('aria-label', text);
            });

            // title 属性
            document.querySelectorAll('[data-i18n-title]').forEach(el => {
                const key = el.getAttribute('data-i18n-title');
                const text = this.t(key);
                if (text !== key) el.title = text;
            });

            // 执行回调
            this.callbacks.forEach(cb => cb());
        });
    },

    onLangChange(cb) {
        this.callbacks.push(cb);
    },

    register(lang, data) {
        this.translations[lang] = data;
    }
};

// 主题切换（占位符）
const Theme = {
    current: 'dark',

    init() {
        this.current = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', this.current);
        this.updateToggleBtn();
    },

    toggle() {
        this.current = this.current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.current);
        document.documentElement.setAttribute('data-theme', this.current);
        this.updateToggleBtn();
    },

    updateToggleBtn() {
        const btn = document.getElementById('themeToggle');
        if (btn) {
            // 深色模式显示太阳图标（点击切换到浅色），浅色模式显示月亮图标
            btn.innerHTML = this.current === 'dark'
                ? '<i class="ri-sun-line"></i>'
                : '<i class="ri-moon-line"></i>';
            const label = this.current === 'dark' ? 'common.switchToLight' : 'common.switchToDark';
            btn.setAttribute('aria-label', I18n.t(label));
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    I18n.init();
    Theme.init();

    // 绑定切换按钮事件
    document.getElementById('langToggle')?.addEventListener('click', () => I18n.toggle());
    document.getElementById('themeToggle')?.addEventListener('click', () => Theme.toggle());

    // 初始应用翻译
    I18n.applyTranslations();
});
