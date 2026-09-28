// 게시글 저장소: data/db.json 파일에 저장 (서버 재시작 후에도 유지)
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const TYPES = {
  event: { label: '학술행사', path: 'events' },
  publication: { label: '간행물', path: 'publications' },
  news: { label: '소식', path: 'news' },
};

// 흑백 스캔 이미지는 사용하지 않음 (컬러 원본이 생기면 관리자 화면에서 등록)
const GRAYSCALE_URLS = [
  '/assets/seminar-2024-poster.jpg', '/assets/seminar-2024-zoom-01.jpg', '/assets/seminar-2024-zoom-02.jpg',
  '/assets/seminar-2023-banner.jpg', '/assets/seminar-2023-zoom.jpg',
];
const SEED_VERSION = 3;

function seed() {
  const now = new Date().toISOString();
  const base = { status: 'published', createdAt: now, updatedAt: now, photos: [], attachments: [] };
  return {
    seedVersion: SEED_VERSION,
    nextId: 7,
    posts: [
      {
        ...base, id: 1, type: 'event', date: '2025-04-03',
        title: 'Bridging Gaps: The Pursuit of Inclusive and Equitable STEM Education',
        summary: '포용적이고 공정한 STEM 교육을 주제로 진행된 학술행사입니다.',
        body: '포용적이고 공정한 STEM 교육을 주제로 진행된 학술행사입니다.',
        photos: [
          { url: '/assets/seminar-2025-01.jpg', name: '2025 학술행사 현장 사진 1' },
          { url: '/assets/seminar-2025-02.jpg', name: '2025 학술행사 현장 사진 2' },
        ],
      },
      {
        ...base, id: 2, type: 'event', date: '2024-01-12',
        title: 'Generative AI & Education',
        summary: '생성형 AI와 교육을 주제로 개최한 학술행사입니다.',
        body: '생성형 AI와 교육을 주제로 개최한 학술행사입니다.',
        attachments: [
          { url: '/assets/seminar-2024-generative-ai-poster.pdf', name: 'Generative AI & Education 행사 포스터.pdf', label: '행사 포스터' },
        ],
      },
      {
        ...base, id: 3, type: 'event', date: '2023-08-02',
        title: '생성형AI 시대의 교수학습 방향과 실제',
        summary: '생성형 AI 시대의 교수·학습 방향과 실제를 주제로 개최한 학술행사입니다.',
        body: '생성형 AI 시대의 교수·학습 방향과 실제를 주제로 개최한 학술행사입니다.',
      },
      {
        ...base, id: 4, type: 'publication', date: '2024-06-30', volume: '제29권 1호',
        title: '청람과학교육연구논총 제29권 1호',
        summary: '청람과학교육연구논총 제29권 1호의 표지·목차 자료입니다.',
        body: '청람과학교육연구논총 제29권 1호의 표지·목차 자료입니다.',
        attachments: [{ url: '/assets/journal-2024-29-1-cover-toc.pdf', name: '청람과학교육연구논총_제29권1호_표지목차.pdf', label: '표지·목차 PDF' }],
      },
      {
        ...base, id: 5, type: 'publication', date: '2023-06-30', volume: '제28권 1호',
        title: '청람과학교육연구논총 제28권 1호',
        summary: '청람과학교육연구논총 제28권 1호의 표지·목차 자료입니다.',
        body: '청람과학교육연구논총 제28권 1호의 표지·목차 자료입니다.',
        attachments: [{ url: '/assets/journal-2023-28-1-cover-toc.pdf', name: '청람과학교육연구논총_제28권1호_표지목차.pdf', label: '표지·목차 PDF' }],
      },
      {
        ...base, id: 6, type: 'publication', date: '2022-12-31', volume: '제27권',
        title: '청람과학교육연구논총 제27권',
        summary: '청람과학교육연구논총 제27권의 표지·목차 자료입니다.',
        body: '청람과학교육연구논총 제27권의 표지·목차 자료입니다.',
        attachments: [{ url: '/assets/journal-2022-27-cover-toc.pdf', name: '청람과학교육연구논총_제27권_표지목차.pdf', label: '표지·목차 PDF' }],
      },
    ],
  };
}

let db;

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    db = seed();
    save();
  } else {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    migrate();
  }
}

// 이전 버전에서 자동으로 넣었던 흑백 스캔 이미지를 제거
function migrate() {
  if ((db.seedVersion || 1) >= SEED_VERSION) return;
  for (const p of db.posts) {
    if (p.photos) p.photos = p.photos.filter((ph) => !GRAYSCALE_URLS.includes(ph.url));
  }
  db.seedVersion = SEED_VERSION;
  save();
}

function save() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, DB_FILE);
}

function byDateDesc(a, b) {
  return (b.date || '').localeCompare(a.date || '') || b.id - a.id;
}

function list(type, { includeUnpublished = false } = {}) {
  return db.posts
    .filter((p) => (!type || p.type === type) && (includeUnpublished || p.status === 'published'))
    .sort(byDateDesc);
}

function get(id) {
  return db.posts.find((p) => p.id === Number(id)) || null;
}

function create(data) {
  const now = new Date().toISOString();
  const post = { photos: [], attachments: [], ...data, id: db.nextId++, createdAt: now, updatedAt: now };
  db.posts.push(post);
  save();
  return post;
}

function update(id, data) {
  const post = get(id);
  if (!post) return null;
  Object.assign(post, data, { updatedAt: new Date().toISOString() });
  save();
  return post;
}

function remove(id) {
  const i = db.posts.findIndex((p) => p.id === Number(id));
  if (i < 0) return null;
  const [post] = db.posts.splice(i, 1);
  save();
  return post;
}

module.exports = { TYPES, DATA_DIR, load, list, get, create, update, remove };
