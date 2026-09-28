// 공개 페이지 목록: 주소별 화면 정보와 게시할 전체 주소 (export-static.js에서 사용)
// 한국어는 /..., 영어는 /en/...
const store = require('./store');
const V = require('./views');

const STATIC = ['about', 'research', 'people'];

function split(url) {
  const u = url.replace(/\/+$/, '') || '/';
  if (u === '/en' || u.startsWith('/en/')) return { lang: 'en', rest: u.slice(3) || '/' };
  return { lang: 'ko', rest: u };
}
function altOf(lang, rest) {
  return lang === 'ko' ? (rest === '/' ? '/en/' : `/en${rest}`) : rest;
}

// 주소에 해당하는 화면 정보. 공개 페이지가 아니면 null
function pageFor(url) {
  const { lang, rest } = split(url);
  const t = V.T[lang];
  const common = { lang, alt: altOf(lang, rest) };
  if (rest === '/') {
    return { ...common, title: '', active: '/', body: V.home({
      events: store.list('event').slice(0, 3),
      pubs: store.list('publication').slice(0, 3),
      news: store.list('news').slice(0, 3),
    }, lang) };
  }
  const [, first, id, more] = rest.split('/');
  if (more !== undefined) return null;
  if (STATIC.includes(first) && !id) {
    return { ...common, title: t.nav[first], active: `/${first}`, body: V[first](lang) };
  }
  const type = Object.keys(store.TYPES).find((k) => store.TYPES[k].path === first);
  if (!type) return null;
  if (!id) return { ...common, title: t.nav[first], active: `/${first}`, body: V.listPage(type, store.list(type), lang) };
  const p = store.get(id);
  if (!p || p.type !== type || p.status !== 'published') return null;
  return { ...common, title: V.loc(p, 'title', lang), active: `/${first}`, body: V.detailPage(p, { lang }) };
}

// 정적 게시할 모든 주소
function allUrls() {
  const urls = [];
  for (const b of ['', '/en']) {
    urls.push(b + '/', ...STATIC.map((s) => `${b}/${s}`));
    for (const [type, t] of Object.entries(store.TYPES)) {
      urls.push(`${b}/${t.path}`, ...store.list(type).map((p) => `${b}/${t.path}/${p.id}`));
    }
  }
  return urls;
}

function langOf(url) { return split(url).lang; }

module.exports = { pageFor, allUrls, langOf };
