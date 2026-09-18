@echo off
setlocal
chcp 65001 >nul
cd /d %~dp0

if not exist node_modules (
  echo [build-exe] node_modules not found, running npm install...
  call npm install
  if errorlevel 1 (
    echo [build-exe] npm install failed.
    pause
    exit /b 1
  )
)

echo [build-exe] building Tauri release, this takes a while...
call npx tauri build
if errorlevel 1 (
  echo [build-exe] build failed.
  pause
  exit /b 1
)

if not exist dist mkdir dist
set COPIED=0
for %%F in ("src-tauri\target\release\bundle\nsis\*.exe") do (
  copy /y "%%F" "dist\" >nul
  echo [build-exe] copied %%~nxF
  set COPIED=1
)
for %%F in ("src-tauri\target\release\bundle\msi\*.msi") do (
  copy /y "%%F" "dist\" >nul
  echo [build-exe] copied %%~nxF
  set COPIED=1
)
if "%COPIED%"=="0" (
  echo [build-exe] no installer found under src-tauri\target\release\bundle.
  pause
  exit /b 1
)

echo [build-exe] done. Files in dist\:
dir /b dist\*.exe dist\*.msi
pause
