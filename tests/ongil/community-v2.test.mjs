// ONGIL Community V2 — senior-friendly, local-first community on this device, with an honest boundary to the future
// Newon+ / community-server side. OCV2-01 … OCV2-73 (+ extras).
// Static and data tests run everywhere (Node, no dependency). Browser tests (marked "browser") need a local Chromium and
// are skipped without one, like the LIVON accessibility suite.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS } from '../../ongil-start/js/storage.js';
import * as C from '../../ongil-start/js/community-contracts.js';
import { createPostStore, createGroupStore, createMeetupStore, createRemoteCommunityRepository, selectCommunityRepository, COMMUNITY_DELIVERY } from '../../ongil-start/js/community.js';
import { COMMUNITY_SECTIONS, COMMUNITY_ITEM_SECTION, resolveCommunitySection, communityItemSection, communityHash, POST_PAGE, COMPOSE_AUTOSAVE_MS } from '../../ongil-start/js/community-view.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { savedSyncPolicy } from '../../ongil-start/js/contracts.js';
import { classOf, maySync, maySearchGlobally, familySharingAllowed } from '../../ongil-start/js/privacy.js';
import { sectionOf, SECTION_RE } from '../../ongil-start/js/router.js';
import * as R from '../../ongil-start/js/routes.js';
import { NO_WRITE_AREAS } from '../../ongil-start/js/assistant-tools.js';
import { EVENTS } from '../../ongil-start/js/analytics.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const VIEW_RAW = read('ongil-start/js/community-view.js');
const VIEW = strip(VIEW_RAW);
const STORE = strip(read('ongil-start/js/community.js'));
const CONTRACTS = strip(read('ongil-start/js/community-contracts.js'));
const SRC = [VIEW, STORE, CONTRACTS].join('\n');
const APP = strip(read('ongil-start/js/app.js'));
const DOC = read('docs/ongil/ONGIL_COMMUNITY_V2.md');
const plain = (x) => JSON.parse(JSON.stringify(x));

const NOW = new Date(2026, 9, 5, 9).getTime();
function env() {
  let t = NOW;
  const now = () => (t += 1000);
  const storage = createStorage({ backend: createMemoryBackend() });
  const meetups = createMeetupStore(storage, { now });
  return { storage, now, posts: createPostStore(storage, { now }), meetups, groups: createGroupStore(storage, { now, meetups }), saved: createSavedStore(storage, { now }) };
}
const POST = { type: 'QUESTION', category: 'HOBBY', title: '동네 사진 모임 있을까요', body: '주말에 같이 사진 찍을 분 찾아요' };
const GROUP = { name: '사진 산책', category: 'PHOTO', meetingStyle: 'OFFLINE', description: '천천히 걸으며 사진' };

