// ONGIL Phase 6 — Community + Groups V1: local-first posts, group drafts, meetup drafts, future contracts
// (comments / reactions / reports / blocks), Enjoy → review prefill, privacy boundaries, safety and quality checks.
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import * as C from '../../ongil-start/js/community-contracts.js';
import { createPostStore, createGroupStore, createMeetupStore, COMMUNITY_DELIVERY } from '../../ongil-start/js/community.js';
import { COMMUNITY_SECTIONS, resolveCommunitySection, POST_PAGE } from '../../ongil-start/js/community-view.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { SAVED_TYPES } from '../../ongil-start/js/contracts.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { classOf, maySync, maySearchGlobally, familySharingAllowed, CONTRACT_CLASSES } from '../../ongil-start/js/privacy.js';
import { SYNCABLE_COLLECTIONS } from '../../ongil-start/js/account.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { resolveView, sectionOf } from '../../ongil-start/js/router.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const VIEW = strip(read('js', 'community-view.js'));
const STORE = strip(read('js', 'community.js'));
const CONTRACTS = strip(read('js', 'community-contracts.js'));
const ENJOY_VIEW = strip(read('js', 'enjoy-view.js'));
const APP = read('js', 'app.js');
const APP_CODE = strip(APP);
const ACCOUNT_VIEW = read('js', 'account-view.js');
const CSS = read('styles', 'ongil-care.css');
const COMMUNITY_SRC = [VIEW, STORE, CONTRACTS].join('\n');

/* fixed clock and a fresh memory-backed storage for each test */
const NOW = new Date(2026, 9, 2, 9).getTime();
function env() {
  let t = NOW;
  const now = () => (t += 1000);
  const storage = createStorage({ backend: createMemoryBackend() });
  const meetups = createMeetupStore(storage, { now });
  return { storage, now, posts: createPostStore(storage, { now }), meetups, groups: createGroupStore(storage, { now, meetups }), saved: createSavedStore(storage, { now }), schedule: createScheduleStore(storage, { now }) };
}
const POST = { type: 'QUESTION', category: 'LOCAL', title: '동네 걷기 코스 추천', body: '아침에 걷기 좋은 곳이 있을까요?' };
const GROUP = { name: '아침 걷기', category: 'WALKING', meetingStyle: 'OFFLINE', description: '천천히 걸어요' };
const MEETUP = { title: '첫 걷기', date: '2026-10-10', time: '08:30', placeText: '○○공원 정문' };

/* ───────── OG-CM: community posts ───────── */

test('OG-CM-1 community collections are registered, PRIVATE, never synced, never in global search', () => {
  for (const c of ['communityPosts', 'groupDrafts', 'meetupDrafts']) {
    assert.ok(COLLECTIONS.includes(c), c);
    assert.equal(classOf(c), 'PRIVATE', c);
    assert.equal(maySync(c), false, c);
    assert.equal(maySearchGlobally(c), false, c);
    assert.ok(!SYNCABLE_COLLECTIONS.includes(c), c);
  }
  assert.equal(familySharingAllowed(), false);
  for (const k of ['CommunityPost', 'GroupDraft', 'MeetupDraft']) assert.equal(CONTRACT_CLASSES[k], 'PRIVATE', k);
});

test('OG-CM-2 a post is created locally with authorMode SELF and status LOCAL', () => {
  const { posts, storage } = env();
  const r = posts.add({ ...POST, status: 'LOCAL' });
  assert.equal(r.ok, true);
  assert.equal(r.post.authorMode, 'SELF');
  assert.equal(r.post.status, 'LOCAL');
  assert.match(r.post.id, /^cp_/);
  assert.equal(storage.get('communityPosts').items.length, 1);
  assert.ok(Object.keys(storage.get('communityPosts')).includes('schemaVersion'));
});

test('OG-CM-3 임시 저장 keeps status DRAFT; any other status becomes LOCAL', () => {
  const { posts } = env();
  assert.equal(posts.add({ ...POST, status: 'DRAFT' }).post.status, 'DRAFT');
  assert.equal(posts.add({ ...POST, status: 'PUBLISHED' }).post.status, 'LOCAL');
});

test('OG-CM-4 the delivery state is local only — never published, never visible to others, no server', () => {
  assert.deepEqual({ ...COMMUNITY_DELIVERY }, { published: false, visibleToOthers: false, server: false });
  assert.ok(Object.isFrozen(COMMUNITY_DELIVERY));
  assert.equal(env().posts.delivery, COMMUNITY_DELIVERY);
});

