# 한국교원대학교 과학교육연구소 홈페이지

https://knue-sei.github.io — GitHub Pages로 운영하는 연구소 홈페이지입니다.
한국어판은 `/`, 영문판은 `/en/` (상단 `English` / `한국어` 버튼으로 전환).

> 글을 올리실 교수님들은 **[홈페이지_사용안내.md](홈페이지_사용안내.md)** 를 참고해 주세요.
글은 **웹 관리자(https://knue-sei.github.io/admin/)** 에서 작성하며, 저장하면 1~2분 뒤 사이트에 반영됩니다.

## 구조

| 폴더·파일 | 내용 |
|---|---|
| `content/events`, `content/publications`, `content/news` | 게시글 (글 1개 = JSON 파일 1개) |
| `uploads/` | 관리자가 올린 사진·PDF |
| `public/` | 디자인(CSS)·로고·최초 자료(사진, 포스터, 논총 표지·목차 PDF) |
| `lib/content.js` | 고정 문구 (연구 분야, 연구진, 영문 논총명·연구진 영문 이름) |
| `lib/views.js` | 화면 구성, 한국어·영어 화면 문구 (`T.ko`, `T.en`) |
| `lib/pages.js` | 공개 페이지 주소 목록 (로컬 서버와 게시에 공통) |
| `cms/` | 웹 관리자(Decap CMS) 화면과 설정 → 사이트의 `/admin/` |
| `scripts/export-static.js` | 사이트 전체를 HTML로 생성 (`npm run export` → `_site/`) |
| `.github/workflows/pages.yml` | main에 변경이 생기면 자동으로 생성·게시 |
| `server.js` | 내 PC에서 미리보기·오프라인 관리자로 쓰는 로컬 서버 |

## 최초 1회 설정

### 1. GitHub Pages 켜기
저장소 **Settings → Pages → Build and deployment → Source: `GitHub Actions`** 선택.
이후 main에 push할 때마다 자동으로 게시됩니다. 진행 상황은 저장소 **Actions** 탭에서 확인할 수 있습니다.

### 2. 웹 관리자 로그인 설정 (GitHub 로그인 중계)
GitHub Pages에는 서버가 없어 로그인 중계 서비스가 필요합니다. 무료인 Netlify의 중계 기능만 사용합니다.

1. **GitHub OAuth 앱 만들기**: GitHub → 조직 `knue-sei` → Settings → Developer settings → OAuth Apps → New OAuth App
   - Application name: `과학교육연구소 관리자`
   - Homepage URL: `https://knue-sei.github.io`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
   - 만든 뒤 **Client ID**와 **Generate a new client secret**으로 만든 **Client secret**을 메모
2. **Netlify 사이트 만들기**: https://app.netlify.com 가입 → Add new site → Deploy manually → 아무 폴더(예: 빈 `index.html` 하나)를 끌어다 놓기
   - Site configuration → Change site name → `knue-sei-cms` (다른 이름이면 `cms/config.yml`의 `site_domain` 수정)
3. **Netlify에 GitHub 연결**: 그 사이트의 Site configuration → Access & security → OAuth → Install provider → GitHub → 1번의 Client ID / Client secret 입력
4. https://knue-sei.github.io/admin/ → **Login with GitHub**

글을 쓸 사람은 GitHub 계정이 있어야 하고, 저장소 `knue-sei/knue-sei.github.io`에 **Write 권한**이 있어야 합니다 (조직 → People 또는 저장소 Settings → Collaborators에서 추가).

## 글 작성 (웹 관리자)

1. https://knue-sei.github.io/admin/ 로그인
2. 왼쪽에서 **학술행사 / 간행물 / 소식** 선택 → **새 ○○** 또는 기존 글 선택
3. 제목·날짜·한 줄 소개·본문, 사진·PDF 입력 → **공개 여부** 선택
   - `(영문)` 칸은 영문판에 표시됩니다. 비워 두면 영문판에도 한글 내용이 나옵니다.
   - `공개`만 사이트에 표시됩니다. `임시저장`·`비공개`는 사이트에 나오지 않습니다.
4. 오른쪽 위 **Publish(게시)** → 1~2분 뒤 사이트 반영
5. 삭제는 글 화면의 **Delete entry** (확인 창 표시)

**저장소가 공개(Public)이므로 `임시저장`·`비공개` 글과 올린 파일도 GitHub에서는 누구나 볼 수 있습니다. 공개해도 되는 내용만 올려 주세요.** 사진은 JPG·PNG·WEBP·GIF, 첨부는 PDF를 사용합니다.

## 내 PC에서 미리보기 (선택)

[Node.js LTS](https://nodejs.org/ko)(18 이상) 설치 후:

```
npm install
npm run set-password   # 로컬 관리자 비밀번호 (data/admin.json에 해시로만 저장, 저장소에 올라가지 않음)
npm start              # http://localhost:3000
```

로컬 관리자에서 쓴 글도 `content/`에 저장되므로 커밋·push하면 사이트에 반영됩니다. 게시될 HTML을 직접 확인하려면 `npm run export` 후 `_site/`를 확인하세요.
