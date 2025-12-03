"""
Steam截图/艺术作品提取脚本 (Blender 4.5+ bpy)
全自动获取指定用户的Steam截图或艺术作品，无需浏览器操作

使用方法：
1. 修改下方配置参数
2. 在Blender中运行此脚本
"""

import bpy
import json
import os
import urllib.request
import urllib.parse
import re
import time
import html

# ============ 配置参数 ============
# Steam用户ID（自定义URL名称或数字ID）
STEAM_USER_ID = "China-NO1"

# 内容类型: "screenshots"（截图）或 "images"（艺术作品）
CONTENT_TYPE = "screenshots"

# 游戏AppID（387990=废品机械师，留空获取全部）
APP_ID = "387990"

# 画廊ID（用于JS文件命名）
GALLERY_ID = "username"

# 画廊显示名称
GALLERY_NAME = "用户名"

# 输出文件路径
OUTPUT_FILE = os.path.join(os.path.expanduser("~"), "Downloads", "gallery-{id}.js")
# ==================================

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def fetch_url(url):
    """请求URL并返回内容"""
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read().decode('utf-8')


def get_item_ids(user_id, content_type, app_id=""):
    """获取用户所有截图/艺术作品ID"""
    if user_id.isdigit():
        base = f"https://steamcommunity.com/profiles/{user_id}/{content_type}/"
    else:
        base = f"https://steamcommunity.com/id/{user_id}/{content_type}/"

    ids = []
    seen = set()
    page = 1
    total = None

    while True:
        params = {"p": page, "sort": "newestfirst", "browsefilter": "myfiles", "view": "grid"}
        if app_id:
            params["appid"] = app_id
        url = base + "?" + urllib.parse.urlencode(params)

        print(f"正在获取第 {page} 页...")
        try:
            page_html = fetch_url(url)
        except Exception as e:
            print(f"请求失败: {e}")
            break

        # 首次获取总数
        if total is None:
            m = re.search(r'Showing \d+ - \d+ of (\d+)', page_html)
            if m:
                total = int(m.group(1))
                print(f"总数: {total}")

        # 尝试多种匹配方式
        found = re.findall(r'data-publishedfileid="(\d+)"', page_html)
        if not found:
            found = re.findall(r'sharedfiles/filedetails/\?id=(\d+)', page_html)
        if not found:
            found = re.findall(r'filedetails/\?id=(\d+)', page_html)

        if not found:
            print("没有更多了")
            break

        new_count = 0
        for fid in found:
            if fid not in seen:
                seen.add(fid)
                ids.append(fid)
                new_count += 1
        print(f"  本页找到 {len(found)} 个，新增 {new_count} 个，累计 {len(ids)} 个")

        # 检查是否已获取全部
        if total and len(ids) >= total:
            print("已获取全部")
            break

        page += 1
        time.sleep(0.5)  # 避免请求过快

    return ids


def get_item_details(item_id, content_type):
    """获取单个截图/艺术作品的高清图片和标题"""
    url = f"https://steamcommunity.com/sharedfiles/filedetails/?id={item_id}"
    try:
        page_html = fetch_url(url)

        # 提取标题
        title = ''
        if content_type == "screenshots":
            # 截图：从screenshotDescription提取
            match = re.search(r'<div class="screenshotDescription">"?([^"<]+)"?</div>', page_html)
            if match:
                title = match.group(1).strip()
            else:
                match = re.search(r'<title>[^:]+:: 截图 :: ([^<]+)</title>', page_html)
                if match:
                    title = match.group(1).strip()
        else:
            # 艺术作品：从workshopItemTitle提取
            match = re.search(r'<div class="workshopItemTitle">([^<]+)</div>', page_html)
            if match:
                title = match.group(1).strip()
            else:
                match = re.search(r'<title>[^:]+::  :: ([^<]+)</title>', page_html)
                if match:
                    title = match.group(1).strip()

        # 提取高清图片URL（保留参数以支持调整大小）
        img_match = re.search(r'href="(https://images\.steamusercontent\.com/ugc/[^"]+)', page_html)
        image = html.unescape(img_match.group(1)) if img_match else ''

        return title, image
    except Exception as e:
        print(f"  请求失败: {e}")
    return '', ''


def main():
    type_name = "截图" if CONTENT_TYPE == "screenshots" else "艺术作品"

    print("=" * 50)
    print(f"Steam{type_name}全自动提取脚本")
    print("=" * 50)

    print(f"\n获取用户 {STEAM_USER_ID} 的{type_name}列表...")
    ids = get_item_ids(STEAM_USER_ID, CONTENT_TYPE, APP_ID)

    if not ids:
        print(f"未找到{type_name}")
        return

    print(f"\n共找到 {len(ids)} 个{type_name}，开始获取详情...")

    works = []
    for i, sid in enumerate(ids):
        print(f"  [{i+1}/{len(ids)}] {sid}")
        title, image = get_item_details(sid, CONTENT_TYPE)
        if image:
            works.append({"title": title, "image": image})

    # 生成JS
    js_content = f'''/**
 * {GALLERY_NAME} - {type_name}数据
 */
GalleryData.register('{GALLERY_ID}', {{
    name: '{GALLERY_NAME}',
    works: {json.dumps(works, ensure_ascii=False, indent=8)}
}});
'''

    output_path = OUTPUT_FILE.replace("{id}", GALLERY_ID)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"\n成功！已保存到: {output_path}")
    print(f"共导出 {len(works)} 个{type_name}")


if __name__ == "__main__":
    main()
