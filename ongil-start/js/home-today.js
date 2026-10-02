/*
 * Home cards about the user's own day: 오늘의 안부 · 오늘 일정 · 오늘 할 일 · 오늘 루틴 · 복약 · 오늘의 생활.
 * 오늘 할 일 and 오늘 루틴 show My Life's own tasks and routines (same stores): Home only shows and checks them,
 * making and editing stays in My Life. All of them read and write through their stores (local-first). Nothing here is sent anywhere, nothing is
 * evaluated, and no card says or implies that the user is safe or healthy.
 */
import { el, clear } from './dom.js';
import { createCard, choiceButton, moreLinks } from './home-ui.js';
import { createListCard } from './home-list.js';
import { formatTime, dateKey } from './dates.js';
import { LIFE_LIMITS } from './life-contracts.js';

/* ───────── 오늘의 안부 ───────── */

/* Phase 3: the same record as 내 생활 › 건강 › 안부와 몸 상태 (기분 = status). Home sets only 기분; the rest is written there. */
export function createCheckInCard({ checkIn, onChange }) {
  const card = createCard({ slot: 'check-in', title: '오늘의 안부', level: 1, lead: '오늘은 어떠세요?' });

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
              checkIn.clear();
              card.say('오늘의 안부를 지웠습니다.');
              if (onChange) onChange();
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

/* ───────── 오늘 일정 ───────── */

export function createScheduleCard({ schedule, onChange }) {
  const card = createCard({ slot: 'schedule', title: '오늘 일정', level: 1 });
  const errors = { INVALID_TITLE: '일정 이름을 적어 주세요.', INVALID_TIME: '시간을 다시 골라 주세요.', LIMIT: '일정이 너무 많습니다. 지난 일정을 지워 주세요.' };
  const list = createListCard({
    card,
    config: {
      itemName: '일정',
      listLabel: '오늘 일정',
      emptyText: '오늘 적어 둔 일정이 없어요.',
      addLabel: '일정 추가',
      doneWord: '끝냄',
      checkWord: '끝낸 일정으로 표시',
      fields: [
        { name: 'title', label: '일정 이름', type: 'text', required: true, maxlength: LIFE_LIMITS.eventTitle, errors: ['INVALID_TITLE'] },
        { name: 'time', label: '시간', type: 'time', required: false, errors: ['INVALID_TIME'] },
      ],
      getItems: () => schedule.listForDate(),
      isDone: (item) => item.completed,
      describe: (item) => ({ title: item.title, meta: item.time ? [formatTime(item.time)] : [] }),
      toggleText: (item, checked) => (checked ? `‘${item.title}’을(를) 끝낸 일정으로 표시했습니다.` : `‘${item.title}’ 표시를 풀었습니다.`),
      onToggle: (item, checked) => schedule.update(item.id, { completed: checked }),
      onAdd: (values) => schedule.add({ title: values.title, time: values.time }),
      onUpdate: (id, values) => schedule.update(id, { title: values.title, time: values.time }),
      onRemove: (id) => schedule.remove(id),
      afterChange: onChange,
      after: () => moreLinks([{ label: '캘린더에서 다른 날 보기', href: '#life/calendar' }]),
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
    },
  });
  list.render();
  return { card, render: list.reset, openAdd: list.openAdd };
}

/* ───────── 오늘 할 일 (My Life tasks) ───────── */

/*
 * Tasks due today, from My Life's task store. Home shows and checks them; it is not a second task manager:
 * adding and editing happen in 내 생활 › 할 일 (onAdd opens that form).
 */
export function createHomeTasksCard({ tasks, now = () => Date.now(), onChange, onAdd }) {
  const card = createCard({ slot: 'tasks', title: '오늘 할 일', level: 2 });
  const list = createListCard({
    card,
    config: {
      itemName: '할 일',
      listLabel: '오늘까지 할 일',
      emptyText: () => (tasks.openCount() ? '오늘까지 할 일은 없어요.' : '적어 둔 할 일이 없어요.'),
      canAdd: false,
      canEdit: false,
      fields: [],
      doneWord: '끝냄',
      checkWord: '끝낸 일로 표시',
      getItems: () => tasks.dueOn(dateKey(now())),
      isDone: (item) => item.completed,
      describe: (item) => ({ title: item.title, meta: item.priority === 'important' ? ['중요'] : [] }),
      toggleText: (item, checked) => (checked ? `‘${item.title}’을(를) 끝낸 일로 표시했습니다.` : `‘${item.title}’ 표시를 풀었습니다.`),
      onToggle: (item, checked) => tasks.update(item.id, { completed: checked }),
      afterChange: onChange,
      after: () => {
        const today = dateKey(now());
        const others = tasks.list({ filter: 'open' }).filter((t) => t.dueDate !== today).length;
        return el(
          'div',
          { class: 'og-home-after' },
          others ? el('p', { class: 'og-home-count', 'data-og-home-other-tasks': String(others), text: `이 밖에 남은 할 일 ${others}개` }) : null,
          el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-home-add': 'task', text: '할 일 추가', onclick: () => onAdd && onAdd() }), el('a', { class: 'og-btn og-btn--text', href: '#life/tasks', text: '할 일 모두 보기' }))
        );
      },
    },
  });
  list.render();
  return { card, render: list.reset };
}

/* ───────── 오늘 루틴 (My Life routines) ───────── */

/* Active routines for today's weekday, with today's mark. The same RoutineLog as 내 생활 › 루틴. */
export function createHomeRoutinesCard({ routines, onChange }) {
  const card = createCard({ slot: 'routines', title: '오늘 루틴', level: 2 });
  const list = createListCard({
    card,
    config: {
      itemName: '루틴',
      listLabel: '오늘 루틴',
      emptyText: () => (routines.count() ? '오늘 요일에 해당하는 루틴이 없어요.' : '만들어 둔 루틴이 없어요.'),
      canAdd: false,
      canEdit: false,
      fields: [],
      doneWord: '했어요',
      checkWord: '오늘 한 루틴으로 표시',
      getItems: () => routines.listForDate(),
      isDone: (item) => item.completed,
      describe: (item) => ({ title: item.title, meta: item.time ? [formatTime(item.time)] : [] }),
      toggleText: (item, checked) => (checked ? `‘${item.title}’을(를) 오늘 한 루틴으로 표시했습니다.` : `‘${item.title}’ 표시를 풀었습니다.`),
      onToggle: (item, checked) => routines.setCompleted(item.id, checked),
      afterChange: onChange,
      after: () => el('div', { class: 'og-form__actions' }, el('a', { class: 'og-btn og-btn--ghost', href: '#life/routines', text: routines.count() ? '루틴 보기·고치기' : '루틴 만들기' })),
    },
  });
  list.render();
  return { card, render: list.reset };
}

/* ───────── 복약 ───────── */

export function createMedicationCard({ medication, onChange }) {
  const card = createCard({ slot: 'medication', title: '복약', level: 2, lead: '먹은 약에 표시하세요.' });
  const errors = { INVALID_NAME: '약 이름을 적어 주세요.', INVALID_TIME: '시간을 다시 골라 주세요.', LIMIT: '약 목록이 가득 찼습니다.' };
  const list = createListCard({
    card,
    config: {
      itemName: '약',
      listLabel: '오늘 먹을 약',
      /* Phase 3: a medication can be set to some weekdays only, so "none today" and "none at all" differ */
      emptyText: () => (medication.count() ? '오늘 먹을 약으로 적어 둔 것이 없어요.' : '적어 둔 약이 없어요.'),
      addLabel: '약 추가',
      doneWord: '먹었어요',
      checkWord: '먹은 약으로 표시',
      note: '약 이름과 시간은 직접 적어 두는 메모입니다. ONGIL은 복용량이나 약에 대해 조언하지 않습니다.',
      fields: [
        { name: 'name', label: '약 이름', type: 'text', required: true, maxlength: LIFE_LIMITS.medicationName, errors: ['INVALID_NAME'] },
        { name: 'time', label: '먹는 시간', type: 'time', required: false, errors: ['INVALID_TIME'] },
        { name: 'memo', label: '메모', type: 'text', required: false, maxlength: LIFE_LIMITS.memo },
      ],
      getItems: () => medication.listForDate(),
      isDone: (item) => item.taken,
      describe: (item) => ({ title: item.name, meta: [item.time ? formatTime(item.time) : '', item.memo].filter(Boolean) }),
      toggleText: (item, checked) => (checked ? `‘${item.name}’을(를) 먹은 약으로 표시했습니다.` : `‘${item.name}’ 표시를 풀었습니다.`),
      onToggle: (item, checked) => medication.setTaken(item.id, checked),
      onAdd: (values) => medication.add(values),
      onUpdate: (id, values) => medication.update(id, values),
      onRemove: (id) => medication.remove(id),
      afterChange: onChange,
      after: () => moreLinks([{ label: '요일 정하기, 지난 날 복약 보기', href: '#life/medication' }]),
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
    },
  });
  list.render();
  return { card, render: list.reset, openAdd: list.openAdd };
}

/* ───────── 오늘의 생활 ───────── */

export function createDailyLifeCard({ dailyLife }) {
  const card = createCard({ slot: 'life-check', title: '오늘의 생활', level: 2, lead: '오늘 한 만큼만 가볍게 표시하세요.' });

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
