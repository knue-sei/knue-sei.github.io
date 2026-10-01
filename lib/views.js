// 화면 템플릿 (서버에서 HTML 생성) — 한국어(/), 영어(/en/) 두 가지
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
function base(lang) { return lang === 'en' ? '/en' : ''; }
function postUrl(p, lang = 'ko') { return `${base(lang)}/${TYPES[p.type].path}/${p.id}`; }
// 영문판에서는 *_en 값을 쓰고, 없으면 한글 값으로 대체
function loc(obj, key, lang) { return (lang === 'en' && obj[`${key}_en`]) || obj[key] || ''; }

/* ---------- 문구 ---------- */
const T = {
  ko: {
    site: '한국교원대학교 과학교육연구소', brand: '과학교육연구소', brandSub: '한국교원대학교 부설연구소',
    desc: '한국교원대학교 과학교육연구소 — 과학교육의 기초 연구를 바탕으로 교육 현장의 발전에 기여합니다.',
    skip: '본문 바로가기', menu: '메뉴', mainNav: '주 메뉴', footNav: '하단 메뉴', home: '홈으로', logoAlt: '한국교원대학교 로고',
    nav: { about: '연구소 소개', research: '연구 분야', people: '연구진', events: '학술행사', publications: '간행물', news: '소식' },
    address: '충청북도 청주시 흥덕구 강내면 태성탑연로 250 교양학관 206호', tel: 'Tel. 044-230-3468',
    switchLabel: 'English', switchLang: 'en',
    heroEyebrow: '한국교원대학교 부설연구소',
    heroTitle: '과학을 가르치는 방법을 다시 묻고, 함께 탐구합니다.',
    heroLead: '과학교육의 기초 연구를 바탕으로 교육 현장의 발전에 기여합니다. 교육과정·평가, 교수·학습, 학습자료, 교사교육, 정책을 연구하고 학술활동을 공유합니다.',
    heroBtnAbout: '연구소 소개', heroBtnEvents: '학술행사 보기', heroCaption: '2025년 포용적 STEM 교육 학술행사 현장',
    facts: ['설립', '연구 분야', '연구진'],
    secFields: '연구의 방향', secEvents: '최근 학술행사', secPubs: '최근 간행물', secNews: '최근 소식', more: '더 보기',
    emptyEvents: '등록된 학술행사가 없습니다.', emptyPubs: '등록된 간행물이 없습니다.', emptyNews: '등록된 소식이 없습니다.',
    aboutHead: '한국교원대학교 과학교육연구소',
    aboutBody: [
      '한국교원대학교 과학교육연구소는 1988년 11월 7일 설립된 대학 부설연구소입니다. 과학교육의 기초 연구를 바탕으로 교육 현장의 발전에 기여하고자 합니다.',
      '연구소는 과학교육과정과 평가, 과학 교수·학습 방법, 과학교육 학습자료, 과학교사교육 및 재교육, 과학교육 정책을 연구합니다. 학술행사와 『청람과학교육연구논총』 발간을 통해 연구 활동과 자료를 공유합니다.',
    ],
    infoHead: '기본 정보',
    info: [['설립일', '1988년 11월 7일'], ['설립 근거', '한국교원대학교 학칙'], ['설립 및 연혁', '1988년 11월: 과학교육연구소 규정 제정 및 연구소 설립']],
    toResearch: '연구 분야 보기', toPeople: '연구진 보기',
    researchHead: '과학교육을 연구하고, 교육 현장과 연결합니다.', researchLead: '연구소 규정에 명시된 다섯 가지 연구 분야를 소개합니다.',
    peopleLead: '한국교원대학교 과학교육연구소의 연구진을 소개합니다.', peopleCols: ['이름', '소속', '대학 이메일'],
    eventsLead: '연구소가 개최한 학술행사를 소개합니다.', newsLead: '연구소의 공지사항을 알려드립니다.',
    journal: '청람과학교육연구논총', pubCols: ['권호', '발행일', '자료 종류'], coverToc: '표지·목차 PDF', noFile: '자료 없음',
    back: '← 목록으로', backBtn: '목록으로', eventDate: '개최일', newsDate: '게시일', volume: '권호', pubDate: '발행일',
    photos: '행사 사진', poster: '포스터 · 자료', attach: '첨부파일', view: '보기', download: '다운로드', github: 'GitHub에서 홈페이지 수정',
    viewPdf: '표지·목차 PDF 보기', downloadPdf: '내려받기',
    nfHead: '페이지를 찾을 수 없습니다.', nfLead: '주소가 바뀌었거나 삭제된 글일 수 있습니다.', nfBtn: '홈으로',
  },
  en: {
    site: 'Science Education Research Institute, KNUE', brand: 'Science Education Research Institute', brandSub: 'Korea National University of Education',
    desc: 'Science Education Research Institute, Korea National University of Education — contributing to educational practice through fundamental research in science education.',
    skip: 'Skip to content', menu: 'Menu', mainNav: 'Main menu', footNav: 'Footer menu', home: 'Home', logoAlt: 'Korea National University of Education logo',
    nav: { about: 'About', research: 'Research', people: 'People', events: 'Events', publications: 'Publications', news: 'News' },
    address: 'Room 206, General Education Hall, 250 Taeseongtabyeon-ro, Gangnae-myeon, Heungdeok-gu, Cheongju-si, Chungcheongbuk-do, Republic of Korea', tel: 'Tel. +82-44-230-3468',
    switchLabel: '한국어', switchLang: 'ko',
    heroEyebrow: 'A research institute of Korea National University of Education',
    heroTitle: 'Rethinking how science is taught, and exploring it together.',
    heroLead: 'Grounded in fundamental research in science education, we contribute to the advancement of educational practice. We study curriculum and assessment, teaching and learning, learning materials, teacher education, and policy, and share our scholarly activities.',
    heroBtnAbout: 'About the Institute', heroBtnEvents: 'View Events', heroCaption: '2025 academic event on inclusive STEM education',
    facts: ['Founded', 'Research areas', 'Researchers'],
    secFields: 'Research Directions', secEvents: 'Recent Events', secPubs: 'Recent Publications', secNews: 'Recent News', more: 'More',
    emptyEvents: 'No events have been posted.', emptyPubs: 'No publications have been posted.', emptyNews: 'No news has been posted.',
    aboutHead: 'Science Education Research Institute, Korea National University of Education',
    aboutBody: [
      'The Science Education Research Institute is a university-affiliated research institute of Korea National University of Education, founded on November 7, 1988. Grounded in fundamental research in science education, it seeks to contribute to the advancement of educational practice.',
      `The Institute conducts research on science curriculum and assessment, science teaching and learning methods, science learning materials, science teacher education and in-service training, and science education policy. It shares its research and resources through academic events and the publication of the ${C.journalEn}.`,
    ],
    infoHead: 'Basic Information',
    info: [['Founded', 'November 7, 1988'], ['Legal basis', 'Regulations of Korea National University of Education'], ['History', 'Nov. 1988: Institute regulations enacted and the Institute established']],
    toResearch: 'Research Areas', toPeople: 'People',
    researchHead: 'Researching science education and connecting it to the classroom.', researchLead: 'The five research areas set out in the Institute’s regulations.',
    peopleLead: 'Meet the researchers of the Science Education Research Institute.', peopleCols: ['Name', 'Affiliation', 'University Email'],
    eventsLead: 'Academic events hosted by the Institute.', newsLead: 'Announcements from the Institute.',
    journal: C.journalEn, pubCols: ['Volume', 'Published', 'Materials'], coverToc: 'Cover & Contents PDF', noFile: 'No file',
    back: '← Back to list', backBtn: 'Back to list', eventDate: 'Date', newsDate: 'Posted', volume: 'Volume', pubDate: 'Published',
    photos: 'Event Photos', poster: 'Poster & Materials', attach: 'Attachments', view: 'View', download: 'Download', github: 'Edit the Website on GitHub',
    viewPdf: 'View Cover & Contents PDF', downloadPdf: 'Download',
    nfHead: 'Page not found.', nfLead: 'The address may have changed, or the post may have been removed.', nfBtn: 'Home',
  },
};
const NAV_KEYS = ['about', 'research', 'people', 'events', 'publications', 'news'];

