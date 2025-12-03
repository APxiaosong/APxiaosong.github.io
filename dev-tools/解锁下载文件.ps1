# ============================================
# 传奇建造队 - 数据文件解锁工具
# 自动从下载文件夹提取并解锁数据库管理器导出的文件
# ============================================

# 保持窗口打开
$Host.UI.RawUI.WindowTitle = "传奇建造队 - 数据文件解锁工具"

# 设置控制台编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 颜色输出函数
function Write-Title {
    param([string]$Text)
    Write-Host ""
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "  $('=' * ($Text.Length + 2))" -ForegroundColor DarkCyan
}

function Write-Success { param([string]$Text) Write-Host "  [OK] $Text" -ForegroundColor Green }
function Write-Info { param([string]$Text) Write-Host "  [i] $Text" -ForegroundColor Yellow }
function Write-Err { param([string]$Text) Write-Host "  [X] $Text" -ForegroundColor Red }

# 匹配的文件模式
$patterns = @("faq-data.js", "tutorial-*.js", "gallery-*.js", "workshop-*.js")

# 下载文件夹路径
$downloadPath = [Environment]::GetFolderPath("UserProfile") + "\Downloads"

Write-Title "传奇建造队 - 数据文件解锁工具"
Write-Info "下载文件夹: $downloadPath"
Write-Host ""

# 查找匹配的文件
$foundFiles = @()
foreach ($pattern in $patterns) {
    $files = Get-ChildItem -Path $downloadPath -Filter $pattern -ErrorAction SilentlyContinue
    $foundFiles += $files
}

if ($foundFiles.Count -eq 0) {
    Write-Err "未找到匹配的数据文件"
    Write-Info "请先从数据库管理器导出文件"
} else {
    Write-Info "找到 $($foundFiles.Count) 个匹配文件:"
    Write-Host ""

    # 解锁文件
    $unlockedCount = 0
    foreach ($file in $foundFiles) {
        $zone = Get-Item $file.FullName -Stream Zone.Identifier -ErrorAction SilentlyContinue
        if ($zone) {
            Unblock-File -Path $file.FullName
            Write-Success "$($file.Name)"
            $unlockedCount++
        } else {
            Write-Host "  [~] $($file.Name) (无需解锁)" -ForegroundColor DarkGray
        }
    }

    Write-Host ""
    if ($unlockedCount -gt 0) {
        Write-Host "  已解锁 $unlockedCount 个文件" -ForegroundColor Green
    } else {
        Write-Info "所有文件均无需解锁"
    }
}

Write-Host ""
Write-Host "  窗口将保持打开，可随时关闭" -ForegroundColor DarkGray
Write-Host ""

# 无限循环保持窗口
while ($true) { Start-Sleep -Seconds 60 }
