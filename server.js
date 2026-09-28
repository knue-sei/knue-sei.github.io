// 한국교원대학교 과학교육연구소 홈페이지 서버
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');

const store = require('./lib/store');
const auth = require('./lib/auth');
const V = require('./lib/views');
const A = require('./lib/admin-views');

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
const SECURE_COOKIE = process.env.SECURE_COOKIE === '1';

store.load();
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '1h' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// 모든 화면에서 관리자 여부 확인
app.use((req, res, next) => { res.locals.admin = auth.isAdmin(req); next(); });

function render(res, opts, status = 200) {
  res.status(status).type('html').send(V.layout({ admin: res.locals.admin, ...opts }));
}

/* =================== 공개 페이지 =================== */
app.get('/', (req, res) => {
  render(res, {
    title: '', active: '/',
    body: V.home({
      events: store.list('event').slice(0, 3),
      pubs: store.list('publication').slice(0, 3),
      news: store.list('news').slice(0, 3),
    }),
  });
});
app.get('/about', (req, res) => render(res, { title: '연구소 소개', active: '/about', body: V.about() }));
app.get('/research', (req, res) => render(res, { title: '연구 분야', active: '/research', body: V.research() }));
app.get('/people', (req, res) => render(res, { title: '연구진', active: '/people', body: V.people() }));

for (const [type, t] of Object.entries(store.TYPES)) {
  app.get(`/${t.path}`, (req, res) => {
    render(res, { title: t.label, active: `/${t.path}`, body: V.listPage(type, store.list(type)) });
  });
  app.get(`/${t.path}/:id(\\d+)`, (req, res) => {
    const p = store.get(req.params.id);
    if (!p || p.type !== type || p.status !== 'published') return notFound(res);
    render(res, { title: p.title, active: `/${t.path}`, body: V.detailPage(p) });
  });
}

/* =================== 관리자 =================== */
function requireAdmin(req, res, next) {
  if (!res.locals.admin) return res.redirect('/admin/login');
  next();
}

app.get('/admin/login', (req, res) => {
  if (res.locals.admin) return res.redirect('/admin');
  render(res, { title: '관리자 로그인', active: '/admin', body: A.login({ configured: auth.isConfigured() }) });
});

app.post('/admin/login', (req, res) => {
  const ip = req.ip;
  if (auth.tooManyAttempts(ip)) {
    return render(res, { title: '관리자 로그인', active: '/admin', body: A.login({ configured: true, error: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해 주세요.' }) }, 429);
  }
  if (!auth.checkPassword(req.body.password)) {
    auth.recordFailure(ip);
    return render(res, { title: '관리자 로그인', active: '/admin', body: A.login({ configured: auth.isConfigured(), error: '비밀번호가 올바르지 않습니다.' }) }, 401);
  }
  auth.issueCookie(res, SECURE_COOKIE);
  res.redirect('/admin');
});

app.post('/admin/logout', (req, res) => { auth.clearCookie(res); res.redirect('/'); });

app.get('/admin', requireAdmin, (req, res) => {
  const type = store.TYPES[req.query.type] ? req.query.type : '';
  const flash = { saved: '저장되었습니다.', deleted: '삭제되었습니다.', published: '공개되었습니다.', hidden: '비공개로 전환되었습니다.' }[req.query.msg];
  render(res, { title: '게시글 관리', active: '/admin', body: A.dashboard({ posts: store.list(type || null, { includeUnpublished: true }), type, flash }) });
});

// 파일 업로드 설정
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 30 * 1024 * 1024, files: 30 },
  fileFilter: (req, file, cb) => {
    // 한글 파일명 복원
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const img = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) && /\.(jpe?g|png|webp|gif)$/i.test(file.originalname);
    const pdf = file.mimetype === 'application/pdf' && /\.pdf$/i.test(file.originalname);
    if (file.fieldname === 'photos' && img) return cb(null, true);
    if (file.fieldname === 'attachments' && pdf) return cb(null, true);
    cb(new Error(file.fieldname === 'photos' ? '사진은 JPG·PNG·WEBP·GIF 파일만 올릴 수 있습니다.' : '첨부파일은 PDF만 올릴 수 있습니다.'));
  },
}).fields([{ name: 'photos', maxCount: 20 }, { name: 'attachments', maxCount: 10 }]);

function handleUpload(req, res, next) {
  upload(req, res, (err) => {
    if (!err) return next();
    cleanupFiles(req.files);
    const msg = err.code === 'LIMIT_FILE_SIZE' ? '파일당 30MB 이하만 올릴 수 있습니다.' : err.message || '업로드 중 오류가 발생했습니다.';
    render(res, { title: '오류', active: '/admin', body: A.errorPage(msg) }, 400);
  });
}

function cleanupFiles(files) {
  if (!files) return;
  Object.values(files).flat().forEach((f) => fs.promises.unlink(f.path).catch(() => {}));
}

function deleteStored(items) {
  (items || []).forEach((f) => {
    if (f.url && f.url.startsWith('/uploads/')) {
      const p = path.join(UPLOAD_DIR, path.basename(f.url));
      fs.promises.unlink(p).catch(() => {});
    }
  });
}

function toArray(v) { return v === undefined ? [] : Array.isArray(v) ? v : [v]; }