function logoMark(t) {
  if (fs.existsSync(OFFICIAL_LOGO)) return `<img class="brand-logo" src="/assets/knue-official-logo.svg" alt="${esc(t.logoAlt)}">`;
  return `<svg class="brand-logo" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="20" cy="20" rx="15" ry="6" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(35 20 20)"/><ellipse cx="20" cy="20" rx="15" ry="6" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(-35 20 20)"/><circle cx="20" cy="20" r="3" fill="currentColor"/></svg>`;
}

// active: 언어 앞머리를 뺀 경로 (예: '/about'), alt: 다른 언어판 주소 (없으면 그 언어의 홈)
function layout({ title, active, body, bodyClass = '', lang = 'ko', alt }) {
  const t = T[lang];
  const b = base(lang);
  const nav = NAV_KEYS.map((k) =>
    `<a href="${b}/${k}"${active === `/${k}` ? ' aria-current="page"' : ''}>${t.nav[k]}</a>`).join('');
  const other = t.switchLang;
  const altHref = alt || (other === 'en' ? '/en/' : '/');
  const switchLink = `<a class="nav-lang" href="${esc(altHref)}" lang="${other}" hreflang="${other}">${t.switchLabel}</a>`;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title ? esc(title) + ' | ' : ''}${esc(t.site)}</title>
