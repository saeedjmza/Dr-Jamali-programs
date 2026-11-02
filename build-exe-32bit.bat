@echo off
setlocal
title Tunnelapp 1.0 (32-bit x86) - Single-File Windows EXE Builder

echo ======================================================================
echo    Tunnelapp 1.0 - Geomechanical Tunnel Calculator
echo    Windows 32-bit (x86) Single-File Executable Builder
echo ======================================================================
echo.

cd /d "%~dp0"

set "CSC_EXE="
if exist "%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\csc.exe" set "CSC_EXE=%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
if "%CSC_EXE%"=="" if exist "%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe" set "CSC_EXE=%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if "%CSC_EXE%"=="" (
    where csc.exe >nul 2>nul
    if not errorlevel 1 set "CSC_EXE=csc.exe"
)

if not exist "build" mkdir "build"
if not exist "release" mkdir "release"
if exist "release\dist" rd /s /q "release\dist" >nul 2>nul

if not exist "build\app_assets.bundle" (
    if exist "scripts\assets.bundle" copy /y "scripts\assets.bundle" "build\app_assets.bundle" >nul 2>nul
    if exist "resources\app_assets.bundle" copy /y "resources\app_assets.bundle" "build\app_assets.bundle" >nul 2>nul
)

if not exist "dist\index.html" (
    if exist "resources\dist\index.html" (
        xcopy /e /i /y "resources\dist" "dist" >nul 2>nul
    )
)

if not exist "build\app_assets.bundle" (
    if exist "dist\index.html" (
        where node.exe >nul 2>nul
        if not errorlevel 1 call node "scripts\pack-assets.cjs"
    )
)

if exist "build\app_assets.bundle" goto :compile_32
if exist "scripts\assets.bundle" goto :compile_32
if exist "resources\app_assets.bundle" goto :compile_32
if exist "release\Tunnelapp1.0.exe" goto :package_already_ready_32

echo [ERROR] Assets not found.
pause
exit /b 1

:compile_32
if "%CSC_EXE%"=="" goto :err_no_csc_32

set "BUNDLE_FILE=build\app_assets.bundle"
if not exist "%BUNDLE_FILE%" if exist "scripts\assets.bundle" set "BUNDLE_FILE=scripts\assets.bundle"
if not exist "%BUNDLE_FILE%" if exist "resources\app_assets.bundle" set "BUNDLE_FILE=resources\app_assets.bundle"

set "ICON_PARAM="
if exist "build\icon.ico" set "ICON_PARAM=/win32icon:build\icon.ico"

call "%CSC_EXE%" /target:winexe /platform:x86 %ICON_PARAM% "/resource:%BUNDLE_FILE%,TunnelappAssets" /out:release\Tunnelapp1.0.exe /r:System.dll scripts\TunnelappLauncher.cs

if not exist "release\Tunnelapp1.0.exe" (
    call "%CSC_EXE%" /target:winexe /platform:x86 "/resource:%BUNDLE_FILE%,TunnelappAssets" /out:release\Tunnelapp1.0.exe /r:System.dll scripts\TunnelappLauncher.cs
)

if not exist "release\Tunnelapp1.0.exe" goto :err_compile_32
copy /y "release\Tunnelapp1.0.exe" "Tunnelapp1.0-Portable.exe" >nul 2>nul

:package_already_ready_32
if exist "release\Tunnelapp1.0.exe" copy /y "release\Tunnelapp1.0.exe" "Tunnelapp1.0-Portable.exe" >nul 2>nul
echo.
echo ======================================================================
echo  [SUCCESS] 32-bit Single-File Portable Executable Ready!
echo  File: Tunnelapp1.0-Portable.exe (and release\Tunnelapp1.0.exe)
echo  * 100%% Portable: No external folders needed!
echo ======================================================================
pause
exit /b 0

:err_no_csc_32
if exist "release\Tunnelapp1.0.exe" goto :package_already_ready_32
echo [ERROR] csc.exe not found.
pause
exit /b 1

:err_compile_32
if exist "release\Tunnelapp1.0.exe" goto :package_already_ready_32
echo [ERROR] 32-bit compilation failed.
pause
exit /b 1
