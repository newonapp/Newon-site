/*
 * My Life — 생활 group: 식사 · 물 · 운동 · 수면, for one chosen day.
 *
 * One date bar (이전 날 · 날짜 · 다음 날 · 오늘) drives all four cards, so there is a single way to move between
 * days. The day is a LOCAL calendar date. These are records of what happened, so a future day cannot be
 * chosen; the past goes back as far as the records are kept (DAILY_BACK_DAYS).
 *
 * 식사, 물 and 운동 write the same DailyLife record as Home's "오늘의 생활" (one record per day): today's values
 * are what Home shows, and a change to another day never touches today. Nothing here counts calories, sets
 * an amount to drink, rates a diet, estimates energy, judges sleep or gives advice: these are the user's notes.
 */
import { el, clear } from './dom.js';
import { createCard, choiceButton, makeField } from './home-ui.js';
import { createListCard } from './home-list.js';
import { MEAL_SLOTS, EXERCISE_TYPES, SLEEP_QUALITIES, LIFE_LIMITS, countMeals } from './life-contracts.js';
import { dateKey, addDays, isDateKey, formatDateKey, formatTime } from './dates.js';

const labelOf = (options, id) => (options.find((o) => o.id === id) || { label: '' }).label;

/* DailyLife keeps LIFE_LIMITS.days days; the oldest day that can still be opened is one inside that window */
export const DAILY_BACK_DAYS = LIFE_LIMITS.days - 1;

/* 'today' | 'past' | 'future' — day keys compare as text because they are zero-padded */
export function dayState(date, today) {
  if (date === today) return 'today';
  return date < today ? 'past' : 'future';
}

/* the nearest day that may be recorded: never after today, never before the kept window, today when unreadable */
export function clampDay(date, today) {
  if (!isDateKey(date) || !isDateKey(today)) return today;
  const oldest = addDays(today, -DAILY_BACK_DAYS);
  if (date > today) return today;
  return date < oldest ? oldest : date;
}

/* how a day is said in a sentence: 오늘, or "10월 1일 목요일" */
export const dayWord = (date, today) => (date === today ? '오늘' : formatDateKey(date));

/*
 * The shared date bar. selected = null means "today, and keep following it" — left open over midnight the
 * bar moves on to the new day; a chosen past day stays chosen.
 */
export function createDayNav({ now = () => Date.now(), onChange }) {
  let selected = null;
  const today = () => dateKey(now());
  const date = () => (selected === null ? today() : clampDay(selected, today()));
  const node = el('div', { class: 'og-daynav', role: 'group', 'aria-label': '기록할 날짜', 'data-og-daynav': 'bar' });

  function set(next, focus) {
    const t = today();
    const d = clampDay(next, t);
    selected = d === t ? null : d;
    render(focus);
    if (typeof onChange === 'function') onChange(date());
  }

  function render(focus) {
    const t = today();
    const d = date();
    const state = dayState(d, t);
    const oldest = addDays(t, -DAILY_BACK_DAYS);
    clear(node);
    node.dataset.ogDay = d;
    node.dataset.ogDayState = state;
    const label = el('p', { class: 'og-daynav__date', tabindex: '-1', 'aria-live': 'polite', 'data-og-daynav': 'date' }, el('span', { class: 'og-daynav__day', text: formatDateKey(d) }), el('span', { class: 'og-daynav__state', text: state === 'today' ? ' (오늘)' : ' (지난 날)' }));
    const button = (id, text, target, disabled, ariaLabel) => el('button', { type: 'button', class: 'og-btn og-btn--ghost og-daynav__btn', 'data-og-daynav': id, 'aria-label': ariaLabel, disabled, text, onclick: () => set(target, id) });
    node.append(
      button('prev', '이전 날', addDays(d, -1), d <= oldest, '이전 날로'),
      label,
      button('next', '다음 날', addDays(d, 1), state === 'today', '다음 날로'),
      button('today', '오늘', t, state === 'today', '오늘로 돌아가기')
    );
    if (focus) {
      const target = node.querySelector(`[data-og-daynav="${focus}"]`);
      /* a button that just became unavailable cannot keep focus: the date itself takes it */
      if (target && !target.disabled) target.focus();
      else label.focus();
    }
  }

  render();
  return { node, date, today, set: (d) => set(d), reset: () => { selected = null; render(); }, render: () => render() };
}

/* ───────── 식사 ───────── */

