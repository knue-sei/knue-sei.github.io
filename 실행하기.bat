@echo off
chcp 65001 > nul
cd /d "%~dp0"
where node > nul 2>&1 || (echo Node.js가 필요합니다. https://nodejs.org/ko 에서 LTS 버전을 설치하세요. & pause & exit /b 1)
if not exist node_modules (
  echo 구성요소를 설치합니다...
  call npm install --no-audit --no-fund || (pause & exit /b 1)
)
if not exist data\admin.json (
  echo 관리자 비밀번호를 설정합니다.
  call npm run set-password || (pause & exit /b 1)
)
start "" http://localhost:3000
npm start
pause