test('OG-CM-5 the six post types and nine categories are fixed', () => {
  assert.deepEqual(C.POST_TYPES.map((t) => t.id), ['QUESTION', 'EXPERIENCE', 'INFORMATION', 'REVIEW', 'TIP', 'DAILY']);
  assert.deepEqual(C.POST_CATEGORIES.map((t) => t.id), ['LIFE', 'HEALTHY_LIVING', 'HOBBY', 'LEARNING', 'CULTURE', 'OUTING', 'LOCAL', 'DIGITAL', 'OTHER']);
  assert.deepEqual([...C.AUTHOR_MODES], ['SELF']);
});

test('OG-CM-6 invalid type, category, empty title or body are refused with a field reason', () => {
  const { posts } = env();
  assert.equal(posts.add({ ...POST, type: 'AD' }).reason, 'INVALID_TYPE');
  assert.equal(posts.add({ ...POST, category: 'POLITICS' }).reason, 'INVALID_CATEGORY');
  assert.equal(posts.add({ ...POST, title: '   ' }).reason, 'INVALID_TITLE');
  assert.equal(posts.add({ ...POST, body: '\n\n' }).reason, 'INVALID_BODY');
  assert.equal(posts.count(), 0);
});

test('OG-CM-7 title is cut to 120 and body to 5000 characters', () => {
  const { posts } = env();
  const p = posts.add({ ...POST, title: '가'.repeat(300), body: '나'.repeat(9000) }).post;
  assert.equal(p.title.length, C.COMMUNITY_LIMITS.postTitle);
  assert.equal(p.body.length, C.COMMUNITY_LIMITS.postBody);
  assert.equal(C.COMMUNITY_LIMITS.postTitle, 120);
  assert.equal(C.COMMUNITY_LIMITS.postBody, 5000);
});

test('OG-CM-8 body keeps line breaks (max two in a row) and drops control characters', () => {
  const b = C.blockText('첫 줄\r\n둘째 줄\n\n\n\n셋째\u0007 줄', 100);
  assert.equal(b, '첫 줄\n둘째 줄\n\n셋째 줄');
  assert.equal(C.lineText('제목\n\t둘', 50), '제목 둘');
});

test('OG-CM-9 a resident registration number is never stored', () => {
  const { posts } = env();
  const r = posts.add({ ...POST, body: '제 번호는 600101-1234567 입니다' });
  assert.deepEqual(r, { ok: false, reason: 'SENSITIVE_NUMBER' });
  assert.equal(posts.count(), 0);
  assert.equal(posts.add({ ...POST, title: '600101-2234567' }).reason, 'SENSITIVE_NUMBER');
});

test('OG-CM-10 a phone number or a detailed address is saved but flagged for a reminder', () => {
  const { posts } = env();
  const r = posts.add({ ...POST, body: '010-1234-5678 로 연락 주세요. 101동 1203호' });
  assert.equal(r.ok, true);
  assert.equal(r.check.phone, true);
  assert.equal(r.check.address, true);
  assert.deepEqual(C.privacyCheck('공원에서 만나요'), { blocked: false, phone: false, address: false });
});

test('OG-CM-11 editing keeps id, createdAt and source and moves updatedAt', () => {
  const { posts } = env();
  const a = posts.add({ ...POST, source: { sourceType: 'PLACE', sourceId: 'kakao-1', sourceTitle: '공원' } }).post;
  const b = posts.update(a.id, { ...POST, title: '고친 제목', source: null }).post;
  assert.equal(b.id, a.id);
  assert.equal(b.createdAt, a.createdAt);
  assert.ok(b.updatedAt > a.updatedAt);
  assert.equal(b.title, '고친 제목');
  assert.deepEqual(b.source, a.source);
  assert.equal(posts.update('cp_missing000', POST).reason, 'NOT_FOUND');
});

test('OG-CM-12 delete removes the post; deleting twice is NOT_FOUND', () => {
  const { posts } = env();
  const a = posts.add(POST).post;
  assert.equal(posts.remove(a.id).ok, true);
  assert.equal(posts.get(a.id), null);
  assert.equal(posts.remove(a.id).reason, 'NOT_FOUND');
});

test('OG-CM-13 list is newest-updated first', () => {
  const { posts } = env();
  const a = posts.add({ ...POST, title: 'A' }).post;
  posts.add({ ...POST, title: 'B' });
  posts.update(a.id, { ...POST, title: 'A2' });
  assert.deepEqual(posts.list().map((p) => p.title), ['A2', 'B']);
});

