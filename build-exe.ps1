# PowerShell script to build Windows .exe for Tunnelapp1.0
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   ساخت فایل اجرایی ویندوز (*.exe) - Tunnelapp 1.0" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] بررسی و نصب وابستگی‌ها..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "[خطا] خطا در اجرای npm install" -ForegroundColor Red
    Read-Host "کلید Enter را برای خروج فشار دهید"
    Exit 1
}

Write-Host "`n[2/3] بیلد فرانت‌اند و کدهای برنامه..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[خطا] خطا در اجرای npm run build" -ForegroundColor Red
    Read-Host "کلید Enter را برای خروج فشار دهید"
    Exit 1
}

Write-Host "`n[3/3] بسته‌بندی فایل اجرایی ویندوز (Tunnelapp1.0 برای نسخه‌های 64 بیتی و 32 بیتی x86)..." -ForegroundColor Yellow

if (Test-Path "node_modules\.bin\electron-builder.cmd") {
    & ".\node_modules\.bin\electron-builder.cmd" --win --config electron-builder.json
} else {
    npx --yes electron-builder --win --config electron-builder.json
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "[هشدار] ساخت پکیج کامل با مشکل مواجه شد. در حال تلاش برای نسخه پرتابل..." -ForegroundColor Yellow
    if (Test-Path "node_modules\.bin\electron-builder.cmd") {
        & ".\node_modules\.bin\electron-builder.cmd" --win portable --config electron-builder.json
    } else {
        npx --yes electron-builder --win portable --config electron-builder.json
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "[خطا] خطا در ایجاد فایل‌های EXE" -ForegroundColor Red
    Write-Host "در صورت بروز مشکل در دانلود Electron، می‌توانید مستقیماً فایل start-offline-app.bat را اجرا کنید." -ForegroundColor Cyan
    Read-Host "کلید Enter را برای خروج فشار دهید"
    Exit 1
}

# Create convenient Tunnelapp1.0.exe
if (Test-Path "release\Tunnelapp1.0-x64.exe") {
    Copy-Item -Path "release\Tunnelapp1.0-x64.exe" -Destination "release\Tunnelapp1.0.exe" -Force
} elseif (Test-Path "release\Tunnelapp1.0-Portable-x64.exe") {
    Copy-Item -Path "release\Tunnelapp1.0-Portable-x64.exe" -Destination "release\Tunnelapp1.0.exe" -Force
} elseif (Test-Path "release\Tunnelapp1.0-ia32.exe") {
    Copy-Item -Path "release\Tunnelapp1.0-ia32.exe" -Destination "release\Tunnelapp1.0.exe" -Force
}

Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host " [موفقیت] فایل Tunnelapp1.0.exe در پوشه 'release' با موفقیت ساخته شد!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green

if (Test-Path "release") {
    Invoke-Item "release"
}

Read-Host "کلید Enter را برای بستن پنجره فشار دهید"
