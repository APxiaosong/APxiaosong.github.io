// ========================================
// 防止重复跳转到当前页面
// ========================================
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const targetPage = href.split('#')[0];
    if (targetPage === currentPage) {
        e.preventDefault();
    }
});

// ========================================
// Navigation
// ========================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Scroll effect for navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Mobile dropdown toggle
const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
dropdownItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            e.stopPropagation();
            item.classList.toggle('active');
            dropdownItems.forEach(other => {
                if (other !== item) other.classList.remove('active');
            });
        }
    });
});

// Close mobile menu on link click (except dropdown toggles)
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // 如果是下拉菜单的触发链接，不关闭菜单
        if (link.closest('.nav-item.has-dropdown') && link.parentElement.classList.contains('has-dropdown')) {
            return;
        }
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// 点击其他地方关闭移动端菜单
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && navMenu.classList.contains('active')) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            dropdownItems.forEach(item => item.classList.remove('active'));
        }
    }
});


// ========================================
// Active nav link based on current page
// ========================================
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
    }
});

// ========================================
// Smooth scroll for anchor links (index page only)
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ========================================
// Toast notification
// ========================================
function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// ========================================
// Copy QQ group number
// ========================================
document.querySelectorAll('.qq-card').forEach(card => {
    card.addEventListener('click', function() {
        const qq = this.dataset.qq;
        if (qq) {
            navigator.clipboard.writeText(qq).then(() => {
                showToast(I18n.t('common.qqCopied'));
            });
        }
    });
});

// ========================================
// Image Gallery / Carousel
// ========================================
class Gallery {
    constructor(element) {
        this.gallery = element;
        this.track = element.querySelector('.gallery-track');
        this.slides = element.querySelectorAll('.gallery-slide');
        this.dots = element.parentElement.querySelectorAll('.gallery-dot');
        this.prevBtn = element.querySelector('.gallery-prev');
        this.nextBtn = element.querySelector('.gallery-next');

        this.currentIndex = 0;
        this.slideCount = this.slides.length;
        this.autoPlayInterval = 5000;
        this.autoPlayTimer = null;

        // Touch support
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        this.bindEvents();
        this.startAutoPlay();
        this.updateSlides();
    }

    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goTo(index));
        });

        // Pause on hover
        this.gallery.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.gallery.addEventListener('mouseleave', () => this.startAutoPlay());

        // Touch events
        this.track.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.stopAutoPlay();
        }, { passive: true });

        this.track.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
            this.startAutoPlay();
        }, { passive: true });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isInViewport()) return;
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
    }

    isInViewport() {
        const rect = this.gallery.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    handleSwipe() {
        const diff = this.touchStartX - this.touchEndX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }

    goTo(index) {
        if (index === this.currentIndex) return;

        this.currentIndex = index;
        if (this.currentIndex >= this.slideCount) this.currentIndex = 0;
        if (this.currentIndex < 0) this.currentIndex = this.slideCount - 1;

        this.updateSlides();
    }

    next() {
        this.goTo(this.currentIndex + 1);
    }

    prev() {
        this.goTo(this.currentIndex - 1);
    }

    updateSlides() {
        // Update track position
        const offset = this.currentIndex * 100;
        this.track.style.transform = `translateX(-${offset}%)`;

        // Update active states
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentIndex);
        });

        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayTimer = setInterval(() => this.next(), this.autoPlayInterval);
    }

    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
}

// Initialize gallery if exists
const galleryElement = document.getElementById('modGallery');
if (galleryElement) {
    new Gallery(galleryElement);
}

// ========================================
// Page Loader (首页专用，其他页面由 components.js 处理)
// ========================================
const pageLoader = document.querySelector('.page-loader');
if (pageLoader && !pageLoader.dataset.handled) {
    pageLoader.dataset.handled = 'true';
    const logo = document.querySelector('.nav-logo img');
    const loaderLogo = document.querySelector('.loader-logo');

    Promise.all([
        new Promise(r => document.readyState === 'loading'
            ? document.addEventListener('DOMContentLoaded', r)
            : r()),
        new Promise(r => !logo || logo.complete ? r() : logo.addEventListener('load', r)),
        new Promise(r => !loaderLogo || loaderLogo.complete ? r() : loaderLogo.addEventListener('load', r))
    ]).then(() => {
        pageLoader.classList.add('hidden');
    });
}

// ========================================
// Back to Top Button
// ========================================
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ========================================
// Scroll Animations (Intersection Observer)
// ========================================
const animateElements = document.querySelectorAll('.animate-on-scroll');
if (animateElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animateElements.forEach(el => observer.observe(el));
}

