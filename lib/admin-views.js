// 관리자 화면 템플릿
const { TYPES } = require('./store');
const { esc, fmtDate, postUrl } = require('./views');

const STATUS = { draft: '임시저장', published: '공개', hidden: '비공개' };

function login({ error, configured }) {
  return `<section class="section admin-login"><div class="wrap">
  <form class="panel login-panel" method="post" action="/admin/login">
    <h1>관리자 로그인</h1>
    <p class="muted">게시글 작성·수정·삭제는 관리자만 할 수 있습니다.</p>
    ${!configured ? '<p class="alert">관리자 비밀번호가 아직 설정되지 않았습니다. 서버에서 <code>npm run set-password</code>를 먼저 실행해 주세요.</p>' : ''}
    ${error ? `<p class="alert" role="alert">${esc(error)}</p>` : ''}
    <label for="pw">비밀번호</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
    <button class="btn primary block" type="submit">로그인</button>
  </form>
</div></section>`;
}

function dashboard({ posts, type, flash }) {
  const tabs = [['', '전체'], ...Object.entries(TYPES).map(([k, v]) => [k, v.label])]
    .map(([k, l]) => `<a href="/admin${k ? `?type=${k}` : ''}"${type === k ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  const rows = posts.map((p) => `<tr>
    <td data-label="종류">${TYPES[p.type].label}</td>
    <td data-label="제목" class="t-title"><a href="/admin/posts/${p.id}/edit">${esc(p.title)}</a></td>
    <td data-label="날짜">${fmtDate(p.date)}</td>
    <td data-label="상태"><span class="badge ${p.status}">${STATUS[p.status]}</span></td>
    <td data-label="관리" class="t-actions">
      <a href="/admin/posts/${p.id}/edit">수정</a>
      <a href="/admin/posts/${p.id}/preview">미리보기</a>
      ${p.status === 'published' ? `<a href="${postUrl(p)}" target="_blank" rel="noopener">사이트에서 보기</a>` : ''}
      <form method="post" action="/admin/posts/${p.id}/status" class="inline">
        <input type="hidden" name="status" value="${p.status === 'published' ? 'hidden' : 'published'}">
        <button type="submit" class="linkbtn">${p.status === 'published' ? '비공개로' : '공개하기'}</button>
      </form>
      <a class="danger" href="/admin/posts/${p.id}/delete">삭제</a>
    </td></tr>`).join('');
  return `<section class="section admin"><div class="wrap">
  <div class="admin-top">
    <h1>게시글 관리</h1>
    <form method="post" action="/admin/logout"><button class="btn small ghost" type="submit">로그아웃</button></form>
  </div>
  ${flash ? `<p class="notice" role="status">${esc(flash)}</p>` : ''}
  <div class="new-row">
    <span>새 글 작성</span>
    <a class="btn small primary" href="/admin/new/news">소식</a>
    <a class="btn small primary" href="/admin/new/event">학술행사</a>
    <a class="btn small primary" href="/admin/new/publication">간행물</a>
  </div>
  <nav class="tabs" aria-label="종류 선택">${tabs}</nav>
  ${posts.length ? `<div class="table-wrap"><table class="admin-table">
    <thead><tr><th>종류</th><th>제목</th><th>날짜</th><th>상태</th><th>관리</th></tr></thead>
    <tbody>${rows}</tbody></table></div>` : '<p class="empty">등록된 글이 없습니다.</p>'}
</div></section>`;
}

function fileList(items, field, kind) {
  if (!items || !items.length) return '';
  return `<ul class="existing-files">${items.map((f, i) => `<li>
    ${kind === 'photo' ? `<img src="${esc(f.url)}" alt="">` : '<span class="pdf-ico">PDF</span>'}
    <a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.name)}</a>
    <label class="rm"><input type="checkbox" name="${field}" value="${i}"> 삭제</label>
  </li>`).join('')}</ul>`;
}

function form({ type, post = {}, error }) {
  const t = TYPES[type];
  const isNew = !post.id;
  const dateLabel = type === 'event' ? '개최일' : type === 'publication' ? '발행일' : '게시일';
  const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const status = post.status || 'draft';
  const action = isNew ? `/admin/new/${type}` : `/admin/posts/${post.id}/edit`;

  let files = '';
  if (type === 'event') {
    files = `<fieldset><legend>행사 사진 (여러 장 가능)</legend>
      ${fileList(post.photos, 'removePhoto', 'photo')}
      <input type="file" name="photos" accept="image/jpeg,image/png,image/webp,image/gif" multiple>
      <p class="hint">JPG·PNG·WEBP·GIF, 파일당 30MB 이하. 첫 번째 사진이 목록의 대표 사진이 됩니다.</p>
    </fieldset>
    <fieldset><legend>포스터 / PDF (있는 경우)</legend>
      ${fileList(post.attachments, 'removeAttachment', 'pdf')}
      <input type="file" name="attachments" accept="application/pdf" multiple>
    </fieldset>`;
  } else if (type === 'publication') {
    files = `<fieldset><legend>표지·목차 PDF</legend>
      ${fileList(post.attachments, 'removeAttachment', 'pdf')}
      <input type="file" name="attachments" accept="application/pdf">
      <p class="hint">표지·목차 공개본만 올려 주세요. 새 파일을 올리면 기존 파일과 함께 표시되니 교체 시 기존 파일은 ‘삭제’에 체크하세요.</p>
    </fieldset>`;
  } else {
    files = `<fieldset><legend>첨부 PDF (필요한 경우)</legend>
      ${fileList(post.attachments, 'removeAttachment', 'pdf')}
      <input type="file" name="attachments" accept="application/pdf" multiple>
    </fieldset>`;
  }

  const buttons = status === 'published'
    ? `<button class="btn primary" name="action" value="save">변경사항 저장 (공개 유지)</button>
       <button class="btn ghost" name="action" value="preview">저장 후 미리보기</button>
       <button class="btn ghost" name="action" value="hide">비공개로 전환</button>`
    : `<button class="btn ghost" name="action" value="draft">임시저장</button>
       <button class="btn ghost" name="action" value="preview">미리보기</button>
       <button class="btn primary" name="action" value="publish">공개</button>`;

  return `<section class="section admin"><div class="wrap narrow">
  <a class="back" href="/admin?type=${type}">← 게시글 관리</a>
  <h1>${esc(t.label)} ${isNew ? '새 글 작성' : '수정'}</h1>
  ${!isNew ? `<p class="muted">현재 상태: <span class="badge ${status}">${STATUS[status]}</span></p>` : ''}
  ${error ? `<p class="alert" role="alert">${esc(error)}</p>` : ''}
  <form class="panel post-form" method="post" action="${action}" enctype="multipart/form-data">
    <label for="f-title">제목 <b>*</b></label>
    <input id="f-title" name="title" value="${esc(post.title || '')}" required maxlength="200">
    <label for="f-title-en">제목 (영문)</label>
    <input id="f-title-en" name="title_en" value="${esc(post.title_en || '')}" maxlength="200" lang="en">
    <div class="two">
      <div><label for="f-date">${dateLabel} <b>*</b></label>
      <input id="f-date" type="date" name="date" value="${esc(post.date || today)}" required></div>
      ${type === 'publication' ? `<div><label for="f-vol">권호 <b>*</b></label>
      <input id="f-vol" name="volume" value="${esc(post.volume || '')}" placeholder="예: 제30권 1호" required></div>
      <div><label for="f-vol-en">권호 (영문)</label>
      <input id="f-vol-en" name="volume_en" value="${esc(post.volume_en || '')}" placeholder="예: Vol. 30, No. 1" lang="en"></div>` : ''}
    </div>
    <label for="f-sum">한 줄 소개</label>
    <input id="f-sum" name="summary" value="${esc(post.summary || '')}" maxlength="300">
    <label for="f-sum-en">한 줄 소개 (영문)</label>
    <input id="f-sum-en" name="summary_en" value="${esc(post.summary_en || '')}" maxlength="300" lang="en">
    <label for="f-body">본문</label>
    <textarea id="f-body" name="body" rows="10">${esc(post.body || '')}</textarea>
    <label for="f-body-en">본문 (영문)</label>
    <textarea id="f-body-en" name="body_en" rows="6" lang="en">${esc(post.body_en || '')}</textarea>
    <p class="hint">빈 줄로 문단을 나눕니다. 영문 칸을 비워 두면 영문판(/en/)에 한글 내용이 표시됩니다.</p>
    ${files}
    <div class="form-actions">${buttons}</div>
  </form>
</div></section>`;
}

function confirmDelete(p) {
  return `<section class="section admin"><div class="wrap narrow">
  <form class="panel" method="post" action="/admin/posts/${p.id}/delete">
    <h1>글을 삭제할까요?</h1>
    <p><strong>${esc(p.title)}</strong> (${TYPES[p.type].label}, ${fmtDate(p.date)})</p>
    <p class="alert">삭제하면 글과 첨부파일이 모두 지워지며 되돌릴 수 없습니다. 잠시 숨기려면 ‘비공개’를 사용하세요.</p>
    <div class="form-actions">
      <a class="btn ghost" href="/admin?type=${p.type}">취소</a>
      <button class="btn danger" type="submit">삭제</button>
    </div>
  </form>
</div></section>`;
}

function previewBar(p) {
  return `<div class="preview-bar"><div class="wrap">
    <span><strong>미리보기</strong> · 현재 상태: ${STATUS[p.status]}${p.status === 'published' ? '' : ' (방문자에게 보이지 않음)'}</span>
    <span class="pv-actions">
      <a class="btn small ghost" href="/admin/posts/${p.id}/edit">수정으로 돌아가기</a>
      ${p.status !== 'published' ? `<form method="post" action="/admin/posts/${p.id}/status" class="inline"><input type="hidden" name="status" value="published"><button class="btn small primary" type="submit">공개하기</button></form>` : ''}
    </span>
  </div></div>`;
}

function errorPage(msg) {
  return `<section class="section"><div class="wrap narrow"><div class="panel"><h1>처리할 수 없습니다</h1><p class="alert">${esc(msg)}</p><p><a class="btn ghost" href="javascript:history.back()">뒤로 가기</a></p></div></div></section>`;
}

module.exports = { login, dashboard, form, confirmDelete, previewBar, errorPage };
