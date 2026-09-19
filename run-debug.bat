@echo off
chcp 65001 >nul
cd /d %~dp0

echo [run-debug] starting Tauri dev with DevTools auto-open...
echo [run-debug] DevTools opens automatically. Copy RED console text if the window is blank.
set WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--auto-open-devtools-for-tabs
call npm run tauri dev
pause
