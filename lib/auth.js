// 관리자 인증: 비밀번호는 scrypt 해시로 서버(data/admin.json)에만 저장, 검증도 서버에서 처리
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DATA_DIR } = require('./store');

const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const SECRET_FILE = path.join(DATA_DIR, 'session.key');
const COOKIE = 'sei_admin';
const SESSION_HOURS = 8;

function secret() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SECRET_FILE)) fs.writeFileSync(SECRET_FILE, crypto.randomBytes(32).toString('hex'));
  return fs.readFileSync(SECRET_FILE, 'utf8').trim();
}

function hashPassword(pw, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(pw, salt, 64).toString('hex') };
}

function setPassword(pw) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(hashPassword(pw)), 'utf8');
}

function isConfigured() {
  return fs.existsSync(ADMIN_FILE) || !!process.env.ADMIN_PASSWORD;
}

function checkPassword(pw) {
  if (typeof pw !== 'string' || !pw) return false;
  if (fs.existsSync(ADMIN_FILE)) {
    const { salt, hash } = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));
    const test = crypto.scryptSync(pw, salt, 64);
    return crypto.timingSafeEqual(test, Buffer.from(hash, 'hex'));
  }
  if (process.env.ADMIN_PASSWORD) {
    const a = crypto.createHash('sha256').update(pw).digest();
    const b = crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD).digest();
    return crypto.timingSafeEqual(a, b);
  }
  return false;
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}

function issueCookie(res, secure) {
  const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
  const nonce = crypto.randomBytes(8).toString('hex');
  const value = `${exp}.${nonce}`;
  res.cookie(COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true, sameSite: 'strict', secure: !!secure, maxAge: SESSION_HOURS * 3600 * 1000, path: '/',
  });
}

function clearCookie(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

function parseCookies(header = '') {
  const out = {};
  header.split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function isAdmin(req) {
  const raw = parseCookies(req.headers.cookie)[COOKIE];
  if (!raw) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  const value = `${parts[0]}.${parts[1]}`;
  const expected = sign(value);
  if (expected.length !== parts[2].length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts[2]))) return false;
  return Number(parts[0]) > Date.now();
}

// 간단한 로그인 시도 제한 (IP당 15분에 10회)
const attempts = new Map();
function tooManyAttempts(ip) {
  const now = Date.now();
  const rec = (attempts.get(ip) || []).filter((t) => now - t < 15 * 60 * 1000);
  attempts.set(ip, rec);
  return rec.length >= 10;
}
function recordFailure(ip) {
  attempts.set(ip, [...(attempts.get(ip) || []), Date.now()]);
}

module.exports = {
  setPassword, isConfigured, checkPassword, issueCookie, clearCookie, isAdmin, tooManyAttempts, recordFailure,
};
