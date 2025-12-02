"""
B站视频数据提取脚本 (Blender 4.5+ bpy)
从剪贴板读取API响应，生成 tutorial-data.js 格式

使用方法：
1. 打开 https://space.bilibili.com/{UID}/video
2. 按 F12 打开开发者工具，切换到 Network 标签
3. 在筛选框输入：wbi/arc/search
4. 刷新页面或滚动加载
5. 点击 wbi/arc/search 请求，切换到 Response 标签
6. 全选复制（Ctrl+A, Ctrl+C）
7. 在Blender中运行此脚本

注意：一次复制即可获取全部视频，会自动按时间从新到旧排序
"""

import bpy
import json
import os

# ============ 配置参数 ============
# 输出文件路径（用户下载文件夹）
OUTPUT_FILE = os.path.join(os.path.expanduser("~"), "Downloads", "tutorial-data.js")
# ==================================


def get_clipboard():
    """从Blender剪贴板获取内容"""
    return bpy.context.window_manager.clipboard


def parse_bilibili_response(json_str):
    """解析B站API响应"""
    try:
        data = json.loads(json_str)
        if data.get('code') == 0:
            return data.get('data', {})
    except json.JSONDecodeError as e:
        print(f"JSON解析失败: {e}")
    return None


def extract_videos(data):
    """从响应数据中提取视频列表"""
    # wbi/arc/search 结构: data.list.vlist
    if 'list' in data and isinstance(data['list'], dict):
        vlist = data['list'].get('vlist', [])
        if vlist:
            return vlist

    # media_list 结构（收藏夹/合集）
    if 'media_list' in data:
        return data.get('media_list', [])

    # archives 结构
    if 'archives' in data:
        return data.get('archives', [])

    return []


def format_video(video):
    """格式化单个视频数据"""
    bvid = video.get('bvid') or video.get('bv_id', '')
    title = video.get('title', '')
    cover = video.get('pic') or video.get('cover', '')
    desc = video.get('description') or video.get('intro') or video.get('desc', '')
    # created 是时间戳（秒）
    pubtime = video.get('created') or video.get('pubtime') or video.get('pubdate') or 0

    # 确保封面URL是完整的
    if cover and not cover.startswith('http'):
        cover = 'https:' + cover

    return {
        "bvid": bvid,
        "标题": title,
        "链接": f"https://b23.tv/{bvid}",
        "封面": cover,
        "简介": desc,
        "pubtime": pubtime
    }


def main():
    print("=" * 50)
    print("B站视频数据提取脚本")
    print("=" * 50)
    print("\n请确保已按照以下步骤操作：")
    print("1. 打开 space.bilibili.com/{UID}/video")
    print("2. F12 → Network → 筛选 'wbi/arc/search'")
    print("3. 刷新页面")
    print("4. 复制 wbi/arc/search 的 Response")
    print("\n正在读取剪贴板...")

    # 从剪贴板获取数据
    clipboard_content = get_clipboard().strip()

    if not clipboard_content:
        print("\n错误：剪贴板为空！")
        return

    # 解析JSON
    data = parse_bilibili_response(clipboard_content)

    if not data:
        print("\n错误：无法解析剪贴板内容")
        print("请确保复制的是完整的JSON响应")
        return

    # 提取视频
    videos = extract_videos(data)

    if not videos:
        print("\n错误：未找到视频数据")
        print(f"数据键: {list(data.keys())}")
        return

    print(f"\n找到 {len(videos)} 个视频")

    # 格式化并去重
    video_dict = {}
    for video in videos:
        formatted = format_video(video)
        bvid = formatted['bvid']
        if bvid:
            video_dict[bvid] = formatted

    # 按时间排序（从新到旧）
    sorted_videos = sorted(video_dict.values(), key=lambda x: x.get('pubtime', 0), reverse=True)

    # 生成最终格式（移除内部字段）
    final_videos = []
    for v in sorted_videos:
        final_videos.append({
            "标题": v["标题"],
            "链接": v["链接"],
            "封面": v["封面"],
            "简介": v["简介"],
            "tags": []
        })

    # 生成JS文件
    js_content = "const TUTORIAL_VIDEOS = \n"
    js_content += json.dumps(final_videos, ensure_ascii=False, indent=2)
    js_content += ";\n"

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"\n成功！已保存到: {OUTPUT_FILE}")
    print(f"共导出 {len(final_videos)} 个视频（按时间从新到旧排序）")


if __name__ == "__main__":
    main()
