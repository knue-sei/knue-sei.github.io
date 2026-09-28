# 한국교원대학교 과학교육연구소 홈페이지

의뢰서(2026) 기준으로 만든 실제 작동하는 홈페이지입니다. Node.js 서버 하나로 공개 페이지, 게시판(학술행사·간행물·소식), 관리자 글 작성 기능이 모두 동작합니다.

## 바로 실행하기 (Windows)

1. [Node.js LTS](https://nodejs.org/ko)를 설치합니다 (18 이상).
2. 이 폴더의 **실행하기.bat**을 더블클릭합니다.
   - 처음 한 번은 구성요소 설치 후 **관리자 비밀번호(8자 이상)** 를 두 번 입력합니다.
   - 브라우저에서 http://localhost:3000 이 열립니다.

직접 명령어로 실행할 때:

```
npm install
npm run set-password      # 관리자 비밀번호 설정 (언제든 다시 실행해 변경 가능)
npm start                 # http://localhost:3000
```

## 화면 구성

| 주소 | 화면 |
|---|---|
| `/` | 홈 (연구의 방향, 최근 학술행사·간행물·소식 각 3건) |
| `/about` | 연구소 소개 + 기본 정보 표 |
| `/research` | 연구 분야 5개 |
| `/people` | 연구진 9명 (이름·소속·대학 이메일, 이메일 클릭 시 메일 작성) |
| `/events`, `/events/번호` | 학술행사 목록 / 상세 (사진, 포스터 보기·다운로드) |
| `/publications`, `/publications/번호` | 청람과학교육연구논총 목록 / 상세 (표지·목차 PDF 보기·내려받기) |
| `/news`, `/news/번호` | 공지사항 목록 / 상세 |
| `/admin/login` → `/admin` | 관리자 로그인 → 게시글 관리 |

## 관리자 비밀번호

- 비밀번호는 **처음 `실행하기.bat`을 실행할 때 직접 정한 값**입니다. 파일에는 암호화된 값만 저장되므로 원래 비밀번호를 확인할 수는 없습니다.
- 잊어버렸거나 바꾸려면 **`비밀번호_변경.bat`** 을 더블클릭해 새로 설정하세요. (사이트가 켜져 있어도 바로 적용됩니다)

## 관리자 사용법

- 상단 **관리자 로그인** → 비밀번호 입력 → **게시글 관리**
- **새 글 작성**에서 소식 / 학술행사 / 간행물 선택
- 작성 흐름: **임시저장 → 미리보기 → 공개**. 공개된 글도 수정·비공개 전환·삭제 가능(삭제 전 확인 화면 표시)
- 사진은 JPG·PNG·WEBP·GIF, 첨부는 PDF만, 파일당 30MB 이하
- 공개하는 즉시 목록과 홈의 ‘최근’ 영역에 반영됩니다.

## 저장 위치

- 게시글: `data/db.json` (첫 실행 시 행사 3건·간행물 3건이 자동 등록됨)
- 관리자 비밀번호: `data/admin.json` (scrypt 해시로만 저장, 원문 저장 안 함)
- 업로드 파일: `uploads/`
- 최초 자료: `public/assets/` (2025 행사 사진 2장, 2024 포스터 PDF, 논총 표지·목차 PDF 3건)

**백업할 폴더는 `data/`와 `uploads/` 두 개입니다.**

## 학교 서버·클라우드에 올릴 때

| 환경변수 | 설명 |
|---|---|
| `PORT` | 포트 (기본 3000) |
| `DATA_DIR` | 게시글·비밀번호 저장 폴더 (기본 `./data`) |
| `UPLOAD_DIR` | 업로드 파일 폴더 (기본 `./uploads`) |
| `SECURE_COOKIE=1` | HTTPS로 운영할 때 설정 |
| `TRUST_PROXY=1` | Nginx 등 프록시 뒤에서 운영할 때 설정 |
| `ADMIN_PASSWORD` | `set-password`를 실행할 수 없는 환경에서만 사용 |

Render·Railway 같은 클라우드는 재배포 시 디스크가 초기화될 수 있으므로 **영구 디스크(Persistent Disk)** 를 연결하고 `DATA_DIR`, `UPLOAD_DIR`을 그 경로로 지정하세요.

## GitHub Pages 게시 (knue-sei.github.io)

GitHub Pages는 정적 파일만 호스팅하므로, **글 작성은 내 PC에서 하고 결과 HTML(`docs/`)만 게시**합니다. 게시된 사이트에는 관리자 로그인 메뉴가 표시되지 않습니다.

최초 1회 설정
1. GitHub에서 조직 `knue-sei` 생성 (github.com → 우측 상단 + → New organization → Free)
2. 조직 안에 저장소 **`knue-sei.github.io`** 생성 (Public)
3. 이 폴더를 그 저장소로 push
4. 저장소 **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `/docs` → Save**
5. 1~2분 뒤 https://knue-sei.github.io 접속

글을 올릴 때마다
1. `실행하기.bat` → http://localhost:3000 관리자에서 글 작성·공개
2. `게시용_파일_만들기.bat` 실행 (`npm run export`, `docs/` 갱신)
3. 변경된 파일(`docs/`, `data/db.json`, `uploads/`)을 커밋·push → 1~2분 뒤 반영

`data/db.json`과 `uploads/`도 저장소에 함께 올라가므로 다른 PC에서 받아도 이어서 작성할 수 있습니다. 비밀번호 파일(`data/admin.json`)은 올라가지 않으니 새 PC에서는 `비밀번호_변경.bat`으로 다시 설정하세요. **저장소가 공개이므로 공개해도 되는 파일만 업로드하세요.**

## 무료 시범 배포 (Render)

1. GitHub에 새 저장소를 만들고 이 폴더의 파일을 올립니다 (`node_modules`, `data` 폴더 제외).
2. Render(render.com)에서 **New → Blueprint** → 저장소 선택 → `ADMIN_PASSWORD` 입력 → Apply.
3. 몇 분 뒤 `https://knue-sei-xxxx.onrender.com` 주소가 생깁니다.

무료 요금제 주의: 15분 동안 방문자가 없으면 잠들었다가 다음 접속 때 1분쯤 걸려 깨어납니다. 또 서버가 다시 시작되면 **관리자가 올린 글·파일이 사라지고 처음 상태(행사 3건·간행물 3건)로 돌아갑니다.** 시범용으로만 쓰세요.

## 로고

상단 로고(`public/assets/knue-official-logo.svg`)와 브라우저 탭 아이콘(`public/favicon.png`)은 한국교원대학교 UI매뉴얼(knue.ac.kr) 공식 심벌마크 EPS를 웹용 SVG로 변환한 것입니다.

## 수정할 곳

- 고정 문구(연구 분야, 연구진): `lib/content.js`
- 화면 문구·구성: `lib/views.js`
- 색상·디자인: `public/css/style.css`