export function createMealsSection({ dailyLife, now = () => Date.now(), getDate = () => dateKey(now()), onChange }) {
  const card = createCard({ area: 'life', slot: 'meals', title: '식사', level: 2, lead: '먹은 끼니에 표시하세요.' });

  function render(focusSlot) {
    const today = dateKey(now());
    const date = getDate();
    const word = dayWord(date, today);
    const day = dailyLife.get(date);
    const slots = day.mealSlots || {};
    clear(card.body);
    card.root.dataset.ogDay = date;
    card.body.append(
      el(
        'div',
        { class: 'og-picks', role: 'group', 'aria-label': `${word} 먹은 끼니` },
        MEAL_SLOTS.map((s) => {
          const on = slots[s.id] === true;
          const b = choiceButton({
            label: s.label,
            pressed: on,
            onChoose: () => {
              const r = dailyLife.update({ mealSlots: { ...(day.mealSlots || {}), [s.id]: !on } }, date);
              card.say(r.ok ? `${word} ${s.label} 식사를 ${on ? '먹지 않은 것으로' : '먹은 것으로'} 적었습니다.` : '저장하지 못했습니다.');
              if (onChange) onChange();
              render(s.id);
            },
          });
          b.dataset.ogMealSlot = s.id;
          return b;
        })
      ),
      el('p', { class: 'og-life-value', 'data-og-meal-count': String(day.meals), text: `${word} ${day.meals}끼` })
    );
    if (!day.mealSlots && day.meals > 0) card.body.append(el('p', { class: 'og-home-note', 'data-og-meal-legacy': 'true', text: date === today ? `홈에서 ${day.meals}끼로 적었어요. 어느 끼니인지 고르면 고른 내용으로 바뀝니다.` : `${day.meals}끼로만 적혀 있어요. 어느 끼니인지 고르면 고른 내용으로 바뀝니다.` }));
    card.body.append(el('p', { class: 'og-home-note', text: '직접 적는 기록입니다. 식단을 평가하거나 열량을 계산하지 않습니다.' }));
    if (focusSlot) {
      const target = card.body.querySelector(`[data-og-meal-slot="${focusSlot}"]`);
      if (target) target.focus();
    }
  }

  render();
  return { card, render: () => render() };
}

/* ───────── 물 ───────── */

/* the same dailyLife.water count as Home's stepper — a number of glasses the user sets, with no amount to reach */
export function createWaterSection({ dailyLife, now = () => Date.now(), getDate = () => dateKey(now()), onChange }) {
  const card = createCard({ area: 'life', slot: 'water', title: '물', level: 2, lead: '마신 물을 잔 수로 적어 두세요.' });

  function render(focus) {
    const today = dateKey(now());
    const date = getDate();
    const word = dayWord(date, today);
    const day = dailyLife.get(date);
    clear(card.body);
    card.root.dataset.ogDay = date;
    const save = (value, which) => {
      const r = dailyLife.update({ water: value }, date);
      card.say(r.ok ? `${word} 마신 물을 ${value}잔으로 적었습니다.` : '저장하지 못했습니다.');
      if (onChange) onChange();
      render(which);
    };
    card.body.append(
      el(
        'div',
        { class: 'og-stepper', role: 'group', 'aria-label': `${word} 마신 물` },
        el('button', { type: 'button', class: 'og-stepper__btn', 'data-og-life-water': 'minus', 'aria-label': '물 한 잔 빼기', disabled: day.water <= 0, text: '−', onclick: () => save(day.water - 1, 'minus') }),
        el('p', { class: 'og-stepper__value', 'data-og-life-water-count': String(day.water), text: `${day.water}잔` }),
        el('button', { type: 'button', class: 'og-stepper__btn', 'data-og-life-water': 'plus', 'aria-label': '물 한 잔 더하기', disabled: day.water >= LIFE_LIMITS.water, text: '+', onclick: () => save(day.water + 1, 'plus') })
      ),
      el('p', { class: 'og-home-note', text: '직접 적는 잔 수입니다. 마실 양을 정해 주거나 평가하지 않습니다.' })
    );
    if (focus) {
      const target = card.body.querySelector(`[data-og-life-water="${focus}"]`);
      if (target && !target.disabled) target.focus();
      else card.focusTitle();
    }
  }

  render();
  return { card, render: () => render() };
}

/* ───────── 운동 ───────── */

