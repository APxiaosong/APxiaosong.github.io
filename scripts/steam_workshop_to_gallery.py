"""
Steam创意工坊作品提取脚本 (Blender 4.5+ bpy)
从剪贴板读取JSON数据，生成画廊JS格式（支持中英文双语）

使用方法：
1. 打开用户的Steam创意工坊页面（第一页），如：
   https://steamcommunity.com/id/ZANE834075490/myworkshopfiles/?appid=387990
2. F12打开开发者工具 → Console标签
3. 粘贴 steam_workshop_fetch.js 脚本内容并回车执行
4. 等待脚本自动遍历所有页面（控制台会显示进度）
5. 完成后数据会自动复制到剪贴板
6. 在Blender中运行此脚本
"""

import bpy
import json
import os

# ============ 配置参数 ============
# 画廊ID（用于JS文件命名，不需要加_workshop后缀）
GALLERY_ID = "username"

# 画廊显示名称（中英文）
GALLERY_NAME_ZH = "用户名"
GALLERY_NAME_EN = "Username"

# 输出文件路径（用户下载文件夹）
OUTPUT_FILE = os.path.join(os.path.expanduser("~"), "Downloads", "workshop-{id}.js")
# ==================================


def get_clipboard():
    """从Blender剪贴板获取内容"""
    return bpy.context.window_manager.clipboard


def main():
    print("=" * 50)
    print("Steam创意工坊作品提取脚本（双语版）")
    print("=" * 50)
    print("\n正在读取剪贴板...")

    clipboard_content = get_clipboard()

    if not clipboard_content:
        print("\n错误：剪贴板为空！")
        return

    try:
        items = json.loads(clipboard_content)
    except json.JSONDecodeError:
        print("\n错误：剪贴板内容不是有效的JSON")
        print("请先在浏览器控制台运行 steam_workshop_fetch.js")
        return

    if not items:
        print("\n错误：未找到创意工坊作品")
        return

    print(f"\n找到 {len(items)} 个作品")

    works = []
    for item in items:
        image_url = item.get('image', '')
        if 'imw=200' in image_url:
            image_url = image_url.replace('imw=200', 'imw=1920').replace('imh=112', 'imh=1080')

        # 处理双语数据结构
        title = item.get('title', {})
        desc = item.get('description', {})

        # 兼容旧格式（单语言）和新格式（双语）
        if isinstance(title, dict):
            title_zh = title.get('zh', '') or title.get('en', '')
            title_en = title.get('en', '') or title.get('zh', '')
        else:
            title_zh = title_en = title or ''

        if isinstance(desc, dict):
            desc_zh = desc.get('zh', '')
            desc_en = desc.get('en', '')
        else:
            desc_zh = desc_en = desc or ''

        item_id = item.get('id', '')
        work = {
            "title": {"zh": title_zh or f"作品 {item_id}", "en": title_en or f"Work {item_id}"},
            "description": {"zh": desc_zh, "en": desc_en},
            "image": image_url,
            "link": f"https://steamcommunity.com/sharedfiles/filedetails/?id={item_id}"
        }
        if work['image']:
            works.append(work)

    js_content = f'''/**
 * {GALLERY_NAME_ZH} / {GALLERY_NAME_EN} - 创意工坊作品数据
 */
WorkshopData.register('{GALLERY_ID}', {{
    name: {{ zh: '{GALLERY_NAME_ZH}', en: '{GALLERY_NAME_EN}' }},
    works: {json.dumps(works, ensure_ascii=False, indent=8)}
}});
'''

    output_path = OUTPUT_FILE.replace("{id}", GALLERY_ID)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"\n成功！已保存到: {output_path}")
    print(f"共导出 {len(works)} 个作品")


if __name__ == "__main__":
    main()
