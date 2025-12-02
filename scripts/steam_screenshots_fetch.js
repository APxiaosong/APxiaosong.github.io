/**
 * Steam截图/艺术作品ID收集脚本
 *
 * 使用方法：
 * 1. 打开用户的Steam截图页面，如：
 *    https://steamcommunity.com/id/China-NO1/screenshots/?appid=387990
 * 2. 滚动到页面最底部，确保所有图片都已加载
 * 3. F12打开开发者工具 → Console标签
 * 4. 粘贴此脚本并回车执行
 * 5. 执行 copy(_screenshotData)
 * 6. 在Blender中运行steam_screenshots_to_gallery.py
 */

(function() {
    // 收集所有截图ID
    const ids = [];
    document.querySelectorAll('a.profile_media_item').forEach(a => {
        const id = a.dataset.publishedfileid;
        if (id && !ids.includes(id)) ids.push(id);
    });

    console.log(`完成！共收集 ${ids.length} 个截图ID`);

    // 存到全局变量
    window._screenshotData = JSON.stringify(ids);
    console.log('请执行: copy(_screenshotData)');
})();