export function createExerciseSection({ dailyLife, now = () => Date.now(), getDate = () => dateKey(now()), onChange }) {
  const card = createCard({ area: 'life', slot: 'exercise', title: '운동', level: 2, lead: '걷거나 운동했는지 적어 두세요.' });

  function render(focusSelector) {
    const today = dateKey(now());
    const date = getDate();
    const word = dayWord(date, today);
    const day = dailyLife.get(date);
    clear(card.body);
    card.root.dataset.ogDay = date;
    const save = (patch, message, focus) => {
      const r = dailyLife.update(patch, date);
      card.say(r.ok ? message : '저장하지 못했습니다.');
      if (onChange) onChange();
      render(focus);
    };
    const yes = choiceButton({ label: '했어요', pressed: day.exercise === true, onChoose: () => save({ exercise: true }, `${word} 운동을 ‘했어요’로 적었습니다.`, '[data-og-exercise="yes"]') });
    yes.dataset.ogExercise = 'yes';
    /* "아직이에요" fits a day that is still going; a past day simply was not an exercise day */
    const noLabel = date === today ? '아직이에요' : '안 했어요';
    const no = choiceButton({ label: noLabel, pressed: day.exercise === false, onChoose: () => save({ exercise: false }, `${word} 운동을 ‘${noLabel}’로 적었습니다.`, '[data-og-exercise="no"]') });
    no.dataset.ogExercise = 'no';
    card.body.append(el('div', { class: 'og-picks', role: 'group', 'aria-label': `${word} 걷기·운동` }, yes, no));

    if (day.exercise) {
      card.body.append(
        el('h4', { class: 'og-life-sub', text: '어떤 운동이었나요? (선택)' }),
        el(
          'div',
          { class: 'og-picks', role: 'group', 'aria-label': '운동 종류' },
          EXERCISE_TYPES.map((t) => {
            const on = day.exerciseType === t.id;
            const b = choiceButton({ label: t.label, pressed: on, onChoose: () => save({ exerciseType: on ? '' : t.id }, on ? '운동 종류를 지웠습니다.' : `운동 종류를 ‘${t.label}’(으)로 적었습니다.`, `[data-og-exercise-type="${t.id}"]`) });
            b.dataset.ogExerciseType = t.id;
            return b;
          })
        )
      );
      const minutes = makeField({ name: 'minutes', label: '시간 (분)', type: 'amount', required: false, maxlength: 3, hint: '1분에서 600분까지' }, day.exerciseMinutes);
      const memo = makeField({ name: 'memo', label: '메모', type: 'text', required: false, maxlength: LIFE_LIMITS.memo }, day.exerciseMemo);
      const error = el('p', { class: 'og-form-error', role: 'alert' });
      const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': '운동 시간과 메모' }, minutes.node, memo.node, error, el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', 'data-og-exercise': 'save', text: '저장' })));
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const raw = minutes.get().trim();
        const value = raw === '' ? null : /^\d{1,3}$/.test(raw) ? Number(raw) : NaN;
        const r = Number.isNaN(value) ? { ok: false } : dailyLife.update({ exerciseMinutes: value, exerciseMemo: memo.get() }, date);
        if (!r.ok) {
          minutes.input.setAttribute('aria-invalid', 'true');
          error.textContent = '시간은 1에서 600 사이 숫자로 적어 주세요.';
          minutes.input.focus();
          return;
        }
        card.say('운동 기록을 저장했습니다.');
        if (onChange) onChange();
        render('[data-og-exercise="save"]');
      });
      card.body.append(form);
    }
    card.body.append(el('p', { class: 'og-home-note', text: '직접 적는 기록입니다. 운동량을 평가하거나 열량을 추정하지 않습니다.' }));
    if (focusSelector) {
      const target = card.body.querySelector(focusSelector);
      if (target) target.focus();
      else card.focusTitle();
    }
  }

  render();
  return { card, render: () => render() };
}

/* ───────── 수면 ───────── */

/* one record per day (the day the user woke up); the date comes from the date bar, like the other cards */
export function createSleepSection({ sleep, now = () => Date.now(), getDate = () => dateKey(now()), onChange }) {
  const card = createCard({ area: 'life', slot: 'sleep', title: '수면', level: 2, lead: '전날 밤 잠을 적어 두세요. 날짜는 일어난 날입니다.' });
  const errors = { INVALID_DATE: '날짜를 다시 골라 주세요.', INVALID_BED_TIME: '잠든 시간을 다시 골라 주세요.', INVALID_WAKE_TIME: '일어난 시간을 다시 골라 주세요.', EMPTY_RECORD: '시간, 느낌, 메모 가운데 하나는 적어 주세요.' };
  const save = (values) => sleep.save({ date: getDate(), bedTime: values.bedTime, wakeTime: values.wakeTime, quality: values.quality, memo: values.memo });
  const word = () => dayWord(getDate(), dateKey(now()));
  const list = createListCard({
    card,
    config: {
      itemName: '수면 기록',
      listLabel: () => `${word()} 수면 기록`,
      emptyText: () => `${word()} 적어 둔 수면 기록이 없어요.`,
      addLabel: '수면 기록 적기',
      checkable: false,
      /* a day holds one record: once it exists it is edited, not added again */
      canAdd: () => !sleep.get(getDate()),
      afterChange: onChange,
      note: '느낌은 스스로 적는 말입니다. 수면 상태를 판단하거나 조언하지 않습니다.',
      fields: [
        { name: 'bedTime', label: '잠든 시간', type: 'time', required: false, errors: ['INVALID_BED_TIME', 'EMPTY_RECORD'] },
        { name: 'wakeTime', label: '일어난 시간', type: 'time', required: false, errors: ['INVALID_WAKE_TIME'] },
        { name: 'quality', label: '어땠나요?', type: 'select', required: false, options: SLEEP_QUALITIES },
        { name: 'memo', label: '메모', type: 'text', required: false, maxlength: LIFE_LIMITS.memo },
      ],
      getItems: () => {
        const r = sleep.get(getDate());
        return r ? [{ ...r, id: r.date }] : [];
      },
      describe: (item) => ({
        title: item.date === dateKey(now()) ? `${formatDateKey(item.date)} (오늘)` : formatDateKey(item.date),
        meta: [item.bedTime ? `잠든 시간 ${formatTime(item.bedTime)}` : '', item.wakeTime ? `일어난 시간 ${formatTime(item.wakeTime)}` : '', labelOf(SLEEP_QUALITIES, item.quality)].filter(Boolean),
        text: item.memo,
      }),
      onAdd: save,
      onUpdate: (id, values) => save(values),
      onRemove: (id) => sleep.remove(id),
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
    },
  });
  list.render();
  return { card, render: list.reset, openAdd: list.openAdd };
}

