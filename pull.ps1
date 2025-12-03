try {
    Write-Host ""
    Write-Host "========== 拉取脚本 ==========" -ForegroundColor Cyan
    Write-Host ""

    # 检查 Git
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "[错误] 未检测到 Git" -ForegroundColor Red
        Write-Host "请安装 Git: https://git-scm.com/download/win"
        Read-Host "按回车键退出"
        exit 1
    }

    # 检查是否已初始化
    $isFirstTime = $false
    if (-not (Test-Path ".git")) {
        Write-Host "[提示] 首次运行，正在初始化 Git 仓库..." -ForegroundColor Yellow
        git init 2>&1 | Out-Null
        $isFirstTime = $true
    }

    # 配置远程仓库
    $repoUrl = "https://github.com/APxiaosong/APxiaosong.github.io.git"
    $remote = git remote get-url origin 2>$null
    if (-not $remote) {
        Write-Host "[配置] 设置远程仓库: $repoUrl" -ForegroundColor Yellow
        git remote add origin $repoUrl
        $isFirstTime = $true
    } elseif ($remote -ne $repoUrl) {
        Write-Host "[配置] 更新远程仓库: $repoUrl" -ForegroundColor Yellow
        git remote set-url origin $repoUrl
    }

    # 拉取
    Write-Host "正在从 GitHub 拉取..."
    if ($isFirstTime) {
        # 首次：fetch 后 checkout 主分支
        git fetch origin --progress 2>&1 | ForEach-Object { Write-Host $_ }
        git checkout -t origin/main 2>&1 | Out-Null
    } else {
        git pull --progress 2>&1 | ForEach-Object { Write-Host $_ }
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[错误] 拉取失败" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }

    Write-Host ""
    Write-Host "拉取完成！" -ForegroundColor Green
    Read-Host "按回车键退出"
}
catch {
    Write-Host "[错误] 发生异常: $_" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}
