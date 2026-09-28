// GitHub Pages용 정적 사이트 만들기:  npm run export
// 공개된 글만 HTML로 만들어 docs/ 폴더에 저장 (관리자 기능 제외)
const fs = require('fs');
const path = require('path');
const store = require('../lib/store');
const V = require('../lib/views');

const ROOT = path.join(__dirname, '..');
const OUT = process.env.EXPORT_DIR || path.join(ROOT, 'docs');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(ROOT, 'uploads');

store.load();
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'public'), OUT, { recursive: true });

function write(urlPath, opts) {
  const file = urlPath === '/404' ? path.join(OUT, '404.html') : path.join(OUT, urlPath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, V.layout({ ...opts, staticSite: true }), 'utf8');
}

write('/', {
  title: '', active: '/',
  body: V.home({
    events: store.list('event').slice(0, 3),
    pubs: store.list('publication').slice(0, 3),
    news: store.list('news').slice(0, 3),
  }),
});
write('/about', { title: '연구소 소개', active: '/about', body: V.about() });
write('/research', { title: '연구 분야', active: '/research', body: V.research() });
write('/people', { title: '연구진', active: '/people', body: V.people() });

// 공개 글이 참조하는 업로드 파일만 복사
const used = new Set();
for (const [type, t] of Object.entries(store.TYPES)) {
  const posts = store.list(type);
  write(`/${t.path}`, { title: t.label, active: `/${t.path}`, body: V.listPage(type, posts) });
  for (const p of posts) {
    write(`/${t.path}/${p.id}`, { title: p.title, active: `/${t.path}`, body: V.detailPage(p) });
    [...(p.photos || []), ...(p.attachments || [])]
      .filter((f) => f.url && f.url.startsWith('/uploads/'))
      .forEach((f) => used.add(path.basename(f.url)));
  }
}
for (const name of used) {
  const src = path.join(UPLOAD_DIR, name);
  if (!fs.existsSync(src)) { console.warn(`※ 파일 없음: uploads/${name}`); continue; }
  fs.mkdirSync(path.join(OUT, 'uploads'), { recursive: true });
  fs.copyFileSync(src, path.join(OUT, 'uploads', name));
}

write('/404', { title: '페이지를 찾을 수 없습니다', active: '', body: V.notFound() });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log(`정적 사이트를 만들었습니다: ${path.relative(ROOT, OUT) || OUT}`);
