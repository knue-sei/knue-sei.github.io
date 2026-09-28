// 게시글 저장소: content/<종류>/<글ID>.json 파일 하나에 글 하나
// 로컬 관리자 화면과 웹 관리자(Decap CMS, /admin/)가 같은 파일을 읽고 씀
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const CONTENT_DIR = process.env.CONTENT_DIR || path.join(ROOT, 'content');
const LEGACY_DB = path.join(DATA_DIR, 'db.json');

const TYPES = {
  event: { label: '학술행사', path: 'events' },
  publication: { label: '간행물', path: 'publications' },
  news: { label: '소식', path: 'news' },
};
const ID_RE = /^[A-Za-z0-9-]+$/;

function dirOf(type) { return path.join(CONTENT_DIR, TYPES[type].path); }
function fileOf(post) { return path.join(dirOf(post.type), `${post.id}.json`); }

function writePost(post) {
  const { id, type, ...rest } = post;
  const file = fileOf(post);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file + '.tmp', JSON.stringify(rest, null, 2) + '\n', 'utf8');
  fs.renameSync(file + '.tmp', file);
}

function load() {
  for (const type of Object.keys(TYPES)) fs.mkdirSync(dirOf(type), { recursive: true });
  // 이전 방식(data/db.json)의 글을 한 번만 옮김 (기존 주소 /events/1 등 유지)
  if (fs.existsSync(LEGACY_DB) && !readAll().length) {
    const db = JSON.parse(fs.readFileSync(LEGACY_DB, 'utf8'));
    for (const p of db.posts || []) writePost({ ...p, id: String(p.id) });
    fs.renameSync(LEGACY_DB, LEGACY_DB + '.migrated');
  }
}

// 파일이 웹 관리자에서 바뀔 수 있으므로 매번 새로 읽음 (글 수가 적어 부담 없음)
function readAll() {
  const posts = [];
  for (const type of Object.keys(TYPES)) {
    const dir = dirOf(type);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const id = f.replace(/\.json$/, '');
      if (!f.endsWith('.json') || !ID_RE.test(id)) continue;
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        posts.push({ status: 'published', photos: [], attachments: [], ...data, id, type });
      } catch (e) {
        console.warn(`※ 읽을 수 없는 글 파일: ${path.relative(ROOT, path.join(dir, f))}`);
      }
    }
  }
  return posts;
}

function byDateDesc(a, b) {
  return (b.date || '').localeCompare(a.date || '') || b.id.localeCompare(a.id, 'en', { numeric: true });
}

function list(type, { includeUnpublished = false } = {}) {
  return readAll()
    .filter((p) => (!type || p.type === type) && (includeUnpublished || p.status === 'published'))
    .sort(byDateDesc);
}

function get(id) {
  return readAll().find((p) => p.id === String(id)) || null;
}

// 웹 관리자와 같은 형식의 ID: 20260928-153000
function newId() {
  const d = new Date(Date.now() + 9 * 3600 * 1000).toISOString();
  const base = d.slice(0, 10).replace(/-/g, '') + '-' + d.slice(11, 19).replace(/:/g, '');
  let id = base;
  for (let n = 2; get(id); n++) id = `${base}-${n}`;
  return id;
}

function create(data) {
  const now = new Date().toISOString();
  const post = { photos: [], attachments: [], ...data, id: newId(), createdAt: now, updatedAt: now };
  writePost(post);
  return post;
}

function update(id, data) {
  const post = get(id);
  if (!post) return null;
  Object.assign(post, data, { id: post.id, type: post.type, updatedAt: new Date().toISOString() });
  writePost(post);
  return post;
}

function remove(id) {
  const post = get(id);
  if (!post) return null;
  fs.unlinkSync(fileOf(post));
  return post;
}

module.exports = { TYPES, DATA_DIR, CONTENT_DIR, load, list, get, create, update, remove };
