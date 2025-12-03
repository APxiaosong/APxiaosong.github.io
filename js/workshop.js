/**
 * 创意工坊页面逻辑
 */
const WorkshopPage = {
    creatorStates: {},
    itemsPerPage: 12,
    lightbox: { active: false, creatorId: null, currentIndex: 0, images: [] },
    selectedCreators: [],
    keyword: '',

    init() {
        if (!document.getElementById('workshopPanel')) return;
        this.initCreatorFilter();
        this.bindSearchEvents();
        this.renderWorkshopPanel();
        this.initLightbox();
        I18n.onLangChange(() => {
            this.updateButtonTexts();
            this.updateCreatorFilter();
            this.renderWorkshopPanel();
        });
    },

    initCreatorFilter() {
        const menu = document.getElementById('workshopCreatorFilterMenu');
        const dropdown = document.getElementById('workshopCreatorFilter');
        if (!menu || !dropdown) return;

        this.updateCreatorFilter();

        dropdown.querySelector('.filter-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        menu.addEventListener('click', (e) => {
            const item = e.target.closest('.filter-item');
            if (!item) return;
            e.stopPropagation();
            const id = item.dataset.id;
            item.classList.toggle('checked');
            if (item.classList.contains('checked')) {
                if (!this.selectedCreators.includes(id)) this.selectedCreators.push(id);
            } else {
                this.selectedCreators = this.selectedCreators.filter(c => c !== id);
            }
            this.applyFilter();
        });

        document.addEventListener('click', () => dropdown.classList.remove('active'));
    },

    updateCreatorFilter() {
        const menu = document.getElementById('workshopCreatorFilterMenu');
        if (!menu) return;

        const creators = WorkshopData.getAllCreators();
        this.selectedCreators = [];

        menu.innerHTML = creators.map(c => `
            <div class="filter-item" data-id="${c.id}">
                <div class="filter-checkbox"><i class="ri-check-line"></i></div>
                <span class="filter-label">${this.getLocalizedText(c.name)}</span>
            </div>
        `).join('');
    },

    bindSearchEvents() {
        const form = document.getElementById('workshopSearchForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.applyFilter();
            });
        }

        const searchInput = document.getElementById('workshopSearch');
        const clearBtn = document.getElementById('workshopSearchClear');
        if (searchInput && clearBtn) {
            searchInput.addEventListener('input', () => {
                clearBtn.classList.toggle('visible', searchInput.value.length > 0);
            });
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                clearBtn.classList.remove('visible');
                this.applyFilter();
            });
        }
    },

    applyFilter() {
        const input = document.getElementById('workshopSearch');
        this.keyword = input ? input.value.trim().toLowerCase() : '';
        this.renderWorkshopPanel();
    },

    updateButtonTexts() {
        document.querySelectorAll('.creator-toggle').forEach(btn => {
            const creatorId = btn.dataset.creator;
            const state = this.creatorStates[creatorId];
            const expanded = state?.expanded || false;
            btn.textContent = I18n.t(expanded ? 'workshopPage.collapse' : 'workshopPage.expand');
        });
    },

    getOptimizedImageUrl(url, forLightbox = false) {
        if (!url.includes('steamusercontent.com') || !url.includes('?imw=')) return url;
        const size = Math.round(Math.max(window.screen.width, window.screen.height) * window.devicePixelRatio * 0.5);
        if (url.includes('impolicy=')) {
            const w = forLightbox ? 1920 : size;
            const h = forLightbox ? 1080 : Math.round(size * 9 / 16);
            return url.replace(/imw=\d+/, `imw=${w}`).replace(/imh=\d+/, `imh=${h}`).replace(/impolicy=Letterbox/, 'impolicy=Fit');
        }
        if (forLightbox) return url.replace(/\?imw=\d+&imh=\d+/, '');
        return url.replace(/\?imw=\d+&imh=\d+/, `?imw=${size}&imh=${size}`);
    },

    getLocalizedText(text) {
        if (!text) return '';
        if (typeof text === 'string') return text;
        const lang = I18n.currentLang === 'zh-CN' ? 'zh' : 'en';
        return text[lang] || text.zh || text.en || '';
    },

    getFilteredCreators() {
        let creators = WorkshopData.getAllCreators();
        if (this.selectedCreators.length > 0 && this.selectedCreators.length < WorkshopData.creatorOrder.length) {
            creators = creators.filter(c => this.selectedCreators.includes(c.id));
        }
        if (this.keyword) {
            creators = creators.map(c => ({
                ...c,
                works: c.works.filter(w => {
                    const title = typeof w.title === 'object'
                        ? `${w.title.zh || ''} ${w.title.en || ''}`.toLowerCase()
                        : (w.title || '').toLowerCase();
                    const desc = typeof w.description === 'object'
                        ? `${w.description.zh || ''} ${w.description.en || ''}`.toLowerCase()
                        : (w.description || '').toLowerCase();
                    return title.includes(this.keyword) || desc.includes(this.keyword);
                })
            })).filter(c => c.works.length > 0);
        }
        return creators;
    },

    renderWorkshopPanel() {
        const panel = document.getElementById('workshopPanel');
        if (!panel || typeof WorkshopData === 'undefined') return;
        const creators = this.getFilteredCreators();
        panel.innerHTML = creators.length ? creators.map(c => this.renderCreatorBlock(c)).join('') : `<div class="no-results"><p>${I18n.t('common.noResults')}</p></div>`;
        this.bindCreatorEvents();
    },

    renderCreatorBlock(creator) {
        const state = this.creatorStates[creator.id] || { expanded: false, page: 1 };
        if (!this.creatorStates[creator.id]) this.creatorStates[creator.id] = state;
        const works = creator.works;
        const isExpanded = state.expanded;
        const itemsText = I18n.t('workshopPage.items');
        const creatorName = this.getLocalizedText(creator.name);

        const totalPages = Math.ceil(works.length / this.itemsPerPage);
        const currentPage = state.page || 1;
        const startIdx = (currentPage - 1) * this.itemsPerPage;
        const pageWorks = works.slice(startIdx, startIdx + this.itemsPerPage);

        return `
            <div class="creator-block" data-creator="${creator.id}">
                <div class="creator-card">
                    <div class="creator-header">
                        <h2 class="creator-name">${creatorName}</h2>
                        <span class="creator-count">${works.length} ${itemsText}</span>
                    </div>
                    <div class="creator-gallery ${isExpanded ? 'expanded' : 'collapsed'}">
                        <div class="workshop-grid">
                            ${pageWorks.map((w, i) => {
                                const realIndex = startIdx + i;
                                const title = this.getLocalizedText(w.title);
                                const desc = this.getLocalizedText(w.description);
                                return `<div class="workshop-item" data-creator="${creator.id}" data-index="${realIndex}">
                                    <a href="${w.link}" target="_blank" rel="noopener" class="workshop-link">
                                        <div class="workshop-thumb">
                                            <img src="${this.getOptimizedImageUrl(w.image)}" alt="${this.escapeHtml(title)}" loading="lazy" referrerpolicy="no-referrer">
                                            <div class="workshop-thumb-overlay">
                                                <i class="ri-steam-fill"></i>
                                            </div>
                                        </div>
                                        <div class="workshop-info">
                                            <h3 class="workshop-title">${this.escapeHtml(title)}</h3>
                                            <p class="workshop-desc">${this.escapeHtml(desc)}</p>
                                        </div>
                                    </a>
                                    <button class="workshop-preview" data-creator="${creator.id}" data-index="${realIndex}" aria-label="Preview">
                                        <i class="ri-image-line"></i>
                                    </button>
                                </div>`;
                            }).join('')}
                        </div>
                        <div class="gallery-fade-overlay"></div>
                        ${isExpanded && totalPages > 1 ? this.renderPagination(creator.id, currentPage, totalPages) : ''}
                    </div>
                    <button class="creator-toggle" data-creator="${creator.id}">
                        ${isExpanded ? I18n.t('workshopPage.collapse') : I18n.t('workshopPage.expand')}
                    </button>
                </div>
            </div>
        `;
    },

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    bindCreatorEvents() {
        const panel = document.getElementById('workshopPanel');
        if (!panel || panel._bindDone) return;
        panel._bindDone = true;

        panel.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('.creator-toggle');
            if (toggleBtn) {
                this.toggleCreator(toggleBtn.dataset.creator);
                return;
            }
            const pageBtn = e.target.closest('.page-btn');
            if (pageBtn && !pageBtn.disabled) {
                const pagination = pageBtn.closest('.workshop-pagination');
                if (pagination) {
                    this.changePage(pagination.dataset.creator, pageBtn.dataset.page);
                }
                return;
            }
            const previewBtn = e.target.closest('.workshop-preview');
            if (previewBtn) {
                e.preventDefault();
                e.stopPropagation();
                this.openLightbox(previewBtn.dataset.creator, parseInt(previewBtn.dataset.index));
            }
        });
    },

    toggleCreator(creatorId) {
        if (!this.creatorStates[creatorId]) {
            this.creatorStates[creatorId] = { expanded: false, page: 1 };
        }
        const state = this.creatorStates[creatorId];
        const gallery = document.querySelector(`.creator-block[data-creator="${creatorId}"] .creator-gallery`);
        const btn = document.querySelector(`.creator-toggle[data-creator="${creatorId}"]`);

        state.expanded = !state.expanded;
        gallery.classList.toggle('collapsed', !state.expanded);
        gallery.classList.toggle('expanded', state.expanded);
        btn.textContent = I18n.t(state.expanded ? 'workshopPage.collapse' : 'workshopPage.expand');

        const creator = WorkshopData.getCreator(creatorId);
        const totalPages = Math.ceil(creator.works.length / this.itemsPerPage);
        const existingPagination = gallery.querySelector('.workshop-pagination');

        if (state.expanded && totalPages > 1 && !existingPagination) {
            gallery.insertAdjacentHTML('beforeend', this.renderPagination(creatorId, state.page, totalPages));
        } else if (!state.expanded && existingPagination) {
            gallery.addEventListener('transitionend', () => existingPagination.remove(), { once: true });
        }
    },

    renderPagination(creatorId, cur, total) {
        let html = `<div class="pagination workshop-pagination" data-creator="${creatorId}">`;
        html += `<button class="page-btn" data-page="prev" ${cur <= 1 ? 'disabled' : ''}>&lt;</button>`;
        const pages = this.getPageNumbers(cur, total);
        pages.forEach(p => {
            if (p === '...') {
                html += '<span class="page-ellipsis">…</span>';
            } else {
                html += `<button class="page-btn ${p === cur ? 'active' : ''}" data-page="${p}">${p}</button>`;
            }
        });
        html += `<button class="page-btn" data-page="next" ${cur >= total ? 'disabled' : ''}>&gt;</button>`;
        html += '</div>';
        return html;
    },

    getPageNumbers(cur, total) {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (cur <= 3) return [1, 2, 3, 4, '...', total];
        if (cur >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
        return [1, '...', cur - 1, cur, cur + 1, '...', total];
    },

    changePage(creatorId, page) {
        const state = this.creatorStates[creatorId];
        const creator = WorkshopData.getCreator(creatorId);
        const totalPages = Math.ceil(creator.works.length / this.itemsPerPage);

        if (page === 'prev') page = state.page - 1;
        else if (page === 'next') page = state.page + 1;
        else page = parseInt(page);

        if (page < 1 || page > totalPages || page === state.page) return;

        state.page = page;
        this.rerenderCreator(creatorId);
    },

    rerenderCreator(creatorId) {
        const creator = WorkshopData.getAllCreators().find(c => c.id === creatorId);
        const block = document.querySelector(`.creator-block[data-creator="${creatorId}"]`);
        if (!block || !creator) return;
        block.outerHTML = this.renderCreatorBlock(creator);
    },

    initLightbox() {
        const lb = document.getElementById('lightbox');
        if (!lb) return;
        lb.querySelector('.lightbox-overlay').addEventListener('click', () => this.closeLightbox());
        lb.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
        lb.querySelector('.lightbox-prev').addEventListener('click', () => this.prevImage());
        lb.querySelector('.lightbox-next').addEventListener('click', () => this.nextImage());
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.active) return;
            if (e.key === 'Escape') this.closeLightbox();
            if (e.key === 'ArrowLeft') this.prevImage();
            if (e.key === 'ArrowRight') this.nextImage();
        });
    },

    openLightbox(creatorId, index) {
        const creator = WorkshopData.getCreator(creatorId);
        if (!creator) return;
        this.lightbox = { active: true, creatorId, images: creator.works, currentIndex: index };
        this.updateLightboxImage();
        document.getElementById('lightbox').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeLightbox() {
        this.lightbox.active = false;
        document.getElementById('lightbox').classList.remove('active');
        document.body.style.overflow = '';
    },

    prevImage() {
        if (this.lightbox.currentIndex > 0) {
            this.lightbox.currentIndex--;
            this.updateLightboxImage();
        }
    },

    nextImage() {
        if (this.lightbox.currentIndex < this.lightbox.images.length - 1) {
            this.lightbox.currentIndex++;
            this.updateLightboxImage();
        }
    },

    updateLightboxImage() {
        const work = this.lightbox.images[this.lightbox.currentIndex];
        const lb = document.getElementById('lightbox');
        const img = lb.querySelector('.lightbox-image');
        img.src = '';
        lb.classList.add('loading');
        img.onload = () => lb.classList.remove('loading');
        img.src = this.getOptimizedImageUrl(work.image, true);
        lb.querySelector('.lightbox-caption').textContent = this.getLocalizedText(work.title);
        lb.querySelector('.lightbox-prev').disabled = this.lightbox.currentIndex === 0;
        lb.querySelector('.lightbox-next').disabled = this.lightbox.currentIndex === this.lightbox.images.length - 1;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WorkshopPage.init());
} else {
    WorkshopPage.init();
}
