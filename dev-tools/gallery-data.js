/**
 * 画廊数据管理
 */
const GalleryData = {
    artists: {},
    artistOrder: [],

    register(id, data) {
        this.artists[id] = data;
        if (!this.artistOrder.includes(id)) {
            this.artistOrder.push(id);
        }
    },

    getArtist(id) {
        return this.artists[id];
    },

    getAllArtists() {
        return this.artistOrder.map(id => ({ id, ...this.artists[id] }));
    }
};
