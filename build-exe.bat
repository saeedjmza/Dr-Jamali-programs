@echo off
setlocal
title Tunnelapp 1.0 - Windows Single-File Executable Builder

echo ======================================================================
echo    Tunnelapp 1.0 - Geomechanical Tunnel Calculator
echo    Windows Standalone Single-File EXE Builder (100%% Offline)
echo ======================================================================
echo.

cd /d "%~dp0"

REM 1. Detect Windows built-in C# Compiler (csc.exe)
set "CSC_EXE="
if exist "%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe" set "CSC_EXE=%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if "%CSC_EXE%"=="" if exist "%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\csc.exe" set "CSC_EXE=%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
if "%CSC_EXE%"=="" (
    where csc.exe >nul 2>nul
    if not errorlevel 1 set "CSC_EXE=csc.exe"
)

REM 2. Prepare directories
if not exist "build" mkdir "build"
if not exist "release" mkdir "release"
if exist "release\dist" rd /s /q "release\dist" >nul 2>nul

REM 3. Restore asset bundle from alternate locations if missing in build/
if not exist "build\app_assets.bundle" (
    if exist "scripts\assets.bundle" copy /y "scripts\assets.bundle" "build\app_assets.bundle" >nul 2>nul
    if exist "resources\app_assets.bundle" copy /y "resources\app_assets.bundle" "build\app_assets.bundle" >nul 2>nul
)

REM 4. Restore web assets if missing
if not exist "dist\index.html" (
    if exist "resources\dist\index.html" (
        echo Restoring web distribution files from resources\dist...
        xcopy /e /i /y "resources\dist" "dist" >nul 2>nul
    )
)

REM 5. If bundle still missing but dist exists, package bundle with node
if not exist "build\app_assets.bundle" (
    if exist "dist\index.html" (
        where node.exe >nul 2>nul
        if not errorlevel 1 (
            echo Packaging web assets into standalone bundle...
            call node "scripts\pack-assets.cjs"
        )
    )
)

REM 6. If bundle exists, proceed to compilation
if exist "build\app_assets.bundle" goto :compile_exe
if exist "scripts\assets.bundle" goto :compile_exe
if exist "resources\app_assets.bundle" goto :compile_exe

REM 7. If pre-built release EXE already exists and bundle is missing, we are ready!
if exist "release\Tunnelapp1.0.exe" goto :package_already_ready

echo [ERROR] Pre-compiled assets could not be located.
echo Please make sure you unzipped all files from the download archive.
pause
exit /b 1

:compile_exe
if "%CSC_EXE%"=="" goto :err_no_csc

set "BUNDLE_FILE=build\app_assets.bundle"
if not exist "%BUNDLE_FILE%" if exist "scripts\assets.bundle" set "BUNDLE_FILE=scripts\assets.bundle"
if not exist "%BUNDLE_FILE%" if exist "resources\app_assets.bundle" set "BUNDLE_FILE=resources\app_assets.bundle"

set "ICON_PARAM="
if exist "build\icon.ico" set "ICON_PARAM=/win32icon:build\icon.ico"
if "%ICON_PARAM%"=="" if exist "public\favicon.ico" set "ICON_PARAM=/win32icon:public\favicon.ico"

echo [Compiling] Building standalone single-file Tunnelapp1.0.exe...
echo Native Compiler: "%CSC_EXE%"
echo Embedded Bundle: "%BUNDLE_FILE%"

call "%CSC_EXE%" /target:winexe %ICON_PARAM% "/resource:%BUNDLE_FILE%,TunnelappAssets" /out:release\Tunnelapp1.0.exe /r:System.dll scripts\TunnelappLauncher.cs

if not exist "release\Tunnelapp1.0.exe" (
    echo Retrying compilation without icon...
    call "%CSC_EXE%" /target:winexe "/resource:%BUNDLE_FILE%,TunnelappAssets" /out:release\Tunnelapp1.0.exe /r:System.dll scripts\TunnelappLauncher.cs
)

if not exist "release\Tunnelapp1.0.exe" goto :err_compile
copy /y "release\Tunnelapp1.0.exe" "Tunnelapp1.0-Portable.exe" >nul 2>nul

:package_already_ready
if exist "release\Tunnelapp1.0.exe" copy /y "release\Tunnelapp1.0.exe" "Tunnelapp1.0-Portable.exe" >nul 2>nul
echo.
echo ======================================================================
echo  [SUCCESS] 100%% Standalone Single-File Portable Executable Ready!
echo.
echo  Portable Executable File:
echo    - Tunnelapp1.0-Portable.exe
echo    - release\Tunnelapp1.0.exe
echo.
echo  * 100%% Portable Single-File EXE:
echo    You can copy ONLY "Tunnelapp1.0-Portable.exe" to your Desktop,
echo    USB flash drive, or any other computer.
echo  * NO external folders (no dist, no node_modules) or files required!
echo  * Double-click to run in a dedicated, high-performance window.
echo ======================================================================
echo.
pause
exit /b 0

:err_no_csc
if exist "release\Tunnelapp1.0.exe" goto :package_already_ready
echo [ERROR] Windows .NET C# compiler (csc.exe) was not found.
pause
exit /b 1

:err_compile
if exist "release\Tunnelapp1.0.exe" goto :package_already_ready
echo [ERROR] Compilation failed.
pause
exit /b 1
