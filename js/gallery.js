/**
 * 画廊页面逻辑
 */
const GalleryPage = {
    artistStates: {},
    creatorStates: {},
    collapsedRows: 2,  // 收起时显示的行数
    itemsPerPage: 17,  // 每页显示数量
    workshopItemsPerPage: 12,  // 创意工坊每页显示数量
    lightbox: { active: false, artistId: null, currentIndex: 0, images: [], isWorkshop: false },
    selectedCreators: [],
    keyword: '',
    currentTab: 'artwork',

    // 根据位置分配大小类
    getSizeClass(index) {
        // 只有第一张是大图，其余普通尺寸，避免网格空洞
        return index === 0 ? 'size-large' : '';
    },

    init() {
        if (!document.getElementById('artworkPanel')) return;
        this.initCreatorFilter();
        this.bindTabEvents();
        this.bindSearchEvents();
        this.renderArtworkPanel();
        this.renderWorkshopPanel();
        this.initLightbox();
        I18n.onLangChange(() => {
            this.updateButtonTexts();
            this.updateCreatorFilter();
            if (this.currentTab === 'workshop') this.renderWorkshopPanel();
        });
    },

    // 初始化作者筛选
    initCreatorFilter() {
        const menu = document.getElementById('galleryCreatorFilterMenu');
        const dropdown = document.getElementById('galleryCreatorFilter');
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
        const menu = document.getElementById('galleryCreatorFilterMenu');
        if (!menu) return;

        let creators = this.currentTab === 'artwork' ? GalleryData.getAllArtists() : WorkshopData.getAllCreators();
        this.selectedCreators = [];

        menu.innerHTML = creators.map(c => `
            <div class="filter-item" data-id="${c.id}">
                <div class="filter-checkbox"><i class="ri-check-line"></i></div>
                <span class="filter-label">${this.getLocalizedText(c.name)}</span>
            </div>
        `).join('');
    },

    bindSearchEvents() {
        const form = document.getElementById('gallerySearchForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.applyFilter();
            });
        }

        const searchInput = document.getElementById('gallerySearch');
        const clearBtn = document.getElementById('gallerySearchClear');
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
        const input = document.getElementById('gallerySearch');
        this.keyword = input ? input.value.trim().toLowerCase() : '';
        if (this.currentTab === 'artwork') {
            this.renderArtworkPanel();
        } else {
            this.renderWorkshopPanel();
        }
    },

    updateButtonTexts() {
        document.querySelectorAll('.artist-toggle').forEach(btn => {
            const artistId = btn.dataset.artist;
            const state = this.artistStates[artistId];
            const expanded = state?.expanded || false;
            btn.textContent = I18n.t(expanded ? 'galleryPage.collapse' : 'galleryPage.expand');
        });
        document.querySelectorAll('.creator-toggle').forEach(btn => {
            const creatorId = btn.dataset.creator;
            const state = this.creatorStates[creatorId];
            const expanded = state?.expanded || false;
            btn.textContent = I18n.t(expanded ? 'galleryPage.collapse' : 'galleryPage.expand');
        });
    },

    // 根据屏幕分辨率获取优化后的图片URL（缩略图用50%分辨率）
    getOptimizedImageUrl(url, forLightbox = false) {
        if (!url.includes('steamusercontent.com')) return url;
        if (!url.includes('?imw=')) return url;
        const size = Math.round(Math.max(window.screen.width, window.screen.height) * window.devicePixelRatio * 0.5);
        // 创意工坊格式：带 impolicy 参数，改用 Fit 去掉黑边
        if (url.includes('impolicy=')) {
            const w = forLightbox ? 1920 : size;
            const h = forLightbox ? 1080 : Math.round(size * 9 / 16);
            return url.replace(/imw=\d+/, `imw=${w}`).replace(/imh=\d+/, `imh=${h}`).replace(/impolicy=Letterbox/, 'impolicy=Fit');
        }
        // 艺术作品格式
        if (forLightbox) return url.replace(/\?imw=\d+&imh=\d+/, '');
        return url.replace(/\?imw=\d+&imh=\d+/, `?imw=${size}&imh=${size}`);
    },

    // 板块切换
    bindTabEvents() {
        document.querySelectorAll('.gallery-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    },

    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.gallery-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tabName);
        });
        document.querySelectorAll('.gallery-panel').forEach(p => {
            p.classList.toggle('active', p.id === tabName + 'Panel');
        });
        // 搜索表单仅在创意工坊显示
        const searchForm = document.getElementById('gallerySearchForm');
        if (searchForm) searchForm.style.display = tabName === 'workshop' ? '' : 'none';
        // 切换时更新筛选器和清空搜索
        this.updateCreatorFilter();
        const input = document.getElementById('gallerySearch');
        if (input) input.value = '';
        this.keyword = '';
    },

    // 获取筛选后的作者列表（艺术作品不支持搜索筛选）
    getFilteredArtists() {
        return GalleryData.getAllArtists();
    },

    // 获取本地化文本（支持字符串或{zh,en}对象）
    getLocalizedText(text) {
        if (!text) return '';
        if (typeof text === 'string') return text;
        const lang = I18n.currentLang === 'zh-CN' ? 'zh' : 'en';
        return text[lang] || text.zh || text.en || '';
    },

    getFilteredCreators() {
        let creators = WorkshopData.getAllCreators();
        // 作者筛选
        if (this.selectedCreators.length > 0 && this.selectedCreators.length < WorkshopData.creatorOrder.length) {
            creators = creators.filter(c => this.selectedCreators.includes(c.id));
        }
        // 关键词筛选
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

    // 渲染艺术作品板块
    renderArtworkPanel() {
        const panel = document.getElementById('artworkPanel');
        const artists = this.getFilteredArtists();
        panel.innerHTML = artists.length ? artists.map(a => this.renderArtistBlock(a)).join('') : `<div class="no-results"><p>${I18n.t('common.noResults')}</p></div>`;
        this.bindArtistEvents();
    },

    renderArtistBlock(artist) {
        const state = this.artistStates[artist.id] || { expanded: false, page: 1 };
        if (!this.artistStates[artist.id]) this.artistStates[artist.id] = state;
        const works = artist.works;
        const isExpanded = state.expanded;
        const worksText = I18n.t('galleryPage.works');

        // 分页计算
        const totalPages = Math.ceil(works.length / this.itemsPerPage);
        const currentPage = state.page || 1;
        const startIdx = (currentPage - 1) * this.itemsPerPage;
        const pageWorks = works.slice(startIdx, startIdx + this.itemsPerPage);

        return `
            <div class="artist-block" data-artist="${artist.id}">
                <div class="artist-card">
                    <div class="artist-header">
                        <h2 class="artist-name">${artist.name}</h2>
                        <span class="artist-count">${works.length} ${worksText}</span>
                    </div>
                    <div class="artist-gallery ${isExpanded ? 'expanded' : 'collapsed'}">
                        <div class="masonry-grid">
                            ${pageWorks.map((w, i) => {
                                const realIndex = startIdx + i;
                                const sizeClass = this.getSizeClass(i);
                                return `<div class="masonry-item ${sizeClass}" data-artist="${artist.id}" data-index="${realIndex}">
                                    <img src="${this.getOptimizedImageUrl(w.image)}" alt="${w.title}" loading="lazy">
                                </div>`;
                            }).join('')}
                        </div>
                        <div class="gallery-fade-overlay"></div>
                        ${isExpanded && totalPages > 1 ? this.renderPagination(artist.id, currentPage, totalPages) : ''}
                    </div>
                    <button class="artist-toggle" data-artist="${artist.id}">
                        ${isExpanded ? I18n.t('galleryPage.collapse') : I18n.t('galleryPage.expand')}
                    </button>
                </div>
            </div>
        `;
    },

    bindArtistEvents() {
        // 使用事件委托，只在 panel 上绑定一次
        const panel = document.getElementById('artworkPanel');
        if (!panel || panel._bindDone) return;
        panel._bindDone = true;

        panel.addEventListener('click', (e) => {
            // 展开/折叠按钮
            const toggleBtn = e.target.closest('.artist-toggle');
            if (toggleBtn) {
                this.toggleArtist(toggleBtn.dataset.artist);
                return;
            }
            // 分页按钮
            const pageBtn = e.target.closest('.page-btn');
            if (pageBtn && !pageBtn.disabled) {
                const pagination = pageBtn.closest('.gallery-pagination');
                if (pagination) {
                    this.changePage(pagination.dataset.artist, pageBtn.dataset.page);
                }
                return;
            }
            // 图片点击
            const item = e.target.closest('.masonry-item');
            if (item) {
                this.openLightbox(item.dataset.artist, parseInt(item.dataset.index));
            }
        });
    },

    toggleArtist(artistId) {
        if (!this.artistStates[artistId]) {
            this.artistStates[artistId] = { expanded: false, page: 1 };
        }
        const state = this.artistStates[artistId];
        const gallery = document.querySelector(`.artist-block[data-artist="${artistId}"] .artist-gallery`);
        const btn = document.querySelector(`.artist-toggle[data-artist="${artistId}"]`);

        state.expanded = !state.expanded;
        gallery.classList.toggle('collapsed', !state.expanded);
        gallery.classList.toggle('expanded', state.expanded);
        btn.textContent = I18n.t(state.expanded ? 'galleryPage.collapse' : 'galleryPage.expand');

        // 展开时添加分页，收起时移除
        const artist = GalleryData.getArtist(artistId);
        const totalPages = Math.ceil(artist.works.length / this.itemsPerPage);
        const existingPagination = gallery.querySelector('.gallery-pagination');

        if (state.expanded && totalPages > 1 && !existingPagination) {
            gallery.insertAdjacentHTML('beforeend', this.renderPagination(artistId, state.page, totalPages));
        } else if (!state.expanded && existingPagination) {
            // 等动画结束后再移除分页，避免高度突变
            gallery.addEventListener('transitionend', () => existingPagination.remove(), { once: true });
        }
    },

    // 灯箱
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

    openLightbox(artistId, index) {
        const artist = GalleryData.getArtist(artistId);
        if (!artist) return;
        this.lightbox = { active: true, artistId, images: artist.works, currentIndex: index };
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
    },

    // 分页渲染
    renderPagination(artistId, cur, total) {
        let html = `<div class="pagination gallery-pagination" data-artist="${artistId}">`;
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

    changePage(artistId, page) {
        const state = this.artistStates[artistId];
        const artist = GalleryData.getArtist(artistId);
        const totalPages = Math.ceil(artist.works.length / this.itemsPerPage);

        if (page === 'prev') page = state.page - 1;
        else if (page === 'next') page = state.page + 1;
        else page = parseInt(page);

        if (page < 1 || page > totalPages || page === state.page) return;

        state.page = page;
        this.rerenderArtist(artistId);
    },

    rerenderArtist(artistId) {
        const artist = GalleryData.getAllArtists().find(a => a.id === artistId);
        const block = document.querySelector(`.artist-block[data-artist="${artistId}"]`);
        if (!block || !artist) return;

        block.outerHTML = this.renderArtistBlock(artist);
    },

    // ========== 创意工坊板块 ==========
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
        const itemsText = I18n.t('galleryPage.items');
        const creatorName = this.getLocalizedText(creator.name);

        const totalPages = Math.ceil(works.length / this.workshopItemsPerPage);
        const currentPage = state.page || 1;
        const startIdx = (currentPage - 1) * this.workshopItemsPerPage;
        const pageWorks = works.slice(startIdx, startIdx + this.workshopItemsPerPage);

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
                        ${isExpanded && totalPages > 1 ? this.renderWorkshopPagination(creator.id, currentPage, totalPages) : ''}
                    </div>
                    <button class="creator-toggle" data-creator="${creator.id}">
                        ${isExpanded ? I18n.t('galleryPage.collapse') : I18n.t('galleryPage.expand')}
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
                    this.changeWorkshopPage(pagination.dataset.creator, pageBtn.dataset.page);
                }
                return;
            }
            const previewBtn = e.target.closest('.workshop-preview');
            if (previewBtn) {
                e.preventDefault();
                e.stopPropagation();
                this.openWorkshopLightbox(previewBtn.dataset.creator, parseInt(previewBtn.dataset.index));
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
        btn.textContent = I18n.t(state.expanded ? 'galleryPage.collapse' : 'galleryPage.expand');

        const creator = WorkshopData.getCreator(creatorId);
        const totalPages = Math.ceil(creator.works.length / this.workshopItemsPerPage);
        const existingPagination = gallery.querySelector('.workshop-pagination');

        if (state.expanded && totalPages > 1 && !existingPagination) {
            gallery.insertAdjacentHTML('beforeend', this.renderWorkshopPagination(creatorId, state.page, totalPages));
        } else if (!state.expanded && existingPagination) {
            gallery.addEventListener('transitionend', () => existingPagination.remove(), { once: true });
        }
    },

    renderWorkshopPagination(creatorId, cur, total) {
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

    changeWorkshopPage(creatorId, page) {
        const state = this.creatorStates[creatorId];
        const creator = WorkshopData.getCreator(creatorId);
        const totalPages = Math.ceil(creator.works.length / this.workshopItemsPerPage);

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

    openWorkshopLightbox(creatorId, index) {
        const creator = WorkshopData.getCreator(creatorId);
        if (!creator) return;
        this.lightbox = { active: true, artistId: creatorId, images: creator.works, currentIndex: index, isWorkshop: true };
        this.updateLightboxImage();
        document.getElementById('lightbox').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GalleryPage.init());
} else {
    GalleryPage.init();
}
