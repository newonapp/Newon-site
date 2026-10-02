/*
 * 운영 보기 화면 (Phase 9) — #admin, #admin/data, #admin/analytics, #admin/privacy.
 *
 * A read-only view of this copy of ONGIL: system, features, data sources, loaded content, local usage counters,
 * privacy and what is not implemented. Numbers and words only (no chart). It has no menu entry and no sign-in, and
 * says so at the top; it never shows a person's content — see admin.js for what is and is not read.
 *
 * The only actions are local: 다시 읽기 (re-read), 자료 상태 지우기 (forget what was observed about the sources
 * this visit) and 사용 기록 지우기 (delete the local counters, after a confirmation). None touches a user's records.
 */
import { el, clear, formatDate } from './dom.js';
import { createCard } from './home-ui.js';
import { ADMIN_SECTIONS, resolveAdminSection } from './routes.js';
import { ADMIN_TABS, adminHash, buildSystemStatus, buildFeatureStatus, buildSourceStatus, buildContentStatus, buildSearchOps, buildSavedOps, buildNotificationOps, buildPrivacyMatrix, buildSecurityStatus, PRIVACY_ANSWERS, KNOWN_LIMITATIONS } from './admin.js';

const put = (node, ...kids) => node.append(...kids.flat().filter((k) => k !== null && k !== undefined && k !== false));
const yesNo = (v) => (v ? '있음' : '없음');
/* label / value rows: a list, so it reads well on a phone and to a screen reader (no table) */
const rows = (label, pairs) => el('ul', { class: 'og-life-days og-admin-rows', 'aria-label': label }, pairs.filter(Boolean).map(([k, v, key]) => el('li', { 'data-og-admin-row': key || null }, el('span', { class: 'og-life-days__date', text: k }), el('span', { class: 'og-admin-value', text: String(v) }))));
const group = (title, body) => el('div', { class: 'og-admin-group' }, el('h4', { class: 'og-life-sub', text: title }), body);
const timeText = (ms) => {
  if (!ms) return '없음';
  const d = new Date(ms);
  return `${formatDate(ms)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const LABEL_OF = { view: '화면', hasSection: '세부 화면', queryLength: '검색어 길이', resultCount: '결과 수', providerCount: 'provider 수', outcome: '결과 상태', contentType: '종류' };
const VALUE_OF = { home: '홈', life: '내 생활', health: '건강·안부', family: '가족', care: '돌봄·서비스', enjoy: '즐길거리', community: '커뮤니티', store: '스토어', saved: '저장', account: '내 정보', admin: '운영 보기', yes: '있음', no: '없음', results: '결과 있음', partial: '일부만', 'no-results': '결과 없음', error: '오류', SERVICE: '서비스', BENEFIT: '혜택·복지', FACILITY: '기관·시설', PROGRAM: '프로그램', PLACE: '장소', POST: '글', PRODUCT: '상품', MENU: '메뉴' };

export function createAdminView({ host, version, hostname, storage, search, saved, sources, analytics, loaded }) {
  let current = 'overview';
  let confirmReset = false;
  const tabs = {};
  const panels = {};
  let cards = null;

  /* ───────── 개요 ───────── */
  function renderOverview() {
    const s = buildSystemStatus({ version, hostname, storage, search });
    clear(cards.system.body);
    put(
      cards.system.body,
      rows('시스템 상태', [
        ['ONGIL 버전', s.version || '알 수 없음', 'version'],
        ['환경', s.environment.label, 'environment'],
        ['저장소', s.storage.persistent ? '이 브라우저에 저장됨' : '저장할 수 없음 (창을 닫으면 사라짐)', 'storage'],
        ['저장 묶음(collection)', `${s.storage.collectionsDefined}개 정의 · ${s.storage.collectionsInUse}개 사용 중`, 'collections'],
        ['화면', `${s.routes.views}개 + 내부 화면 ${s.routes.internalViews}개 · 주소 ${s.routes.addresses}개`, 'routes'],
        ['통합검색 provider', `${s.search.providers}개 (공개 ${s.search.publicProviders} · 개인 ${s.search.privateProviders})`, 'providers'],
        ['저장함 종류', `${s.savedTypes}개`, 'saved-types'],
        ['알림 종류', `${s.notificationTypes}개`, 'notification-types'],
        ['사용 기록', `이벤트 ${s.analytics.events}종 · ${s.analytics.retentionDays}일 보관`, 'analytics'],
      ])
    );
    clear(cards.features.body);
    put(
      cards.features.body,
      buildFeatureStatus().map((f) =>
        el(
          'section',
          { class: 'og-admin-group', 'data-og-admin-feature': f.id, 'aria-label': f.label },
          el('h4', { class: 'og-life-sub', text: `${f.label} · 메뉴 ${f.modulesTotal}개 가운데 ${f.modulesAvailable}개 동작` }),
          el('ul', { class: 'og-admin-list' }, f.capabilities.map((c) => el('li', { 'data-og-admin-mode': c.mode }, el('span', { class: 'og-admin-value', text: c.label }), el('span', { class: 'og-home-item__meta', text: ` — ${c.modeLabel}` }))))
        )
      ),
      el('p', { class: 'og-home-note', text: '기능이 어떤 방식으로 동작하는지 적은 것이에요. 점수나 준비도 평가가 아니에요.' })
    );
    const c = buildContentStatus({ loaded: loaded(), savedCounts: saved.counts(), storage });
    clear(cards.content.body);
    put(
      cards.content.body,
      group('이번 방문에 불러온 공개 항목', rows('이번 방문에 불러온 공개 항목', [['돌봄·서비스', `${c.loadedThisVisit.care}개`, 'loaded-care'], ['즐길거리', `${c.loadedThisVisit.enjoy}개`, 'loaded-enjoy'], ['스토어', `${c.loadedThisVisit.store}개`, 'loaded-store']])),
      el('p', { class: 'og-home-note', text: '전체 자료 수가 아니에요. 사용자가 화면에서 직접 불러온 항목만 세요. 새로 고치면 0으로 돌아가요.' }),
      group('이 기기의 저장함', rows('저장함 종류별 개수', c.saved.map((t) => [t.label, `${t.count}개`, `saved-${t.type}`]))),
      group('이 기기의 커뮤니티 초안', rows('커뮤니티 초안 개수', [['내 글', `${c.communityLocal.posts}개`, 'community-posts'], ['모임 초안', `${c.communityLocal.groupDrafts}개`, 'community-groups'], ['모임 일정 초안', `${c.communityLocal.meetupDrafts}개`, 'community-meetups'], ['공개된 글·신고·회원', '없음 (서버 없음)', 'community-remote']])),
      el('p', { class: 'og-home-note', text: '개수만 세요. 제목이나 내용은 읽지 않아요. 건강 기록과 가족 설정은 이 화면에서 세지도 읽지도 않아요.' })
    );
    clear(cards.limits.body);
    put(cards.limits.body, el('ul', { class: 'og-admin-list', 'aria-label': '알려진 한계' }, KNOWN_LIMITATIONS.map((t) => el('li', { text: t }))));
  }

  /* ───────── 자료 ───────── */
  function renderData(focus) {
    const list = buildSourceStatus(sources);
    clear(cards.sources.body);
    put(
      cards.sources.body,
      el('p', { class: 'og-notice', role: 'note', 'data-og-admin-live': 'not-verified' }, el('strong', { text: '운영 서버 확인: 하지 않음. ' }), '아래는 사용자가 이번 방문에 화면에서 요청했을 때의 결과예요. ONGIL은 스스로 서버를 확인하지 않아요.'),
      list.map((s) =>
        el(
          'section',
          { class: 'og-admin-group', 'data-og-admin-source': s.id, 'data-og-admin-state': s.state, 'aria-label': s.label },
          el('h4', { class: 'og-life-sub', text: s.label }),
          rows(`${s.label} 상태`, [
            ['쓰이는 곳', s.features.join(', ') || '없음'],
            ['하는 일', s.purpose],
            s.provider ? ['provider', s.provider] : ['provider', '없음 (연결된 자료 없음)'],
            ['상태', s.stateLabel, 'state'],
            ['서버 설정', s.configured === 'YES' ? '있음 (응답으로 확인)' : s.configured === 'NO' ? '없음' : '모름 (요청한 적 없음)', 'configured'],
            ['이번 방문 요청', `${s.requests}번`, 'requests'],
            ['마지막 요청', timeText(s.lastRequestAt), 'last'],
            ['마지막 결과', s.lastCount === null ? '없음' : `${s.lastCount}개`, 'count'],
            s.lastReason ? ['이유', s.lastReasonLabel, 'reason'] : null,
          ])
        )
      ),
      el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-admin-action': 'clear-sources', text: '자료 상태 지우기', onclick: () => { sources.clear(); cards.sources.say('이번 방문에 본 자료 상태를 지웠어요. 자료 자체는 그대로예요.'); renderData('[data-og-admin-action="clear-sources"]'); } })),
      el('p', { class: 'og-home-note', text: '요청 내용, 응답 내용, 지역, 검색어, 키는 기록하지 않아요. 상태와 개수만 남겨요.' })
    );
    const ops = buildSearchOps(search);
    clear(cards.search.body);
    put(
      cards.search.body,
      group('등록된 provider', rows('통합검색 provider', ops.providers.map((p) => [p.label, `${p.scope === 'PUBLIC' ? '공개 (검색에 사용)' : '개인 (검색에 사용 안 함)'} · ${p.supportedTypes.length}종`, `provider-${p.id}`]))),
      group('종류별 담당 화면', rows('종류별 담당 화면', ops.owners.map((o) => [o.label, `${o.ownerLabel} · ${o.searchable ? '검색 대상' : '검색 제외'}`, `owner-${o.type}`]))),
      el('p', { class: 'og-home-note', text: '검색어는 어디에도 저장하지 않아요.' })
    );
    clear(cards.saved.body);
    put(cards.saved.body, rows('저장함 종류와 sync 정책', buildSavedOps().map((t) => [t.label, `${t.syncPolicy === 'LOCAL_ONLY' ? '이 기기에만 (LOCAL_ONLY)' : 'sync 가능 정책 (SYNCABLE, 연결 없음)'} · ${t.external ? '출처 링크 가능' : '출처 링크 없음'}`, `policy-${t.type}`])));
    const n = buildNotificationOps();
    clear(cards.notifications.body);
    put(
      cards.notifications.body,
      group('전달 방법', rows('알림 전달 방법', [['ONGIL 안 목록', yesNo(n.delivery.inApp), 'in-app'], ['휴대폰 알림 (OS PUSH)', yesNo(n.delivery.osPush), 'os-push'], ['이메일', yesNo(n.delivery.email), 'email'], ['문자 (SMS)', yesNo(n.delivery.sms), 'sms'], ['서버에서 보내는 알림', yesNo(n.delivery.remote), 'remote']])),
      group('알림 종류', rows('알림 종류', n.types.map((t) => [t.label, t.produced ? '만드는 곳 있음' : '만드는 곳 없음', `type-${t.id}`])))
    );
    if (focus) {
      const t = host.querySelector(focus);
      if (t) t.focus();
    }
  }

  /* ───────── 사용 기록 ───────── */
  function renderAnalytics(focus) {
    const s = analytics.summary();
    const card = cards.analytics;
    clear(card.body);
    card.root.dataset.ogState = s.empty ? 'empty' : 'filled';
    put(card.body, el('p', { class: 'og-notice', role: 'note', 'data-og-admin-analytics': 'local' }, el('strong', { text: '이 기기의 횟수 집계예요. ' }), `어디로도 보내지 않고, 사람이나 기기를 구별하는 번호를 만들지 않아요. 최근 ${analytics.retentionDays}일만 보관해요.`));
    if (s.empty) put(card.body, el('p', { class: 'og-home-empty', 'data-og-admin-analytics-empty': 'true', text: '아직 기록 없음' }));
    else {
      put(
        card.body,
        el('p', { class: 'og-life-value', 'data-og-admin-analytics-total': String(s.total), text: `${s.days}일 동안 ${s.total}번` }),
        el('p', { class: 'og-home-note', text: `${s.firstDay} ~ ${s.lastDay}` }),
        s.events.map((e) =>
          el(
            'section',
            { class: 'og-admin-group', 'data-og-admin-event': e.name, 'data-og-admin-count': String(e.count), 'aria-label': e.label },
            el('h4', { class: 'og-life-sub', text: `${e.label} ${e.count}번` }),
            e.breakdown.length ? el('ul', { class: 'og-admin-list' }, e.breakdown.map((b) => el('li', { 'data-og-admin-breakdown': `${b.key}=${b.value}`, text: `${LABEL_OF[b.key] || b.key} ${VALUE_OF[b.value] || b.value}: ${b.count}번` }))) : null
          )
        )
      );
    }
    if (confirmReset) {
      const cancel = el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-admin-action': 'reset-cancel', text: '취소', onclick: () => { confirmReset = false; renderAnalytics('[data-og-admin-action="reset-analytics"]'); } });
      const confirm = el('button', { type: 'button', class: 'og-btn og-btn--danger', 'data-og-admin-action': 'reset-confirm', text: '지우기', onclick: () => { const done = analytics.reset(); confirmReset = false; card.say(done ? '사용 기록 집계를 지웠어요.' : '지우지 못했어요.'); renderAnalytics('title'); } });
      put(card.body, el('div', { class: 'og-confirm', role: 'group', 'aria-label': '사용 기록 지우기 확인' }, el('p', { text: '이 기기의 사용 기록 집계를 지울까요? 일정, 건강 기록, 저장함 같은 내 정보는 그대로예요.' }), el('div', { class: 'og-form__actions' }, cancel, confirm)));
      queueMicrotask(() => cancel.focus());
    } else {
      put(card.body, el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-admin-action': 'reset-analytics', disabled: s.empty, text: '사용 기록 지우기', onclick: () => { confirmReset = true; renderAnalytics(); } })));
    }
    put(card.body, el('p', { class: 'og-home-note', text: '검색어, 글, 이름, 금액, 주소, 건강 기록은 세지 않아요. 이용자 수나 매출 같은 숫자는 서버가 없어 알 수 없어요.' }));
    if (focus === 'title') card.focusTitle();
    else if (focus) {
      const t = host.querySelector(focus);
      if (t && !t.disabled) t.focus();
      else card.focusTitle();
    }
  }

  /* ───────── 개인정보 ───────── */
  function renderPrivacy() {
    clear(cards.privacy.body);
    put(
      cards.privacy.body,
      buildPrivacyMatrix().map((r) =>
        el(
          'section',
          { class: 'og-admin-group', 'data-og-admin-class': r.class, 'aria-label': r.label },
          el('h4', { class: 'og-life-sub', text: r.collections.length ? `${r.label} · ${r.collections.length}묶음` : r.label }),
          rows(`${r.label} 허용 범위`, [['통합검색', PRIVACY_ANSWERS[r.search], 'search'], ['계정 sync', PRIVACY_ANSWERS[r.sync], 'sync'], ['가족 공유', PRIVACY_ANSWERS[r.family], 'family'], ['커뮤니티 공개', PRIVACY_ANSWERS[r.community], 'community']]),
          r.note ? el('p', { class: 'og-home-note', text: r.note }) : null
        )
      ),
      el('p', { class: 'og-home-note', text: '묶음의 종류와 규칙만 보여 드려요. 기록의 내용은 이 화면에 나오지 않아요.' })
    );
    const sec = buildSecurityStatus();
    clear(cards.security.body);
    put(
      cards.security.body,
      group('이 앱의 코드가 지키는 규칙', rows('코드가 지키는 규칙', sec.policies.map((p) => [p.label, p.detail, `policy-${p.id}`]))),
      group('없는 것', rows('구현되지 않은 것', sec.serverGaps.map((g) => [g.label, g.implemented ? '있음' : '없음 (NOT IMPLEMENTED)', `gap-${g.id}`]))),
      el('p', { class: 'og-home-note', 'data-og-admin-overall': 'none', text: '종합 평가는 하지 않아요. 서버가 없어 확인할 수 없는 것이 많아요. 실제 운영에는 서버 로그인, 관리자 권한, 감사 기록이 먼저 필요해요.' })
    );
  }

  const RENDER = { overview: renderOverview, data: renderData, analytics: renderAnalytics, privacy: renderPrivacy };

  function build() {
    clear(host);
    cards = {
      system: createCard({ area: 'admin', slot: 'system', title: '시스템 상태', level: 2 }),
      features: createCard({ area: 'admin', slot: 'features', title: '기능 상태', level: 2 }),
      content: createCard({ area: 'admin', slot: 'content', title: '콘텐츠 상태', level: 2 }),
      limits: createCard({ area: 'admin', slot: 'limits', title: '알려진 한계', level: 3 }),
      sources: createCard({ area: 'admin', slot: 'sources', title: '자료 출처 상태', level: 2 }),
      search: createCard({ area: 'admin', slot: 'search', title: '통합검색', level: 3 }),
      saved: createCard({ area: 'admin', slot: 'saved', title: '저장함', level: 3 }),
      notifications: createCard({ area: 'admin', slot: 'notifications', title: '알림', level: 3 }),
      analytics: createCard({ area: 'admin', slot: 'analytics', title: '사용 기록', level: 2 }),
      privacy: createCard({ area: 'admin', slot: 'privacy', title: '개인정보 분류', level: 2 }),
      security: createCard({ area: 'admin', slot: 'security', title: '보안 상태', level: 3 }),
    };
    const layout = { overview: ['system', 'features', 'content', 'limits'], data: ['sources', 'search', 'saved', 'notifications'], analytics: ['analytics'], privacy: ['privacy', 'security'] };
    const tablist = el('div', { class: 'og-tabs', role: 'tablist', 'aria-label': '운영 보기 영역' });
    for (const t of ADMIN_TABS) {
      const tab = el('button', { type: 'button', class: 'og-tab', role: 'tab', id: `og-admin-tab-${t.id}`, 'aria-controls': `og-admin-panel-${t.id}`, 'aria-selected': 'false', tabindex: '-1', 'data-og-admin-tab': t.id, text: t.label, onclick: () => { window.location.hash = adminHash(t.id); } });
      tabs[t.id] = tab;
      tablist.append(tab);
      panels[t.id] = el('div', { class: 'og-life-panel', role: 'tabpanel', id: `og-admin-panel-${t.id}`, 'aria-labelledby': tab.id, tabindex: '-1', hidden: true }, layout[t.id].map((k) => cards[k].root));
    }
    tablist.addEventListener('keydown', (event) => {
      const index = ADMIN_SECTIONS.indexOf(current);
      let next = -1;
      if (event.key === 'ArrowRight') next = (index + 1) % ADMIN_SECTIONS.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + ADMIN_SECTIONS.length) % ADMIN_SECTIONS.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = ADMIN_SECTIONS.length - 1;
      if (next < 0) return;
      event.preventDefault();
      window.location.hash = adminHash(ADMIN_SECTIONS[next]);
      tabs[ADMIN_SECTIONS[next]].focus();
    });
    put(
      host,
      el('p', { class: 'og-notice', role: 'note', 'data-og-admin-mode': 'LOCAL_OPERATIONS_VIEW' }, el('strong', { text: '로컬 운영 보기입니다. ' }), '이 브라우저에 있는 ONGIL의 상태만 보여 줍니다. 서버 로그인, 관리자 권한, 감사 기록이 없으므로 보안된 관리자 페이지가 아닙니다. 다른 사람의 정보는 없습니다.'),
      el('div', { class: 'og-form__actions og-admin-actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-admin-action': 'refresh', text: '다시 읽기', onclick: () => { show(current); const b = host.querySelector('[data-og-admin-action="refresh"]'); if (b) b.focus(); } })),
      tablist,
      ADMIN_TABS.map((t) => panels[t.id])
    );
    host.dataset.ogRendered = 'true';
  }

  /* only the visible part is computed; nothing is read until the screen is opened */
  function show(section) {
    current = resolveAdminSection(section) || 'overview';
    if (current !== 'analytics') confirmReset = false;
    for (const t of ADMIN_TABS) {
      const on = t.id === current;
      tabs[t.id].setAttribute('aria-selected', on ? 'true' : 'false');
      tabs[t.id].tabIndex = on ? 0 : -1;
      panels[t.id].hidden = !on;
    }
    for (const c of Object.values(cards)) c.status.textContent = '';
    host.dataset.ogAdminSection = current;
    RENDER[current]();
  }

  build();
  return Object.freeze({ show, current: () => current });
}
