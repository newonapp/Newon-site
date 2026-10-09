/*
 * Home cards that point outward (Home V2): 가족 · 즐길거리 (with 내 주변) · 돌봄·서비스 · 커뮤니티 · ONGIL 도우미 · 서비스 안내.
 *
 * None of them invents content. Each one says what really works today and on what — mostly this device — and what is
 * not open yet. 가족 shows connection facts only (never a record), 즐길거리 shows what the person saved or found,
 * 내 주변 asks a real data source only when the person presses the button, and says plainly when nothing can be shown.
 * The helper is the rule-based ONGIL 도우미: it is never presented as a conversational or generative AI.
 */
import { el, clear, append } from './dom.js';
import { createCard } from './home-ui.js';
import { setRegionState } from './views.js';
import { buildActivities } from './life-today.js';

const actions = (...nodes) => el('div', { class: 'og-form__actions' }, nodes.filter(Boolean));
const link = (href, text, cls = 'og-btn og-btn--ghost') => el('a', { class: cls, href, text });
const read = (fn, fallback) => { try { return fn(); } catch { return fallback; } };

/* ───────── 가족 ───────── */

/*
 * Home V2: what is really possible today. Family members can be connected on THIS device (Family Connection V1, mode
 * LOCAL); connecting with family on another phone or computer needs a Newon+ account and is not open. The card shows
 * only facts about connections and the person's own choices — how many are connected, invitations waiting, help notes
 * not sent. It never shows a check-in, a medication, a place, a phone number or any record, whatever was shared.
 */
export const FAMILY_LOCAL_TEXT = '지금은 이 기기 안에서만 가족과 연결돼요. 다른 휴대폰이나 컴퓨터의 가족과 연결하는 기능은 아직 열리지 않았어요.';
export const FAMILY_PRIVATE_TEXT = '건강·안부·위치·연락처는 자동으로 공유되지 않아요. 가족에게 보일 정보는 가족 화면에서 내가 직접 골라요.';

export function createFamilyCard({ family = null }) {
  const card = createCard({ slot: 'family', title: '가족', level: 3 });
  function render() {
    const connect = family && family.connect ? family.connect : null;
    const connected = connect ? read(() => connect.connectedCount(), 0) : 0;
    const pending = connect ? read(() => connect.overview().pending.length, 0) : 0;
    const open = family && family.help ? read(() => family.help.openCount(), 0) : 0;
    clear(card.body);
    card.root.dataset.ogState = connected ? 'connected' : 'empty';
    append(card.body, [
      el('p', { class: connected ? 'og-life-value' : 'og-home-empty', 'data-og-family-connected': String(connected), text: connected ? `이 기기에서 연결한 가족 ${connected}명` : '아직 연결한 가족이 없어요.' }),
      pending ? el('p', { class: 'og-home-count', 'data-og-family-pending': String(pending), text: `기다리는 초대 ${pending}개` }) : null,
      open ? el('p', { class: 'og-home-count', 'data-og-family-help': String(open), text: `적어 둔 도움 요청 ${open}개 (보내지 않음)` }) : null,
      el('p', { class: 'og-home-note', text: FAMILY_LOCAL_TEXT }),
      el('p', { class: 'og-home-note', text: FAMILY_PRIVATE_TEXT }),
      actions(link('#family', connected ? '가족 화면 보기' : '가족 화면에서 연결 살펴보기')),
    ]);
  }
  render();
  return { card, render };
}

/* ───────── 즐길거리 (+ 내 주변) ───────── */

/* the six 즐길거리 categories, each opening that category (#enjoy/<id>) */
export const ENJOY_CATEGORIES = Object.freeze(['취미', '배움', '운동', '문화', '나들이', '여행']);
const ENJOY_LINKS = Object.freeze({ 취미: 'hobby', 배움: 'learning', 운동: 'exercise', 문화: 'culture', 나들이: 'outing', 여행: 'travel' });
const TYPE_WORD = (type) => (type === 'PLACE' ? '장소' : type === 'CLASS' ? '강좌' : type === 'EVENT' ? '행사' : '프로그램');

/*
 * 내 주변 (Home V2: part of 즐길거리). Asks the 평생학습 강좌 source only when the person presses the button and sends only
 * the region name. A slow, failing or unconnected source (the provider answering 502 included) becomes a plain sentence
 * inside this part: nothing else on Home waits for it or breaks with it.
 */
