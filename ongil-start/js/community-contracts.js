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
const PHONE = /(01[016789]|0\d{1,2})[-.\s]?\d{3,4}[-.\s]?\d{4}/;
const DETAIL_ADDRESS = /\d+\s?동\s?\d+\s?호|\d+\s?호(?![가-힣])|(?:로|길)\s?\d+(?:-\d+)?\s?\d*\s?(?:층|호)/;
export function privacyCheck(...texts) {
  const all = texts.filter((t) => typeof t === 'string').join('\n');
  return { blocked: RRN.test(all), phone: PHONE.test(all), address: DETAIL_ADDRESS.test(all) };
}

/* list / search / filter over the user's own posts (title, body, type and category names) */
const norm = (s) => String(s || '').toLowerCase().replace(/[\s·]+/g, '');
const label = (list, id) => (list.find((o) => o.id === id) || { label: '' }).label;
export function filterPosts(posts, { type = '', category = '', query = '' } = {}) {
  const q = norm(lineText(query, 60));
  return (Array.isArray(posts) ? posts : []).filter((p) => {
    if (type && p.type !== type) return false;
    if (category && p.category !== category) return false;
    if (q && ![p.title, p.body, label(POST_TYPES, p.type), label(POST_CATEGORIES, p.category)].some((f) => norm(f).includes(q))) return false;
    return true;
  });
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
export const REPORT_TARGETS = Object.freeze(['POST', 'COMMENT', 'GROUP', 'MEETUP', 'USER']);
export const REPORT_STATUSES = Object.freeze(['submitted', 'reviewing', 'resolved', 'dismissed']);
/* contract only: a report is accepted and tracked by the future moderation server, never "completed" by this device */
export function normalizeReport(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_REPORT');
  if (!ID_RE.test(String(input.id))) throw new ContractError('INVALID_ID');
  if (!REPORT_TARGETS.includes(input.targetType)) throw new ContractError('INVALID_TARGET');
  if (!/^[A-Za-z0-9_:-]{6,128}$/.test(String(input.targetId))) throw new ContractError('INVALID_TARGET');
  if (!oneOf(input.reason, REPORT_REASONS)) throw new ContractError('INVALID_REASON');
  return { schemaVersion: SCHEMA_VERSION, id: input.id, targetType: input.targetType, targetId: input.targetId, reason: input.reason, details: blockText(input.details, 500), status: REPORT_STATUSES.includes(input.status) ? input.status : 'submitted', createdAt: stamp(input.createdAt, now) };
}

/* contract only: enforced by the server for every read (feeds, comments, groups, messages), not by hiding in a UI */
export function normalizeBlock(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_BLOCK');
  if (!USER_ID.test(String(input.blockerUserId)) || !USER_ID.test(String(input.blockedUserId))) throw new ContractError('INVALID_USER');
  if (input.blockerUserId === input.blockedUserId) throw new ContractError('SELF_BLOCK');
  return { blockerUserId: input.blockerUserId, blockedUserId: input.blockedUserId, createdAt: stamp(input.createdAt, now) };
}

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
