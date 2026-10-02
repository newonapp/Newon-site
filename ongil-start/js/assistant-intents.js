/*
 * ONGIL 도우미 — what a request means (Phase 10).
 *
 * There is NO language model here (MODEL.connected === false). A typed request is matched against a short, fixed
 * list of things ONGIL can already do; anything else is answered with "지금은 이 요청을 바로 처리할 수 없어요" and the
 * list of what is possible. Nothing is guessed: a date or time that is not written in one of the supported forms is
 * reported as unclear, never filled in.
 *
 *   matchIntent(text, { today }) → { intent, args, reason }
 *
 * `intent` is one of INTENT_IDS; `args` are plain values for the tool that serves the intent (assistant-tools.js
 * validates them again). When a server model is connected later it replaces this file only: it proposes the same
 * { intent / tool, args } shape, and the tool layer keeps deciding what is allowed.
 *
 * Pure: no DOM, no storage, no network. The text is never stored or sent anywhere.
 */
import { safeText } from './contracts.js';
import { dateKey, isDateKey, addDays, parseDateKey } from './dates.js';
import { CARE_CATEGORIES } from './care-contracts.js';
import { ENJOY_CATEGORIES } from './enjoy-contracts.js';

export const MODEL = Object.freeze({ connected: false, provider: null, freeChat: false, medicalAdvice: false });
export const INPUT_MAX = 120;

export const INTENT_IDS = Object.freeze([
  'VIEW_TODAY', 'VIEW_SCHEDULE', 'VIEW_TASKS', 'VIEW_ROUTINES', 'VIEW_SAVED',
  'SEARCH_CARE', 'SEARCH_ENJOY', 'SEARCH_STORE',
  'ADD_CALENDAR', 'ADD_TASK',
  'OPEN_HOME', 'OPEN_LIFE', 'OPEN_HEALTH', 'OPEN_FAMILY', 'OPEN_CARE', 'OPEN_ENJOY', 'OPEN_COMMUNITY', 'OPEN_STORE', 'OPEN_SAVED',
  'PREPARE_FAMILY_SHARE',
  'HEALTH_SAFETY', 'NOT_AVAILABLE', 'HELP', 'UNSUPPORTED',
]);
/* why a request could not be served as asked — a closed list, shown as a fixed sentence */
export const REASONS = Object.freeze(['', 'EMPTY', 'TOO_LONG', 'NO_MATCH', 'DATE_MISSING', 'DATE_UNCLEAR', 'DATE_INVALID', 'TIME_UNCLEAR', 'TITLE_MISSING', 'PURCHASE', 'BOOKING', 'MESSAGE', 'CALL', 'EDIT', 'EMERGENCY', 'SENSITIVE_RECORD']);

const result = (intent, args = {}, reason = '') => ({ intent, args, reason });
const pad = (n) => String(n).padStart(2, '0');

/* ───────── dates: 오늘 · 내일 · 모레 · YYYY-MM-DD · M월 D일 (this year, not in the past). Local calendar days only. ───────── */

/* words that name a day ONGIL does not work out: they make the date unclear instead of being guessed */
const VAGUE_DAY = /(다음 ?주|다다음|이번 ?주|지난|주말|평일|[월화수목금토일]요일|글피|그저께|어제|며칠|언젠가|조만간|말일|월말|월초|초순|중순|하순|매주|매일|매달|격주)/;

