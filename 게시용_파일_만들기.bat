@echo off
chcp 65001 > nul
cd /d "%~dp0"
if not exist node_modules call npm install --no-audit --no-fund
call npm run export
echo.
echo docs 폴더가 갱신되었습니다. GitHub Desktop 등에서 커밋 후 Push 하면 사이트에 반영됩니다.
pause
