@echo off
chcp 65001 >nul
cd /d %~dp0

if not exist node_modules (
  echo [run-dev] node_modules not found, running npm install...
  call npm install
  if errorlevel 1 (
    echo [run-dev] npm install failed.
    pause
    exit /b 1
  )
)

echo [run-dev] starting Tauri dev...
call npm run tauri dev
pause
