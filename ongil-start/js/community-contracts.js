/*
 * Community + Groups contracts (Phase 6).
 *
 * Built and stored on this device (community.js):
 *   CommunityPost   the user's own writing. authorMode is always SELF; status DRAFT (임시 저장) or LOCAL (이 기기에 저장).
 *   GroupDraft      a group the user is preparing (모임 초안). Nobody else can see or join it.
 *   MeetupDraft     a meeting planned inside one group draft (모임 일정 초안).
 * Contracts only (no code creates one — they need a community server, other users and moderation):
 *   Comment (replies = parentId) · Reaction · Report · Block
 *
 * There is no other author, member, follower, view count, like count or "popular" anywhere in this model.
 * Nothing here is published, sent or shared. Text is plain text and is rendered with textContent.
 *
 * Community V2 adds, without changing the stored shape of a post:
 *   deliveryState()      what happened to a post, said truthfully (LOCAL_DRAFT · LOCAL_ONLY; REMOTE_* only from a server)
 *   COMMUNITY_FEATURES   every feature with the mode it works in today (LOCAL / ACCOUNT_REQUIRED / REMOTE_REQUIRED)
 *   compose drafts       what is being typed, kept on this device until it is saved or thrown away on purpose
 *   report reasons       a senior-safety taxonomy (fraud, impersonation, money requests, unsafe health advice …)
 *   profile · follow     contracts only (no profile, follow or block exists until Newon+ and a community server do)
 *   COMMUNITY_REMOTE_CONTRACT  the operations a future server must offer and the rules it must enforce
 */
import { ContractError, isPlainObject, SCHEMA_VERSION } from './contracts.js';
import { isDateKey, isTime } from './dates.js';

const opt = (id, label) => Object.freeze({ id, label });
const ID_RE = /^[a-z]{2,4}_[a-z0-9]{6,40}$/;
const stamp = (value, fallback) => (Number.isSafeInteger(value) && value > 0 ? value : fallback);
const oneOf = (value, options) => (options.some((o) => o.id === value) ? value : '');

/* single-line text: control characters out, spaces collapsed, cut to max */
export function lineText(value, max) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}
/* multi-line text: line breaks kept (max two in a row), other control characters out, cut to max */
export function blockText(value, max) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
}

/* the same limits in the model and in every form (maxlength) */
export const COMMUNITY_LIMITS = Object.freeze({ postTitle: 120, postBody: 5000, posts: 500, groupName: 80, groupDescription: 2000, groups: 100, meetupTitle: 120, meetupDescription: 2000, meetupPlace: 60, meetups: 300, sourceTitle: 120 });

/* ───────── posts ───────── */

export const POST_TYPES = Object.freeze([opt('QUESTION', '질문'), opt('EXPERIENCE', '경험'), opt('INFORMATION', '정보'), opt('REVIEW', '후기'), opt('TIP', '팁'), opt('DAILY', '일상')]);
/* "건강 생활" is everyday healthy living — not a medical advice board, and no health record is ever attached */
export const POST_CATEGORIES = Object.freeze([opt('LIFE', '생활'), opt('HEALTHY_LIVING', '건강 생활'), opt('HOBBY', '취미'), opt('LEARNING', '배움'), opt('CULTURE', '문화'), opt('OUTING', '나들이'), opt('LOCAL', '지역'), opt('DIGITAL', '디지털'), opt('OTHER', '기타')]);
export const POST_STATUSES = Object.freeze([opt('DRAFT', '임시 저장'), opt('LOCAL', '이 기기에 저장')]);
/*
 * Where a post is, in words that are always true. A post on this device is LOCAL_DRAFT or LOCAL_ONLY — never shown to anyone
 * else. REMOTE_REQUIRED names what sharing would need; REMOTE_PUBLISHED can only ever come from a server's answer (none today).
 */