function createNearbyPart({ card, profile, source, saved }) {
  let ticket = 0;
  const node = el('div', { class: 'og-home-nearby', 'data-og-home-part': 'nearby' });

  function programRow(item) {
    const meta = [item.organizer, item.venue].filter(Boolean).join(' · ');
    const when = [item.period, item.days, item.time].filter(Boolean).join(' · ');
    const isSaved = read(() => saved.isSaved('PROGRAM', item.id), false);
    const savable = isSaved || /^[A-Za-z0-9][A-Za-z0-9._:\-]*$/.test(item.id);
    return el(
      'li',
      { class: 'og-home-item' },
      el(
        'div',
        { class: 'og-home-item__main' },
        el('p', { class: 'og-home-item__title', text: item.title }),
        meta ? el('p', { class: 'og-home-item__meta', text: meta }) : null,
        when ? el('p', { class: 'og-home-item__meta', text: when }) : null,
        item.href ? el('p', { class: 'og-home-item__meta' }, el('a', { href: item.href, target: '_blank', rel: 'noopener noreferrer', text: '운영기관 누리집 (새 창)' })) : null
      ),
      savable
        ? el(
            'div',
            { class: 'og-home-item__actions' },
            el('button', {
              type: 'button',
              class: 'og-btn og-btn--ghost og-btn--small',
              'aria-pressed': isSaved ? 'true' : 'false',
              'aria-label': isSaved ? `‘${item.title}’ 저장 취소` : `‘${item.title}’ 저장`,
              text: isSaved ? '✓ 저장됨' : '저장',
              onclick: (event) => {
                const r = read(() => saved.toggle({ type: 'PROGRAM', id: item.id, title: item.title, description: meta, href: item.href, source: item.attribution }), { ok: false });
                card.say(r.ok ? (r.saved ? `‘${item.title}’을(를) 저장했습니다.` : `‘${item.title}’ 저장을 취소했습니다.`) : '저장하지 못했습니다.');
                const li = event.currentTarget.closest('li');
                const fresh = programRow(item);
                li.replaceWith(fresh);
                fresh.querySelector('button').focus();
              },
            })
          )
        : null
    );
  }

  function render() {
    ticket += 1;
    const region = read(() => profile.getProfile().region, '');
    clear(node);
    node.append(el('h4', { class: 'og-life-sub', text: '내 주변 강좌' }));
    const zone = el('div', { class: 'og-region og-home-region', 'data-og-region': 'nearby', role: 'region', 'aria-label': '내 주변 강좌 찾은 결과' });
    if (!region) {
      node.dataset.ogState = 'needs-region';
      node.append(el('p', { class: 'og-home-empty', text: '사는 지역을 정하면 그 지역의 평생학습 강좌를 찾아볼 수 있어요.' }), actions(link('#account', '내 정보에서 지역 정하기')));
      return;
    }
    node.dataset.ogState = 'idle';
    const button = el('button', {
      type: 'button',
      class: 'og-btn og-btn--ghost',
      text: `${region} 지역 강좌 찾아보기`,
      onclick: async () => {
        const mine = ++ticket;
        button.disabled = true;
        clear(zone);
        setRegionState(zone, 'loading', '강좌를 찾고 있습니다.');
        node.dataset.ogState = 'loading';
        let result;
        try {
          result = await source.load({ region });
        } catch {
          result = { state: 'unavailable', items: [] };
        }
        if (mine !== ticket) return;
        button.disabled = false;
        clear(zone);
        node.dataset.ogState = result && result.state ? result.state : 'unavailable';
        if (result && result.state === 'ready') {
          setRegionState(zone, 'ready');
          append(zone, [el('ul', { class: 'og-home-items', 'aria-label': `${region} 지역 강좌` }, result.items.map(programRow)), result.attribution ? el('p', { class: 'og-home-note', text: `자료: ${result.attribution}` }) : null]);
          card.say(`강좌 ${result.items.length}개를 찾았습니다.`);
        } else if (result && result.state === 'empty') {
          setRegionState(zone, 'empty', '지금 모집 중인 강좌를 찾지 못했어요.');
        } else if (result && result.reason === 'NO_ANSWER') {
          /* the route exists but did not answer (offline, slow, a provider error): say so, and that trying again may work */
          setRegionState(zone, 'empty', '지금은 강좌 정보를 받아오지 못했어요. 잠시 뒤 다시 눌러 주세요.');
        } else {
          setRegionState(zone, 'empty', '주변 강좌 정보는 지금 쓸 수 없어요. 즐길거리 화면에서 다른 정보를 찾아볼 수 있어요.');
        }
      },
    });
    node.append(el('p', { class: 'og-home-note', text: '공공기관이 공개한 평생학습 강좌를 찾아봅니다. 지역 이름만 보내며, 버튼을 눌렀을 때만 찾습니다.' }), actions(button), zone);
  }

  render();
  return { node, render };
}