<meta name="description" content="${esc(t.desc)}">
<link rel="alternate" hreflang="${other}" href="${esc(altHref)}">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/css/style.css">
</head>
<body class="${bodyClass}${lang === 'en' ? ' lang-en' : ''}">
<a class="skip" href="#main">${t.skip}</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${b}/" aria-label="${esc(t.home)}">
      ${logoMark(t)}
      <span class="brand-text"><strong>${t.brand}</strong><small>${t.brandSub}</small></span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span><em class="sr">${t.menu}</em></button>
    <nav id="site-nav" class="site-nav" aria-label="${t.mainNav}">${nav}${switchLink}</nav>
  </div>
</header>
<main id="main">${body}</main>
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div>
      <p class="footer-name">한국교원대학교 과학교육연구소</p>
      <p class="footer-en">Science Education Research Institute, Korea National University of Education</p>
      <address class="footer-contact">${t.address}<br>${t.tel}</address>
    </div>
    <nav class="footer-nav" aria-label="${t.footNav}">${NAV_KEYS.map((k) => `<a href="${b}/${k}">${t.nav[k]}</a>`).join('')}${switchLink}<a href="https://github.com/knue-sei/knue-sei.github.io" target="_blank" rel="noopener noreferrer">${t.github}</a></nav>
  </div>
  <div class="wrap footer-copy">© ${new Date().getFullYear()} ${lang === 'en' ? 'Science Education Research Institute, KNUE' : '한국교원대학교 과학교육연구소'}</div>
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
function eventCard(p, lang) {
  const img = p.photos && p.photos[0];
  return `<article class="card event-card${img ? ' has-img' : ''}">
    ${img ? `<a class="card-img" href="${postUrl(p, lang)}" tabindex="-1" aria-hidden="true"><img src="${esc(img.url)}" alt="" loading="lazy"></a>` : ''}
    <div class="card-body">
      <p class="meta"><time datetime="${esc(p.date)}">${fmtDate(p.date)}</time></p>
      <h3><a href="${postUrl(p, lang)}">${esc(loc(p, 'title', lang))}</a></h3>
      <p class="summary">${esc(loc(p, 'summary', lang))}</p>
    </div>
  </article>`;
}
function pubCard(p, lang) {
  const t = T[lang];
  return `<article class="card pub-card">
    <div class="pub-spine" aria-hidden="true"><span>청람<br>과학교육<br>연구논총</span><b>${esc(p.volume || '')}</b></div>
    <div class="card-body">
      <p class="meta"><time datetime="${esc(p.date)}">${fmtDate(p.date)}</time> · ${(p.attachments || []).length ? t.coverToc : t.noFile}</p>
      <h3><a href="${postUrl(p, lang)}">${esc(loc(p, 'title', lang))}</a></h3>
      <p class="summary">${esc(loc(p, 'volume', lang))}</p>
    </div>
  </article>`;
}
function newsRow(p, lang) {
  const summary = loc(p, 'summary', lang);
  return `<li class="news-row">
    <time datetime="${esc(p.date)}">${fmtDate(p.date)}</time>
    <div><a href="${postUrl(p, lang)}">${esc(loc(p, 'title', lang))}</a>${summary ? `<p>${esc(summary)}</p>` : ''}</div>
  </li>`;
}

function fieldItems(lang) {
  return C.fields.map((f, i) => `<li class="field"><span class="field-no">0${i + 1}</span><h3>${esc(lang === 'en' ? f.nameEn : f.name)}</h3><p>${esc(lang === 'en' ? f.descEn : f.desc)}</p></li>`).join('');
}

