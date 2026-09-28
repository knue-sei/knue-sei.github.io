# 한국교원대학교 과학교육연구소 홈페이지

- 사이트: https://knue-sei.github.io (영문판 `/en/`)
- 글 올리는 방법: **[홈페이지_사용안내.md](홈페이지_사용안내.md)**

글은 GitHub 웹사이트에서 `content/` 폴더에 파일을 추가·수정해 올립니다. main에 변경이 생기면 GitHub Actions가 사이트를 다시 만들어 1~2분 뒤 반영합니다.

## 구조

| 경로 | 내용 |
|---|---|
| `content/` | 게시글 (학술행사·간행물·소식, 글 1개 = `.md` 1개, 각 폴더의 `_양식.md` 참고) |
| `uploads/` | 글에 넣는 사진·PDF |
| `public/` | CSS·로고·최초 자료 |
| `lib/content.js` | 고정 문구: 연구 분야, 연구진, 영문 논총명 |
| `lib/views.js` | 화면 구성과 한국어·영어 문구 |

## 관리 담당자

- **글쓴이 추가**: 저장소 Settings → Collaborators → GitHub 사용자 이름으로 초대 (Write 권한)
- **게시 설정**: Settings → Pages → Source가 **GitHub Actions** 인지 확인
- **수정이 필요한 곳**
  - 연구진 영문 이름: `lib/content.js`의 `nameEn` (비어 있으면 영문판에 한글 이름 표시)
  - 논총 공식 영문명: `lib/content.js`의 `journalEn`
  - 사용 안내문 끝의 문의처: `홈페이지_사용안내.md`
