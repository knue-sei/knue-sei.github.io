// GitHub Pages용 정적 사이트 만들기:  npm run export
// 공개된 글만 HTML로 만들어 _site/ 폴더에 저장 (한국어 /, 영어 /en/) + 웹 관리자(cms/ → /admin/) 포함
// GitHub Actions(.github/workflows/pages.yml)가 push 때마다 실행해 게시함
const fs = require('fs');
const path = require('path');
const store = require('../lib/store');
const V = require('../lib/views');
const P = require('../lib/pages');

const ROOT = path.join(__dirname, '..');
const OUT = process.env.EXPORT_DIR || path.join(ROOT, '_site');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(ROOT, 'uploads');

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'public'), OUT, { recursive: true });

function writeHtml(file, opts) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, V.layout(opts), 'utf8');
}

const urls = P.allUrls();
for (const url of urls) writeHtml(path.join(OUT, url, 'index.html'), P.pageFor(url));
writeHtml(path.join(OUT, '404.html'), { title: '페이지를 찾을 수 없습니다', active: '', body: V.notFound() });

// 공개 글이 참조하는 업로드 파일만 복사
for (const p of store.list(null)) {
  for (const f of [...(p.photos || []), ...(p.attachments || [])]) {
    if (!f.url || !f.url.startsWith('/uploads/')) continue;
    const name = path.basename(f.url);
    const src = path.join(UPLOAD_DIR, name);
    if (!fs.existsSync(src)) { console.warn(`※ 파일 없음: uploads/${name}`); continue; }
    fs.mkdirSync(path.join(OUT, 'uploads'), { recursive: true });
    fs.copyFileSync(src, path.join(OUT, 'uploads', name));
  }
}

fs.cpSync(path.join(ROOT, 'cms'), path.join(OUT, 'admin'), { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log(`정적 사이트를 만들었습니다: ${path.relative(ROOT, OUT) || OUT} (페이지 ${urls.length}개)`);