export const DELIVERY_STATES = Object.freeze({
  LOCAL_DRAFT: Object.freeze({ id: 'LOCAL_DRAFT', label: '임시 저장 · 이 기기에만 있어요', visibleToOthers: false }),
  LOCAL_ONLY: Object.freeze({ id: 'LOCAL_ONLY', label: '이 기기에 저장됨 · 다른 사용자에게 공개되지 않아요', visibleToOthers: false }),
  REMOTE_REQUIRED: Object.freeze({ id: 'REMOTE_REQUIRED', label: '다른 사람과 나누려면 Newon+ 계정과 커뮤니티 서버가 필요해요 (아직 없음)', visibleToOthers: false }),
  REMOTE_PUBLISHED: Object.freeze({ id: 'REMOTE_PUBLISHED', label: '커뮤니티 서버가 받은 글', visibleToOthers: true }),
});
export const deliveryState = (post) => (post && post.status === 'DRAFT' ? DELIVERY_STATES.LOCAL_DRAFT : DELIVERY_STATES.LOCAL_ONLY);
export const AUTHOR_MODES = Object.freeze(['SELF']);
/* where a review started (즐길거리): a reference only, never the provider's text */
export const SOURCE_TYPES = Object.freeze(['PROGRAM', 'CLASS', 'EVENT', 'PLACE']);

export function normalizePost(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_POST');
  if (!ID_RE.test(String(input.id))) throw new ContractError('INVALID_ID');
  if (!oneOf(input.type, POST_TYPES)) throw new ContractError('INVALID_TYPE');
  if (!oneOf(input.category, POST_CATEGORIES)) throw new ContractError('INVALID_CATEGORY');
  const title = lineText(input.title, COMMUNITY_LIMITS.postTitle);
  if (!title) throw new ContractError('INVALID_TITLE');
  const body = blockText(input.body, COMMUNITY_LIMITS.postBody);
  if (!body) throw new ContractError('INVALID_BODY');
  const src = isPlainObject(input.source) ? input.source : null;
  const source = src && SOURCE_TYPES.includes(src.sourceType) && typeof src.sourceId === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,120}$/.test(src.sourceId) ? { sourceType: src.sourceType, sourceId: src.sourceId, sourceTitle: lineText(src.sourceTitle, COMMUNITY_LIMITS.sourceTitle) } : null;
  return {
    schemaVersion: SCHEMA_VERSION,
    id: input.id,
    authorMode: 'SELF',
    type: input.type,
    category: input.category,
    title,
    body,
    status: input.status === 'DRAFT' ? 'DRAFT' : 'LOCAL',
    ...(source ? { source } : {}),
    createdAt: stamp(input.createdAt, now),
    updatedAt: stamp(input.updatedAt, now),
  };
}

/*
 * A gentle privacy check before saving: a resident registration number is never stored; a phone number or a
 * detailed address only gets a reminder. This is a pattern check, not moderation, and it says so.
 */
const RRN = /\d{6}\s?-\s?[1-8]\d{6}/;
/* a payment card number (4-4-4-4) is never stored either */
const CARD = /\b\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}\b/;
/* words that scams use to get people to hand over access: a reminder, never a block (the user may be warning others) */
const CREDENTIAL = /인증\s?번호|비밀\s?번호|OTP|보안\s?카드|계좌\s?번호|카드\s?번호|공인\s?인증서|원격\s?(제어|지원)\s?앱/i;
const PHONE = /(01[016789]|0\d{1,2})[-.\s]?\d{3,4}[-.\s]?\d{4}/;
const DETAIL_ADDRESS = /\d+\s?동\s?\d+\s?호|\d+\s?호(?![가-힣])|(?:로|길)\s?\d+(?:-\d+)?\s?\d*\s?(?:층|호)/;
export function privacyCheck(...texts) {
  const all = texts.filter((t) => typeof t === 'string').join('\n');
  return { blocked: RRN.test(all), phone: PHONE.test(all), address: DETAIL_ADDRESS.test(all) };
}
/* Community V2: the same check plus the scam-safety signals (kept apart so privacyCheck keeps its V1 answer) */
export function safetyCheck(...texts) {
  const all = texts.filter((t) => typeof t === 'string').join('\n');
  const base = privacyCheck(...texts);
  return { ...base, blocked: base.blocked || CARD.test(all), card: CARD.test(all), credential: CREDENTIAL.test(all) };
}

