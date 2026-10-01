# 작업 규칙

## 작업 기록(worklog) 필수

- 요청을 처리할 때마다 **반드시** `worklog/` 폴더에 작업 기록을 남긴다. 응답을 마치기 전에 기록 파일을 먼저 작성한다.
- 파일명·형식은 [worklog/README.md](worklog/README.md) 규약을 따른다.
  - 파일명: `worklog/YYYY-MM-DD-HHMM.md` (KST 기준, 1개 작업 단위 = 파일 1개)
  - 본문: `## 작업내용`, `## 인공지능 활용`(회사·모델·도구/환경·요청사항·실행사항)
  - 확인·검증한 내용이 있으면 `## 확인` 절에 함께 적는다.
- 시각은 KST로 적는다(Windows에서는 PowerShell `Get-Date -Format "yyyy-MM-dd HH:mm"`로 확인).
- 커밋·푸시를 하는 작업이면 작업 기록 파일도 같은 커밋에 포함한다.
