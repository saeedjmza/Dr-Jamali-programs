@echo off
setlocal
title Tunnelapp 1.0 - Android App Setup Guide

echo ======================================================================
echo    Tunnelapp 1.0 - Geomechanical Tunnel Calculator
echo    Android App and WebAPK Installation Guide
echo ======================================================================
echo.

cd /d "%~dp0"

echo Verified Live Public Android URL:
echo   https://ais-pre-fcstyvfufuog5ozewob7r4-655471265608.europe-west2.run.app
echo.
echo ======================================================================
echo  Available Options for Android:
echo ======================================================================
echo  [1] (Recommended) Direct WebAPK Install on Phone / Tablet
echo      * Installs standalone native Android app in 5 seconds with custom icon
echo      * 100%% offline capability in tunnels without internet
echo      * ZERO downloads required on your PC!
echo.
echo  [2] Generate Free Signed APK with Microsoft PWABuilder (Online)
echo      * In 30 seconds, get a signed .apk file without Java or Android Studio
echo.
echo  [3] Open Step-by-Step Persian Guide in Browser (GUIDE_FA.html)
echo.
echo  [4] Open Android Documentation (README_ANDROID_APP.md)
echo ======================================================================
echo.

set "CHOICE=1"
set /p "CHOICE=Enter choice [Default is 1]: "
if "%CHOICE%"=="" set "CHOICE=1"

if "%CHOICE%"=="1" goto :opt_pwa_guide
if "%CHOICE%"=="2" goto :opt_pwabuilder
if "%CHOICE%"=="3" goto :opt_persian_guide
if "%CHOICE%"=="4" goto :opt_readme
goto :opt_pwa_guide

:opt_pwa_guide
echo.
echo ======================================================================
echo  How to Install WebAPK directly on your Android Phone / Tablet:
echo ======================================================================
echo  1. Open this link on your phone: https://ais-pre-fcstyvfufuog5ozewob7r4-655471265608.europe-west2.run.app
echo  2. Tap the three dots menu (top-right of Chrome or Samsung Internet).
echo  3. Tap "Install App" or "Add to Home Screen".
echo  4. Confirm Install.
echo.
echo  Android automatically builds and installs a standalone WebAPK with its
echo  own icon, launching full-screen without address bars, 100%% offline!
echo ======================================================================
echo.
pause
exit /b 0

:opt_pwabuilder
echo.
echo Opening Microsoft PWABuilder with your pre-filled app URL...
start https://www.pwabuilder.com/?url=https%3A%2F%2Fais-pre-fcstyvfufuog5ozewob7r4-655471265608.europe-west2.run.app
pause
exit /b 0

:opt_persian_guide
if exist "GUIDE_FA.html" start "" "GUIDE_FA.html"
pause
exit /b 0

:opt_readme
if exist "README_ANDROID_APP.md" start notepad "README_ANDROID_APP.md"
pause
exit /b 0