// ========================================
// Tutorial Library - Video Grid
// ========================================
const TutorialLibrary = {
    data: [],
    filtered: [],
    page: 1,
    perPage: 12,
    keyword: '',

    // B站图标 SVG
    bilibiliSVG: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.659.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906L17.813 4.653zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773H5.333zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/></svg>`,

    selectedCreators: [],
    selectedTags: [],

    init() {
        const videoGrid = document.getElementById('videoGrid');
        if (!videoGrid) return;

        // 使用 TutorialData 管理器或旧的 TUTORIAL_VIDEOS 变量
        if (typeof TutorialData !== 'undefined' && TutorialData.getAllVideos) {
            this.data = TutorialData.getAllVideos();
            this.selectedCreators = [];
            this.selectedTags = [];
            this.initFilter();
            this.filtered = this.data;
            this.render();
            this.bindEvents();
        } else if (typeof TUTORIAL_VIDEOS !== 'undefined') {
            this.data = TUTORIAL_VIDEOS;
            this.filtered = this.data;
            this.render();
            this.bindEvents();
        } else {
            videoGrid.innerHTML = `<div class="no-results"><p>${I18n.t('common.loadFailed')}</p></div>`;
        }
    },

    initFilter() {
        const dropdown = document.getElementById('tutorialFilter');
        const creatorColumn = document.getElementById('tutorialCreatorColumn');
        const tagColumn = document.getElementById('tutorialTagColumn');
        if (!dropdown || !creatorColumn || !tagColumn) return;

        // 作者列表
        const creators = TutorialData.getAllCreators();
        const creatorItems = creators.map(c => `
            <div class="filter-item" data-id="${c.id}" data-type="creator">
                <div class="filter-checkbox"><i class="ri-check-line"></i></div>
                <span class="filter-label">${c.name}</span>
            </div>
        `).join('');
        creatorColumn.innerHTML = `<div class="filter-column-title" data-i18n="tutorialLibPage.filterCreator">${I18n.t('tutorialLibPage.filterCreator')}</div>` + creatorItems;

        // 标签列表
        const tagItems = TutorialData.tags.map(tag => `
            <div class="filter-item" data-id="${tag}" data-type="tag">
                <div class="filter-checkbox"><i class="ri-check-line"></i></div>
                <span class="filter-label">${I18n.t('tutorialLibPage.tags.' + tag)}</span>
            </div>
        `).join('');
        tagColumn.innerHTML = `<div class="filter-column-title" data-i18n="tutorialLibPage.filterTag">${I18n.t('tutorialLibPage.filterTag')}</div>` + tagItems;

        // 点击按钮切换下拉
        dropdown.querySelector('.filter-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        // 点击选项切换选中
        dropdown.querySelector('.filter-menu').addEventListener('click', (e) => {
            const item = e.target.closest('.filter-item');
            if (!item) return;
            e.stopPropagation();
            const id = item.dataset.id;
            const type = item.dataset.type;
            item.classList.toggle('checked');

            if (type === 'creator') {
                if (item.classList.contains('checked')) {
                    if (!this.selectedCreators.includes(id)) this.selectedCreators.push(id);
                } else {
                    this.selectedCreators = this.selectedCreators.filter(c => c !== id);
                }
            } else if (type === 'tag') {
                // 单选逻辑：先清除其他标签选中状态
                dropdown.querySelectorAll('.filter-item[data-type="tag"]').forEach(t => {
                    if (t !== item) t.classList.remove('checked');
                });
                this.selectedTags = item.classList.contains('checked') ? [id] : [];
            }
            this.applyFilter();
        });

        // 点击外部关闭
        document.addEventListener('click', () => dropdown.classList.remove('active'));
    },

    applyFilter() {
        const input = document.getElementById('tutorialSearch');
        this.keyword = input ? input.value.trim().toLowerCase() : '';

        let filtered = this.data;

        // UP主筛选
        if (this.selectedCreators.length > 0) {
            filtered = filtered.filter(v => this.selectedCreators.includes(v.creatorId));
        }

        // 标签筛选
        if (this.selectedTags.length > 0) {
            filtered = TutorialData.filterByTags(filtered, this.selectedTags);
        }

        // 关键词筛选
        if (this.keyword) {
            filtered = filtered.filter(v =>
                v['标题'].toLowerCase().includes(this.keyword) ||
                v['简介'].toLowerCase().includes(this.keyword)
            );
        }

        this.filtered = filtered;
        this.page = 1;
        this.render();
    },

    bindEvents() {
        const form = document.getElementById('searchForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.search();
            });
        }

        const searchInput = document.getElementById('tutorialSearch');
        const clearBtn = document.getElementById('tutorialSearchClear');
        if (searchInput && clearBtn) {
            const adjustWidth = () => {
                const temp = document.createElement('span');
                temp.style.cssText = 'visibility:hidden;position:absolute;white-space:pre;font:inherit;padding:0 60px 0 20px';
                temp.textContent = searchInput.value || searchInput.placeholder;
                document.body.appendChild(temp);
                const newWidth = Math.min(Math.max(temp.offsetWidth, 200), 350);
                temp.remove();
                searchInput.style.width = newWidth + 'px';
            };
            searchInput.addEventListener('input', () => {
                clearBtn.classList.toggle('visible', searchInput.value.length > 0);
                adjustWidth();
            });
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                clearBtn.classList.remove('visible');
                adjustWidth();
                this.applyFilter();
            });
        }

        // 分页按钮事件委托
        const pagination = document.getElementById('pagination');
        if (pagination) {
            pagination.addEventListener('click', (e) => {
                const btn = e.target.closest('.page-btn');
                if (!btn || btn.disabled) return;
                const page = btn.dataset.page;
                if (page === 'prev') this.goToPage(this.page - 1);
                else if (page === 'next') this.goToPage(this.page + 1);
                else this.goToPage(parseInt(page));
            });
        }
    },

    search() {
        this.applyFilter();
    },

    goToPage(n) {
        const totalPages = Math.ceil(this.filtered.length / this.perPage);
        if (n < 1 || n > totalPages) return;
        this.page = n;
        this.render();
        window.scrollTo({ top: 400, behavior: 'smooth' });
    },

    render() {
        const grid = document.getElementById('videoGrid');
        const pagination = document.getElementById('pagination');
        const resultsInfo = document.getElementById('resultsInfo');

        if (!grid) return;

        const total = this.filtered.length;
        const totalPages = Math.ceil(total / this.perPage) || 1;
        const start = (this.page - 1) * this.perPage;
        const end = start + this.perPage;
        const videos = this.filtered.slice(start, end);

        // 结果信息
        if (resultsInfo) {
            if (this.keyword) {
                resultsInfo.textContent = `找到 ${total} 个相关视频`;
            } else {
                resultsInfo.textContent = `共 ${total} 个视频`;
            }
        }

        // 无结果
        if (videos.length === 0) {
            grid.innerHTML = `<div class="no-results"><p>${I18n.t('common.noResults')}</p></div>`;
            if (pagination) pagination.style.display = 'none';
            return;
        }

        // 渲染卡片
        grid.innerHTML = videos.map(v => `
            <a href="${v['链接']}" target="_blank" rel="noopener" class="video-card">
                <div class="video-thumb">
                    <img src="${v['封面']}" alt="" referrerpolicy="no-referrer" loading="lazy">
                    <div class="bilibili-icon">${this.bilibiliSVG}</div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${this.escapeHtml(v['标题'])}</h3>
                    <p class="video-desc">${this.escapeHtml(v['简介'])}</p>
                    <div class="video-tooltip">${this.escapeHtml(v['简介'])}</div>
                </div>
            </a>
        `).join('');

        // 分页
        if (pagination) {
            pagination.style.display = totalPages > 1 ? 'flex' : 'none';
            pagination.innerHTML = this.renderPagination(totalPages);
        }
    },

    renderPagination(totalPages) {
        const cur = this.page;
        let html = '';

        // 上一页
        html += `<button class="page-btn" data-page="prev" ${cur <= 1 ? 'disabled' : ''}><i class="ri-arrow-left-s-line"></i></button>`;

        // 页码逻辑：1 2 3 … 12 或 1 … 5 6 7 … 12
        const pages = this.getPageNumbers(cur, totalPages);
        for (let i = 0; i < pages.length; i++) {
            const p = pages[i];
            if (p === '...') {
                html += '<span class="page-ellipsis">…</span>';
            } else {
                html += `<button class="page-btn ${p === cur ? 'active' : ''}" data-page="${p}">${p}</button>`;
            }
        }

        // 下一页
        html += `<button class="page-btn" data-page="next" ${cur >= totalPages ? 'disabled' : ''}><i class="ri-arrow-right-s-line"></i></button>`;

        return html;
    },

    getPageNumbers(cur, total) {
        // 总页数 <= 7，显示全部
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const pages = [];
        // 始终显示第1页
        pages.push(1);

        if (cur <= 3) {
            // 靠近开头：1 2 3 4 … 12
            pages.push(2, 3, 4, '...', total);
        } else if (cur >= total - 2) {
            // 靠近末尾：1 … 9 10 11 12
            pages.push('...', total - 3, total - 2, total - 1, total);
        } else {
            // 中间：1 … 5 6 7 … 12
            pages.push('...', cur - 1, cur, cur + 1, '...', total);
        }

        return pages;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// 初始化教程库
TutorialLibrary.init();

// ========================================
// FAQ Page
// ========================================
const FAQManager = {
    data: [],
    filtered: [],
    page: 1,
    perPage: 10,

    init() {
        const faqList = document.getElementById('faqList');
        if (!faqList) return;

        if (typeof FAQ_DATA !== 'undefined') {
            this.data = FAQ_DATA;
            this.filtered = this.data;
            this.render();
            this.bindEvents();
        }
    },

    bindEvents() {
        const searchForm = document.getElementById('faqSearchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.search();
            });
        }

        const searchInput = document.getElementById('faqSearch');
        const clearBtn = document.getElementById('faqSearchClear');
        if (searchInput && clearBtn) {
            const adjustWidth = () => {
                const temp = document.createElement('span');
                temp.style.cssText = 'visibility:hidden;position:absolute;white-space:pre;font:inherit;padding:0 60px 0 20px';
                temp.textContent = searchInput.value || searchInput.placeholder;
                document.body.appendChild(temp);
                const newWidth = Math.min(Math.max(temp.offsetWidth, 200), 350);
                temp.remove();
                searchInput.style.width = newWidth + 'px';
            };
            searchInput.addEventListener('input', () => {
                clearBtn.classList.toggle('visible', searchInput.value.length > 0);
                adjustWidth();
            });
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                clearBtn.classList.remove('visible');
                adjustWidth();
                this.filtered = this.data;
                this.page = 1;
                this.render();
            });
        }

        const pagination = document.getElementById('faqPagination');
        if (pagination) {
            pagination.addEventListener('click', (e) => {
                const btn = e.target.closest('.page-btn');
                if (!btn || btn.disabled) return;
                const page = btn.dataset.page;
                if (page === 'prev') this.goToPage(this.page - 1);
                else if (page === 'next') this.goToPage(this.page + 1);
                else this.goToPage(parseInt(page));
            });
        }

        const faqList = document.getElementById('faqList');
        if (faqList) {
            faqList.addEventListener('click', (e) => {
                const question = e.target.closest('.faq-question');
                if (!question) return;
                question.closest('.faq-item').classList.toggle('active');
            });
        }
    },

    search() {
        const input = document.getElementById('faqSearch');
        const keyword = input ? input.value.trim().toLowerCase() : '';
        const isEn = I18n.currentLang === 'en';

        if (keyword) {
            this.filtered = this.data.filter(faq => {
                const q = isEn ? faq.questionEn : faq.question;
                const a = isEn ? faq.answerEn : faq.answer;
                return q.toLowerCase().includes(keyword) || a.toLowerCase().includes(keyword);
            });
        } else {
            this.filtered = this.data;
        }

        this.page = 1;
        this.render();
    },

    goToPage(n) {
        const totalPages = Math.ceil(this.filtered.length / this.perPage);
        if (n < 1 || n > totalPages) return;
        this.page = n;
        this.render();
        window.scrollTo({ top: 400, behavior: 'smooth' });
    },

    render() {
        const list = document.getElementById('faqList');
        const pagination = document.getElementById('faqPagination');
        const resultsInfo = document.getElementById('faqResultsInfo');
        const isEn = I18n.currentLang === 'en';

        if (!list) return;

        const total = this.filtered.length;
        const totalPages = Math.ceil(total / this.perPage) || 1;
        const start = (this.page - 1) * this.perPage;
        const faqs = this.filtered.slice(start, start + this.perPage);

        if (resultsInfo) {
            resultsInfo.textContent = `${I18n.t('faqPage.total')} ${total} ${I18n.t('faqPage.questions')}`;
        }

        if (faqs.length === 0) {
            list.innerHTML = `<div class="no-results"><p>${I18n.t('faqPage.noResults')}</p></div>`;
            if (pagination) pagination.style.display = 'none';
            return;
        }

        list.innerHTML = faqs.map(faq => `
            <div class="faq-item">
                <div class="faq-question">
                    <span>${this.escapeHtml(isEn ? faq.questionEn : faq.question)}</span>
                    <i class="ri-arrow-down-s-line"></i>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-content">${this.escapeHtml(isEn ? faq.answerEn : faq.answer)}</div>
                </div>
            </div>
        `).join('');

        if (pagination) {
            pagination.style.display = totalPages > 1 ? 'flex' : 'none';
            pagination.innerHTML = TutorialLibrary.renderPagination.call({
                page: this.page,
                getPageNumbers: TutorialLibrary.getPageNumbers
            }, totalPages);
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// 页面加载完成后初始化FAQ
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FAQManager.init());
} else {
    FAQManager.init();
}

// 首页创意工坊预览
function initWorkshopPreview() {
    const grid = document.getElementById('workshopPreviewGrid');
    if (!grid || typeof WorkshopData === 'undefined') return;

    const creator = WorkshopData.getCreator('dianyuzhangzane');
    if (!creator || !creator.works) return;

    const items = creator.works.slice(0, 3);
    grid.innerHTML = items.map(item => `
        <div class="workshop-item">
            <a href="${item.link}" target="_blank" rel="noopener" class="workshop-link">
                <div class="workshop-thumb">
                    <img src="${item.image}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer">
                    <div class="workshop-thumb-overlay"><i class="ri-steam-fill"></i></div>
                </div>
                <div class="workshop-info">
                    <h3 class="workshop-title">${item.title}</h3>
                    <p class="workshop-desc">${item.description || ''}</p>
                </div>
            </a>
        </div>
    `).join('');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorkshopPreview);
} else {
    initWorkshopPreview();
}

// ========================================
// Community Entrance Carousel Background
// ========================================
function initEntranceCarousel() {
    const container = document.querySelector('.entrance-carousel-bg');
    if (!container) return;

    const slides = container.querySelectorAll('.entrance-carousel-slide');
    if (slides.length < 2) return;

    const images = [
        'https://images.steamusercontent.com/ugc/16132458798851579615/E73CFAC5EF821A860AE5A43F4316FDCEF09E58CD/',
        'https://images.steamusercontent.com/ugc/9546155098926737150/1BC4FA54AF97B29D1637793C17AC02ACC9F19BCC/',
        'https://images.steamusercontent.com/ugc/12463685672229803625/2642C645834997C17B801D31289A62F2DA73C93E/',
        'https://images.steamusercontent.com/ugc/10934611208860954779/943C2CFC0D691DF57866108AAE93372CD1CC5212/',
        'https://images.steamusercontent.com/ugc/16389891040394510856/CCFEF164909AF7A91B79D3A34A74A0B4CDF8C836/',
        'https://images.steamusercontent.com/ugc/11367830578160335829/3AB9610A664AC75B3D36365D4DAB0168F2BEC668/'
    ];

    let currentIndex = 0;
    let activeSlide = 0;

    // Shuffle and pick first image
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    currentIndex = 0;

    // Initialize first slide
    slides[0].style.backgroundImage = `url('${shuffled[currentIndex]}')`;
    slides[0].classList.add('active');

    function getNextIndex() {
        let next;
        do {
            next = Math.floor(Math.random() * shuffled.length);
        } while (next === currentIndex && shuffled.length > 1);
        return next;
    }

    function transition() {
        const nextIndex = getNextIndex();
        const nextSlide = activeSlide === 0 ? 1 : 0;

        // Prepare next slide
        slides[nextSlide].style.backgroundImage = `url('${shuffled[nextIndex]}')`;
        slides[nextSlide].classList.add('slide-in-right');
        slides[nextSlide].classList.remove('active', 'slide-out-left');

        // Force reflow
        slides[nextSlide].offsetHeight;

        // Animate out current, animate in next
        slides[activeSlide].classList.add('slide-out-left');
        slides[activeSlide].classList.remove('active');
        slides[nextSlide].classList.remove('slide-in-right');
        slides[nextSlide].classList.add('active');

        currentIndex = nextIndex;
        activeSlide = nextSlide;
    }

    setInterval(transition, 6000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEntranceCarousel);
} else {
    initEntranceCarousel();
}

// ========================================
// Hero 背景轮播（首页）
// ========================================
function initHeroCarousel() {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.hero-carousel-slide');
    if (slides.length < 2) return;

    const creditEl = document.querySelector('.hero-image-credit');
    const creditArtist = document.querySelector('.credit-artist');

    // 使用 GalleryFeatured 数据
    let images = [];
    if (typeof GalleryFeatured !== 'undefined' && GalleryFeatured.length > 0) {
        images = GalleryFeatured;
    } else {
        console.warn('GalleryFeatured not loaded, hero carousel disabled');
        return;
    }

    // 配置
    const INTERVAL = 10000;
    const PRELOAD_COUNT = 3;

    let currentIndex = -1;
    let activeSlide = 0;
    let usedIndices = [];
    let preloadedImages = new Set();
    let intervalId = null;

    // 获取屏幕适配的图片尺寸
    function getScreenSize() {
        const dpr = window.devicePixelRatio || 1;
        const width = Math.min(window.innerWidth * dpr, 2560);
        const height = Math.min(window.innerHeight * dpr, 1440);
        return { width: Math.round(width), height: Math.round(height) };
    }

    // 优化图片 URL，根据屏幕分辨率调整
    function getOptimizedImageUrl(url) {
        if (!url) return url;
        const { width, height } = getScreenSize();

        // 移除现有的尺寸参数，添加新的
        let baseUrl = url.split('?')[0];
        // 确保 URL 末尾有 /
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        return `${baseUrl}?imw=${width}&imh=${height}&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false`;
    }

    // 获取随机索引（避免近期重复）
    function getRandomIndex() {
        if (usedIndices.length >= images.length - 1) {
            usedIndices = currentIndex >= 0 ? [currentIndex] : [];
        }

        let newIndex;
        let attempts = 0;
        do {
            newIndex = Math.floor(Math.random() * images.length);
            attempts++;
        } while (usedIndices.includes(newIndex) && attempts < 50);

        usedIndices.push(newIndex);
        return newIndex;
    }

    // 预加载图片
    function preloadImage(url) {
        const optimizedUrl = getOptimizedImageUrl(url);
        if (preloadedImages.has(optimizedUrl)) return Promise.resolve(optimizedUrl);

        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                preloadedImages.add(optimizedUrl);
                resolve(optimizedUrl);
            };
            img.onerror = () => {
                resolve(optimizedUrl);
            };
            img.src = optimizedUrl;
        });
    }

    // 预加载接下来的图片
    function preloadNextImages() {
        for (let i = 0; i < PRELOAD_COUNT; i++) {
            const idx = Math.floor(Math.random() * images.length);
            if (images[idx] && images[idx].image) {
                preloadImage(images[idx].image);
            }
        }
    }

    // 更新署名
    function updateCredit(artist) {
        if (creditEl && creditArtist) {
            if (artist) {
                creditArtist.textContent = artist;
                creditEl.classList.add('show');
            } else {
                creditEl.classList.remove('show');
            }
        }
    }

    // 切换到下一张
    function transition() {
        const nextIndex = getRandomIndex();
        const nextSlide = activeSlide === 0 ? 1 : 0;
        const imageData = images[nextIndex];

        if (!imageData || !imageData.image) return;

        preloadImage(imageData.image).then((optimizedUrl) => {
            slides[nextSlide].style.backgroundImage = `url('${optimizedUrl}')`;

            requestAnimationFrame(() => {
                slides[activeSlide].classList.add('fade-out');
                slides[activeSlide].classList.remove('active');
                slides[nextSlide].classList.remove('fade-out');
                slides[nextSlide].classList.add('active');

                updateCredit(imageData.artist);

                currentIndex = nextIndex;
                activeSlide = nextSlide;

                preloadNextImages();
            });
        });
    }

    // 初始化第一张图片
    function init() {
        const heroSection = document.querySelector('.hero');
        const firstIndex = Math.floor(Math.random() * images.length);
        const imageData = images[firstIndex];

        if (!imageData || !imageData.image) return;

        preloadImage(imageData.image).then((optimizedUrl) => {
            slides[0].style.backgroundImage = `url('${optimizedUrl}')`;
            slides[0].classList.add('active');

            // 图片加载完成，切换到轮播状态
            if (heroSection) {
                heroSection.classList.add('carousel-ready');
            }

            updateCredit(imageData.artist);

            currentIndex = firstIndex;
            usedIndices.push(firstIndex);

            preloadNextImages();

            intervalId = setInterval(transition, INTERVAL);
        });
    }

    // 页面不可见时暂停轮播
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        } else {
            if (!intervalId && currentIndex >= 0) {
                intervalId = setInterval(transition, INTERVAL);
            }
        }
    });

    init();
}

// 初始化 Hero 轮播
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroCarousel);
} else {
    initHeroCarousel();
}