test('OG-CM-14 filter by type and category', () => {
  const { posts } = env();
  posts.add({ ...POST, type: 'TIP', category: 'DIGITAL', title: '키오스크 팁' });
  posts.add({ ...POST, type: 'QUESTION', category: 'LOCAL' });
  posts.add({ ...POST, type: 'TIP', category: 'LOCAL', title: '동네 팁' });
  assert.equal(C.filterPosts(posts.list(), { type: 'TIP' }).length, 2);
  assert.equal(C.filterPosts(posts.list(), { type: 'TIP', category: 'DIGITAL' }).length, 1);
  assert.equal(C.filterPosts(posts.list(), { category: 'LOCAL' }).length, 2);
});

test('OG-CM-15 search matches title, body, type label and category label, ignoring spaces and case', () => {
  const list = [C.normalizePost({ id: 'cp_aaaaaa', type: 'TIP', category: 'DIGITAL', title: 'Kiosk 쓰는 법', body: '천천히 눌러도 괜찮아요' }, NOW)];
  assert.equal(C.filterPosts(list, { query: 'kiosk' }).length, 1);
  assert.equal(C.filterPosts(list, { query: '천천히눌러' }).length, 1);
  assert.equal(C.filterPosts(list, { query: '팁' }).length, 1);
  assert.equal(C.filterPosts(list, { query: '디지털' }).length, 1);
  assert.equal(C.filterPosts(list, { query: '없는말' }).length, 0);
  assert.equal(C.filterPosts(null, {}).length, 0);
});

test('OG-CM-16 the list shows a one-line summary, never the whole body', () => {
  const s = C.summaryOf('줄 하나\n줄 둘 ' + '가'.repeat(200));
  assert.ok(s.length <= 81);
  assert.ok(s.endsWith('…'));
  assert.ok(!s.includes('\n'));
  assert.equal(C.summaryOf('짧아요'), '짧아요');
});

