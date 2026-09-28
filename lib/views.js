// 화면 템플릿 (서버에서 HTML 생성)
const fs = require('fs');
const path = require('path');
const { TYPES } = require('./store');
const C = require('./content');

const OFFICIAL_LOGO = path.join(__dirname, '..', 'public', 'assets', 'knue-official-logo.svg');

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function fmtDate(d) { return d ? String(d).replace(/-/g, '.') : ''; }
function paragraphs(text) {
  return String(text || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
}
function postUrl(p) { return `/${TYPES[p.type].path}/${p.id}`; }

const NAV = [
  ['/about', '연구소 소개'],
  ['/research', '연구 분야'],
  ['/people', '연구진'],
  ['/events', '학술행사'],
  ['/publications', '간행물'],
  ['/news', '소식'],
];

function logoMark() {
  if (fs.existsSync(OFFICIAL_LOGO)) return '<img class="brand-logo" src="/assets/knue-official-logo.svg" alt="한국교원대학교 로고">';
  return `<svg class="brand-logo" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="20" cy="20" rx="15" ry="6" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(35 20 20)"/><ellipse cx="20" cy="20" rx="15" ry="6" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(-35 20 20)"/><circle cx="20" cy="20" r="3" fill="currentColor"/></svg>`;
}

function layout({ title, active, body, admin = false, bodyClass = '', staticSite = false }) {
  const nav = NAV.map(([href, label]) =>
    `<a href="${href}"${active === href ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  // 정적 게시본(GitHub Pages)에는 서버가 없으므로 관리자 링크를 넣지 않음
  const adminLink = staticSite ? '' : admin
    ? `<a class="nav-admin" href="/admin"${active === '/admin' ? ' aria-current="page"' : ''}>게시글 관리</a>`
    : `<a class="nav-admin" href="/admin/login"${active === '/admin' ? ' aria-current="page"' : ''}>관리자 로그인</a>`;
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title ? esc(title) + ' | ' : ''}한국교원대학교 과학교육연구소</title>
<meta name="description" content="한국교원대학교 과학교육연구소 — 과학교육의 기초 연구를 바탕으로 교육 현장의 발전에 기여합니다.">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/css/style.css">
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">본문 바로가기</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="홈으로">
      ${logoMark()}
      <span class="brand-text"><strong>과학교육연구소</strong><small>한국교원대학교 부설연구소</small></span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span><em class="sr">메뉴</em></button>
    <nav id="site-nav" class="site-nav" aria-label="주 메뉴">${nav}${adminLink}</nav>
  </div>
</header>
<main id="main">${body}</main>
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div>
      <p class="footer-name">한국교원대학교 과학교육연구소</p>
      <p class="footer-en">Science Education Research Institute, Korea National University of Education</p>
      <p class="footer-motto">과학교육의 오늘을 살피고 내일의 배움을 연구합니다.</p>
    </div>
    <nav class="footer-nav" aria-label="하단 메뉴">${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</nav>
  </div>
  <div class="wrap footer-copy">© ${new Date().getFullYear()} 한국교원대학교 과학교육연구소</div>
</footer>
<script src="/js/site.js" defer></script>
</body>
</html>`;
}

function pageHead(eyebrow, heading, lead) {
  return `<section class="page-head"><div class="wrap">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h1>${esc(heading)}</h1>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
  </div></section>`;
}

/* ---------- 목록 카드 ---------- */
function eventCard(p) {
  const img = p.photos && p.photos[0];
  return `<article class="card event-card${img ? ' has-img' : ''}">
    ${img ? `<a class="card-img" href="${postUrl(p)}" tabindex="-1" aria-hidden="true"><img src="${esc(img.url)}" alt="" loading="lazy"></a>` : ''}
    <div class="card-body">
      <p class="meta"><time datetime="${esc(p.date)}">${fmtDate(p.date)}</time></p>
      <h3><a href="${postUrl(p)}">${esc(p.title)}</a></h3>
      <p class="summary">${esc(p.summary)}</p>
    </div>
  </article>`;
}
function pubCard(p) {
  return `<article class="card pub-card">
    <div class="pub-spine" aria-hidden="true"><span>청람<br>과학교육<br>연구논총</span><b>${esc(p.volume || '')}</b></div>
    <div class="card-body">
      <p class="meta"><time datetime="${esc(p.date)}">${fmtDate(p.date)}</time> · ${(p.attachments || []).length ? '표지·목차 PDF' : '자료 없음'}</p>
      <h3><a href="${postUrl(p)}">${esc(p.title)}</a></h3>
      <p class="summary">${esc(p.volume || '')}</p>
    </div>
  </article>`;
}
function newsRow(p) {
  return `<li class="news-row">
    <time datetime="${esc(p.date)}">${fmtDate(p.date)}</time>
    <div><a href="${postUrl(p)}">${esc(p.title)}</a>${p.summary ? `<p>${esc(p.summary)}</p>` : ''}</div>
  </li>`;
}

/* ---------- 페이지 ---------- */
function home({ events, pubs, news }) {
  const fields = C.fields.map((f, i) => `<li class="field"><span class="field-no">0${i + 1}</span><h3>${esc(f.name)}</h3><p>${esc(f.desc)}</p></li>`).join('');
  return `
<section class="hero">
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <p class="eyebrow">한국교원대학교 부설연구소</p>
      <h1>과학을 가르치는 방법을 다시 묻고, 함께 탐구합니다.</h1>
      <p class="lead">과학교육의 기초 연구를 바탕으로 교육 현장의 발전에 기여합니다. 교육과정·평가, 교수·학습, 학습자료, 교사교육, 정책을 연구하고 학술활동을 공유합니다.</p>
      <div class="btns">
        <a class="btn primary" href="/about">연구소 소개</a>
        <a class="btn ghost" href="/events">학술행사 보기</a>
      </div>
    </div>
    <figure class="hero-fig">
      <img src="/assets/seminar-2025-01.jpg" alt="2025년 포용적 STEM 교육 학술행사 현장">
      <figcaption>2025년 포용적 STEM 교육 학술행사 현장</figcaption>
    </figure>
  </div>
  <div class="wrap hero-facts">
    <div><b>1988</b><span>설립</span></div>
    <div><b>5</b><span>연구 분야</span></div>
    <div><b>9</b><span>연구진</span></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>연구의 방향</h2><a class="more" href="/research">더 보기</a></div>
    <ul class="field-grid">${fields}</ul>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="section-head"><h2>최근 학술행사</h2><a class="more" href="/events">더 보기</a></div>
    ${events.length ? `<div class="card-grid">${events.map(eventCard).join('')}</div>` : '<p class="empty">등록된 학술행사가 없습니다.</p>'}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>최근 간행물</h2><a class="more" href="/publications">더 보기</a></div>
    ${pubs.length ? `<div class="card-grid">${pubs.map(pubCard).join('')}</div>` : '<p class="empty">등록된 간행물이 없습니다.</p>'}
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="section-head"><h2>최근 소식</h2><a class="more" href="/news">더 보기</a></div>
    ${news.length ? `<ul class="news-list">${news.map(newsRow).join('')}</ul>` : '<p class="empty">등록된 소식이 없습니다.</p>'}
  </div>
</section>`;
}

function about() {
  return pageHead('연구소 소개', '한국교원대학교 과학교육연구소') + `
<section class="section"><div class="wrap narrow prose">
  <p>한국교원대학교 과학교육연구소는 1988년 11월 7일 설립된 대학 부설연구소입니다. 과학교육의 기초 연구를 바탕으로 교육 현장의 발전에 기여하고자 합니다.</p>
  <p>연구소는 과학교육과정과 평가, 과학 교수·학습 방법, 과학교육 학습자료, 과학교사교육 및 재교육, 과학교육 정책을 연구합니다. 학술행사와 『청람과학교육연구논총』 발간을 통해 연구 활동과 자료를 공유합니다.</p>
  <h2>기본 정보</h2>
  <div class="table-wrap"><table class="info-table">
    <tbody>
      <tr><th scope="row">설립일</th><td>1988년 11월 7일</td></tr>
      <tr><th scope="row">설립 근거</th><td>한국교원대학교 학칙</td></tr>
      <tr><th scope="row">설립 및 연혁</th><td>1988년 11월: 과학교육연구소 규정 제정 및 연구소 설립</td></tr>
    </tbody>
  </table></div>
  <div class="btns"><a class="btn ghost" href="/research">연구 분야 보기</a><a class="btn ghost" href="/people">연구진 보기</a></div>
</div></section>`;
}

function research() {
  const items = C.fields.map((f, i) => `<li class="field"><span class="field-no">0${i + 1}</span><h3>${esc(f.name)}</h3><p>${esc(f.desc)}</p></li>`).join('');
  return pageHead('연구 분야', '과학교육을 연구하고, 교육 현장과 연결합니다.', '연구소 규정에 명시된 다섯 가지 연구 분야를 소개합니다.') + `
<section class="section"><div class="wrap"><ul class="field-grid">${items}</ul></div></section>`;
}

function people() {
  const rows = C.people.map((p) => `<tr><td class="name">${esc(p.name)}</td><td>${esc(C.affiliation)}</td><td><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></td></tr>`).join('');
  const cards = C.people.map((p) => `<li><strong>${esc(p.name)}</strong><span>${esc(C.affiliation)}</span><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></li>`).join('');
  return pageHead('연구진', '연구진', '한국교원대학교 과학교육연구소의 연구진을 소개합니다.') + `
<section class="section"><div class="wrap narrow">
  <div class="table-wrap desktop-only"><table class="people-table">
    <thead><tr><th scope="col">이름</th><th scope="col">소속</th><th scope="col">대학 이메일</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
  <ul class="people-cards mobile-only">${cards}</ul>
</div></section>`;
}

function listPage(type, posts) {
  if (type === 'event') {
    return pageHead('학술행사', '학술행사', '연구소가 개최한 학술행사를 소개합니다.') + `
<section class="section"><div class="wrap">
  ${posts.length ? `<div class="list-stack">${posts.map(eventCard).join('')}</div>` : '<p class="empty">등록된 학술행사가 없습니다.</p>'}
</div></section>`;
  }
  if (type === 'publication') {
    const rows = posts.map((p) => `<tr>
      <td><a href="${postUrl(p)}">${esc(p.volume || p.title)}</a></td>
      <td><time datetime="${esc(p.date)}">${fmtDate(p.date)}</time></td>
      <td>${(p.attachments || []).length ? '표지·목차 PDF' : '—'}</td></tr>`).join('');
    return pageHead('간행물', '간행물') + `
<section class="section"><div class="wrap">
  <h2 class="list-title">청람과학교육연구논총</h2>
  ${posts.length ? `<div class="table-wrap"><table class="list-table">
    <thead><tr><th scope="col">권호</th><th scope="col">발행일</th><th scope="col">자료 종류</th></tr></thead>
    <tbody>${rows}</tbody></table></div>` : '<p class="empty">등록된 간행물이 없습니다.</p>'}
</div></section>`;
  }
  return pageHead('소식', '소식', '연구소의 공지사항을 알려드립니다.') + `
<section class="section"><div class="wrap narrow">
  ${posts.length ? `<ul class="news-list">${posts.map(newsRow).join('')}</ul>` : '<p class="empty">등록된 소식이 없습니다.</p>'}
</div></section>`;
}

function fileButtons(att, viewLabel, dlLabel) {
  return `<div class="file-row">
    <span class="file-name">${esc(att.label || att.name)}</span>
    <span class="file-btns">
      <a class="btn small primary" href="${esc(att.url)}" target="_blank" rel="noopener">${esc(viewLabel)}</a>
      <a class="btn small ghost" href="${esc(att.url)}" download="${esc(att.name)}">${esc(dlLabel)}</a>
    </span>
  </div>`;
}

function detailPage(p, { preview = false } = {}) {
  const t = TYPES[p.type];
  const back = `/${t.path}`;
  let extra = '';
  if (p.type === 'event') {
    if (p.photos && p.photos.length) {
      extra += `<h2 class="sub">행사 사진</h2><div class="gallery">${p.photos.map((ph) =>
        `<a href="${esc(ph.url)}" target="_blank" rel="noopener"><img src="${esc(ph.url)}" alt="${esc(ph.name || p.title)}" loading="lazy"></a>`).join('')}</div>`;
    }
    if (p.attachments && p.attachments.length) {
      extra += `<h2 class="sub">포스터 · 자료</h2>${p.attachments.map((a) => fileButtons(a, '보기', '다운로드')).join('')}`;
    }
  } else if (p.type === 'publication') {
    if (p.attachments && p.attachments.length) {
      const a = p.attachments[0];
      extra += `<div class="file-actions">
        <a class="btn primary" href="${esc(a.url)}" target="_blank" rel="noopener">표지·목차 PDF 보기</a>
        <a class="btn ghost" href="${esc(a.url)}" download="${esc(a.name)}">내려받기</a>
      </div>
      <div class="pdf-embed desktop-only"><iframe src="${esc(a.url)}#view=FitH" title="${esc(p.title)} 표지·목차 PDF"></iframe></div>`;
    }
  } else if (p.attachments && p.attachments.length) {
    extra += `<h2 class="sub">첨부파일</h2>${p.attachments.map((a) => fileButtons(a, '보기', '다운로드')).join('')}`;
  }

  const metaRows = p.type === 'publication'
    ? `<dl class="meta-list"><div><dt>권호</dt><dd>${esc(p.volume || '')}</dd></div><div><dt>발행일</dt><dd>${fmtDate(p.date)}</dd></div></dl>`
    : `<dl class="meta-list"><div><dt>${p.type === 'event' ? '개최일' : '게시일'}</dt><dd>${fmtDate(p.date)}</dd></div></dl>`;

  return `
${preview || ''}
<article class="detail">
  <div class="wrap narrow">
    <a class="back" href="${back}">← 목록으로</a>
    <p class="eyebrow">${esc(t.label)}</p>
    <h1>${esc(p.title)}</h1>
    ${metaRows}
    ${p.type !== 'publication' && p.summary ? `<p class="lead">${esc(p.summary)}</p>` : ''}
    ${p.type !== 'publication' && p.summary && p.body === p.summary ? '' : `<div class="prose">${paragraphs(p.body)}</div>`}
    ${extra}
    <p class="back-bottom"><a class="btn ghost" href="${back}">목록으로</a></p>
  </div>
</article>`;
}

function notFound() {
  return pageHead('', '페이지를 찾을 수 없습니다.', '주소가 바뀌었거나 삭제된 글일 수 있습니다.') +
    '<section class="section"><div class="wrap narrow"><a class="btn primary" href="/">홈으로</a></div></section>';
}

module.exports = { layout, home, about, research, people, listPage, detailPage, notFound, esc, fmtDate, pageHead, postUrl };
