/*
 * Home cards about the user's own day.
 *   Home V2 › 오늘 할 것   오늘 일정 · 오늘 할 일 · 오늘 루틴 · 기한 지난 할 일 (one buildToday result) · 다가오는 일정
 *   Home V2 › 건강·안부    오늘의 안부 · 복약 · 오늘의 생활 (식사 · 물 · 걷기·운동)
 * Home shows and marks the records with the stores' own calls; making and editing stay in 내 생활 and 건강·안부.
 * All of them read and write through their stores (local-first). Nothing here is sent anywhere, nothing is evaluated,
 * and no card says or implies that the user is safe or healthy.
 */
import { el, clear, append } from './dom.js';
import { createCard, choiceButton, moreLinks } from './home-ui.js';
import { createListCard, STORAGE_ERROR_TEXT } from './home-list.js';
import { formatTime, dateKey, formatDateKey } from './dates.js';
import { buildToday, buildUpcoming, lineMeta, dayTitle, UPCOMING_DAYS } from './life-today.js';

/* ───────── 오늘의 안부 ───────── */

/* Phase 3: the same record as 내 생활 › 건강 › 안부와 몸 상태 (기분 = status). Home sets only 기분; the rest is written there. */
export function createCheckInCard({ checkIn, onChange }) {
  const card = createCard({ slot: 'check-in', title: '오늘의 안부', level: 2, heading: 'h4', lead: '오늘은 어떠세요?' });

  function render() {
    const record = checkIn.get();
    /* a day where only 몸 상태 or a memo was written in 내 생활 has no 기분 yet: Home shows it as not chosen */
    const current = record && record.status ? record : null;
    clear(card.body);
    card.root.dataset.ogState = current ? 'filled' : 'empty';
    card.body.append(
      el(
        'div',
        { class: 'og-picks og-picks--stack', role: 'group', 'aria-label': '오늘의 안부 고르기' },
        checkIn.statuses.map((s) =>
          choiceButton({
            label: s.label,
            pressed: !!current && current.status === s.id,
            onChoose: () => {
              const r = checkIn.set(s.id);
              card.say(r.ok ? `오늘의 안부를 ‘${s.label}’(으)로 남겼습니다.` : '안부를 저장하지 못했습니다.');
              if (onChange) onChange();
              render();
              const pressed = card.body.querySelector('.og-pick[aria-pressed="true"]');
              if (pressed) pressed.focus();
            },
          })
        )
      )
    );
    if (current && current.status === 'help') {
      card.body.append(
        el(
          'div',
          { class: 'og-notice og-home-help', role: 'note' },
          el('p', {}, el('strong', { text: 'ONGIL은 이 선택을 다른 사람에게 알리지 않습니다.' })),
          el('p', { text: '도움이 필요하면 가까운 사람에게 직접 연락해 주세요.' }),
          el('p', { text: '위급할 때는 119에 직접 전화해 주세요.' })
        )
      );
    }
    if (current) {
      card.body.append(
        el(
          'div',
          { class: 'og-form__actions' },
          el('button', {
            type: 'button',
            class: 'og-btn og-btn--text',
            text: '오늘 안부 지우기',
            onclick: () => {
              /* Product Completion Audit V1: a clear the store did not write is not announced as done */
              const cleared = checkIn.clear();
              card.say(cleared ? '오늘의 안부를 지웠습니다.' : STORAGE_ERROR_TEXT);
              if (cleared && onChange) onChange();
              render();
              card.focusTitle();
            },
          })
        )
      );
    }
    card.body.append(moreLinks([{ label: '몸 상태·증상도 적기', href: '#life/checkin' }]));
    card.body.append(el('p', { class: 'og-home-note', text: current ? '다시 고르면 바뀝니다. 이 기기에만 남는 기록이에요.' : '고른 내용은 이 기기에만 남습니다.' }));
  }

  render();
  return { card, render };
}

/* ───────── 오늘 할 것 (Home V2) ───────── */

/*
 * Home V2: 오늘 일정 · 오늘 할 일 · 오늘 루틴 · 기한 지난 할 일 are four short lists cut from ONE buildToday() result
 * (My Life V2, life-today.js), so Home and 내 생활 › 요약 › 오늘 할 것 show exactly the same records and the same numbers.
 * Home only shows and marks them with the stores' own calls; making and editing happen in 내 생활 (onAdd opens the exact
 * form there). Tomorrow, later days and tasks without a day are never counted as today. Nothing is copied or stored here.
 */