/* ───────── audit · home ───────── */
test('OCV2-01 V1 is reused: the same three stores and collections; no new collection, no second post store', () => {
  for (const c of ['communityPosts', 'groupDrafts', 'meetupDrafts']) { assert.ok(COLLECTIONS.includes(c), c); assert.equal(classOf(c), 'PRIVATE'); }
  assert.equal(COLLECTIONS.includes('communityCompose'), false, 'the compose draft lives in communityPosts, next to the posts');
  assert.match(STORE, /listStore\(storage, 'communityPosts', normalizePost, now, \['compose'\]\)/);
  assert.equal((STORE.match(/listStore\(storage, '/g) || []).length, 3, 'still exactly three local stores');
  assert.match(APP, /createPostStore\(storage\)/);
  assert.equal(/communityCompose|createCommunityStore/.test(APP), false);
});

test('OCV2-02 honest empty state: no seed post fills the screen', () => {
  assert.match(VIEW, /'data-og-community-empty': 'posts', text: '아직 표시할 커뮤니티 글이 없어요\./);
  const { posts } = env();
  assert.equal(posts.list().length, 0);
  assert.equal(/seed|샘플 글|예시 글|fixture/i.test(SRC), false);
});

/* ───────── posts: create · draft · edit · delete · reload ───────── */
test('OCV2-03 create a local post: authorMode SELF, LOCAL_ONLY, never visible to others', () => {
  const { posts } = env();
  const r = posts.add(POST);
  assert.equal(r.ok, true);
  assert.equal(r.post.authorMode, 'SELF');
  assert.equal(C.deliveryState(r.post).id, 'LOCAL_ONLY');
  assert.equal(C.deliveryState(r.post).visibleToOthers, false);
  assert.deepEqual({ ...COMMUNITY_DELIVERY }, { published: false, visibleToOthers: false, server: false });
});

test('OCV2-04 임시 저장 is LOCAL_DRAFT and says so', () => {
  const { posts } = env();
  const p = posts.add({ ...POST, status: 'DRAFT' }).post;
  assert.equal(p.status, 'DRAFT');
  assert.equal(C.deliveryState(p).id, 'LOCAL_DRAFT');
  assert.match(C.deliveryState(p).label, /이 기기에만/);
});

test('OCV2-05 edit keeps id and createdAt, moves updatedAt; a draft can become a saved post', () => {
  const { posts } = env();
  const p = posts.add({ ...POST, status: 'DRAFT' }).post;
  const r = posts.update(p.id, { ...POST, title: '고친 제목', status: 'LOCAL' });
  assert.equal(r.post.id, p.id); assert.equal(r.post.createdAt, p.createdAt); assert.ok(r.post.updatedAt > p.updatedAt);
  assert.equal(r.post.status, 'LOCAL'); assert.equal(r.post.title, '고친 제목');
});

test('OCV2-06 delete removes the post; a second delete is NOT_FOUND', () => {
  const { posts } = env();
  const p = posts.add(POST).post;
  assert.equal(posts.remove(p.id).ok, true);
  assert.deepEqual(plain(posts.remove(p.id)), { ok: false, reason: 'NOT_FOUND' });
});

test('OCV2-07 reload persistence: a new store on the same storage reads the same posts and compose draft', () => {
  const { storage, posts } = env();
  posts.add(POST);
  posts.compose.save('', { title: '쓰다 만 글', body: '' });
  const again = createPostStore(storage);
  assert.equal(again.list().length, 1);
  assert.equal(again.compose.get().values.title, '쓰다 만 글');
});

/* ───────── validation · rendering safety ───────── */
test('OCV2-08 title: required, one line, control characters out, 120 at most', () => {
  const { posts } = env();
  assert.deepEqual(plain(posts.add({ ...POST, title: '   ' })), { ok: false, reason: 'INVALID_TITLE' });
  const p = posts.add({ ...POST, title: 'a\u0000b\u0007c\nd' + 'x'.repeat(300) }).post;
  assert.equal(/[\u0000-\u001f]/.test(p.title), false);
  assert.ok(p.title.length <= C.COMMUNITY_LIMITS.postTitle);
});

test('OCV2-09 body: required, line breaks kept, control characters out, 5000 at most; ID or card numbers are never stored', () => {
  const { posts } = env();
  assert.deepEqual(plain(posts.add({ ...POST, body: '' })), { ok: false, reason: 'INVALID_BODY' });
  assert.ok(posts.add({ ...POST, body: 'y'.repeat(9000) }).post.body.length <= C.COMMUNITY_LIMITS.postBody);
  assert.equal(posts.add({ ...POST, body: '카드 1234-5678-9012-3456 입니다' }).reason, 'SENSITIVE_NUMBER');
  assert.equal(posts.add({ ...POST, body: '주민번호 900101-1234567' }).reason, 'SENSITIVE_NUMBER');
  assert.equal(posts.count(), 1);
});

test('OCV2-10 safe rendering: text only (textContent), no innerHTML, eval, Function or script injection', () => {
  assert.equal(/innerHTML|insertAdjacentHTML|outerHTML\s*=|document\.write|\beval\(|new Function|setAttribute\('on/.test(SRC), false);
  assert.match(read('ongil-start/js/dom.js'), /textContent/);
  const { posts } = env();
  const p = posts.add({ ...POST, title: '<img src=x onerror=alert(1)>', body: '<script>alert(1)</script>' }).post;
  assert.equal(p.title, '<img src=x onerror=alert(1)>', 'kept as text — it is shown as text, never as markup');
});

test('OCV2-11 unsafe URLs: a profile avatar must be https; javascript:, data: and http: are refused; links keep safeHref', () => {
  for (const bad of ['javascript:alert(1)', 'data:image/png;base64,x', 'http://x.test/a.png', 'https://x.test/"onerror=x']) assert.throws(() => C.normalizeProfile({ displayName: '나', avatarUrl: bad }), /INVALID_AVATAR/, bad);
  assert.equal(C.normalizeProfile({ displayName: '나', avatarUrl: 'https://img.example.test/me.png' }).avatarUrl, 'https://img.example.test/me.png');
  assert.equal(/href: ['`]javascript|target: '_blank'/.test(VIEW), false, 'the community screen opens no outside page');
});

/* ───────── draft protection ───────── */
test('OCV2-12 draft protection: typed text is kept automatically and only thrown away after a confirmation', () => {
  assert.ok(COMPOSE_AUTOSAVE_MS > 0 && COMPOSE_AUTOSAVE_MS <= 1000);
  assert.match(VIEW, /autosaveTimer = setTimeout\(keep, COMPOSE_AUTOSAVE_MS\)/);
  assert.match(VIEW, /if \(dirty \|\| \(latest === null && state\.compose && state\.compose\.resumed\)\) \{ state\.composeAsk = true;/);
  assert.match(VIEW, /작성 중인 내용을 버릴까요\? 버리면 되돌릴 수 없어요\./);
  assert.match(VIEW, /'data-og-compose-keep': 'true', text: '계속 쓰기'/);
  assert.match(VIEW, /if \(kept && !id && !\(values && values\.source\)\)/, 'a new form never overwrites a kept draft');
  const { posts } = env();
  assert.equal(posts.compose.save('', { title: '', body: '' }).empty, true, 'nothing typed → nothing kept');
  assert.equal(posts.compose.save('', { title: '카드 1234 5678 9012 3456', body: '' }).reason, 'SENSITIVE_NUMBER');
});

test('OCV2-13 draft recovery: the kept draft survives saving other posts, a reload and a damaged value', () => {
  const { storage, posts } = env();
  posts.compose.save('', { type: 'QUESTION', category: 'HOBBY', title: '이어 쓸 글', body: '반쯤' });
  posts.add(POST); posts.add({ ...POST, title: '또 하나' });
  const again = createPostStore(storage);
  assert.deepEqual(plain(again.compose.get().values), { type: 'QUESTION', category: 'HOBBY', title: '이어 쓸 글', body: '반쯤' });
  const doc = storage.get('communityPosts', null);
  storage.set('communityPosts', { ...doc, compose: { values: 'broken' } });
  assert.equal(again.compose.get(), null, 'a damaged draft reads as none');
  assert.equal(again.list().length, 2, 'and the posts are untouched');
  assert.match(VIEW, /'data-og-draft-resume': 'true', text: '이어서 쓰기'/);
  assert.match(VIEW, /작성 중이던 \$\{what\}을\(를\) 버릴까요\? 되돌릴 수 없어요\./);
});

/* ───────── detail · no fake social data ───────── */
test('OCV2-14 post detail shows type, category, title, body, dates, local state and saved state', () => {
  for (const s of ["'data-og-post-delivery': deliveryState(post).id", "'data-og-post-visibility': 'local'", "id: 'og-post-detail-title'", "'data-og-post-body': 'true', text: post.body", '쓴 날', '고친 날', "'data-og-post-save': 'true'"]) assert.ok(VIEW.includes(s), s);
});

const FAKE = /조회수|views?Count|viewCount|likeCount|commentCount|memberCount|followers|팔로워|팔로잉|명 참여|인기|trending|popular|좋아요 \d|공감 \d|Math\.random/;
test('OCV2-15 no fake views', () => { assert.equal(/조회|viewCount|views:/.test(SRC), false); });
test('OCV2-16 no fake likes or reactions', () => { assert.equal(/likeCount|reactionCount|좋아요 \d|공감 \d/.test(SRC), false); });
test('OCV2-17 no fake comments', () => { assert.equal(/commentCount|comments\.push|addComment|댓글 \d/.test(SRC), false); });
test('OCV2-18 no fake users, authors or random data', () => { assert.equal(FAKE.test(SRC), false); assert.equal(/authorName|nickname: '|익명\d|user\d{2}/.test(SRC), false); });

/* ───────── comments · replies · reactions (decision: REMOTE_REQUIRED) ───────── */
test('OCV2-19 comments: REMOTE_REQUIRED (no local comment store); the contract keeps author from a server and replies by parent', () => {
  assert.equal(C.featureMode('COMMENT'), 'REMOTE_REQUIRED');
  assert.equal(/createCommentStore|'communityComments'/.test(SRC), false);
  assert.throws(() => C.normalizeComment({ id: 'cm_abcdef1', postId: 'cp_abcdef1', authorId: 'u', body: 'x' }), /INVALID_AUTHOR/);
});
test('OCV2-20 replies: a reply names its parent, never itself; a remote route checks the parent is on the same post', () => {
  assert.throws(() => C.normalizeComment({ id: 'cm_abcdef1', postId: 'cp_abcdef1', authorId: 'account123', body: 'x', parentId: 'cm_abcdef1' }), /INVALID_PARENT/);
  assert.match(C.COMMUNITY_REMOTE_CONTRACT.routes.find((r) => r.op === 'createComment').does, /same post/);
});
test('OCV2-21 reactions are truthful: no count, no local reaction; REMOTE_REQUIRED and the caller\'s own reaction only', () => {
  assert.equal(C.featureMode('REACTION'), 'REMOTE_REQUIRED');
  assert.match(C.COMMUNITY_REMOTE_CONTRACT.routes.find((r) => r.op === 'setReaction').does, /own reaction only/);
  assert.equal(/reactions?Store|'communityReactions'/.test(SRC), false);
});

/* ───────── profile · follow · block · report ───────── */
test('OCV2-22 profile boundary: four fields only; birth date, address, phone or health are refused; ACCOUNT_REQUIRED today', () => {
  assert.deepEqual([...C.PROFILE_FIELDS], ['displayName', 'avatarUrl', 'bio', 'interests']);
  for (const k of ['birthDate', 'address', 'phone', 'health', 'userId']) assert.throws(() => C.normalizeProfile({ displayName: '나', [k]: 'x' }), /UNEXPECTED_FIELD/, k);
  assert.equal(C.featureMode('PROFILE'), 'ACCOUNT_REQUIRED');
  assert.equal(C.COMMUNITY_FEATURES.find((f) => f.id === 'PROFILE').note, 'Newon+ 연결 후 사용할 수 있어요.');
  assert.equal(/createProfile|profileStore|'communityProfile'/.test(SRC), false, 'no profile is invented');
});
test('OCV2-23 follow: REMOTE_REQUIRED, no relation or count stored; the contract refuses a self-follow', () => {
  assert.equal(C.featureMode('FOLLOW'), 'REMOTE_REQUIRED');
  assert.throws(() => C.normalizeFollow({ followerUserId: 'account123', followedUserId: 'account123' }), /SELF_FOLLOW/);
  assert.equal(/'follows'|followStore/.test(SRC), false);
});
test('OCV2-24 block: REMOTE_REQUIRED and server-enforced; the screen never says it blocked anyone', () => {
  assert.equal(C.featureMode('BLOCK'), 'REMOTE_REQUIRED');
  assert.equal(/차단했어요|차단되었/.test(VIEW.replace(/그 전에는 차단했다고 말하지 않아요/g, '')), false);
  assert.match(C.COMMUNITY_REMOTE_CONTRACT.routes.find((r) => r.op === 'block').does, /server hides both ways on every read/);
});
test('OCV2-25 report: REMOTE_REQUIRED; no "접수" anywhere; a report starts as submitted only on a future server', () => {
  assert.equal(C.featureMode('REPORT'), 'REMOTE_REQUIRED');
  assert.equal(/신고가 접수|접수되었|신고했어요/.test(SRC), false);
  assert.equal(C.normalizeReport({ id: 'rp_abcdef1', targetType: 'POST', targetId: 'cp_abcdef1', reason: 'SPAM' }).status, 'submitted');
  assert.equal(C.normalizeReport({ id: 'rp_abcdef1', targetType: 'PROFILE', targetId: 'account123', reason: 'SPAM' }).targetType, 'USER', 'a profile is reported as its account');
});

test('OCV2-26 scam taxonomy: impersonation, money / investment requests, credential requests, outside contact, illegal sales', () => {
  const ids = C.ALL_REPORT_REASONS.map((r) => r.id);
  for (const id of ['SCAM', 'IMPERSONATION', 'FINANCIAL_SOLICITATION', 'CREDENTIAL_REQUEST', 'OFF_PLATFORM_CONTACT', 'ILLEGAL_SALE']) assert.ok(ids.includes(id), id);
  assert.deepEqual(C.REPORT_REASONS.map((r) => r.id), ['SPAM', 'HARASSMENT', 'PRIVACY', 'MISINFORMATION', 'SCAM', 'OTHER'], 'V1 reasons unchanged');
  assert.equal(C.safetyCheck('인증번호 좀 알려주세요').credential, true);
  assert.match(VIEW, /계좌번호·카드번호·인증번호·비밀번호는 누구에게도 알려 주거나 묻지 마세요/);
});
test('OCV2-27 unsafe medical advice: its own reason (HIGH); healthy-living posts carry the "not medical advice" boundary', () => {
  assert.equal(C.SAFETY_REPORT_REASONS.find((r) => r.id === 'UNSAFE_HEALTH_ADVICE').severity, 'HIGH');
  assert.match(VIEW, /post\.category === 'HEALTHY_LIVING' \? el\('p', \{ class: 'og-home-note', 'data-og-health-boundary': 'true', text: HEALTH_BOUNDARY \}\)/);
  assert.match(VIEW_RAW, /ONGIL의 의료 조언이 아니며, 진료와 약은 의사·약사와 상의하세요/);
  assert.equal(/치료됩니다|이 약을 드세요|완치/.test(SRC), false, 'the system never writes treatment advice');
});
test('OCV2-28 privacy taxonomy: PRIVACY reason; phone / detailed address flagged, ID and card numbers refused', () => {
  assert.ok(C.ALL_REPORT_REASONS.some((r) => r.id === 'PRIVACY'));
  const s = C.safetyCheck('010-1234-5678, 101동 1203호');
  assert.equal(s.phone && s.address && !s.blocked, true);
  assert.deepEqual(plain(C.privacyCheck('공원에서 만나요')), { blocked: false, phone: false, address: false }, 'V1 privacyCheck answer unchanged');
});

/* ───────── groups ───────── */
test('OCV2-29 group drafts: create, edit, delete (with their meetup drafts) — kept and working', () => {
  const { groups, meetups } = env();
  const g = groups.add(GROUP).group;
  meetups.add(g.id, { title: '첫 산책', date: '2026-10-10' });
  assert.equal(groups.update(g.id, { ...GROUP, name: '사진 산책 모임' }).group.name, '사진 산책 모임');
  groups.remove(g.id);
  assert.equal(groups.count() + meetups.count(), 0);
});
test('OCV2-30 no fake group: no directory entries, organiser or attendance; the directory is an honest empty state', () => {
  assert.match(VIEW, /공개된 모임 목록은 아직 없어요/);
  assert.equal(/organizer|attendance|참석자 \d|모임장/.test(SRC), false);
});
test('OCV2-31 no fake member count: a group draft has no members field and the screen shows none', () => {
  const { groups } = env();
  const g = groups.add(GROUP).group;
  assert.equal('members' in g || 'memberCount' in g, false);
  assert.equal(/memberCount|명 참여|회원 \d/.test(SRC), false);
});

/* ───────── search · boundaries ───────── */
test('OCV2-32 local search finds posts (title, body, type, category) and group drafts', () => {
  const { posts, groups } = env();
  posts.add(POST); posts.add({ ...POST, title: '걷기', body: '아침', category: 'LIFE' });
  groups.add(GROUP);
  assert.equal(C.filterPosts(posts.list(), { query: '사진' }).length, 1);
  assert.equal(C.filterPosts(posts.list(), { query: '취미' }).length, 1, 'category label');
  assert.equal(C.filterGroups(groups.list(), '사진').length, 1);
  assert.equal(C.filterGroups(groups.list(), '').length, 0, 'no query lists nothing');
});
test('OCV2-33 drafts and posts stay out of every public / global index', () => {
  assert.equal(maySearchGlobally('communityPosts'), false);
  assert.equal(maySync('communityPosts'), false);
  assert.equal(savedSyncPolicy('POST'), 'LOCAL_ONLY');
  assert.equal(/registerProvider\([^)]*communit/i.test(APP), false);
  assert.match(read('ongil-start/js/search.js'), /a saved community post is the user's own writing \(LOCAL_ONLY\) and is never searched/);
});
test('OCV2-34 health records never enter community (and community never reads them)', () => {
  assert.equal(/symptoms|healthNotes|healthMeasures|medication|checkIn|healthAppointments|emergencyContacts/.test(SRC), false);
});
test('OCV2-35 family records never enter community; Family V2 code is not touched by community', () => {
  assert.equal(/familySharing|helpRequests|family-(remote|service|repository|permissions|domain|connect)|FamilyRemote|ongil\/family/.test(SRC), false);
  assert.equal(familySharingAllowed('communityPosts'), false);
});
test('OCV2-36 My Life records never enter community', () => {
  assert.equal(/journal|expenses|sleepRecords|dailyLife|routines|tasks\.|'events'/.test(SRC), false);
});

/* ───────── filters · activity · saved · notifications ───────── */
test('OCV2-37 factual filters and order: state (저장 / 임시 / 내가 저장한 글) and dates only', () => {
  const { posts, saved } = env();
  const a = posts.add(POST).post; const b = posts.add({ ...POST, title: 'b', status: 'DRAFT' }).post;
  saved.toggle({ type: 'POST', id: a.id, title: a.title, href: communityHash('post', a.id) });
  const ids = new Set(saved.list({ type: 'POST' }).map((x) => x.id));
  assert.deepEqual(C.filterPosts(posts.list(), { state: 'DRAFT' }).map((p) => p.id), [b.id]);
  assert.deepEqual(C.filterPosts(posts.list(), { state: 'LOCAL' }).map((p) => p.id), [a.id]);
  assert.deepEqual(C.filterPosts(posts.list(), { state: 'SAVED', savedIds: ids }).map((p) => p.id), [a.id]);
  assert.deepEqual(C.POST_SORTS.map((s) => s.id), ['', 'created']);
});
test('OCV2-38 no fake popularity: no popular / trending / most-liked order exists', () => {
  assert.equal(/popular|trending|mostLiked|recommended|인기|추천순/.test(SRC), false);
});
test('OCV2-39 my posts: counted from this device and shown as a shortcut (내 활동)', () => {
  assert.match(VIEW, /row\('posts', '이 기기에 저장한 글', all\.length - drafts/);
  assert.match(VIEW, /이 기기에 있는 것만 세어요\. 다른 사람의 반응이나 방문 수는 없어요\./);
});
test('OCV2-40 my drafts: 임시 저장 and 작성 중인 글 are counted and open their list', () => {
  assert.match(VIEW, /row\('drafts', '임시 저장한 글', drafts, show\('DRAFT'/);
  assert.match(VIEW, /row\('composing', '작성 중인 글', composing/);
});
test('OCV2-41 saved integration: the existing Saved store; the link opens the post; deleting a post unsaves it', () => {
  assert.match(VIEW, /saved\.toggle\(\{ type: 'POST', id: post\.id, title: post\.title, description: [\s\S]{0,120}, href: communityHash\('post', post\.id\) \}\)/);
  assert.match(VIEW, /if \(saved\.isSaved\('POST', id\)\) saved\.unsave\('POST', id\);/);
  assert.equal(R.ownerRoute('POST', '#community/post-cp_abcdef1'), '#community/post-cp_abcdef1');
  assert.equal(R.ownerRoute('POST', '#care/facility'), '#community', 'a saved post can never open another screen');
  assert.match(APP, /origins: \{ POST: \(id\) => !!communityPosts\.get\(id\) \}/, 'a saved post whose post is gone is shown as gone');
});
test('OCV2-42 no fake notifications: community produces none', () => {
  assert.equal(/notifications?\.(add|push|notify|create)/.test(SRC), false);
});

/* ───────── deep links ───────── */
test('OCV2-43 valid addresses: #community/activity, post-, edit-, group- pass the router and the route check', () => {
  for (const s of ['activity', 'post-cp_abcdef12', 'edit-cp_abcdef12', 'group-gd_abcdef12']) {
    assert.equal(sectionOf(`#community/${s}`), s);
    assert.equal(resolveCommunitySection(s), s);
    assert.equal(R.canonicalHash(`#community/${s}`), `#community/${s}`);
  }
  assert.equal(communityHash('post', 'cp_abcdef12'), '#community/post-cp_abcdef12');
  assert.equal(communityItemSection('post', 'nope'), '');
});
test('OCV2-44 invalid addresses fall back to #community; other screens are unchanged', () => {
  for (const bad of ['#community/post-', '#community/post-CP_ABC', '#community/delete-cp_abcdef12', '#community/post-cp_abc/x', '#community/__proto__', '#community/constructor']) assert.equal(R.canonicalHash(bad), '#community', bad);
  /* markup characters are not an address at all (app.js then shows the screen itself, as for every screen) */
  for (const junk of ['#community/post-cp_<x>', '#community/"x']) assert.equal(['', '#community'].includes(R.canonicalHash(junk)), true, junk);
  assert.equal(R.canonicalHash('#life/calendar'), '#life/calendar');
  assert.equal(R.canonicalHash('#life/unknown_1'), '#life');
  assert.match(SECTION_RE.source, /^\^\[a-z\]\[a-z0-9_-\]\{0,60\}\$$/);
  assert.equal(resolveCommunitySection('toString'), '');
});
test('OCV2-45 deleted post / group: the address says plainly it is not on this device', () => {
  assert.match(VIEW, /찾을 수 없는 글이에요\. 지웠거나 이 기기에 없는 글이에요\./);
  assert.match(VIEW, /찾을 수 없는 모임 초안이에요\. 지웠거나 이 기기에 없는 초안이에요\./);
});

/* ───────── repositories · remote contract · authorization ───────── */
test('OCV2-46 local repository: the posts, compose draft and group stores are the only working side', () => {
  const { storage } = env();
  const repo = selectCommunityRepository({ storage });
  assert.equal(repo.mode, 'LOCAL');
  assert.equal(typeof repo.posts.compose.save, 'function');
});
test('OCV2-47 remote unavailable: every remote operation refuses with REMOTE_NOT_CONFIGURED, never success', async () => {
  const remote = createRemoteCommunityRepository();
  assert.equal(remote.configured, false);
  for (const r of C.COMMUNITY_REMOTE_CONTRACT.routes) assert.deepEqual(plain(await remote[r.op]({})), { ok: false, reason: 'REMOTE_NOT_CONFIGURED' }, r.op);
  assert.equal(/fetch\(|XMLHttpRequest|WebSocket|sendBeacon|\/api\//.test(SRC), false, 'no network in community code');
});
test('OCV2-48 remote contract: posts, comments, reactions, profiles, follows, blocks, reports, groups; bounded pages', () => {
  const c = C.COMMUNITY_REMOTE_CONTRACT;
  assert.equal(c.status, 'CONTRACT_ONLY');
  assert.equal(c.base, 'ongil/community');
  assert.ok(c.pageMax <= 50);
  for (const p of ['posts', 'posts/{id}', 'posts/{id}/comments', 'posts/{id}/reaction', 'profiles/{id}', 'follows/{id}', 'blocks/{id}', 'reports', 'groups']) assert.ok(c.routes.some((r) => r.path === p), p);
  assert.equal(new Set(c.routes.map((r) => r.op)).size, c.routes.length);
});
test('OCV2-49 token identity: the Newon+ ID token is the only identity; client user ids are refused (contract + docs)', () => {
  assert.match(C.COMMUNITY_REMOTE_CONTRACT.auth, /Newon\+ ID token in the Authorization header; the server derives the account/);
  assert.match(read('ongil-start/js/community-contracts.js'), /a userId \/ authorId \/\s*\n?\s*\*?\s*memberId \/ ownerId in a body or query is refused, never trusted/);
  assert.match(DOC, /client-sent `userId`, `authorId`, `memberId` or `ownerId` is refused/);
});
test('OCV2-50 author-only mutation: update / delete of posts and comments are AUTHOR operations', () => {
  for (const op of ['updatePost', 'deletePost', 'deleteComment']) assert.equal(C.COMMUNITY_REMOTE_CONTRACT.routes.find((r) => r.op === op).who, 'AUTHOR', op);
});
test('OCV2-51 IDOR: an id the caller may not use answers like an id that does not exist (contract + docs)', () => {
  assert.match(read('ongil-start/js/community-contracts.js'), /answers like an id that\s*\n?\s*\*?\s*does not exist \(no IDOR, no enumeration\)/);
  assert.match(DOC, /IDOR/);
});

/* ───────── boundaries ───────── */
test('OCV2-52 Family V2 privacy boundary: no family route, member, permission or snapshot in community; family code has no community', () => {
  assert.equal(/ongil\/family|familyRemote|permissions|consents|snapshots/.test(SRC), false);
  for (const f of ['ongil-start/js/family-remote.js', 'ongil-start/js/family-remote-view.js', 'server/ongil/family/http.mjs', 'server/ongil/family/store.mjs']) assert.equal(/communit/i.test(strip(read(f))), false, f);
});
test('OCV2-53 health boundary: community is PRIVATE, health records are HEALTH_ADJACENT and never shared into it', () => {
  assert.equal(classOf('healthMeasures'), 'HEALTH_ADJACENT');
  assert.equal(classOf('communityPosts'), 'PRIVATE');
  assert.match(VIEW, /내 건강 기록이나 가족 공유 설정은 커뮤니티에 함께 올라가지 않아요/);
});
test('OCV2-54 location boundary: no geolocation; region is a coarse choice; meetups suggest public places', () => {
  assert.equal(/geolocation|getCurrentPosition|latitude|longitude/.test(SRC), false);
  assert.match(VIEW, /정확한 집 주소 대신 ‘○○공원 정문’처럼 공공장소 이름을 적어 주세요/);
  assert.match(VIEW, /집 주소는 알려 주지 마세요/);
  assert.equal(C.normalizeMeetup({ id: 'mt_abcdef1', groupId: 'gd_abcdef1', title: 'x', date: '2026-10-10' }).placeVisibility, 'PRIVATE');
});
test('OCV2-55 AI boundary: the helper cannot write community data and community never calls the helper', () => {
  for (const c of ['communityPosts', 'groupDrafts', 'meetupDrafts']) assert.ok(NO_WRITE_AREAS.includes(c), c);
  assert.equal(/assistant|openai|ai-/i.test(SRC), false);
});
test('OCV2-56 analytics privacy: only a content-free event; no title, body, search text or draft in any counter', () => {
  assert.deepEqual([...EVENTS.community_post_saved], []);
  assert.equal(/track\(|analytics/.test(SRC), false, 'the community screen counts nothing itself');
  assert.equal(/console\.(log|info|warn)/.test(SRC), false, 'and logs nothing');
});

/* ───────── integrity · scale ───────── */
test('OCV2-57 corrupt storage: damaged items are skipped one by one; a damaged compose draft reads as none', () => {
  const { storage } = env();
  storage.set('communityPosts', { schemaVersion: 1, items: [null, 7, { id: 'x' }, { id: 'cp_goodpost1', type: 'DAILY', category: 'LIFE', title: 't', body: 'b', status: 'LOCAL', createdAt: 1, updatedAt: 1 }], compose: 'junk' });
  const posts = createPostStore(storage);
  assert.deepEqual(posts.list().map((p) => p.id), ['cp_goodpost1']);
  assert.equal(posts.compose.get(), null);
});
test('OCV2-58 duplicate ids are dropped on read', () => {
  const { storage } = env();
  const one = { id: 'cp_dupdupdup', type: 'DAILY', category: 'LIFE', title: 't', body: 'b', status: 'LOCAL', createdAt: 1, updatedAt: 1 };
  storage.set('communityPosts', { schemaVersion: 1, items: [one, { ...one, title: 'other' }] });
  assert.equal(createPostStore(storage).list().length, 1);
});
test('OCV2-59 delete cascade: post → its Saved entry (view); group → its meetup drafts; a kept edit draft of a deleted post is offered as a new post', () => {
  const { groups, meetups } = env();
  const g = groups.add(GROUP).group;
  meetups.add(g.id, { title: 'a', date: '2026-10-10' });
  groups.remove(g.id);
  assert.equal(meetups.count(), 0);
  assert.match(VIEW, /고치던 글은 지워져서, 새 글로 이어 쓸 수 있어요\./);
});
function bulk(n) {
  const items = [];
  for (let i = 0; i < n; i++) items.push({ schemaVersion: 1, id: `cp_bulk${String(i).padStart(6, '0')}`, authorMode: 'SELF', type: 'DAILY', category: 'LIFE', title: `기록 ${i}`, body: `내용 ${i}`, status: i % 2 ? 'LOCAL' : 'DRAFT', createdAt: NOW - i, updatedAt: NOW - i });
  return items;
}
for (const [id, n] of [['OCV2-60', 100], ['OCV2-61', 500], ['OCV2-62', 1000]]) {
  test(`${id} ${n} local records: read, filtered and searched quickly; the list shows ${POST_PAGE} at a time`, () => {
    const { storage } = env();
    storage.set('communityPosts', { schemaVersion: 1, items: bulk(n) });
    const posts = createPostStore(storage);
    const t0 = performance.now();
    const all = posts.list();
    const drafts = C.filterPosts(all, { state: 'DRAFT' });
    const found = C.filterPosts(all, { query: `기록 ${n - 1}` });
    const ms = performance.now() - t0;
    assert.equal(all.length, n); assert.equal(drafts.length, n / 2); assert.ok(found.length >= 1);
    assert.ok(ms < 1500, `${ms.toFixed(0)} ms`);
    assert.equal(all.slice(0, POST_PAGE).length, Math.min(POST_PAGE, n));
  });
}
test('OCV2-63 bounded DOM: 20 rows per page with 더 보기; search shows at most five group drafts; no infinite scroll', () => {
  assert.equal(POST_PAGE, 20);
  assert.match(VIEW, /const page = list\.slice\(0, state\.shown\);/);
  assert.match(VIEW, /found\.slice\(0, 5\)/);
  assert.equal(/IntersectionObserver|addEventListener\('scroll'/.test(VIEW), false);
});

/* ───────── browser: responsive · keyboard · focus · zoom (skipped without a local Chromium) ───────── */
const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const canBrowse = fs.existsSync(PW) && fs.existsSync(CHROME);
const skip = !canBrowse && 'no local Chromium';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
let B = null, SERVER = null, BASE = '';
async function boot() {
  if (B) return;
  const { chromium } = await import(PW);
  SERVER = await new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); return res.end(fs.readFileSync(f)); }
      res.writeHead(404); res.end();
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
  BASE = `http://127.0.0.1:${SERVER.address().port}`;
  B = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
}
test.after(async () => { if (B) await B.close(); if (SERVER) SERVER.close(); });
async function page(width, hash = '#community') {
  await boot();
  const ctx = await B.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  await ctx.route('**/*', (r) => (r.request().url().startsWith(BASE) ? r.continue() : r.abort()));
  const pg = await ctx.newPage();
  pg._errors = []; pg.on('pageerror', (e) => pg._errors.push(e.message));
  await pg.goto(`${BASE}/ongil-start/${hash}`, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
  return pg;
}
const layout = (pg, scope) => pg.evaluate((scope) => {
  const vis = (e) => { const s = getComputedStyle(e); const b = e.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0 && !e.closest('[hidden]'); };
  const root = document.querySelector(scope);
  const inter = [...root.querySelectorAll('a[href],button,input,select,textarea')].filter(vis);
  const small = inter.filter((e) => { const b = e.getBoundingClientRect(); return b.height < 44 || b.width < 44; }).map((e) => e.outerHTML.slice(0, 70));
  return { over: document.documentElement.scrollWidth - document.documentElement.clientWidth, small, n: inter.length };
}, scope);
async function fill(pg) {
  await pg.evaluate(() => {
    const P = window.Ongil.communityPosts;
    for (let i = 0; i < 25; i++) P.add({ type: 'DAILY', category: i % 2 ? 'HEALTHY_LIVING' : 'LIFE', title: '아주긴제목을가진글입니다'.repeat(6) + i, body: '긴내용'.repeat(300), status: i % 3 ? 'LOCAL' : 'DRAFT' });
    window.Ongil.groupDrafts.add({ name: '모임'.repeat(35), category: 'OTHER', meetingStyle: 'BOTH', description: '설명'.repeat(200) });
  });
  await pg.evaluate(() => { location.hash = '#ongil-home'; }); await pg.waitForTimeout(200);
  await pg.evaluate(() => { location.hash = '#community'; }); await pg.waitForTimeout(400);
}
for (const [id, w] of [['OCV2-64', 320], ['OCV2-65', 390], ['OCV2-66', 768], ['OCV2-67', 1024], ['OCV2-68', 1440]]) {
  test(`${id} browser ${w}px: home, list, write form, discard confirmation and detail — no overflow, every target ≥ 44px`, { skip }, async () => {
    const pg = await page(w);
    for (const step of ['empty', 'filled', 'form', 'confirm', 'detail']) {
      if (step === 'filled') await fill(pg);
      if (step === 'form') { await pg.locator('[data-og-post-write]').click(); await pg.waitForTimeout(200); }
      if (step === 'confirm') { await pg.locator('form[data-og-post-form] input[name=title]').fill('x'); await pg.locator('form[data-og-post-form] [data-og-submit="cancel"]').click(); await pg.waitForTimeout(200); }
      if (step === 'detail') { await pg.locator('[data-og-compose-discard]').click(); await pg.waitForTimeout(200); await pg.locator('[data-og-post-open]').first().click(); await pg.waitForTimeout(300); }
      const r = await layout(pg, step === 'detail' ? '#og-post-detail' : '[data-og-screen="community"]');
      assert.equal(r.over, 0, `${w} ${step}: page overflow ${r.over}px`);
      assert.deepEqual(r.small, [], `${w} ${step}: small targets`);
    }
    assert.deepEqual(pg._errors, []);
    await pg.context().close();
  });
}
test('OCV2-69 browser keyboard: write → 임시 저장 → open → Escape, all from the keyboard; the discard confirmation answers Escape', { skip }, async () => {
  const pg = await page(390);
  await pg.locator('[data-og-post-write]').focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(200);
  assert.equal(await pg.evaluate(() => document.activeElement.name), 'type', 'focus starts on the first field');
  await pg.keyboard.press('ArrowDown');
  await pg.keyboard.press('Tab'); await pg.keyboard.press('ArrowDown');
  await pg.keyboard.press('Tab'); await pg.keyboard.type('키보드로 쓴 글');
  await pg.keyboard.press('Tab'); await pg.keyboard.type('내용');
  await pg.locator('form[data-og-post-form] [data-og-submit="cancel"]').focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(200);
  assert.equal(await pg.evaluate(() => document.activeElement.dataset.ogComposeKeep), 'true', '계속 쓰기 has focus');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
  assert.equal(await pg.locator('form[data-og-post-form]').count(), 1, 'Escape keeps writing');
  await pg.locator('form[data-og-post-form] [data-og-submit="DRAFT"]').focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
  const row = pg.locator('[data-og-post-open]').first();
  assert.equal(await pg.evaluate(() => document.activeElement.dataset.ogPostOpen && 1), 1, 'focus moves to the saved post');
  await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
  assert.equal(await pg.evaluate(() => document.querySelector('#og-post-detail').open), true);
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
  assert.equal(await pg.evaluate(() => document.querySelector('#og-post-detail').open), false);
  assert.equal(await row.evaluate((n) => n === document.activeElement), true, 'focus returns to the row');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});
test('OCV2-70 browser focus and addresses: a kept draft after reload; #community/post-<id> opens and closes with focus kept on the screen', { skip }, async () => {
  const pg = await page(390);
  await pg.locator('[data-og-post-write]').click(); await pg.waitForTimeout(200);
  await pg.locator('form[data-og-post-form] input[name=title]').fill('다시 열 글');
  await pg.waitForTimeout(COMPOSE_AUTOSAVE_MS + 400);
  await pg.reload(); await pg.waitForTimeout(800);
  assert.equal(await pg.locator('[data-og-draft-banner="new"]').count(), 1, 'the kept draft is offered after a reload');
  await pg.locator('[data-og-draft-resume]').click(); await pg.waitForTimeout(200);
  assert.equal(await pg.locator('form[data-og-post-form] input[name=title]').inputValue(), '다시 열 글');
  const id = await pg.evaluate(() => window.Ongil.communityPosts.add({ type: 'DAILY', category: 'LIFE', title: '주소로 여는 글', body: 'b' }).post.id);
  await pg.goto(`${BASE}/ongil-start/#community/post-${id}`); await pg.waitForTimeout(800);
  assert.equal(await pg.evaluate(() => document.querySelector('#og-post-detail').open), true, 'the address opens the post');
  assert.equal(await pg.evaluate(() => document.activeElement.id), 'og-post-detail-title');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
  assert.equal(await pg.evaluate(() => location.hash), '#community');
  assert.ok(await pg.evaluate(() => !!document.activeElement.closest('[data-og-screen="community"]')), 'focus stays on the community screen');
  await pg.evaluate((id) => { window.Ongil.communityPosts.remove(id); location.hash = '#community/post-' + id; }, id); await pg.waitForTimeout(500);
  assert.match(await pg.locator('[data-og-community-missing]').innerText(), /찾을 수 없는 글이에요/);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});
test('OCV2-71 browser 200% text at 320px: no overflow, nothing clipped in the list, form or detail', { skip }, async () => {
  const pg = await page(320);
  await fill(pg);
  await pg.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await pg.waitForTimeout(300);
  assert.equal((await layout(pg, '[data-og-screen="community"]')).over, 0);
  await pg.locator('[data-og-post-write]').click(); await pg.waitForTimeout(200);
  assert.equal((await layout(pg, '[data-og-screen="community"]')).over, 0);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

/* ───────── protection of other products ───────── */
test('OCV2-72 LIVON untouched: no LIVON file is read or written by community code', () => {
  assert.equal(/livon|LivonApi|\/livon\//i.test(SRC), false);
});
test('OCV2-73 Family V2 preserved: the family route, store and migrations are present and unchanged in shape', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'api/ongil/family.mjs')));
  for (const f of ['001_family.sql', '002_family_limits.sql']) assert.ok(fs.existsSync(path.join(ROOT, 'server/ongil/family/migrations', f)), f);
  assert.match(read('server/ongil/family/http.mjs'), /export const LIMIT_SQLSTATE = Object\.freeze\(\{ members: 'OGF01', invitations: 'OGF02' \}\);/);
  assert.equal(/communit/i.test(read('api/ongil/family.mjs')), false);
});

/* ───────── extras ───────── */
test('OCV2-74 every feature row names a real mode; what works locally is exactly the V1 + V2 local features', () => {
  for (const f of C.COMMUNITY_FEATURES) assert.ok(C.FEATURE_MODES.includes(f.mode), f.id);
  assert.deepEqual(C.COMMUNITY_FEATURES.filter((f) => f.mode === 'LOCAL').map((f) => f.id), ['WRITE', 'DRAFT', 'SEARCH', 'SAVE', 'GROUP_DRAFT']);
  assert.match(VIEW, /COMMUNITY_FEATURES\.filter\(\(f\) => f\.mode !== 'LOCAL'\)/);
});
test('OCV2-75 the documentation covers every required part', () => {
  for (const h of ['Existing audit', 'Product purpose', 'Senior UX', 'Local mode', 'Remote mode', 'Post model', 'Drafts', 'Comments and replies', 'Reactions', 'Profile', 'Follow', 'Block', 'Report', 'Moderation', 'Scam safety', 'Medical-content boundary', 'Groups', 'Meeting safety', 'Region privacy', 'Family boundary', 'Health boundary', 'My Life boundary', 'Search', 'Saved', 'Notifications', 'Newon+ boundary', 'AI boundary', 'Analytics and log privacy', 'Remote contract', 'Authorization', 'Known limitations', 'Activation roadmap'])
    assert.match(DOC, new RegExp(`^## .*${h.replace(/[+]/g, '\\+')}`, 'mi'), h);
});
