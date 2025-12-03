/**
 * 画廊页面逻辑（精选展示）
 */
const GalleryPage = {
    lightbox: { active: false, currentIndex: 0 },
    itemsPerPage: 16,
    currentPage: 1,

    getSizeClass(index) {
        return index === 0 ? 'size-large' : '';
    },

    init() {
        if (!document.getElementById('artworkPanel')) return;
        this.renderGallery();
        this.initLightbox();
        this.initPagination();
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

    renderGallery() {
        const panel = document.getElementById('artworkPanel');
        if (!GalleryFeatured || GalleryFeatured.length === 0) {
            panel.innerHTML = `<div class="no-results"><p>${I18n.t('galleryPage.noFeatured')}</p></div>`;
            return;
        }

        const totalPages = Math.ceil(GalleryFeatured.length / this.itemsPerPage);
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const pageItems = GalleryFeatured.slice(startIdx, startIdx + this.itemsPerPage);

        panel.innerHTML = `
            <div class="masonry-grid">
                ${pageItems.map((item, i) => `
                    <div class="masonry-item ${this.getSizeClass(i)}" data-index="${startIdx + i}">
                        <img src="${this.getOptimizedImageUrl(item.image)}" alt="${item.title || ''}" loading="lazy">
                    </div>
                `).join('')}
            </div>
            ${totalPages > 1 ? this.renderPagination(this.currentPage, totalPages) : ''}
        `;
    },

    renderPagination(cur, total) {
        let html = '<div class="pagination gallery-pagination">';
        html += `<button class="page-btn" data-page="prev" ${cur <= 1 ? 'disabled' : ''}><i class="ri-arrow-left-s-line"></i></button>`;
        const pages = this.getPageNumbers(cur, total);
        pages.forEach(p => {
            if (p === '...') {
                html += '<span class="page-ellipsis">…</span>';
            } else {
                html += `<button class="page-btn ${p === cur ? 'active' : ''}" data-page="${p}">${p}</button>`;
            }
        });
        html += `<button class="page-btn" data-page="next" ${cur >= total ? 'disabled' : ''}><i class="ri-arrow-right-s-line"></i></button>`;
        html += '</div>';
        return html;
    },

    getPageNumbers(cur, total) {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (cur <= 3) return [1, 2, 3, 4, '...', total];
        if (cur >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
        return [1, '...', cur - 1, cur, cur + 1, '...', total];
    },

    initPagination() {
        document.getElementById('artworkPanel').addEventListener('click', (e) => {
            // 翻页按钮
            const btn = e.target.closest('.page-btn');
            if (btn && !btn.disabled) {
                this.changePage(btn.dataset.page);
                return;
            }
            // 图片点击打开灯箱
            const item = e.target.closest('.masonry-item');
            if (item) this.openLightbox(parseInt(item.dataset.index));
        });
    },

    changePage(page) {
        const totalPages = Math.ceil(GalleryFeatured.length / this.itemsPerPage);
        if (page === 'prev') page = this.currentPage - 1;
        else if (page === 'next') page = this.currentPage + 1;
        else page = parseInt(page);

        if (page < 1 || page > totalPages || page === this.currentPage) return;
        this.currentPage = page;
        this.renderGallery();
        document.getElementById('artworkPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    openLightbox(index) {
        this.lightbox = { active: true, currentIndex: index };
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
        if (this.lightbox.currentIndex < GalleryFeatured.length - 1) {
            this.lightbox.currentIndex++;
            this.updateLightboxImage();
        }
    },

    updateLightboxImage() {
        const item = GalleryFeatured[this.lightbox.currentIndex];
        const lb = document.getElementById('lightbox');
        const img = lb.querySelector('.lightbox-image');
        img.src = '';
        lb.classList.add('loading');
        img.onload = () => lb.classList.remove('loading');
        img.src = this.getOptimizedImageUrl(item.image, true);

        // 显示作者和标题
        const caption = [];
        if (item.artist) caption.push(item.artist);
        if (item.title) caption.push(item.title);
        lb.querySelector('.lightbox-caption').textContent = caption.join(' - ');

        lb.querySelector('.lightbox-prev').disabled = this.lightbox.currentIndex === 0;
        lb.querySelector('.lightbox-next').disabled = this.lightbox.currentIndex === GalleryFeatured.length - 1;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GalleryPage.init());
} else {
    GalleryPage.init();
}