/* list / search / filter over the user's own posts (title, body, type and category names) */
const norm = (s) => String(s || '').toLowerCase().replace(/[\s·]+/g, '');
const label = (list, id) => (list.find((o) => o.id === id) || { label: '' }).label;
export function filterPosts(posts, { type = '', category = '', query = '', state = '', savedIds = null, sort = '' } = {}) {
  const q = norm(lineText(query, 60));
  const out = (Array.isArray(posts) ? posts : []).filter((p) => {
    if (type && p.type !== type) return false;
    if (category && p.category !== category) return false;
    /* Community V2 — factual filters only: what is stored (임시 저장 / 이 기기에 저장) and what the user saved */
    if (state === 'DRAFT' && p.status !== 'DRAFT') return false;
    if (state === 'LOCAL' && p.status === 'DRAFT') return false;
    if (state === 'SAVED' && !(savedIds && savedIds.has(p.id))) return false;
    if (q && ![p.title, p.body, label(POST_TYPES, p.type), label(POST_CATEGORIES, p.category)].some((f) => norm(f).includes(q))) return false;
    return true;
  });
  /* order by dates the user made — never by counts, people or ranking */
  if (sort === 'created') out.sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id));
  return out;
}
export const POST_FILTER_STATES = Object.freeze([opt('', '전체'), opt('LOCAL', '이 기기에 저장'), opt('DRAFT', '임시 저장'), opt('SAVED', '내가 저장한 글')]);
export const POST_SORTS = Object.freeze([opt('', '최근 고친 순'), opt('created', '최근 쓴 순')]);
/* group drafts found by the same words (name, description, category, meeting style, region) */
export function filterGroups(groups, query = '') {
  const q = norm(lineText(query, 60));
  if (!q) return [];
  return (Array.isArray(groups) ? groups : []).filter((g) => [g.name, g.description, g.region, label(GROUP_CATEGORIES, g.category), label(MEETING_STYLES, g.meetingStyle)].some((f) => norm(f).includes(q)));
}
/*
 * Compose draft (Community V2): what is being typed in the write form, kept on this device so that nothing is lost by a
 * reload or by leaving the screen. It is not a post: values are cut to the post limits but not validated, and it is only
 * removed when the user saves the post or throws the draft away on purpose. editId points at the post being changed.
 */
export function normalizeComposeDraft(input, now = Date.now()) {
  if (!isPlainObject(input) || !isPlainObject(input.values)) return null;
  const v = input.values;
  const values = { type: oneOf(v.type, POST_TYPES), category: oneOf(v.category, POST_CATEGORIES), title: lineText(v.title, COMMUNITY_LIMITS.postTitle), body: blockText(v.body, COMMUNITY_LIMITS.postBody) };
  const src = isPlainObject(v.source) && SOURCE_TYPES.includes(v.source.sourceType) && typeof v.source.sourceId === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,120}$/.test(v.source.sourceId) ? { sourceType: v.source.sourceType, sourceId: v.source.sourceId, sourceTitle: lineText(v.source.sourceTitle, COMMUNITY_LIMITS.sourceTitle) } : null;
  if (!values.title && !values.body) return null;
  const editId = typeof input.editId === 'string' && ID_RE.test(input.editId) ? input.editId : '';
  return { editId, values: src ? { ...values, source: src } : values, savedAt: stamp(input.savedAt, now) };
}

/* the list shows a summary, never the whole body */
export function summaryOf(body, max = 80) {
  const one = lineText(body, max + 1);
  return one.length > max ? `${one.slice(0, max)}…` : one;
}

/* ───────── future: comments · replies · reactions · reports · blocks (contracts only) ───────── */

const USER_ID = /^[A-Za-z0-9_-]{6,128}$/;
export const COMMENT_STATUSES = Object.freeze(['visible', 'hidden', 'deleted']);
/* authorId comes from the future account server; a reply is a comment with parentId */
export function normalizeComment(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_COMMENT');
  if (!ID_RE.test(String(input.id)) || !ID_RE.test(String(input.postId))) throw new ContractError('INVALID_ID');
  if (!USER_ID.test(String(input.authorId))) throw new ContractError('INVALID_AUTHOR');
  const body = blockText(input.body, 1000);
  if (!body) throw new ContractError('INVALID_BODY');
  const parentId = input.parentId === undefined || input.parentId === null || input.parentId === '' ? null : String(input.parentId);
  if (parentId !== null && (!ID_RE.test(parentId) || parentId === input.id)) throw new ContractError('INVALID_PARENT');
  return { schemaVersion: SCHEMA_VERSION, id: input.id, postId: input.postId, authorId: input.authorId, body, parentId, createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now), status: COMMENT_STATUSES.includes(input.status) ? input.status : 'visible' };
}