export const PLAN_GROUPS = Object.freeze([
  Object.freeze({ id: 'events', slot: 'plan-events', title: '오늘 일정', empty: '오늘 적어 둔 일정이 없어요.', doneWord: '끝냄', checkWord: '끝낸 일정으로 표시', doneText: '끝낸 일정으로' }),
  Object.freeze({ id: 'tasks', slot: 'plan-tasks', title: '오늘 할 일', empty: '오늘까지 할 일이 없어요.', doneWord: '끝냄', checkWord: '끝낸 일로 표시', doneText: '끝낸 일로' }),
  Object.freeze({ id: 'routines', slot: 'plan-routines', title: '오늘 루틴', empty: '오늘 요일에 해당하는 루틴이 없어요.', doneWord: '했어요', checkWord: '오늘 한 루틴으로 표시', doneText: '오늘 한 루틴으로' }),
  Object.freeze({ id: 'overdue', slot: 'plan-overdue', title: '기한 지난 할 일', empty: '기한이 지난 할 일이 없어요.', doneWord: '끝냄', checkWord: '끝낸 일로 표시', doneText: '끝낸 일로' }),
]);

/* splitToday(buildToday result) → { events, tasks, routines, overdue } — a cut of the same lists, nothing added or dropped */
export function splitToday(t) {
  return {
    events: t.items.filter((i) => i.kind === 'event'),
    tasks: t.items.filter((i) => i.kind === 'task'),
    routines: t.items.filter((i) => i.kind === 'routine'),
    overdue: t.overdue,
  };
}

export function createPlanCards({ stores, now = () => Date.now(), onChange, onAdd }) {
  const { schedule, tasks, routines } = stores;
  const today = () => splitToday(buildToday({ schedule, tasks, routines }, now));
  const add = (section, label) => el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-home-add': section, text: label, onclick: () => onAdd && onAdd(section) });
  const link = (href, label, cls = 'og-btn og-btn--text') => el('a', { class: cls, href, text: label });
  const AFTER = {
    events: () => el('div', { class: 'og-form__actions' }, add('calendar', '일정 추가'), link('#life/calendar', '캘린더 열기')),
    tasks: () => el('div', { class: 'og-form__actions' }, add('tasks', '할 일 추가'), link('#life/tasks', '할 일 모두 보기')),
    routines: () => el('div', { class: 'og-form__actions' }, link('#life/routines', routines.count() ? '루틴 보기·고치기' : '루틴 만들기', 'og-btn og-btn--ghost')),
    overdue: () => el('div', { class: 'og-form__actions' }, link('#life/tasks', '할 일에서 날짜 고치기')),
  };
  const cards = {};
  for (const g of PLAN_GROUPS) {
    const card = createCard({ slot: g.slot, title: g.title, level: 2, heading: 'h4' });
    const list = createListCard({
      card,
      config: {
        itemName: g.id === 'events' ? '일정' : g.id === 'routines' ? '루틴' : '할 일',
        listLabel: g.title,
        emptyText: () => g.empty,
        canAdd: false,
        canEdit: false,
        fields: [],
        doneWord: g.doneWord,
        checkWord: g.checkWord,
        getItems: () => today()[g.id],
        isDone: (item) => item.done,
        describe: (item) => ({ title: item.title, meta: [item.time ? formatTime(item.time) : '', g.id === 'events' && item.label !== '일정' ? item.label : '', item.important ? '중요' : '', item.dueDate ? `${formatDateKey(item.dueDate)}까지였어요` : ''].filter(Boolean) }),
        toggleText: (item, checked) => (checked ? `‘${item.title}’을(를) ${g.doneText} 표시했습니다.` : `‘${item.title}’ 표시를 풀었습니다.`),
        onToggle: (item, checked) => {
          if (item.kind === 'event') return schedule.update(item.id, { completed: checked });
          if (item.kind === 'routine') return routines.setCompleted(item.id, checked);
          return tasks.update(item.id, { completed: checked });
        },
        afterChange: onChange,
        after: AFTER[g.id],
      },
    });
    cards[g.id] = { card, render: () => { list.reset(); if (g.id === 'overdue') card.root.hidden = today().overdue.length === 0; } };
  }
  /* 기한 지난 할 일 is shown only when there is one: an empty "overdue" box would only add worry */
  cards.overdue.render();
  return cards;
}

/* ───────── 다가오는 일정 (Home V2) ───────── */