/* ───────── 최근 7일 ───────── */

/* what was written on each of the last seven days, as written — no average, no target. Each day opens in the cards above. */
export function describeDay({ dailyLife, sleep }, date, recorded) {
  const rec = recorded.has(date) ? dailyLife.get(date) : null;
  const parts = [];
  if (rec) {
    const detail = rec.mealSlots ? MEAL_SLOTS.filter((s) => rec.mealSlots[s.id]).map((s) => s.label).join(' · ') : '';
    if (rec.meals > 0) parts.push(`식사 ${rec.meals}끼${detail ? ` (${detail})` : ''}`);
    if (rec.water > 0) parts.push(`물 ${rec.water}잔`);
    if (rec.exercise) parts.push('운동 했어요');
  }
  if (sleep.get(date)) parts.push('수면 적음');
  return parts;
}

export function createRecentDaysCard({ dailyLife, sleep, now = () => Date.now(), getDate, onPick }) {
  const card = createCard({ area: 'life', slot: 'recent-days', title: '최근 7일', level: 3, lead: '날짜를 누르면 그날 기록을 보고 고칠 수 있어요.' });

  function render() {
    const today = dateKey(now());
    const chosen = getDate();
    const recorded = new Set(dailyLife.recordedDates());
    clear(card.body);
    card.body.append(
      el(
        'ul',
        { class: 'og-life-days og-life-days--pick', 'aria-label': '최근 7일 기록' },
        Array.from({ length: 7 }, (_, i) => addDays(today, -i)).map((d) => {
          const parts = describeDay({ dailyLife, sleep }, d, recorded);
          const name = d === today ? `${formatDateKey(d)} (오늘)` : formatDateKey(d);
          return el(
            'li',
            { 'data-og-recent-day': d },
            el('button', { type: 'button', class: 'og-life-days__pick', 'aria-pressed': d === chosen ? 'true' : 'false', 'aria-label': `${name} 기록 보기`, text: name, onclick: () => onPick(d) }),
            el('span', { class: 'og-life-days__text', text: parts.length ? parts.join(' · ') : '적은 내용 없음' })
          );
        })
      )
    );
  }

  render();
  return { card, render };
}

/* ───────── the group: one date for all four cards ───────── */

/* onDateChange (Phase 3): the 건강 tab shares this date bar, so a new day re-renders its cards too */
export function createDailyGroup({ dailyLife, sleep, now = () => Date.now(), onDateChange }) {
  let parts = null;
  const renderCards = () => parts && [parts.meals, parts.water, parts.exercise, parts.sleep, parts.recent].forEach((p) => p.render());
  const nav = createDayNav({
    now,
    onChange: () => {
      renderCards();
      if (typeof onDateChange === 'function') onDateChange();
    },
  });
  const refreshRecent = () => parts && parts.recent.render();
  const shared = { dailyLife, now, getDate: nav.date, onChange: refreshRecent };
  parts = {
    meals: createMealsSection(shared),
    water: createWaterSection(shared),
    exercise: createExerciseSection(shared),
    sleep: createSleepSection({ sleep, now, getDate: nav.date, onChange: refreshRecent }),
    recent: createRecentDaysCard({
      dailyLife,
      sleep,
      now,
      getDate: nav.date,
      onPick: (d) => {
        nav.set(d);
        const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        nav.node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        const label = nav.node.querySelector('[data-og-daynav="date"]');
        if (label) label.focus();
      },
    }),
  };
  const render = () => {
    nav.render();
    renderCards();
  };
  return { nav, ...parts, render, date: nav.date, setDate: nav.set, resetDate: nav.reset };
}

export { countMeals };