export const REACTION_TYPES = Object.freeze([opt('LIKE', '좋아요'), opt('HELPFUL', '도움돼요')]);
export function normalizeReaction(input) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_REACTION');
  if (!ID_RE.test(String(input.postId))) throw new ContractError('INVALID_ID');
  if (!USER_ID.test(String(input.userId))) throw new ContractError('INVALID_USER');
  if (!oneOf(input.type, REACTION_TYPES)) throw new ContractError('INVALID_TYPE');
  return { postId: input.postId, userId: input.userId, type: input.type };
}

export const REPORT_REASONS = Object.freeze([opt('SPAM', '광고·도배'), opt('HARASSMENT', '괴롭힘·욕설'), opt('PRIVACY', '개인정보 노출'), opt('MISINFORMATION', '잘못된 정보'), opt('SCAM', '사기 의심'), opt('OTHER', '기타')]);
/*
 * Community V2 — senior-safety reasons, for the future moderation server. SCAM above stays the general "사기 의심"
 * (fraud / voice phishing); these name the patterns that target older people. Severity orders a future review queue;
 * it never hides or removes anything on this device. A contract only: no report is sent or "접수" anywhere today.
 */
export const SAFETY_REPORT_REASONS = Object.freeze([
  Object.freeze({ id: 'IMPERSONATION', label: '가족·기관을 사칭해요', severity: 'HIGH' }),
  Object.freeze({ id: 'FINANCIAL_SOLICITATION', label: '돈·투자·대출을 권해요', severity: 'HIGH' }),
  Object.freeze({ id: 'CREDENTIAL_REQUEST', label: '계좌번호·인증번호·비밀번호를 물어요', severity: 'HIGH' }),
  Object.freeze({ id: 'OFF_PLATFORM_CONTACT', label: '모르는 곳으로 연락하라고 해요', severity: 'MEDIUM' }),
  Object.freeze({ id: 'UNSAFE_HEALTH_ADVICE', label: '위험한 건강·약 정보예요', severity: 'HIGH' }),
  Object.freeze({ id: 'ILLEGAL_SALE', label: '불법 판매예요', severity: 'HIGH' }),
]);
export const ALL_REPORT_REASONS = Object.freeze([...REPORT_REASONS, ...SAFETY_REPORT_REASONS]);
export const REPORT_TARGETS = Object.freeze(['POST', 'COMMENT', 'GROUP', 'MEETUP', 'USER']);
/* the profile is reported as the account behind it: USER (kept for V1 compatibility) */
export const REPORT_TARGET_ALIASES = Object.freeze({ PROFILE: 'USER' });
export const REPORT_STATUSES = Object.freeze(['submitted', 'reviewing', 'resolved', 'dismissed']);
/* contract only: a report is accepted and tracked by the future moderation server, never "completed" by this device */
export function normalizeReport(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_REPORT');
  if (!ID_RE.test(String(input.id))) throw new ContractError('INVALID_ID');
  const targetType = REPORT_TARGET_ALIASES[input.targetType] || input.targetType;
  if (!REPORT_TARGETS.includes(targetType)) throw new ContractError('INVALID_TARGET');
  if (!/^[A-Za-z0-9_:-]{6,128}$/.test(String(input.targetId))) throw new ContractError('INVALID_TARGET');
  if (!oneOf(input.reason, ALL_REPORT_REASONS)) throw new ContractError('INVALID_REASON');
  return { schemaVersion: SCHEMA_VERSION, id: input.id, targetType, targetId: input.targetId, reason: input.reason, details: blockText(input.details, 500), status: REPORT_STATUSES.includes(input.status) ? input.status : 'submitted', createdAt: stamp(input.createdAt, now) };
}

/* contract only: enforced by the server for every read (feeds, comments, groups, messages), not by hiding in a UI */
export function normalizeBlock(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_BLOCK');
  if (!USER_ID.test(String(input.blockerUserId)) || !USER_ID.test(String(input.blockedUserId))) throw new ContractError('INVALID_USER');
  if (input.blockerUserId === input.blockedUserId) throw new ContractError('SELF_BLOCK');
  return { blockerUserId: input.blockerUserId, blockedUserId: input.blockedUserId, createdAt: stamp(input.createdAt, now) };
}

