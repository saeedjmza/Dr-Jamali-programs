@echo off
setlocal
title Tunnelapp 1.0 - Instant Offline Desktop App

echo ======================================================================
echo    Tunnelapp 1.0 - Geomechanical Tunnel Calculator
echo    Instant Offline Desktop Launcher (100%% Offline)
echo ======================================================================
echo.

cd /d "%~dp0"

if exist "release\Tunnelapp1.0.exe" (
    echo Launching standalone executable...
    start "" "release\Tunnelapp1.0.exe"
    exit /b 0
)

if not exist "dist\index.html" (
    if exist "resources\dist\index.html" (
        xcopy /e /i /y "resources\dist" "dist" >nul 2>nul
    )
)

set "INDEX_PATH=%~dp0dist\index.html"
if not exist "%INDEX_PATH%" set "INDEX_PATH=%~dp0resources\dist\index.html"

if exist "%INDEX_PATH%" goto :launch_ready

echo [ERROR] Web distribution files not found.
pause
exit /b 1

:launch_ready
echo Launching Tunnelapp 1.0 in standalone desktop window...
set "APP_URL=file:///%INDEX_PATH:\=/%"

if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL%" --allow-file-access-from-files
    exit /b 0
)
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL%" --allow-file-access-from-files
    exit /b 0
)
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="%APP_URL%" --allow-file-access-from-files
    exit /b 0
)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app="%APP_URL%" --allow-file-access-from-files
    exit /b 0
)

start "" "%INDEX_PATH%"
exit /b 0