/* ---------- 페이지 ---------- */
function home({ events, pubs, news }, lang = 'ko') {
  const t = T[lang];
  const b = base(lang);
  const cards = (list, fn, cls) => `<div class="${cls}">${list.map((p) => fn(p, lang)).join('')}</div>`;
  return `
<section class="hero">
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <p class="eyebrow">${t.heroEyebrow}</p>
      <h1>${t.heroTitle}</h1>
      <p class="lead">${t.heroLead}</p>
      <div class="btns">
        <a class="btn primary" href="${b}/about">${t.heroBtnAbout}</a>
        <a class="btn ghost" href="${b}/events">${t.heroBtnEvents}</a>
      </div>
    </div>
    <figure class="hero-fig">
      <img src="/assets/seminar-2025-01.jpg" alt="${esc(t.heroCaption)}">
      <figcaption>${t.heroCaption}</figcaption>
    </figure>
  </div>
  <div class="wrap hero-facts">
    <div><b>1988</b><span>${t.facts[0]}</span></div>
    <div><b>5</b><span>${t.facts[1]}</span></div>
    <div><b>9</b><span>${t.facts[2]}</span></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>${t.secFields}</h2><a class="more" href="${b}/research">${t.more}</a></div>
    <ul class="field-grid">${fieldItems(lang)}</ul>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="section-head"><h2>${t.secEvents}</h2><a class="more" href="${b}/events">${t.more}</a></div>
    ${events.length ? cards(events, eventCard, 'card-grid') : `<p class="empty">${t.emptyEvents}</p>`}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>${t.secPubs}</h2><a class="more" href="${b}/publications">${t.more}</a></div>
    ${pubs.length ? cards(pubs, pubCard, 'card-grid') : `<p class="empty">${t.emptyPubs}</p>`}
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="section-head"><h2>${t.secNews}</h2><a class="more" href="${b}/news">${t.more}</a></div>
    ${news.length ? `<ul class="news-list">${news.map((p) => newsRow(p, lang)).join('')}</ul>` : `<p class="empty">${t.emptyNews}</p>`}
  </div>
</section>`;
}

function about(lang = 'ko') {
  const t = T[lang];
  const b = base(lang);
  return pageHead(t.nav.about, t.aboutHead) + `
<section class="section"><div class="wrap narrow prose">
  ${t.aboutBody.map((p) => `<p>${esc(p)}</p>`).join('\n  ')}
  <h2>${t.infoHead}</h2>
  <div class="table-wrap"><table class="info-table">
    <tbody>
      ${t.info.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('\n      ')}
    </tbody>
  </table></div>
  <div class="btns"><a class="btn ghost" href="${b}/research">${t.toResearch}</a><a class="btn ghost" href="${b}/people">${t.toPeople}</a></div>
</div></section>`;
}

function research(lang = 'ko') {
  const t = T[lang];
  return pageHead(t.nav.research, t.researchHead, t.researchLead) + `
<section class="section"><div class="wrap"><ul class="field-grid">${fieldItems(lang)}</ul></div></section>`;
}

function people(lang = 'ko') {
  const t = T[lang];
  const aff = lang === 'en' ? C.affiliationEn : C.affiliation;
  const nm = (p) => (lang === 'en' && p.nameEn) || p.name;
  const rows = C.people.map((p) => `<tr><td class="name">${esc(nm(p))}</td><td>${esc(aff)}</td><td><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></td></tr>`).join('');
  const cards = C.people.map((p) => `<li><strong>${esc(nm(p))}</strong><span>${esc(aff)}</span><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></li>`).join('');
  return pageHead(t.nav.people, t.nav.people, t.peopleLead) + `
<section class="section"><div class="wrap narrow">
  <div class="table-wrap desktop-only"><table class="people-table">
    <thead><tr>${t.peopleCols.map((c) => `<th scope="col">${c}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
  <ul class="people-cards mobile-only">${cards}</ul>
</div></section>`;
}

function listPage(type, posts, lang = 'ko') {
  const t = T[lang];
  if (type === 'event') {
    return pageHead(t.nav.events, t.nav.events, t.eventsLead) + `
<section class="section"><div class="wrap">
  ${posts.length ? `<div class="list-stack">${posts.map((p) => eventCard(p, lang)).join('')}</div>` : `<p class="empty">${t.emptyEvents}</p>`}
</div></section>`;
  }
  if (type === 'publication') {
    const rows = posts.map((p) => `<tr>
      <td><a href="${postUrl(p, lang)}">${esc(loc(p, 'volume', lang) || loc(p, 'title', lang))}</a></td>
      <td><time datetime="${esc(p.date)}">${fmtDate(p.date)}</time></td>
      <td>${(p.attachments || []).length ? t.coverToc : '—'}</td></tr>`).join('');
    return pageHead(t.nav.publications, t.nav.publications) + `
<section class="section"><div class="wrap">
  <h2 class="list-title">${esc(t.journal)}</h2>
  ${posts.length ? `<div class="table-wrap"><table class="list-table">
    <thead><tr>${t.pubCols.map((c) => `<th scope="col">${c}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody></table></div>` : `<p class="empty">${t.emptyPubs}</p>`}
</div></section>`;
  }
  return pageHead(t.nav.news, t.nav.news, t.newsLead) + `
<section class="section"><div class="wrap narrow">
  ${posts.length ? `<ul class="news-list">${posts.map((p) => newsRow(p, lang)).join('')}</ul>` : `<p class="empty">${t.emptyNews}</p>`}
</div></section>`;
}