/*
 * Community profile (contract only). The person behind it is the Newon+ account the server resolves from the token; the
 * profile carries what the person chooses to show and nothing else. Birth date, address, phone, health and family details
 * are not fields of it, and a payload that carries any other key is refused whole.
 */
export const PROFILE_FIELDS = Object.freeze(['displayName', 'avatarUrl', 'bio', 'interests']);
export const PROFILE_LIMITS = Object.freeze({ displayName: 20, bio: 300, interests: 5, interest: 20 });
export function normalizeProfile(input) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_PROFILE');
  for (const k of Object.keys(input)) if (!PROFILE_FIELDS.includes(k)) throw new ContractError('UNEXPECTED_FIELD');
  const displayName = lineText(input.displayName, PROFILE_LIMITS.displayName);
  if (!displayName) throw new ContractError('INVALID_NAME');
  const avatar = typeof input.avatarUrl === 'string' && /^https:\/\/[a-z0-9.-]+(?::\d+)?\/[^\s"'<>]*$/i.test(input.avatarUrl) ? input.avatarUrl : '';
  if (input.avatarUrl !== undefined && input.avatarUrl !== '' && !avatar) throw new ContractError('INVALID_AVATAR');
  const interests = (Array.isArray(input.interests) ? input.interests : []).map((x) => lineText(x, PROFILE_LIMITS.interest)).filter(Boolean).slice(0, PROFILE_LIMITS.interests);
  return { displayName, avatarUrl: avatar, bio: blockText(input.bio, PROFILE_LIMITS.bio), interests };
}
/* follow (contract only): both sides are accounts the server knows; the client never names the follower */
export function normalizeFollow(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_FOLLOW');
  if (!USER_ID.test(String(input.followerUserId)) || !USER_ID.test(String(input.followedUserId))) throw new ContractError('INVALID_USER');
  if (input.followerUserId === input.followedUserId) throw new ContractError('SELF_FOLLOW');
  return { followerUserId: input.followerUserId, followedUserId: input.followedUserId, createdAt: stamp(input.createdAt, now) };
}

/*
 * What works today, and what does not — one table the screen and the docs read.
 *   LOCAL             works on this device now (nobody else sees it)
 *   ACCOUNT_REQUIRED  needs a Newon+ sign-in on this page (not loaded in ONGIL yet)
 *   REMOTE_REQUIRED   needs a Newon+ account AND a community server with moderation (neither exists yet)
 */
export const FEATURE_MODES = Object.freeze(['LOCAL', 'ACCOUNT_REQUIRED', 'REMOTE_REQUIRED']);
const feature = (id, label, mode, note) => Object.freeze({ id, label, mode, note });
export const COMMUNITY_FEATURES = Object.freeze([
  feature('WRITE', '글쓰기 · 고치기 · 지우기', 'LOCAL', '이 기기에만 저장돼요.'),
  feature('DRAFT', '임시 저장 · 작성 중인 글 보관', 'LOCAL', '저장하거나 직접 버리기 전에는 사라지지 않아요.'),
  feature('SEARCH', '내 글 · 모임 초안 찾기', 'LOCAL', '이 기기에 있는 것만 찾아요.'),
  feature('SAVE', '저장', 'LOCAL', '‘저장’ 화면에서 다시 볼 수 있어요.'),
  feature('GROUP_DRAFT', '모임 초안 · 일정 초안', 'LOCAL', '회원을 모으지는 않아요.'),
  feature('PUBLISH', '다른 사람에게 글 공개', 'REMOTE_REQUIRED', '커뮤니티 서버와 운영 정책이 필요해요.'),
  feature('COMMENT', '댓글 · 답글', 'REMOTE_REQUIRED', '아직 다른 사람이 없어서 열지 않았어요.'),
  feature('REACTION', '공감', 'REMOTE_REQUIRED', '숫자를 지어내지 않아요.'),
  feature('PROFILE', '커뮤니티 프로필', 'ACCOUNT_REQUIRED', 'Newon+ 연결 후 사용할 수 있어요.'),
  feature('FOLLOW', '이웃 맺기', 'REMOTE_REQUIRED', 'Newon+ 계정과 커뮤니티 서버가 필요해요.'),
  feature('BLOCK', '차단', 'REMOTE_REQUIRED', '서버가 지켜야 의미가 있어서, 그 전에는 차단했다고 말하지 않아요.'),
  feature('REPORT', '신고', 'REMOTE_REQUIRED', '받아서 살펴볼 운영팀과 서버가 생기면 열어요.'),
  feature('GROUP_JOIN', '모임 가입 · 회원 모집', 'REMOTE_REQUIRED', '커뮤니티 서버가 필요해요.'),
]);
export const featureMode = (id) => (COMMUNITY_FEATURES.find((f) => f.id === id) || { mode: 'REMOTE_REQUIRED' }).mode;

