/**
 * 创意工坊数据管理
 */
const WorkshopData = {
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
    }
};
