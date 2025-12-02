try {
    # ============================================
    # 首次部署脚本（用完请删除此文件）
    # ============================================

    Write-Host ""
    Write-Host "========== 首次部署脚本 ==========" -ForegroundColor Cyan
    Write-Host "此脚本将完全覆盖远程仓库内容"
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""

    # 检查是否已初始化
    if (Test-Path ".git") {
        Write-Host "[错误] 检测到 .git 文件夹，说明已经初始化过了" -ForegroundColor Red
        Write-Host "如果需要重新部署，请先手动删除 .git 文件夹"
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
    Write-Host "[检查] Git 已安装" -ForegroundColor Green

    # 检查并配置 Git 用户
    $gitEmail = git config --global user.email 2>$null
    $gitName = git config --global user.name 2>$null
    
    if (-not $gitEmail -or -not $gitName) {
        Write-Host ""
        Write-Host "[提示] Git 用户信息未配置，现在进行配置" -ForegroundColor Yellow
        Write-Host ""
        
        if (-not $gitName) {
            $inputName = Read-Host "请输入你的名字（如：Zhang San）"
            if ([string]::IsNullOrWhiteSpace($inputName)) {
                Write-Host "[错误] 名字不能为空" -ForegroundColor Red
                Read-Host "按回车键退出"
                exit 1
            }
            git config --global user.name $inputName
            $gitName = $inputName
        }
        
        if (-not $gitEmail) {
            $inputEmail = Read-Host "请输入你的邮箱（如：zhangsan@example.com）"
            if ([string]::IsNullOrWhiteSpace($inputEmail)) {
                Write-Host "[错误] 邮箱不能为空" -ForegroundColor Red
                Read-Host "按回车键退出"
                exit 1
            }
            git config --global user.email $inputEmail
            $gitEmail = $inputEmail
        }
        
        Write-Host ""
    }
    Write-Host "[检查] Git 用户: $gitName <$gitEmail>" -ForegroundColor Green

    # 检查网络连接
    Write-Host "[检查] 正在测试网络连接..."
    try {
        $null = Invoke-WebRequest -Uri "https://github.com" -TimeoutSec 10 -UseBasicParsing
        Write-Host "[检查] 网络连接正常" -ForegroundColor Green
    }
    catch {
        Write-Host "[错误] 无法连接到 GitHub，请检查网络" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }

    # 下载 CNAME 文件
    Write-Host ""
    Write-Host "正在下载 CNAME 文件..."
    try {
        Invoke-WebRequest -Uri "https://raw.githubusercontent.com/APxiaosong/APxiaosong.github.io/main/CNAME" -OutFile "CNAME" -TimeoutSec 30
    }
    catch {
        Write-Host "[错误] CNAME 文件下载失败: $_" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }

    if (-not (Test-Path "CNAME") -or (Get-Item "CNAME").Length -eq 0) {
        Write-Host "[错误] CNAME 文件为空或下载失败" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
    Write-Host "[成功] CNAME 文件下载完成" -ForegroundColor Green

    # 初始化 Git 仓库
    Write-Host ""
    Write-Host "正在初始化 Git 仓库..."
    
    git init 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[错误] Git 初始化失败" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }

    git config init.defaultBranch main 2>&1 | Out-Null
    
    git remote add origin https://github.com/APxiaosong/APxiaosong.github.io.git 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[错误] 添加远程仓库失败" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }

    Write-Host "正在添加文件..."
    git add . 2>&1 | Out-Null

    Write-Host "正在创建提交..."
    git commit -m "初始化部署" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[错误] 创建提交失败" -ForegroundColor Red
        Write-Host "可能原因：没有文件可提交，或 Git 配置问题"
        Read-Host "按回车键退出"
        exit 1
    }

    git branch -M main 2>&1 | Out-Null

    # 推送到远程
    Write-Host ""
    Write-Host "正在推送到 GitHub（首次推送可能需要登录）..."
    git push -u origin main --force 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[错误] 推送失败" -ForegroundColor Red
        Write-Host "可能原因："
        Write-Host "  1. 网络连接问题"
        Write-Host "  2. 没有仓库写入权限（需要被添加为协作者）"
        Write-Host "  3. GitHub 登录失败"
        Read-Host "按回车键退出"
        exit 1
    }

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "首次部署完成！" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "之后请双击 日常更新.bat 进行日常更新"
    Write-Host "此脚本（deploy-init.ps1 和 首次部署.bat）可以删除了"
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