/*
 * The future community server (contract only — nothing in ONGIL calls it, and createRemoteCommunityRepository refuses).
 * Paths are relative to the site's API prefix (`<api>/ongil/community/…`), the same API host Family V2 uses.
 * Rules every operation must keep:
 *   identity      the verified Newon+ ID token (Authorization header) is the only identity; a userId / authorId /
 *                 memberId / ownerId in a body or query is refused, never trusted
 *   authorization a post or comment is changed or deleted by its author only; group moderation by a group role the server
 *                 holds; platform moderation by a server-side role; an id the caller may not use answers like an id that
 *                 does not exist (no IDOR, no enumeration)
 *   blocks        enforced by the server on every read (feeds, comments, groups, profiles), not hidden by a screen
 *   moderation    reports are accepted and tracked server-side; SAFETY_REPORT_REASONS first; nothing is "resolved" by a client
 *   limits        per-account rate limits on writes, reports and searches; COMMUNITY_LIMITS on every field; plain text only
 *   pagination    cursor-based, newest first, bounded pages (≤ 50); no counts of other people's activity are returned
 *   privacy       no health, family, location or My Life record is ever attached; region is a coarse area the author chose
 */
const route = (op, method, path, who, does) => Object.freeze({ op, method, path, who, does });
export const COMMUNITY_REMOTE_CONTRACT = Object.freeze({
  status: 'CONTRACT_ONLY',
  base: 'ongil/community',
  auth: 'Newon+ ID token in the Authorization header; the server derives the account',
  pageMax: 50,
  routes: Object.freeze([
    route('listPosts', 'GET', 'posts', 'SIGNED_IN', 'published posts, newest first, cursor pages, blocks applied'),
    route('createPost', 'POST', 'posts', 'SIGNED_IN', 'publish a post the author chose to share'),
    route('readPost', 'GET', 'posts/{id}', 'SIGNED_IN', 'one post, if visible to the caller'),
    route('updatePost', 'PATCH', 'posts/{id}', 'AUTHOR', 'change own post'),
    route('deletePost', 'DELETE', 'posts/{id}', 'AUTHOR', 'delete own post (its comments go with it)'),
    route('listComments', 'GET', 'posts/{id}/comments', 'SIGNED_IN', 'comments and replies (parentId), blocks applied'),
    route('createComment', 'POST', 'posts/{id}/comments', 'SIGNED_IN', 'comment or reply; parent must be on the same post'),
    route('deleteComment', 'DELETE', 'comments/{id}', 'AUTHOR', 'delete own comment'),
    route('setReaction', 'PUT', 'posts/{id}/reaction', 'SIGNED_IN', 'the caller\'s own reaction only'),
    route('readProfile', 'GET', 'profiles/{id}', 'SIGNED_IN', 'what that person chose to show'),
    route('updateProfile', 'PATCH', 'profiles/me', 'SELF', 'PROFILE_FIELDS only'),
    route('follow', 'PUT', 'follows/{id}', 'SELF', 'follow another account'),
    route('unfollow', 'DELETE', 'follows/{id}', 'SELF', 'stop following'),
    route('block', 'PUT', 'blocks/{id}', 'SELF', 'block: the server hides both ways on every read'),
    route('unblock', 'DELETE', 'blocks/{id}', 'SELF', 'remove a block'),
    route('report', 'POST', 'reports', 'SIGNED_IN', 'report a post, comment, group, meetup or profile with a reason'),
    route('listGroups', 'GET', 'groups', 'SIGNED_IN', 'public groups by coarse region and interest'),
    route('groupJoinRequest', 'POST', 'groups/{id}/join-requests', 'SIGNED_IN', 'ask to join; the group decides'),
  ]),
});

/* ───────── groups · meetups ───────── */