/*
 * loaded: () → the 즐길거리 items the person actually found on that screen during this visit. saved: the person's own
 * 저장 (PROGRAM · PLACE through buildActivities, My Life V2) — shown only when something was really saved. Nothing is
 * ranked, scored or personalised, and no programme, event or place is made up.
 */
export function createEnjoyCard({ loaded = null, saved = null, profile = null, source = null } = {}) {
  const card = createCard({ slot: 'enjoy', title: '즐길거리', level: 3, lead: '해 보고 싶은 것을 골라 보세요.' });
  const nearby = profile && source && saved ? createNearbyPart({ card, profile, source, saved }) : null;
  const top = el('div', { class: 'og-home-enjoy' });
  card.body.append(top);
  if (nearby) card.body.append(nearby.node);
  function render() {
    const items = typeof loaded === 'function' ? read(() => loaded(), []).slice(0, 3) : [];
    const mine = saved ? read(() => buildActivities(saved), { total: 0, items: [] }) : { total: 0, items: [] };
    clear(top);
    card.root.dataset.ogState = items.length || mine.total ? 'filled' : 'empty';
    append(top, [
      el('ul', { class: 'og-linkchips', 'aria-label': '즐길거리 종류' }, ENJOY_CATEGORIES.map((name) => el('li', {}, el('a', { class: 'og-linkchip', href: `#enjoy/${ENJOY_LINKS[name]}`, 'aria-label': `${name} — 즐길거리 화면으로 이동` }, name)))),
      mine.total
        ? [
            el('h4', { class: 'og-life-sub', text: '내가 저장한 관심 활동' }),
            el('ul', { class: 'og-life-days', 'aria-label': '내가 저장한 관심 활동', 'data-og-home-saved': String(mine.total) }, mine.items.map((it) => el('li', {}, el('span', { class: 'og-life-days__date', text: it.label }), el('span', { text: it.title })))),
            mine.total > mine.items.length ? el('p', { class: 'og-home-count', text: `이 밖에 ${mine.total - mine.items.length}개를 저장했어요.` }) : null,
            el('p', { class: 'og-home-note', text: '저장만 해 둔 것이에요. 신청이나 예약은 ONGIL이 하지 않아요.' }),
          ]
        : null,
      items.length
        ? [
            el('h4', { class: 'og-life-sub', text: '즐길거리에서 찾아 본 것' }),
            el('ul', { class: 'og-home-items', 'aria-label': '즐길거리에서 찾아 본 것', 'data-og-home-enjoy': String(items.length) }, items.map((i) => el('li', { class: 'og-home-item' }, el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: i.title }), el('p', { class: 'og-home-item__meta', text: [TYPE_WORD(i.type), i.region].filter(Boolean).join(' · ') }))))),
            el('p', { class: 'og-home-note', text: '추천이 아니라 이번에 즐길거리 화면에서 찾아 본 것 가운데 몇 가지예요.' }),
          ]
        : null,
      !items.length && !mine.total ? el('p', { class: 'og-home-note', text: '분류를 누르면 즐길거리 화면에서 지역의 강좌와 장소를 찾아볼 수 있어요.' }) : null,
      actions(link('#enjoy', '즐길거리 보기'), mine.total ? link('#saved', '저장한 것 모두 보기', 'og-btn og-btn--text') : null),
    ]);
  }
  render();
  return { card, render: () => { render(); if (nearby) nearby.render(); } };
}

/* ───────── 돌봄·서비스 ───────── */

/*
 * What really exists: 돌봄·서비스 lists the kinds of help, and 가까운 기관·시설 can be searched there (on a button).
 * Care services and benefits have no data source yet, so the card says so instead of showing anything as offered.
 */
export const CARE_LINKS = Object.freeze([
  Object.freeze({ id: 'care', label: '돌봄' }),
  Object.freeze({ id: 'living', label: '생활지원' }),
  Object.freeze({ id: 'hospital-escort', label: '병원 동행' }),
  Object.freeze({ id: 'welfare', label: '복지·공공지원' }),
]);

export function createCareCard() {
  const card = createCard({ slot: 'care', title: '돌봄·서비스', level: 3, lead: '필요한 도움을 종류별로 살펴보세요.' });
  card.root.dataset.ogState = 'links';
  card.body.append(
    el('ul', { class: 'og-linkchips', 'aria-label': '돌봄·서비스 종류' }, CARE_LINKS.map((c) => el('li', {}, el('a', { class: 'og-linkchip', href: `#care/${c.id}`, 'aria-label': `${c.label} — 돌봄·서비스 화면으로 이동` }, c.label)))),
    el('p', { class: 'og-home-note', text: '가까운 복지관·보건소 같은 기관은 돌봄·서비스 화면에서 찾아볼 수 있어요. 돌봄 서비스와 복지 혜택 정보는 아직 연결된 자료가 없어요. ONGIL은 신청이나 예약을 대신하지 않아요.' }),
    actions(link('#care', '돌봄·서비스 모두 보기'), link('#health', '긴급 연락망 보기', 'og-btn og-btn--text'))
  );
  return { card, render: () => {} };
}