export function parseDate(text, today = dateKey()) {
  const t = typeof text === 'string' ? text : '';
  if (!isDateKey(today)) return { state: 'INVALID', date: '', matched: [] };
  const found = [];
  const matched = [];
  for (const m of t.matchAll(/(\d{4})-(\d{1,2})-(\d{1,2})/g)) {
    matched.push(m[0]);
    const key = `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
    if (!isDateKey(key)) return { state: 'INVALID', date: '', matched };
    found.push(key);
  }
  const rest = matched.reduce((s, m) => s.replace(m, ' '), t);
  for (const m of rest.matchAll(/(\d{1,2})월 ?(\d{1,2})일/g)) {
    matched.push(m[0]);
    const key = `${parseDateKey(today).year}-${pad(m[1])}-${pad(m[2])}`;
    if (!isDateKey(key)) return { state: 'INVALID', date: '', matched };
    /* a day already past this year might mean next year — that is a guess, so it is asked instead */
    if (key < today) return { state: 'UNCLEAR', date: '', matched };
    found.push(key);
  }
  for (const [word, days] of [['오늘', 0], ['내일', 1], ['모레', 2]]) {
    if (rest.includes(word)) {
      matched.push(word);
      found.push(addDays(today, days));
    }
  }
  if (VAGUE_DAY.test(rest)) return { state: 'UNCLEAR', date: '', matched };
  const unique = [...new Set(found)];
  if (unique.length === 0) return { state: 'NONE', date: '', matched };
  if (unique.length > 1) return { state: 'UNCLEAR', date: '', matched };
  return { state: 'OK', date: unique[0], matched };
}

/* ───────── time: 14:00 · 14시 · 오후 2시 · 오전 9시 30분 · 저녁 7시 반. "2시" alone is unclear (오전? 오후?). ───────── */

const AM_WORDS = '오전|아침|새벽';
const PM_WORDS = '오후|저녁|밤';
const VAGUE_TIME = /(쯤|경에|무렵|즈음|이따|나중|늦게|일찍|점심때|저녁때|아침에|저녁에|밤에|낮에|오전에|오후에|오전 ?중|오후 ?중)/;

export function parseTime(text) {
  const t = typeof text === 'string' ? text : '';
  const colon = [...t.matchAll(/(^|[^\d:])(\d{1,2}):(\d{2})(?![\d:])/g)];
  const clock = [...t.matchAll(new RegExp(`(?:(${AM_WORDS}|${PM_WORDS}) ?)?(\\d{1,2})시(?: ?(반|\\d{1,2}분))?`, 'g'))];
  if (colon.length + clock.length > 1) return { state: 'UNCLEAR', time: '', matched: [] };
  if (colon.length === 1) {
    const [, , h, m] = colon[0];
    const hour = Number(h);
    const minute = Number(m);
    if (hour > 23 || minute > 59) return { state: 'UNCLEAR', time: '', matched: [`${h}:${m}`] };
    return { state: 'OK', time: `${pad(hour)}:${pad(minute)}`, matched: [`${h}:${m}`] };
  }
  if (clock.length === 1) {
    const [whole, period, h, extra] = clock[0];
    let hour = Number(h);
    const minute = extra === '반' ? 30 : extra ? Number(extra.replace('분', '')) : 0;
    if (minute > 59 || hour > 23) return { state: 'UNCLEAR', time: '', matched: [whole] };
    if (period) {
      if (hour < 1 || hour > 12) return { state: 'UNCLEAR', time: '', matched: [whole] };
      const pm = new RegExp(`^(${PM_WORDS})$`).test(period);
      hour = pm ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour;
    } else if (hour >= 1 && hour <= 12) {
      /* "2시": morning or afternoon is not said */
      return { state: 'UNCLEAR', time: '', matched: [whole] };
    }
    return { state: 'OK', time: `${pad(hour)}:${pad(minute)}`, matched: [whole] };
  }
  /* a time is hinted at but not given */
  if (VAGUE_TIME.test(t) || new RegExp(`(${AM_WORDS}|${PM_WORDS}|점심|낮)`).test(t)) return { state: 'UNCLEAR', time: '', matched: [] };
  return { state: 'NONE', time: '', matched: [] };
}

/* ───────── what is left after the date, the time and the command words: the title ───────── */

const ADD_VERBS = '추가|등록|넣어|잡아|만들어|적어|기록';
function titleOf(text, drop, nouns) {
  let s = text;
  for (const part of drop) s = s.replace(part, ' ');
  s = s.replace(new RegExp(`(${nouns})(을|를|으로|로|에)?`, 'g'), ' ');
  s = s.replace(new RegExp(`(${ADD_VERBS})[^ ]*( ?(해|줘|주세요|줄래|주실래요|주라|줘요|해줘|해 줘|해주세요|해 주세요|하기|할게|하고 싶어|하고 싶어요))*`, 'g'), ' ');
  s = s.replace(/(^| )(좀|하나|새|새로|에|에는|은|는)(?= |$)/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s.replace(/ ?(을|를|으로|이라고|라고)$/, '').trim();
}

/* ───────── search words ───────── */

const FILLER = /(찾아|찾고|찾기|찾을|알려|보여|추천|검색|있어|있나|있을까|있는지|뭐가|뭐|어디|좀|줘요|줘|주세요|줄래|해줘|해 줘|해주세요|싶어요|싶어|볼래|볼까|만한|것|거|곳|데|근처에서|근처|주변에서|주변|가까운|동네|요즘|갈 때|갈때|도움받을|도움 받을|받을|할 수 있는|수 있는|배울|배우는|배우고)/g;
function keywordOf(text, nouns) {
  const s = text.replace(new RegExp(`(${nouns})(을|를|이|가|은|는|에서|에)?`, 'g'), ' ').replace(FILLER, ' ').replace(/[?!.,~]/g, ' ').replace(/\s+/g, ' ').trim();
  return s.replace(/ (을|를|은|는|에서|에)$/, '').replace(/(을|를)$/, '').trim().slice(0, 30);
}
const careCategoryIn = (t) => (CARE_CATEGORIES.find((c) => t.replace(/\s/g, '').includes(c.label.replace(/[\s·]/g, ''))) || {}).id || '';
const ENJOY_HINTS = Object.freeze({ LEARNING: /(배울|배우|배움|강좌|수업|교육|공부)/, EXERCISE: /(운동|걷기|체조|요가|수영|등산)/, HOBBY: /(취미|미술|서예|사진|악기|원예|공예)/, CULTURE: /(문화|영화|공연|전시|박물관)/, OUTING: /(나들이|공원|산책)/, TRAVEL: /(여행|관광)/ });
const enjoyCategoryIn = (t) => (ENJOY_CATEGORIES.find((c) => ENJOY_HINTS[c.id] && ENJOY_HINTS[c.id].test(t)) || {}).id || '';
const SAVED_TYPE_WORDS = Object.freeze([['PROGRAM', /(프로그램|강좌|수업|행사)/], ['PLACE', /(장소|공원|관광)/], ['PRODUCT', /(상품|물건)/], ['FACILITY', /(기관|시설|복지관)/], ['BENEFIT', /(혜택|복지)/], ['SERVICE', /(서비스|돌봄)/]]);

const FAMILY = /(가족|엄마|아빠|어머니|아버지|아들|딸|자녀|손주|손자|손녀|남편|아내|며느리|사위|형제|언니|누나|오빠|동생)/;
/* a recipient: 엄마한테, 가족에게, 딸이랑 … */
const FAMILY_TO = new RegExp(`${FAMILY.source}[가-힣]{0,2}(에게|한테|께|이랑|랑|하고)`);
const SHARE = /(보여|공유|알려 ?(주|줘)|전해|보내|전달)/;
/* an emergency is never judged here: the person is told to call for help themselves */
const EMERGENCY = /(응급|위급|구급|11[9])/;
const HEALTH_WORD = /(약|증상|아프|아파|아픈|통증|병|혈압|혈당|열이|어지|기침|두통|건강|몸이|컨디션)/;
const JUDGEMENT = /(진단|무슨 ?병|병인가|병일까|먹어도|추천|용량|얼마나 먹|부작용|응급|치료|나을까|낫|괜찮을까|괜찮은 ?건가|위험|왜 ?이래|원인)/;
const HURTS = /(아파|아픈데|아프다|아픕니다|아파요|통증이|어지러워|어지럽|숨이)/;

export function matchIntent(input, { today = dateKey() } = {}) {
  if (typeof input !== 'string') return result('UNSUPPORTED', {}, 'EMPTY');
  if (input.length > INPUT_MAX * 4) return result('UNSUPPORTED', {}, 'TOO_LONG');
  const t = safeText(input, INPUT_MAX * 4);
  if (!t) return result('UNSUPPORTED', {}, 'EMPTY');
  if (t.length > INPUT_MAX) return result('UNSUPPORTED', {}, 'TOO_LONG');
  /* markup has no meaning here: it is not a request */
  if (/[<>]/.test(t)) return result('UNSUPPORTED', {}, 'NO_MATCH');
  const adds = new RegExp(`(${ADD_VERBS})`).test(t);

  if (EMERGENCY.test(t)) return result('HEALTH_SAFETY', {}, 'EMERGENCY');

  /* 0. changing or removing what is already recorded is done on its own screen, by the person */
  if (/(지워|지우|삭제|없애|고쳐|수정|바꿔|바꾸|변경|취소해|완료 ?(해|처리|로)|체크해)/.test(t) && !(HEALTH_WORD.test(t) && JUDGEMENT.test(t))) return result('NOT_AVAILABLE', {}, 'EDIT');

  /* 1. family: only a preview can be prepared — nothing is sent */
  if (FAMILY_TO.test(t) && SHARE.test(t)) return result('PREPARE_FAMILY_SHARE');

  /* 2. health: no judgement is given, and no health record is written from here */
  if ((HEALTH_WORD.test(t) && JUDGEMENT.test(t)) || HURTS.test(t)) return result('HEALTH_SAFETY');
  if (/(안부|체크인|컨디션 ?기록)/.test(t)) return result('OPEN_HEALTH', { section: 'checkin' }, 'SENSITIVE_RECORD');
  if (/(복약|약 ?(을|를)? ?(먹|챙|기록|복용)|먹는 ?약|약 ?이름|복용)/.test(t)) return result('OPEN_HEALTH', { section: 'medication' }, 'SENSITIVE_RECORD');
  if (/증상/.test(t)) return result('OPEN_HEALTH', { section: 'symptoms' }, 'SENSITIVE_RECORD');
  if (/(건강 ?메모|건강 ?기록|혈압|혈당)/.test(t)) return result('OPEN_HEALTH', { section: 'health-notes' }, 'SENSITIVE_RECORD');
  if (/(일기|기록장)/.test(t)) return result('OPEN_LIFE', { section: 'journal' }, 'SENSITIVE_RECORD');
  if (/(가계부|지출|생활비|쓴 ?돈)/.test(t)) return result('OPEN_LIFE', { section: 'expenses' }, 'SENSITIVE_RECORD');

  /* 3. things ONGIL does not do at all */
  if (/(결제|주문|구매|사 ?줘|사줘|송금|이체)/.test(t)) return result('NOT_AVAILABLE', {}, 'PURCHASE');
  if (/(문자|메시지|카톡|메일|이메일)/.test(t)) return result('NOT_AVAILABLE', {}, 'MESSAGE');
  if (/(전화 ?(해|걸)|통화)/.test(t)) return result('NOT_AVAILABLE', {}, 'CALL');
  if (/예약/.test(t) && !/(일정|약속)/.test(t)) return result('NOT_AVAILABLE', {}, 'BOOKING');

  /* 4. add: a task or a calendar entry — prepared, shown, and saved only after 확인 */
  if (adds && /(할 ?일|해야 ?할)/.test(t)) {
    const d = parseDate(t, today);
    if (d.state === 'INVALID') return result('ADD_TASK', {}, 'DATE_INVALID');
    if (d.state === 'UNCLEAR') return result('ADD_TASK', {}, 'DATE_UNCLEAR');
    const title = titleOf(t, d.matched, '할 ?일|해야 ?할 ?일');
    if (!title) return result('ADD_TASK', {}, 'TITLE_MISSING');
    return result('ADD_TASK', { title, dueDate: d.date });
  }
  if (adds && /(일정|약속|스케줄)/.test(t)) {
    const d = parseDate(t, today);
    if (d.state === 'INVALID') return result('ADD_CALENDAR', {}, 'DATE_INVALID');
    if (d.state === 'UNCLEAR') return result('ADD_CALENDAR', {}, 'DATE_UNCLEAR');
    if (d.state === 'NONE') return result('ADD_CALENDAR', {}, 'DATE_MISSING');
    const rest = d.matched.reduce((s, m) => s.replace(m, ' '), t);
    const tm = parseTime(rest);
    if (tm.state === 'UNCLEAR') return result('ADD_CALENDAR', {}, 'TIME_UNCLEAR');
    const title = titleOf(rest, [...tm.matched.map((m) => new RegExp(`${m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(에|부터)?`)), new RegExp(`(${AM_WORDS}|${PM_WORDS})`, 'g')], '일정|약속|스케줄');
    if (!title) return result('ADD_CALENDAR', {}, 'TITLE_MISSING');
    return result('ADD_CALENDAR', { title, date: d.date, time: tm.time });
  }
  if (adds && /(글|게시|모임|후기)/.test(t)) return result('OPEN_COMMUNITY', { section: /모임/.test(t) ? 'groups' : 'write' }, 'SENSITIVE_RECORD');

  /* 5. read what is already recorded for a day */
  const day = () => {
    const d = parseDate(t, today);
    return d.state === 'OK' ? { date: d.date } : d.state === 'NONE' ? { date: today } : null;
  };
  if (/저장/.test(t)) {
    const type = (SAVED_TYPE_WORDS.find(([, re]) => re.test(t)) || [''])[0];
    return result('VIEW_SAVED', type ? { type } : {});
  }
  if (/루틴|습관/.test(t)) return day() ? result('VIEW_ROUTINES', day()) : result('VIEW_ROUTINES', {}, 'DATE_UNCLEAR');
  if (/(할 ?일|해야 ?(할|해|하)|뭐 ?해야)/.test(t)) return day() ? result('VIEW_TASKS', day()) : result('VIEW_TASKS', {}, 'DATE_UNCLEAR');
  if (/(일정|약속|스케줄)/.test(t)) return day() ? result('VIEW_SCHEDULE', day()) : result('VIEW_SCHEDULE', {}, 'DATE_UNCLEAR');
  if (/^오늘( ?(은|하루|요약|뭐|어때|볼래|보기|보여|알려).*)?$/.test(t) || /오늘 ?(하루|요약)/.test(t)) return result('VIEW_TODAY');

  /* 6. find public information that was loaded on its screen this visit */
  if (/(상품|물건|용품|스토어|쇼핑)/.test(t)) return result('SEARCH_STORE', { query: keywordOf(t, '상품|물건|스토어|쇼핑') });
  if (/(돌봄|동행|복지|혜택|기관|시설|복지관|보건소|요양|도시락|서비스|생활지원|장보기|청소|세탁)/.test(t)) {
    const category = careCategoryIn(t);
    return result('SEARCH_CARE', { query: keywordOf(t, '서비스|돌봄 서비스'), ...(category ? { category } : {}) });
  }
  if (/(배울|배우|배움|강좌|수업|프로그램|취미|운동|문화|나들이|여행|즐길|놀 ?거리|갈 ?만한|공원|박물관|전시|공연|행사)/.test(t)) {
    const category = enjoyCategoryIn(t);
    return result('SEARCH_ENJOY', { query: keywordOf(t, '즐길거리|즐길 거리|프로그램|놀거리|놀 거리'), ...(category ? { category } : {}) });
  }

  /* 7. open a screen */
  if (/(커뮤니티|이웃|모임|게시)/.test(t)) return result('OPEN_COMMUNITY');
  if (/가족/.test(t)) return result('OPEN_FAMILY');
  if (/건강/.test(t)) return result('OPEN_HEALTH');
  if (/(내 ?생활|캘린더|달력)/.test(t)) return result('OPEN_LIFE', /(캘린더|달력)/.test(t) ? { section: 'calendar' } : {});
  if (/(홈|처음 ?화면|첫 ?화면)/.test(t)) return result('OPEN_HOME');

  /* 8. what can be asked */
  if (/(도움말|사용법|뭘 ?할 ?수|무엇을 ?할 ?수|뭐 ?할 ?수|어떻게 ?(써|쓰|사용)|할 ?수 ?있)/.test(t)) return result('HELP');
  return result('UNSUPPORTED', {}, 'NO_MATCH');
}