export const GROUP_CATEGORIES = Object.freeze([opt('WALKING', '걷기'), opt('READING', '독서'), opt('PHOTO', '사진'), opt('HOBBY', '취미'), opt('LEARNING', '배움'), opt('EXERCISE', '운동'), opt('CULTURE', '문화'), opt('LOCAL', '동네'), opt('OTHER', '기타')]);
export const MEETING_STYLES = Object.freeze([opt('ONLINE', '온라인'), opt('OFFLINE', '직접 만나기'), opt('BOTH', '둘 다')]);
export const GROUP_STATUSES = Object.freeze(['DRAFT', 'LOCAL']);

export function normalizeGroup(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_GROUP');
  if (!ID_RE.test(String(input.id))) throw new ContractError('INVALID_ID');
  const name = lineText(input.name, COMMUNITY_LIMITS.groupName);
  if (!name) throw new ContractError('INVALID_NAME');
  if (!oneOf(input.category, GROUP_CATEGORIES)) throw new ContractError('INVALID_CATEGORY');
  if (!oneOf(input.meetingStyle, MEETING_STYLES)) throw new ContractError('INVALID_STYLE');
  return {
    schemaVersion: SCHEMA_VERSION,
    id: input.id,
    name,
    category: input.category,
    description: blockText(input.description, COMMUNITY_LIMITS.groupDescription),
    region: lineText(input.region, 20),
    meetingStyle: input.meetingStyle,
    status: input.status === 'LOCAL' ? 'LOCAL' : 'DRAFT',
    createdAt: stamp(input.createdAt, now),
    updatedAt: stamp(input.updatedAt, now),
  };
}

/*
 * MeetupDraft. placeText is a short description of WHERE (예: "○○공원 정문"), and placeVisibility is PRIVATE by
 * default: when meetups become shareable, the place must be opened on purpose and never default to public.
 */
export const PLACE_VISIBILITY = Object.freeze(['PRIVATE', 'MEMBERS']);
export function normalizeMeetup(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_MEETUP');
  if (!ID_RE.test(String(input.id)) || !ID_RE.test(String(input.groupId))) throw new ContractError('INVALID_ID');
  const title = lineText(input.title, COMMUNITY_LIMITS.meetupTitle);
  if (!title) throw new ContractError('INVALID_TITLE');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  const time = input.time === undefined || input.time === null || input.time === '' ? '' : input.time;
  if (time !== '' && !isTime(time)) throw new ContractError('INVALID_TIME');
  return {
    schemaVersion: SCHEMA_VERSION,
    id: input.id,
    groupId: input.groupId,
    title,
    date: input.date,
    time,
    placeText: lineText(input.placeText, COMMUNITY_LIMITS.meetupPlace),
    placeVisibility: 'PRIVATE',
    description: blockText(input.description, COMMUNITY_LIMITS.meetupDescription),
    status: input.status === 'LOCAL' ? 'LOCAL' : 'DRAFT',
    createdAt: stamp(input.createdAt, now),
    updatedAt: stamp(input.updatedAt, now),
  };
}

/* calendar: title, date and time only; the same title on the same day and time counts as already added */
export function meetupCalendarDraft(meetup) {
  if (!meetup || !isDateKey(meetup.date)) return null;
  return { title: meetup.title.slice(0, 80), date: meetup.date, time: isTime(meetup.time) ? meetup.time : '' };
}
export function isMeetupInCalendar(draft, eventsOnDay) {
  return !!draft && (Array.isArray(eventsOnDay) ? eventsOnDay : []).some((e) => e.title === draft.title && (e.time || '') === draft.time);
}

/* 즐길거리 category → community category, for a review prefill */
export const REVIEW_CATEGORY_OF = Object.freeze({ HOBBY: 'HOBBY', LEARNING: 'LEARNING', EXERCISE: 'HEALTHY_LIVING', CULTURE: 'CULTURE', OUTING: 'OUTING', TRAVEL: 'OUTING' });
export function reviewPrefill(item) {
  if (!isPlainObject(item) || !SOURCE_TYPES.includes(item.type) || typeof item.id !== 'string') return null;
  const title = lineText(item.title, 100);
  if (!title) return null;
  return { type: 'REVIEW', category: REVIEW_CATEGORY_OF[item.category] || 'OTHER', title: `${title} 후기`, body: '', source: { sourceType: item.type, sourceId: item.id, sourceTitle: title } };
}