/* ───────── 커뮤니티 ───────── */

/*
 * Community V2 is LOCAL: the person's own posts and group/meetup drafts live on this device and nobody else sees them.
 * Publishing, comments and joining need a Newon+ account and a server that do not exist yet — said, never shown as live.
 * Only counts of the person's own items are shown; never their words.
 */
export const COMMUNITY_LOCAL_TEXT = '지금은 이 기기에만 저장돼요. 다른 사람에게 글을 공개하거나 댓글을 주고받는 기능은 아직 열리지 않았어요.';

export function createCommunityCard({ community = null }) {
  const card = createCard({ slot: 'community', title: '커뮤니티', level: 3 });
  function render() {
    const posts = community && community.posts ? read(() => community.posts.count(), 0) : 0;
    const groups = community && community.groups ? read(() => community.groups.count(), 0) : 0;
    clear(card.body);
    card.root.dataset.ogState = posts || groups ? 'filled' : 'empty';
    append(card.body, [
      posts || groups
        ? el('p', { class: 'og-home-count', 'data-og-home-posts': String(posts), 'data-og-home-groups': String(groups), text: [posts ? `내가 쓴 글 ${posts}개` : '', groups ? `모임 준비 ${groups}개` : ''].filter(Boolean).join(' · ') })
        : el('p', { class: 'og-home-empty', text: '아직 쓴 글이나 모임 준비가 없어요.' }),
      el('p', { class: 'og-home-note', text: COMMUNITY_LOCAL_TEXT }),
      actions(link('#community/write', '글 쓰기'), link('#community/groups', '모임 준비하기', 'og-btn og-btn--text'), link('#community', '커뮤니티 보기', 'og-btn og-btn--text')),
    ]);
  }
  render();
  return { card, render };
}

/* ───────── ONGIL 도우미 ───────── */

/*
 * The helper is rule-based (assistant-intents · assistant-tools): it understands a fixed set of requests, reads this
 * device's records only to answer the person, and asks before writing anything. It is not a chat or generative AI and
 * is not connected to one. The examples are SUGGESTIONS that really work in the panel.
 */
export const HELPER_EXAMPLES = Object.freeze(['오늘 일정 알려줘', '오늘 할 일 알려줘', '즐길거리 찾아줘']);
export const HELPER_TEXT = '정해진 요청만 알아듣는 도우미예요. 자유로운 대화를 하거나 글을 지어내는 AI는 아니에요. 무언가를 저장하기 전에는 꼭 먼저 물어봐요.';

export function createHelperCard({ onOpen = null }) {
  const card = createCard({ slot: 'helper', title: 'ONGIL 도우미', level: 4 });
  card.root.dataset.ogState = onOpen ? 'ready' : 'unavailable';
  append(card.body, [
    el('p', { class: 'og-home-note', text: HELPER_TEXT }),
    el('ul', { class: 'og-family-points', 'aria-label': '이렇게 물어볼 수 있어요' }, HELPER_EXAMPLES.map((t) => el('li', { text: `“${t}”` }))),
    onOpen ? actions(el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-home-helper': 'open', text: '도우미 열기', onclick: () => onOpen() })) : null,
  ]);
  return { card, render: () => {} };
}

/* ───────── 서비스 안내 ───────── */

export const GUIDE_LINKS = Object.freeze([
  Object.freeze({ href: '#saved', label: '저장한 것' }),
  Object.freeze({ href: '#account', label: '내 정보·글자 크기' }),
  Object.freeze({ href: '/ko/ongil/', label: 'ONGIL 소개' }),
]);

export function createGuideCard() {
  const card = createCard({ slot: 'guide', title: '서비스 안내', level: 4 });
  card.body.append(
    el('ul', { class: 'og-linkchips', 'aria-label': '서비스 안내' }, GUIDE_LINKS.map((g) => el('li', {}, el('a', { class: 'og-linkchip', href: g.href }, g.label)))),
    el('p', { class: 'og-home-note', text: 'ONGIL에 적은 기록은 이 기기에 저장돼요. 의료 판단이나 응급 대응을 대신하지 않아요. 위급할 때는 119에 직접 전화해 주세요.' })
  );
  return { card, render: () => {} };
}