function fileButtons(att, t, lang) {
  return `<div class="file-row">
    <span class="file-name">${esc(loc(att, 'label', lang) || att.name)}</span>
    <span class="file-btns">
      <a class="btn small primary" href="${esc(att.url)}" target="_blank" rel="noopener">${t.view}</a>
      <a class="btn small ghost" href="${esc(att.url)}" download="${esc(att.name)}">${t.download}</a>
    </span>
  </div>`;
}

function detailPage(p, { lang = 'ko' } = {}) {
  const t = T[lang];
  const back = `${base(lang)}/${TYPES[p.type].path}`;
  const title = loc(p, 'title', lang);
  const summary = loc(p, 'summary', lang);
  const body = loc(p, 'body', lang);
  let extra = '';
  if (p.type === 'event') {
    if (p.photos && p.photos.length) {
      extra += `<h2 class="sub">${t.photos}</h2><div class="gallery">${p.photos.map((ph) =>
        `<a href="${esc(ph.url)}" target="_blank" rel="noopener"><img src="${esc(ph.url)}" alt="${esc(loc(ph, 'name', lang) || title)}" loading="lazy"></a>`).join('')}</div>`;
    }
    if (p.attachments && p.attachments.length) {
      extra += `<h2 class="sub">${t.poster}</h2>${p.attachments.map((a) => fileButtons(a, t, lang)).join('')}`;
    }
  } else if (p.type === 'publication') {
    if (p.attachments && p.attachments.length) {
      const a = p.attachments[0];
      extra += `<div class="file-actions">
        <a class="btn primary" href="${esc(a.url)}" target="_blank" rel="noopener">${t.viewPdf}</a>
        <a class="btn ghost" href="${esc(a.url)}" download="${esc(a.name)}">${t.downloadPdf}</a>
      </div>
      <div class="pdf-embed desktop-only"><iframe src="${esc(a.url)}#view=FitH" title="${esc(title)} — ${esc(t.coverToc)}"></iframe></div>`;
    }
  } else if (p.attachments && p.attachments.length) {
    extra += `<h2 class="sub">${t.attach}</h2>${p.attachments.map((a) => fileButtons(a, t, lang)).join('')}`;
  }

  const metaRows = p.type === 'publication'
    ? `<dl class="meta-list"><div><dt>${t.volume}</dt><dd>${esc(loc(p, 'volume', lang))}</dd></div><div><dt>${t.pubDate}</dt><dd>${fmtDate(p.date)}</dd></div></dl>`
    : `<dl class="meta-list"><div><dt>${p.type === 'event' ? t.eventDate : t.newsDate}</dt><dd>${fmtDate(p.date)}</dd></div></dl>`;

  return `
<article class="detail">
  <div class="wrap narrow">
    <a class="back" href="${back}">${t.back}</a>
    <p class="eyebrow">${esc(t.nav[TYPES[p.type].path])}</p>
    <h1>${esc(title)}</h1>
    ${metaRows}
    ${p.type !== 'publication' && summary ? `<p class="lead">${esc(summary)}</p>` : ''}
    ${p.type !== 'publication' && summary && body === summary ? '' : `<div class="prose">${paragraphs(body)}</div>`}
    ${extra}
    <p class="back-bottom"><a class="btn ghost" href="${back}">${t.backBtn}</a></p>
  </div>
</article>`;
}

function notFound(lang = 'ko') {
  const t = T[lang];
  return pageHead('', t.nfHead, t.nfLead) +
    `<section class="section"><div class="wrap narrow"><a class="btn primary" href="${base(lang)}/">${t.nfBtn}</a></div></section>`;
}

module.exports = { layout, home, about, research, people, listPage, detailPage, notFound, esc, fmtDate, pageHead, postUrl, loc, T };
