try {
    # ============================================
    # 日常更新脚本
    # ============================================

    Write-Host ""
    Write-Host "========== 日常更新脚本 ==========" -ForegroundColor Cyan
    Write-Host ""

    # 检查是否已初始化
    if (-not (Test-Path ".git")) {
        Write-Host "[错误] 未检测到 .git 文件夹" -ForegroundColor Red
        Write-Host "请先运行 git init 初始化仓库"
        Read-Host "按回车键退出"
        exit 1
    }

    # 检查 Git 是否安装
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "[错误] 未检测到 Git" -ForegroundColor Red
        Write-Host "请安装 Git: https://git-scm.com/download/win"
        Read-Host "按回车键退出"
        exit 1
    }

    # 检查远程仓库配置
    $remote = git remote get-url origin 2>$null
    if (-not $remote) {
        Write-Host "[错误] 未配置远程仓库" -ForegroundColor Red
        Write-Host "请先运行 git remote add origin <仓库地址> 配置远程仓库"
        Read-Host "按回车键退出"
        exit 1
    }

    # 检查是否有改动
    $status = git status --porcelain 2>$null
    if (-not $status) {
        Write-Host "[提示] 没有检测到任何文件改动，无需更新" -ForegroundColor Yellow
        Read-Host "按回车键退出"
        exit 0
    }

    # 显示改动
    Write-Host "检测到以下改动：" -ForegroundColor Cyan
    Write-Host ""
    git status --short
    Write-Host ""

    # 输入提交说明
    $msg = Read-Host "请输入提交说明"

    if ([string]::IsNullOrWhiteSpace($msg)) {
        Write-Host "[错误] 提交说明不能为空" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }

    # 添加文件
    Write-Host ""
    Write-Host "正在添加文件..."
    git add . 2>&1 | Out-Null

    # 创建提交（确保中文编码正确）
    Write-Host "正在创建提交..."
    $env:LC_ALL = "C.UTF-8"
    git commit -m $msg 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[错误] 创建提交失败" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }

    # 推送
    Write-Host "正在推送到 GitHub..."
    git push --progress 2>&1 | ForEach-Object { Write-Host $_ }
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[错误] 推送失败" -ForegroundColor Red
        Write-Host "可能原因："
        Write-Host "  1. 网络连接问题"
        Write-Host "  2. 远程有新的提交，请先拉取"
        Write-Host "  3. 没有仓库写入权限"
        Read-Host "按回车键退出"
        exit 1
    }

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "部署完成！" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Read-Host "按回车键退出"
}
catch {
    Write-Host ""
    Write-Host "[错误] 发生异常: $_" -ForegroundColor Red
    Write-Host ""
    Read-Host "按回车键退出"
    exit 1
}
