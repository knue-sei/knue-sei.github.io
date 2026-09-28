// 게시글 읽기: content/<종류>/<글ID>.md 파일 하나에 글 하나
// 글은 GitHub 웹사이트에서 파일을 추가·수정해 올림 (형식은 홈페이지_사용안내.md 참고)
//
// ---
// 제목: 글 제목
// 제목(영문): English title
// 날짜: 2026-10-01
// 한줄소개: 목록에 보이는 한 줄 소개
// 사진: 사진.jpg | 사진 설명 | English caption      (여러 장이면 줄을 반복)
// 첨부: 자료.pdf | 표시 이름 | English label          (여러 개면 줄을 반복)
// 공개: 예
// ---
// 한글 본문
//
// === English ===
// English body
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = process.env.CONTENT_DIR || path.join(__dirname, '..', 'content');

const TYPES = {
  event: { label: '학술행사', path: 'events' },
  publication: { label: '간행물', path: 'publications' },
  news: { label: '소식', path: 'news' },
};
// 파일 이름(=주소): 한글·영문·숫자·하이픈·밑줄. '_'로 시작하는 파일은 무시(양식·메모용)
const ID_RE = /^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u;

const KEYS = {
  '제목': 'title', '제목(영문)': 'title_en',
  '날짜': 'date', '개최일': 'date', '발행일': 'date', '게시일': 'date',
  '한줄소개': 'summary', '한줄소개(영문)': 'summary_en',
  '권호': 'volume', '권호(영문)': 'volume_en',
  '공개': 'published',
};

// '파일.jpg' → /uploads/파일.jpg, '/assets/..' 처럼 /로 시작하면 그대로
function fileUrl(v) {
  const s = v.trim();
  return s.startsWith('/') ? s : `/uploads/${s}`;
}
function fileItem(value) {
  const [file, ko, en] = value.split('|').map((s) => s.trim());
  const url = fileUrl(file);
  return { url, name: path.basename(url), ko: ko || '', en: en || '' };
}

function parse(text, type) {
  const src = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const head = m ? m[1] : '';
  const rest = m ? m[2] : src;
  const post = { photos: [], attachments: [], status: 'published' };

  for (const line of head.split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const key = line.slice(0, i).replace(/\s+/g, '');
    const value = line.slice(i + 1).trim();
    if (!value) continue;
    if (key === '사진') {
      const f = fileItem(value);
      post.photos.push({ url: f.url, name: f.ko, name_en: f.en });
    } else if (key === '첨부') {
      const f = fileItem(value);
      const isPub = type === 'publication';
      post.attachments.push({
        url: f.url, name: f.name,
        label: f.ko || (isPub ? '표지·목차 PDF' : f.name.replace(/\.pdf$/i, '')),
        label_en: f.en || (isPub ? 'Cover & Contents PDF' : ''),
      });
    } else if (KEYS[key] === 'published') {
      if (/^(아니오|아니요|no|false|비공개)$/i.test(value)) post.status = 'hidden';
    } else if (KEYS[key] === 'date') {
      post.date = value.replace(/[./]/g, '-').replace(/-(\d)(?!\d)/g, '-0$1');
    } else if (KEYS[key]) {
      post[KEYS[key]] = value;
    }
  }

  const [ko, en] = rest.split(/^===\s*English\s*===\s*$/im);
  post.body = (ko || '').trim();
  post.body_en = (en || '').trim();
  return post;
}

let cache = null;

function readAll() {
  if (cache) return cache;
  cache = [];
  for (const [type, t] of Object.entries(TYPES)) {
    const dir = path.join(CONTENT_DIR, t.path);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const id = f.normalize('NFC').replace(/\.md$/, '');
      if (!ID_RE.test(id)) {
        if (!f.startsWith('_')) console.warn(`※ 파일 이름에 공백·특수문자가 있어 건너뜀: content/${t.path}/${f}`);
        continue;
      }
      const post = parse(fs.readFileSync(path.join(dir, f), 'utf8'), type);
      if (!post.title) console.warn(`※ 제목이 없습니다: content/${t.path}/${f}`);
      cache.push({ ...post, title: post.title || id, id, type });
    }
  }
  return cache;
}

function byDateDesc(a, b) {
  return (b.date || '').localeCompare(a.date || '') || b.id.localeCompare(a.id, 'ko', { numeric: true });
}

// 공개 글만, 날짜 최신순
function list(type) {
  return readAll().filter((p) => (!type || p.type === type) && p.status === 'published').sort(byDateDesc);
}

function get(id) {
  return readAll().find((p) => p.id === String(id)) || null;
}

module.exports = { TYPES, list, get };