function collect(req, type, existing = {}) {
  const b = req.body;
  const data = {
    type,
    title: (b.title || '').trim(),
    date: /^\d{4}-\d{2}-\d{2}$/.test(b.date || '') ? b.date : '',
    summary: (b.summary || '').trim(),
    body: (b.body || '').replace(/\r\n/g, '\n').trim(),
  };
  if (type === 'publication') data.volume = (b.volume || '').trim();

  const rmPhotos = new Set(toArray(b.removePhoto).map(Number));
  const rmAtt = new Set(toArray(b.removeAttachment).map(Number));
  const oldPhotos = existing.photos || [];
  const oldAtt = existing.attachments || [];
  const removed = [...oldPhotos.filter((_, i) => rmPhotos.has(i)), ...oldAtt.filter((_, i) => rmAtt.has(i))];

  const files = req.files || {};
  const newPhotos = (files.photos || []).map((f) => ({ url: `/uploads/${f.filename}`, name: f.originalname }));
  const newAtt = (files.attachments || []).map((f) => ({
    url: `/uploads/${f.filename}`, name: f.originalname,
    label: type === 'publication' ? '표지·목차 PDF' : f.originalname.replace(/\.pdf$/i, ''),
  }));
  data.photos = type === 'event' ? [...oldPhotos.filter((_, i) => !rmPhotos.has(i)), ...newPhotos] : [];
  data.attachments = [...oldAtt.filter((_, i) => !rmAtt.has(i)), ...newAtt];

  let error = '';
  if (!data.title) error = '제목을 입력해 주세요.';
  else if (!data.date) error = '날짜를 입력해 주세요.';
  else if (type === 'publication' && !data.volume) error = '권호를 입력해 주세요.';
  return { data, removed, error };
}

function nextStatus(action, current) {
  if (action === 'publish') return 'published';
  if (action === 'draft') return 'draft';
  if (action === 'hide') return 'hidden';
  return current || 'draft'; // save, preview
}

function afterSave(res, post, action) {
  if (action === 'preview') return res.redirect(`/admin/posts/${post.id}/preview`);
  const msg = post.status === 'published' ? (action === 'publish' ? 'published' : 'saved') : action === 'hide' ? 'hidden' : 'saved';
  res.redirect(`/admin?type=${post.type}&msg=${msg}`);
}

app.get('/admin/new/:type', requireAdmin, (req, res) => {
  const type = req.params.type;
  if (!store.TYPES[type]) return notFound(res);
  render(res, { title: '새 글 작성', active: '/admin', body: A.form({ type }) });
});

app.post('/admin/new/:type', requireAdmin, handleUpload, (req, res) => {
  const type = req.params.type;
  if (!store.TYPES[type]) { cleanupFiles(req.files); return notFound(res); }
  const { data, error } = collect(req, type);
  if (error) {
    cleanupFiles(req.files);
    return render(res, { title: '새 글 작성', active: '/admin', body: A.form({ type, post: { ...data, photos: [], attachments: [] }, error }) }, 400);
  }
  data.status = nextStatus(req.body.action, 'draft');
  const post = store.create(data);
  afterSave(res, post, req.body.action);
});

app.get('/admin/posts/:id(\\d+)/edit', requireAdmin, (req, res) => {
  const p = store.get(req.params.id);
  if (!p) return notFound(res);
  render(res, { title: '글 수정', active: '/admin', body: A.form({ type: p.type, post: p }) });
});

app.post('/admin/posts/:id(\\d+)/edit', requireAdmin, handleUpload, (req, res) => {
  const p = store.get(req.params.id);
  if (!p) { cleanupFiles(req.files); return notFound(res); }
  const { data, removed, error } = collect(req, p.type, p);
  if (error) {
    cleanupFiles(req.files);
    return render(res, { title: '글 수정', active: '/admin', body: A.form({ type: p.type, post: { ...p, ...data, photos: p.photos, attachments: p.attachments }, error }) }, 400);
  }
  data.status = nextStatus(req.body.action, p.status);
  const post = store.update(p.id, data);
  deleteStored(removed);
  afterSave(res, post, req.body.action);
});

app.get('/admin/posts/:id(\\d+)/preview', requireAdmin, (req, res) => {
  const p = store.get(req.params.id);
  if (!p) return notFound(res);
  render(res, { title: `미리보기: ${p.title}`, active: `/${store.TYPES[p.type].path}`, body: V.detailPage(p, { preview: A.previewBar(p) }) });
});

app.post('/admin/posts/:id(\\d+)/status', requireAdmin, (req, res) => {
  const p = store.get(req.params.id);
  if (!p) return notFound(res);
  const status = ['published', 'hidden', 'draft'].includes(req.body.status) ? req.body.status : p.status;
  store.update(p.id, { status });
  res.redirect(`/admin?type=${p.type}&msg=${status === 'published' ? 'published' : 'hidden'}`);
});

app.get('/admin/posts/:id(\\d+)/delete', requireAdmin, (req, res) => {
  const p = store.get(req.params.id);
  if (!p) return notFound(res);
  render(res, { title: '삭제 확인', active: '/admin', body: A.confirmDelete(p) });
});

app.post('/admin/posts/:id(\\d+)/delete', requireAdmin, (req, res) => {
  const p = store.remove(req.params.id);
  if (!p) return notFound(res);
  deleteStored([...(p.photos || []), ...(p.attachments || [])]);
  res.redirect(`/admin?type=${p.type}&msg=deleted`);
});

// 관리자 하위 경로는 로그인 필요
app.use('/admin', requireAdmin);

function notFound(res) {
  render(res, { title: '페이지를 찾을 수 없습니다', active: '', body: V.notFound() }, 404);
}
app.use((req, res) => notFound(res));

app.use((err, req, res, next) => {
  console.error(err);
  render(res, { title: '오류', active: '', body: A.errorPage('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.') }, 500);
});

app.listen(PORT, () => {
  console.log(`과학교육연구소 홈페이지 실행 중: http://localhost:${PORT}`);
  if (!auth.isConfigured()) console.log('※ 관리자 비밀번호가 없습니다. `npm run set-password`로 설정하세요.');
});
