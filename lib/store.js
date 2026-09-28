// 게시글 읽기: content/<종류>/<글ID>.json 파일 하나에 글 하나
// 글 작성·수정은 웹 관리자(Decap CMS, /admin/)가 저장소에 직접 커밋함
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = process.env.CONTENT_DIR || path.join(__dirname, '..', 'content');

const TYPES = {
  event: { label: '학술행사', path: 'events' },
  publication: { label: '간행물', path: 'publications' },
  news: { label: '소식', path: 'news' },
};
const ID_RE = /^[A-Za-z0-9-]+$/;

let cache = null;

function readAll() {
  if (cache) return cache;
  cache = [];
  for (const [type, t] of Object.entries(TYPES)) {
    const dir = path.join(CONTENT_DIR, t.path);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const id = f.replace(/\.json$/, '');
      if (!f.endsWith('.json') || !ID_RE.test(id)) continue;
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        cache.push({ status: 'published', photos: [], attachments: [], ...data, id, type });
      } catch (e) {
        console.warn(`※ 읽을 수 없는 글 파일: content/${t.path}/${f}`);
      }
    }
  }
  return cache;
}

function byDateDesc(a, b) {
  return (b.date || '').localeCompare(a.date || '') || b.id.localeCompare(a.id, 'en', { numeric: true });
}

// 공개(published) 글만, 날짜 최신순
function list(type) {
  return readAll().filter((p) => (!type || p.type === type) && p.status === 'published').sort(byDateDesc);
}

function get(id) {
  return readAll().find((p) => p.id === String(id)) || null;
}

module.exports = { TYPES, list, get };
