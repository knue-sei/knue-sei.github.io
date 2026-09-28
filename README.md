# 한국교원대학교 과학교육연구소 홈페이지

- 사이트: https://knue-sei.github.io (영문판 `/en/`)
- 글쓰기(웹 관리자): https://knue-sei.github.io/admin/
- 글 올리는 방법: **[홈페이지_사용안내.md](홈페이지_사용안내.md)**

main에 변경이 생기면(웹 관리자에서 게시 포함) GitHub Actions가 사이트를 다시 만들어 1~2분 뒤 반영합니다.

## 구조

| 경로 | 내용 |
|---|---|
| `content/` | 게시글 (학술행사·간행물·소식, 글 1개 = JSON 1개) |
| `uploads/` | 웹 관리자에서 올린 사진·PDF |
| `public/` | CSS·로고·최초 자료 |
| `lib/content.js` | 고정 문구: 연구 분야, 연구진, 영문 논총명 |
| `lib/views.js` | 화면 구성과 한국어·영어 문구 |
| `cms/` | 웹 관리자(Decap CMS) 설정 |

## 최초 1회 설정 (관리 담당자)

1. **Pages 켜기**: 저장소 Settings → Pages → Source: **GitHub Actions**
2. **GitHub OAuth 앱**: 조직 `knue-sei` → Settings → Developer settings → OAuth Apps → New OAuth App
   - Homepage URL `https://knue-sei.github.io`, Authorization callback URL `https://api.netlify.com/auth/done`
   - Client ID와 Client secret 메모
3. **Netlify(로그인 중계)**: https://app.netlify.com → Add new site → Deploy manually(빈 폴더) → 사이트 이름 `knue-sei-cms`
   - Site configuration → Access & security → OAuth → Install provider → GitHub → 2번의 ID·secret 입력
   - 사이트 이름이 다르면 `cms/config.yml`의 `site_domain` 수정
4. **글쓴이 추가**: 저장소 Settings → Collaborators → GitHub 사용자 이름으로 초대 (Write 권한)

## 수정이 필요한 곳

- 연구진 영문 이름: `lib/content.js`의 `nameEn` (비어 있으면 영문판에 한글 이름 표시)
- 논총 공식 영문명: `lib/content.js`의 `journalEn`
- 사용 안내문 끝의 문의처: `홈페이지_사용안내.md`

## 미리보기 (선택, Node.js 18 이상)

```
npm run export     # _site/ 에 사이트 생성
npx serve _site    # http://localhost:3000
```
