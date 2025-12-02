/**
 * 教程视频数据管理
 */
const TutorialData = {
    creators: {},
    creatorOrder: [],

    register(id, data) {
        this.creators[id] = data;
        if (!this.creatorOrder.includes(id)) {
            this.creatorOrder.push(id);
        }
    },

    getCreator(id) {
        return this.creators[id];
    },

    getAllCreators() {
        return this.creatorOrder.map(id => ({ id, ...this.creators[id] }));
    },

    getAllVideos() {
        const videos = [];
        this.creatorOrder.forEach(id => {
            const creator = this.creators[id];
            if (creator && creator.videos) {
                creator.videos.forEach(video => {
                    videos.push({ ...video, creatorId: id, creatorName: creator.name });
                });
            }
        });
        return videos;
    },

    // 标签定义
    tags: ['tutorial', 'gameplay', 'other'],

    // 按标签筛选视频
    filterByTags(videos, selectedTags) {
        if (!selectedTags || selectedTags.length === 0) return videos;
        return videos.filter(v => v.tags && v.tags.some(t => selectedTags.includes(t)));
    }
};