/* the next few lines of buildUpcoming (My Life V2) — tomorrow onward, never part of today's numbers */
export const UPCOMING_HOME_LINES = 3;
export function createUpcomingCard({ stores, now = () => Date.now() }) {
  const card = createCard({ slot: 'plan-upcoming', title: '다가오는 일정', level: 3, heading: 'h4' });
  function render() {
    const u = buildUpcoming({ schedule: stores.schedule, tasks: stores.tasks }, now);
    const lines = u.days.flatMap((d) => d.lines.map((line) => ({ date: d.date, line }))).slice(0, UPCOMING_HOME_LINES);
    clear(card.body);
    card.root.dataset.ogState = lines.length ? 'filled' : 'empty';
    /* append() from dom.js skips an absent line; the native Node.append would print the word "null" */
    append(card.body, [
      lines.length
        ? el('ul', { class: 'og-family-points', 'aria-label': '다가오는 일정' }, lines.map(({ date, line }) => el('li', { 'data-og-upcoming-kind': line.kind, text: `${dayTitle(date, dateKey(now()))} · ${line.title} · ${lineMeta(line)}` })))
        : el('p', { class: 'og-home-empty', text: `앞으로 ${UPCOMING_DAYS}일 동안 적어 둔 일정이나 할 일이 없어요.` }),
      u.total > lines.length ? el('p', { class: 'og-home-count', 'data-og-upcoming-more': String(u.total - lines.length), text: `이 밖에 ${u.total - lines.length}개가 더 있어요.` }) : null,
      el('p', { class: 'og-home-note', text: '내일부터의 일정이에요. 오늘 할 것의 숫자에는 넣지 않아요.' }),
      el('div', { class: 'og-form__actions' }, el('a', { class: 'og-btn og-btn--text', href: '#life', text: '내 생활에서 모두 보기' }))
    ]);
  }
  render();
  return { card, render };
}

/* ───────── 복약 (Home V2) ───────── */

/*
 * Today's planned medications with the person's own mark — 먹었어요 · 건너뜀 · 표시 풀기 — through medication.setStatus,
 * the same call and the same words as 건강·안부 › 오늘 복약. Home no longer adds, edits or deletes a medication: 약 추가
 * opens the form in 내 생활 › 복약 (onAdd), and the list is changed there. A time on the screen never marks anything.
 */
export function createMedicationCard({ medication, now = () => Date.now(), onChange, onAdd }) {
  const card = createCard({ slot: 'medication', title: '복약', level: 2, heading: 'h4', lead: '먹은 약이나 건너뛴 약에 직접 표시하세요.' });
  const read = (fn, fallback) => { try { return fn(); } catch { return fallback; } };
  function render(focusId) {
    const date = dateKey(now());
    const meds = read(() => medication.listForDate(date), []);
    clear(card.body);
    card.root.dataset.ogState = meds.length ? 'filled' : 'empty';
    const mark = (m, status, text) => {
      const r = read(() => medication.setStatus(m.id, status, date), { ok: false });
      card.say(r && r.ok ? text : STORAGE_ERROR_TEXT);
      if (r && r.ok && onChange) onChange();
      render(m.id);
    };
    if (!meds.length) {
      card.body.append(el('p', { class: 'og-home-empty', text: read(() => medication.count(), 0) ? '오늘 먹을 약으로 적어 둔 것이 없어요.' : '적어 둔 약이 없어요.' }));
    } else {
      card.body.append(
        el('ul', { class: 'og-home-items', 'aria-label': '오늘 먹을 약' }, meds.map((m) => {
          const state = m.taken ? '먹었어요로 표시' : m.skipped ? '건너뜀으로 표시' : '아직 표시하지 않았어요';
          return el('li', { class: m.taken ? 'og-home-item is-done' : 'og-home-item', 'data-og-home-med': m.id },
            el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: m.name }), el('p', { class: 'og-home-item__meta', text: [m.time ? formatTime(m.time) : '', state].filter(Boolean).join(' · ') })),
            el('div', { class: 'og-home-item__actions' },
              !m.taken ? el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-med-mark': 'TAKEN', 'aria-label': `‘${m.name}’ 먹었어요로 표시`, text: '먹었어요', onclick: () => mark(m, 'TAKEN', `‘${m.name}’을(를) 먹었어요로 표시했어요.`) }) : null,
              !m.taken && !m.skipped ? el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-med-mark': 'SKIPPED', 'aria-label': `‘${m.name}’ 건너뜀으로 표시`, text: '건너뜀', onclick: () => mark(m, 'SKIPPED', `‘${m.name}’을(를) 건너뜀으로 표시했어요.`) }) : null,
              m.taken || m.skipped ? el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-med-mark': 'NONE', 'aria-label': `‘${m.name}’ 표시 풀기`, text: '표시 풀기', onclick: () => mark(m, 'NONE', `‘${m.name}’ 표시를 풀었어요.`) }) : null));
        }))
      );
    }
    card.body.append(
      el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-home-add': 'medication', text: '약 추가', onclick: () => onAdd && onAdd('medication') }), el('a', { class: 'og-btn og-btn--text', href: '#life/medication', text: '약 목록 고치기·지난 날 보기' })),
      el('p', { class: 'og-home-note', text: '먹었어요·건너뜀은 내가 직접 표시한 것만 기록돼요. 표시하지 않은 약을 먹지 않았다고 여기지 않아요.' }),
      el('p', { class: 'og-home-note', text: '약 이름과 시간은 직접 적어 두는 메모입니다. ONGIL은 복용량이나 약에 대해 조언하지 않습니다.' })
    );
    if (focusId) {
      const row = card.body.querySelector(`[data-og-home-med="${focusId}"] button`);
      if (row) row.focus();
      else card.focusTitle();
    }
  }
  render();
  return { card, render: () => render() };
}

