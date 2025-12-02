/**
 * Steam创意工坊全量获取脚本（中英文双语版）
 *
 * 使用方法：
 * 1. 打开用户的Steam创意工坊页面（第一页）
 * 2. F12打开开发者工具 → Console标签
 * 3. 粘贴此脚本并回车执行
 * 4. 等待脚本自动遍历所有页面（会分别获取中英文版本）
 * 5. 完成后JSON数据会自动复制到剪贴板
 * 6. 在Blender中运行steam_workshop_to_gallery.py
 */

(async function() {
    // 获取基础URL（去掉语言和分页参数）
    let baseUrl = location.href.split('?')[0];
    const params = new URLSearchParams(location.search);
    params.delete('l');
    params.delete('p');
    const queryStr = params.toString();
    baseUrl = baseUrl + (queryStr ? '?' + queryStr : '');

    // 获取单语言版本的所有作品
    async function fetchLang(lang, langName) {
        const items = {};
        const langUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `l=${lang}`;

        // 先获取第一页来确定总页数
        const firstResp = await fetch(langUrl + '&p=1');
        const firstHtml = await firstResp.text();
        const pagingMatch = firstHtml.match(/class="workshopBrowsePagingControls"[^>]*>([\s\S]*?)<\/div>/);
        const pagingHtml = pagingMatch ? pagingMatch[1] : '';
        const pageNums = [...pagingHtml.matchAll(/>(\d+)<\/a>/g)].map(m => parseInt(m[1]));
        const totalPages = pageNums.length > 0 ? Math.max(...pageNums) : 1;

        console.log(`[${langName}] 共 ${totalPages} 页`);

        for (let page = 1; page <= totalPages; page++) {
            console.log(`[${langName}] 正在获取第 ${page}/${totalPages} 页...`);

            const url = langUrl + `&p=${page}`;
            const resp = page === 1 ? { text: () => firstHtml } : await fetch(url);
            const html = page === 1 ? firstHtml : await resp.text();

            const regex = /SharedFileBindMouseHover\s*\(\s*"[^"]+"\s*,\s*true\s*,\s*(\{[^}]+\})\s*\)/g;
            let match;
            while ((match = regex.exec(html)) !== null) {
                try {
                    const data = JSON.parse(match[1]);
                    if (data.id) {
                        const imgRegex = new RegExp(`sharedfile_${data.id}[^>]*>[\\s\\S]*?<img[^>]*src="([^"]+)"`, 'i');
                        const imgMatch = html.match(imgRegex);
                        items[data.id] = {
                            title: data.title || '',
                            description: data.description || '',
                            image: imgMatch ? imgMatch[1].replace(/&amp;/g, '&') : ''
                        };
                    }
                } catch(e) {}
            }

            if (page < totalPages) await new Promise(r => setTimeout(r, 300));
        }
        return items;
    }

    console.log('开始获取中文版本...');
    const zhItems = await fetchLang('schinese', '中文');

    console.log('开始获取英文版本...');
    const enItems = await fetchLang('english', '英文');

    // 合并数据
    const allIds = new Set([...Object.keys(zhItems), ...Object.keys(enItems)]);
    const result = [...allIds].map(id => {
        const zh = zhItems[id] || {};
        const en = enItems[id] || {};
        return {
            id,
            title: { zh: zh.title || en.title || '', en: en.title || zh.title || '' },
            description: { zh: zh.description || '', en: en.description || '' },
            image: zh.image || en.image || ''
        };
    });

    console.log(`完成！共获取 ${result.length} 个作品`);

    const json = JSON.stringify(result);
    window._workshopData = json;

    try {
        await navigator.clipboard.writeText(json);
        console.log('数据已复制到剪贴板');
    } catch(e) {
        console.log('自动复制失败，请手动执行: copy(_workshopData)');
    }
})();