test('OG-CM-17 a post can be saved as Saved POST pointing back to #community', () => {
  const { posts, saved } = env();
  assert.ok(SAVED_TYPES.includes('POST'));
  const p = posts.add(POST).post;
  const r = saved.toggle({ type: 'POST', id: p.id, title: p.title, description: '내 글 · 질문 · 이 기기에만 있어요', href: '#community' });
  assert.equal(r.ok, true);
  assert.equal(saved.isSaved('POST', p.id), true);
  assert.match(VIEW, /saved\.toggle\(\{ type: 'POST'/);
  assert.match(VIEW, /href: '#community'/);
});

test('OG-CM-18 deleting a post also removes it from Saved (view wiring)', () => {
  assert.match(VIEW, /if \(saved\.isSaved\('POST', id\)\) saved\.unsave\('POST', id\)/);
});

test('OG-CM-19 the post limit is 500 and storage overflow is reported, not silently dropped', () => {
  const storage = createStorage({ backend: createMemoryBackend() });
  let n = 0;
  const posts = createPostStore(storage, { now: () => NOW + n, makeId: () => `cp_${String(++n).padStart(6, '0')}` });
  for (let i = 0; i < 500; i += 1) assert.equal(posts.add({ ...POST, body: 'x' }).ok, true, String(i));
  assert.equal(posts.add(POST).reason, 'LIMIT');
  const big = createPostStore(createStorage({ backend: createMemoryBackend() }), { now: () => NOW });
  let last;
  for (let i = 0; i < 200; i += 1) {
    last = big.add({ ...POST, body: '가'.repeat(4999) + i });
    if (!last.ok) break;
  }
  assert.equal(last.reason, 'STORAGE_FULL');
  assert.match(STORE, /STORAGE_FULL/);
});

test('OG-CM-20 damaged storage is skipped item by item and duplicates are dropped', () => {
  const storage = createStorage({ backend: createMemoryBackend() });
  const good = C.normalizePost({ id: 'cp_good01', ...POST }, NOW);
  storage.set('communityPosts', { schemaVersion: 1, items: [good, good, null, 42, { id: 'bad' }, { ...good, id: 'cp_good02', type: 'AD' }] });
  const posts = createPostStore(storage, { now: () => NOW });
  assert.deepEqual(posts.list().map((p) => p.id), ['cp_good01']);
  storage.set('communityPosts', { schemaVersion: 1, items: 'garbage' });
  assert.deepEqual(posts.list(), []);
});

test('OG-CM-21 a stored post can never claim another author', () => {
  const p = C.normalizePost({ id: 'cp_other1', ...POST, authorMode: 'OTHER', authorId: 'someone', authorName: '이웃' }, NOW);
  assert.equal(p.authorMode, 'SELF');
  assert.ok(!('authorId' in p));
  assert.ok(!('authorName' in p));
});

test('OG-CM-22 comments are a contract only: replies by parentId, no self-parent, authorId from a future server', () => {
  const c = C.normalizeComment({ id: 'cm_aaaaaa', postId: 'cp_aaaaaa', authorId: 'user_123456', body: '좋아요', parentId: 'cm_bbbbbb' }, NOW);
  assert.equal(c.parentId, 'cm_bbbbbb');
  assert.equal(c.status, 'visible');
  assert.throws(() => C.normalizeComment({ id: 'cm_aaaaaa', postId: 'cp_aaaaaa', authorId: 'user_123456', body: 'x', parentId: 'cm_aaaaaa' }), /INVALID_PARENT/);
  assert.throws(() => C.normalizeComment({ id: 'cm_aaaaaa', postId: 'cp_aaaaaa', authorId: '?', body: 'x' }), /INVALID_AUTHOR/);
  assert.ok(!COLLECTIONS.some((c2) => /comment/i.test(c2)));
});

test('OG-CM-23 reactions are a contract only (LIKE / HELPFUL), never stored or counted on this device', () => {
  assert.deepEqual(C.REACTION_TYPES.map((r) => r.id), ['LIKE', 'HELPFUL']);
  assert.deepEqual(C.normalizeReaction({ postId: 'cp_aaaaaa', userId: 'user_123456', type: 'HELPFUL' }), { postId: 'cp_aaaaaa', userId: 'user_123456', type: 'HELPFUL' });
  assert.throws(() => C.normalizeReaction({ postId: 'cp_aaaaaa', userId: 'user_123456', type: 'LOVE' }), /INVALID_TYPE/);
  assert.ok(!COLLECTIONS.some((c) => /reaction|like/i.test(c)));
  assert.doesNotMatch(VIEW, /normalizeReaction|REACTION_TYPES|reactionCount|likeCount/);
});

test('OG-CM-24 reports are a contract only: start as submitted, never completed by this device', () => {
  assert.deepEqual(C.REPORT_REASONS.map((r) => r.id), ['SPAM', 'HARASSMENT', 'PRIVACY', 'MISINFORMATION', 'SCAM', 'OTHER']);
  const r = C.normalizeReport({ id: 'rp_aaaaaa', targetType: 'POST', targetId: 'cp_aaaaaa', reason: 'SCAM', status: 'whatever' }, NOW);
  assert.equal(r.status, 'submitted');
  assert.throws(() => C.normalizeReport({ id: 'rp_aaaaaa', targetType: 'PAGE', targetId: 'cp_aaaaaa', reason: 'SCAM' }), /INVALID_TARGET/);
  assert.doesNotMatch(VIEW, /normalizeReport|신고 접수|신고되었|신고가 완료/);
});

test('OG-CM-25 blocks are a contract only and cannot target yourself', () => {
  assert.throws(() => C.normalizeBlock({ blockerUserId: 'user_123456', blockedUserId: 'user_123456' }), /SELF_BLOCK/);
  assert.equal(C.normalizeBlock({ blockerUserId: 'user_123456', blockedUserId: 'user_654321' }, NOW).blockedUserId, 'user_654321');
  assert.ok(!COLLECTIONS.some((c) => /block/i.test(c)));
});

test('OG-CM-26 the screen says plainly that comments, reactions and reports are not here yet', () => {
  assert.match(VIEW, /data-og-community-future/);
  assert.match(VIEW, /댓글, 공감, 신고는 커뮤니티 서버와 운영 정책이 생기면 쓸 수 있어요/);
  assert.match(VIEW, /data-og-community-mode': 'local'|'data-og-community-mode': 'local'/);
  assert.match(VIEW, /이 기기에만 저장돼요/);
});

test('OG-CM-27 no fake people, counts, popularity or notifications anywhere in community code', () => {
  assert.doesNotMatch(COMMUNITY_SRC, /조회수|팔로워|팔로잉|인기|실시간|게시되었|공개되었|명 참여|memberCount|viewCount|likeCount|followers|trending|popular/);
  assert.doesNotMatch(COMMUNITY_SRC, /notifications?\.(add|push|notify)/);
  assert.doesNotMatch(COMMUNITY_SRC, /Math\.random/);
});

test('OG-CM-28 community code has no network, no backend, no Firebase, no AI', () => {
  assert.doesNotMatch(COMMUNITY_SRC, /fetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|firebase|firestore|openai|\/api\//i);
});

test('OG-CM-29 community posts are not registered as a global search provider', () => {
  const regs = APP_CODE.match(/search\.registerProvider\(/g) || [];
  /* Phase 7: + createStoreProvider (public products); still none for community */
  assert.equal(regs.length, 5);
  assert.doesNotMatch(APP_CODE, /registerProvider\([^)]*communit/i);
  assert.doesNotMatch(APP_CODE, /registerProvider\([^)]*(groupDrafts|meetupDrafts|communityPosts)/);
});

test('OG-CM-30 the list is paged by 20 with a 더 보기 button (no infinite scroll)', () => {
  assert.equal(POST_PAGE, 20);
  assert.match(VIEW, /data-og-post-more/);
  assert.match(VIEW, /state\.shown \+= POST_PAGE/);
  assert.doesNotMatch(VIEW, /IntersectionObserver|addEventListener\('scroll'/);
});

/* ───────── OG-GR: group drafts + meetup drafts ───────── */

test('OG-GR-1 a group draft is created with status DRAFT and no members', () => {
  const { groups } = env();
  const r = groups.add({ ...GROUP, status: 'PUBLIC', members: 30 });
  assert.equal(r.ok, true);
  assert.equal(r.group.status, 'DRAFT');
  assert.match(r.group.id, /^gd_/);
  assert.ok(!('members' in r.group));
  assert.ok(!('memberCount' in r.group));
});

test('OG-GR-2 group categories and meeting styles are fixed', () => {
  assert.deepEqual(C.GROUP_CATEGORIES.map((g) => g.id), ['WALKING', 'READING', 'PHOTO', 'HOBBY', 'LEARNING', 'EXERCISE', 'CULTURE', 'LOCAL', 'OTHER']);
  assert.deepEqual(C.MEETING_STYLES.map((m) => m.id), ['ONLINE', 'OFFLINE', 'BOTH']);
});

test('OG-GR-3 a group needs a name, a category and a meeting style', () => {
  const { groups } = env();
  assert.equal(groups.add({ ...GROUP, name: ' ' }).reason, 'INVALID_NAME');
  assert.equal(groups.add({ ...GROUP, category: 'DATING' }).reason, 'INVALID_CATEGORY');
  assert.equal(groups.add({ ...GROUP, meetingStyle: 'VR' }).reason, 'INVALID_STYLE');
  assert.equal(groups.count(), 0);
});

test('OG-GR-4 group name is cut to 80 and description to 2000', () => {
  const { groups } = env();
  const g = groups.add({ ...GROUP, name: '모'.repeat(200), description: '임'.repeat(5000) }).group;
  assert.equal(g.name.length, 80);
  assert.equal(g.description.length, 2000);
});

test('OG-GR-5 editing a group keeps id and createdAt and stays DRAFT', () => {
  const { groups } = env();
  const a = groups.add(GROUP).group;
  const b = groups.update(a.id, { ...GROUP, name: '아침 걷기 모임', status: 'PUBLIC' }).group;
  assert.equal(b.id, a.id);
  assert.equal(b.createdAt, a.createdAt);
  assert.equal(b.status, 'DRAFT');
  assert.equal(b.name, '아침 걷기 모임');
});

test('OG-GR-6 a resident registration number in a group draft is refused', () => {
  const { groups } = env();
  assert.equal(groups.add({ ...GROUP, description: '연락 600101-1234567' }).reason, 'SENSITIVE_NUMBER');
});

test('OG-GR-7 deleting a group removes its meetup drafts but leaves other groups and calendar events alone', () => {
  const { groups, meetups, schedule } = env();
  const g1 = groups.add(GROUP).group;
  const g2 = groups.add({ ...GROUP, name: '독서' }).group;
  meetups.add(g1.id, MEETUP);
  meetups.add(g1.id, { ...MEETUP, title: '둘째' });
  meetups.add(g2.id, MEETUP);
  schedule.add({ title: MEETUP.title, date: MEETUP.date, time: MEETUP.time });
  assert.equal(groups.remove(g1.id).ok, true);
  assert.equal(meetups.listFor(g1.id).length, 0);
  assert.equal(meetups.listFor(g2.id).length, 1);
  assert.equal(schedule.listForDate(MEETUP.date).length, 1);
});

test('OG-GR-8 a meetup draft needs a title and a valid date; time is optional but must be valid', () => {
  const { groups, meetups } = env();
  const g = groups.add(GROUP).group;
  assert.equal(meetups.add(g.id, { ...MEETUP, title: '' }).reason, 'INVALID_TITLE');
  assert.equal(meetups.add(g.id, { ...MEETUP, date: '2026-13-40' }).reason, 'INVALID_DATE');
  assert.equal(meetups.add(g.id, { ...MEETUP, time: '25:99' }).reason, 'INVALID_TIME');
  assert.equal(meetups.add(g.id, { ...MEETUP, time: '' }).meetup.time, '');
});

test('OG-GR-9 a meetup place is always PRIVATE and status DRAFT', () => {
  const { groups, meetups } = env();
  const g = groups.add(GROUP).group;
  const m = meetups.add(g.id, { ...MEETUP, placeVisibility: 'PUBLIC', status: 'OPEN' }).meetup;
  assert.equal(m.placeVisibility, 'PRIVATE');
  assert.equal(m.status, 'DRAFT');
  assert.deepEqual([...C.PLACE_VISIBILITY], ['PRIVATE', 'MEMBERS']);
});

test('OG-GR-10 meetup title 120, place 60, description 2000', () => {
  const { groups, meetups } = env();
  const g = groups.add(GROUP).group;
  const m = meetups.add(g.id, { ...MEETUP, title: '가'.repeat(300), placeText: '나'.repeat(300), description: '다'.repeat(5000) }).meetup;
  assert.equal(m.title.length, 120);
  assert.equal(m.placeText.length, 60);
  assert.equal(m.description.length, 2000);
});

test('OG-GR-11 meetups are listed per group by date and time', () => {
  const { groups, meetups } = env();
  const g = groups.add(GROUP).group;
  meetups.add(g.id, { ...MEETUP, title: 'C', date: '2026-10-12' });
  meetups.add(g.id, { ...MEETUP, title: 'B', date: '2026-10-10', time: '10:00' });
  meetups.add(g.id, { ...MEETUP, title: 'A', date: '2026-10-10', time: '08:00' });
  assert.deepEqual(meetups.listFor(g.id).map((m) => m.title), ['A', 'B', 'C']);
});

test('OG-GR-12 editing a meetup keeps its group; removing it is NOT_FOUND the second time', () => {
  const { groups, meetups } = env();
  const g = groups.add(GROUP).group;
  const m = meetups.add(g.id, MEETUP).meetup;
  const e = meetups.update(m.id, { ...MEETUP, title: '바뀐 일정' }).meetup;
  assert.equal(e.groupId, g.id);
  assert.equal(e.title, '바뀐 일정');
  assert.equal(meetups.remove(m.id).ok, true);
  assert.equal(meetups.remove(m.id).reason, 'NOT_FOUND');
});

test('OG-GR-13 a detailed address in a meetup place is flagged; an RRN is refused', () => {
  const { groups, meetups } = env();
  const g = groups.add(GROUP).group;
  assert.equal(meetups.add(g.id, { ...MEETUP, placeText: '101동 1203호' }).check.address, true);
  assert.equal(meetups.add(g.id, { ...MEETUP, description: '600101-1234567' }).reason, 'SENSITIVE_NUMBER');
});

test('OG-GR-14 groups (100) and meetups (300) have limits', () => {
  assert.equal(C.COMMUNITY_LIMITS.groups, 100);
  assert.equal(C.COMMUNITY_LIMITS.meetups, 300);
  const storage = createStorage({ backend: createMemoryBackend() });
  let n = 0;
  const groups = createGroupStore(storage, { now: () => NOW, makeId: () => `gd_${String(++n).padStart(6, '0')}` });
  for (let i = 0; i < 100; i += 1) groups.add(GROUP);
  assert.equal(groups.add(GROUP).reason, 'LIMIT');
});

test('OG-GR-15 there is no join, member, chat or public listing in group code; the directory is an honest empty state', () => {
  assert.doesNotMatch(COMMUNITY_SRC, /가입하기|참여하기|채팅|메시지 보내기|joinGroup|sendMessage|members\s*:/);
  assert.match(VIEW, /data-og-community-empty': 'directory'|'data-og-community-empty': 'directory'/);
  assert.match(VIEW, /공개된 모임 목록은 아직 없어요/);
});

/* ───────── OG-CG: calendar, Enjoy → review, boundaries, app wiring, quality ───────── */

test('OG-CG-1 a meetup becomes a calendar draft of title, date and time only', () => {
  const m = C.normalizeMeetup({ id: 'mt_aaaaaa', groupId: 'gd_aaaaaa', ...MEETUP, description: '비밀 설명' }, NOW);
  assert.deepEqual(C.meetupCalendarDraft(m), { title: '첫 걷기', date: '2026-10-10', time: '08:30' });
  assert.equal(C.meetupCalendarDraft({ title: 'x', date: 'bad' }), null);
});

test('OG-CG-2 adding the same meetup to the calendar twice is detected (title + date + time)', () => {
  const { schedule } = env();
  const d = { title: '첫 걷기', date: '2026-10-10', time: '08:30' };
  assert.equal(C.isMeetupInCalendar(d, schedule.listForDate(d.date)), false);
  schedule.add(d);
  assert.equal(C.isMeetupInCalendar(d, schedule.listForDate(d.date)), true);
  assert.equal(C.isMeetupInCalendar({ ...d, time: '09:00' }, schedule.listForDate(d.date)), false);
});

test('OG-CG-3 the view re-checks for a duplicate before adding and only adds after a preview', () => {
  assert.match(VIEW, /data-og-meetup-preview/);
  assert.match(VIEW, /data-og-meetup-calendar-add/);
  assert.match(VIEW, /if \(isMeetupInCalendar\(draft, schedule\.listForDate\(draft\.date\)\)\)/);
  assert.match(VIEW, /이미 내 일정에 있어요/);
});

test('OG-CG-4 review prefill: type REVIEW, category mapped, title "… 후기", empty body, minimal source', () => {
  const p = C.reviewPrefill({ type: 'PLACE', id: 'kakao-9001', title: '서울숲', category: 'OUTING', address: '서울 성동구', phone: '02-000-0000' });
  assert.deepEqual(p, { type: 'REVIEW', category: 'OUTING', title: '서울숲 후기', body: '', source: { sourceType: 'PLACE', sourceId: 'kakao-9001', sourceTitle: '서울숲' } });
});

test('OG-CG-5 review category mapping falls back to OTHER', () => {
  assert.equal(C.reviewPrefill({ type: 'CLASS', id: 'lc000001', title: '스마트폰', category: 'LEARNING' }).category, 'LEARNING');
  assert.equal(C.reviewPrefill({ type: 'PROGRAM', id: 'p1', title: '체조', category: 'EXERCISE' }).category, 'HEALTHY_LIVING');
  assert.equal(C.reviewPrefill({ type: 'PLACE', id: 'p1', title: '바다', category: 'TRAVEL' }).category, 'OUTING');
  assert.equal(C.reviewPrefill({ type: 'PLACE', id: 'p1', title: '어딘가', category: 'UNKNOWN' }).category, 'OTHER');
});

test('OG-CG-6 review prefill refuses unknown types and empty titles', () => {
  assert.equal(C.reviewPrefill({ type: 'PRODUCT', id: 'x', title: 'y' }), null);
  assert.equal(C.reviewPrefill({ type: 'PLACE', id: 'x', title: '  ' }), null);
  assert.equal(C.reviewPrefill(null), null);
});

test('OG-CG-7 starting a review never saves anything by itself', () => {
  const start = VIEW.slice(VIEW.indexOf('function startReview'), VIEW.indexOf('function startReview') + 400);
  assert.match(start, /openCompose\(/);
  assert.doesNotMatch(start, /posts\.(add|update)/);
  assert.match(APP_CODE, /pendingReview = reviewPrefill\(item\)/);
  assert.match(APP_CODE, /'#community\/write'/);
});

test('OG-CG-8 the review source survives save and is limited to type, id and title', () => {
  const { posts } = env();
  const pre = C.reviewPrefill({ type: 'PLACE', id: 'kakao-9001', title: '서울숲', category: 'OUTING' });
  const p = posts.add({ ...pre, body: '좋았어요' }).post;
  assert.deepEqual(Object.keys(p.source).sort(), ['sourceId', 'sourceTitle', 'sourceType']);
  const bad = C.normalizePost({ id: 'cp_aaaaaa', ...POST, source: { sourceType: 'PLACE', sourceId: '<script>' } }, NOW);
  assert.ok(!('source' in bad));
});

test('OG-CG-9 the Enjoy button is labelled 후기 쓰기, closes the dialog and only hands over type, id, title, category', () => {
  assert.match(ENJOY_VIEW, /'data-og-enjoy-review': 'true', text: '후기 쓰기'/);
  assert.match(ENJOY_VIEW, /d\.close\(\); onReview\(\{ type: item\.type, id: item\.id, title: item\.title, category: item\.category \}\)/);
  assert.doesNotMatch(ENJOY_VIEW, /communityPosts|createPostStore/);
});

test('OG-CG-10 the router sends #community/write and #community/groups; anything else falls back', () => {
  assert.deepEqual([...COMMUNITY_SECTIONS], ['write', 'groups']);
  assert.equal(resolveCommunitySection('write'), 'write');
  assert.ok(!resolveCommunitySection('feed'));
  assert.equal(resolveView('community'), 'community');
  assert.equal(sectionOf('#community/groups'), 'groups');
  assert.match(APP_CODE, /if \(view === 'community' && section && !resolveCommunitySection\(section\)\) win\.history\.replaceState\(null, '', '#community'\)/);
  /* both a section change and entering the view from elsewhere reach the community screen */
  assert.equal((APP_CODE.match(/if \(view === 'community'\) showCommunity\(section\);/g) || []).length, 2);
});

test('OG-CG-11 community never touches health or family records', () => {
  assert.doesNotMatch(COMMUNITY_SRC, /symptoms|healthNotes|medication|checkIn|familySharing|helpRequests|health-notes|family\.js/);
  const area = AREAS.find((a) => a.id === 'community');
  assert.match(area.notice, /이 기기에만 저장되고 다른 사람에게 보이지 않습니다/);
});

test('OG-CG-12 erasing ONGIL data removes community data and the copy says so', () => {
  const { storage, posts, groups, meetups } = env();
  const g = groups.add(GROUP).group;
  posts.add(POST);
  meetups.add(g.id, MEETUP);
  storage.clear();
  assert.equal(posts.count() + groups.count() + meetups.count(), 0);
  for (const c of ['communityPosts', 'groupDrafts', 'meetupDrafts']) assert.ok((KEY_PREFIX + c).startsWith('ongil.v1.'));
  assert.match(ACCOUNT_VIEW, /커뮤니티 글과 모임 초안도 함께 지웁니다/);
  assert.match(APP_CODE, /communityView\.render\(\)/);
});

test('OG-CG-13 forms are accessible: aria-invalid on the bad field, role=alert errors, maxlength from the model', () => {
  assert.match(VIEW, /setAttribute\('aria-invalid', 'true'\)/);
  assert.match(VIEW, /role: 'alert'/);
  assert.match(VIEW, /maxlength: COMMUNITY_LIMITS\.postTitle/);
  assert.match(VIEW, /maxlength: COMMUNITY_LIMITS\.postBody/);
  assert.match(VIEW, /maxlength: COMMUNITY_LIMITS\.groupName/);
  assert.match(VIEW, /maxlength: COMMUNITY_LIMITS\.meetupTitle/);
});

test('OG-CG-14 the detail dialog traps Tab, is labelled and returns focus on close', () => {
  assert.match(VIEW, /id: 'og-post-detail', 'aria-labelledby': 'og-post-detail-title'/);
  assert.match(VIEW, /event\.key !== 'Tab'/);
  assert.match(VIEW, /addEventListener\('close'/);
  assert.match(VIEW, /showModal/);
});

test('OG-CG-15 long text wraps instead of overflowing; body keeps line breaks', () => {
  assert.match(CSS, /\.og-community-body\s*\{[^}]*white-space:\s*pre-wrap/);
  assert.match(CSS, /\.og-community-body\s*\{[^}]*overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(VIEW, /innerHTML|insertAdjacentHTML|outerHTML\s*=/);
});

test('OG-CG-16 no test fixtures or QA data in production source; app is versioned (community-v1, then store-v1)', () => {
  assert.doesNotMatch(COMMUNITY_SRC, /QA 글|cp_qa|gd_qa|mt_qa|fixture|lorem/i);
  /* Phase 7 moved the version on: store-v1 / ?v=20261003s7 */
  /* Phase 8 moved the version on again: integration-v2 / ?v=20261003i8 (BEFORE: store-v1 / 20261003s7) */
  /* Phase 9 moved the version on: admin-v1 / ?v=20261003a9 (BEFORE: integration-v2 / 20261003i8). The version now lives in APP_VERSION. */
  /* Phase 10 moved the version on: assistant-v1 / ?v=20261003b10 (BEFORE: admin-v1 / 20261003a9) — ONGIL 도우미 was added. */
  /* Phase 11 moved the version on: hardening-v1 / ?v=20261003r11 (BEFORE: assistant-v1 / 20261003b10) — release hardening changed app.js and two stylesheets. */
  assert.match(APP, /const APP_VERSION = 'hardening-v1';/);
  assert.match(read('index.html'), /app\.js\?v=20261004v12/); // Completion V2: app.js changed
});