/* ───────── 오늘의 생활 ───────── */

export function createDailyLifeCard({ dailyLife }) {
  const card = createCard({ slot: 'life-check', title: '식사·물·운동', level: 2, heading: 'h4', lead: '오늘 한 만큼만 가볍게 표시하세요.' });

  function row(label, control) {
    return el('div', { class: 'og-life-row' }, el('p', { class: 'og-life-row__label', text: label }), control);
  }

  function render(focusSelector) {
    const day = dailyLife.get();
    clear(card.body);
    const save = (patch, message, focus) => {
      const r = dailyLife.update(patch);
      card.say(r.ok ? message : '저장하지 못했습니다.');
      render(focus);
    };
    const meals = el(
      'div',
      { class: 'og-picks', role: 'group', 'aria-label': '오늘 식사 횟수' },
      [0, 1, 2, 3].map((n) => {
        const b = choiceButton({ label: `${n}끼`, pressed: day.meals === n, onChoose: () => save({ meals: n }, `식사를 ${n}끼로 적었습니다.`, `[data-og-meal="${n}"]`) });
        b.dataset.ogMeal = String(n);
        return b;
      })
    );
    const water = el(
      'div',
      { class: 'og-stepper', role: 'group', 'aria-label': '오늘 마신 물' },
      el('button', { type: 'button', class: 'og-stepper__btn', 'data-og-water': 'minus', 'aria-label': '물 한 잔 빼기', disabled: day.water <= 0, text: '−', onclick: () => save({ water: day.water - 1 }, `물을 ${day.water - 1}잔으로 적었습니다.`, '[data-og-water="minus"]') }),
      el('p', { class: 'og-stepper__value', text: `${day.water}잔` }),
      el('button', { type: 'button', class: 'og-stepper__btn', 'data-og-water': 'plus', 'aria-label': '물 한 잔 더하기', disabled: day.water >= dailyLife.limits.water, text: '+', onclick: () => save({ water: day.water + 1 }, `물을 ${day.water + 1}잔으로 적었습니다.`, '[data-og-water="plus"]') })
    );
    const moveYes = choiceButton({ label: '했어요', pressed: day.exercise === true, onChoose: () => save({ exercise: true }, '걷기·운동을 ‘했어요’로 적었습니다.', '[data-og-move="yes"]') });
    moveYes.dataset.ogMove = 'yes';
    const moveNo = choiceButton({ label: '아직이에요', pressed: day.exercise === false, onChoose: () => save({ exercise: false }, '걷기·운동을 ‘아직이에요’로 적었습니다.', '[data-og-move="no"]') });
    moveNo.dataset.ogMove = 'no';
    card.body.append(row('식사', meals), row('물', water), row('걷기·운동', el('div', { class: 'og-picks', role: 'group', 'aria-label': '오늘 걷기·운동' }, moveYes, moveNo)), moreLinks([{ label: '끼니·운동 자세히, 지난 날 고치기', href: '#life/meals' }]), el('p', { class: 'og-home-note', text: '직접 적는 기록입니다. 점수를 매기거나 평가하지 않습니다.' }));
    if (focusSelector) {
      const target = card.body.querySelector(focusSelector);
      if (target && !target.disabled) target.focus();
      else card.focusTitle();
    }
  }

  render();
  return { card, render: () => render() };
}
