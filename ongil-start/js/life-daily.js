/*
 * My Life — 생활 group: 식사 · 운동 · 수면.
 *
 * 식사 and 운동 write the same DailyLife record as Home's "오늘의 생활" (one record per day), so a change on
 * either screen is what the other shows. Nothing here counts calories, rates a diet, estimates energy,
 * judges sleep or gives advice: these are the user's own notes.
 */
import { el, clear } from './dom.js';
import { createCard, choiceButton, makeField } from './home-ui.js';
import { createListCard } from './home-list.js';
import { MEAL_SLOTS, EXERCISE_TYPES, SLEEP_QUALITIES, LIFE_LIMITS, countMeals } from './life-contracts.js';
import { dateKey, addDays, formatDateKey, formatTime } from './dates.js';

const labelOf = (options, id) => (options.find((o) => o.id === id) || { label: '' }).label;

/* ───────── 식사 ───────── */

export function createMealsSection({ dailyLife, now = () => Date.now() }) {
  const card = createCard({ area: 'life', slot: 'meals', title: '식사', level: 2, lead: '오늘 먹은 끼니에 표시하세요.' });

  function render(focusSlot) {
    const day = dailyLife.get();
    const slots = day.mealSlots || {};
    clear(card.body);
    card.body.append(
      el(
        'div',
        { class: 'og-picks', role: 'group', 'aria-label': '오늘 먹은 끼니' },
        MEAL_SLOTS.map((s) => {
          const on = slots[s.id] === true;
          const b = choiceButton({
            label: s.label,
            pressed: on,
            onChoose: () => {
              const r = dailyLife.update({ mealSlots: { ...(day.mealSlots || {}), [s.id]: !on } });
              card.say(r.ok ? `${s.label} 식사를 ${on ? '먹지 않은 것으로' : '먹은 것으로'} 적었습니다.` : '저장하지 못했습니다.');
              render(s.id);
            },
          });
          b.dataset.ogMealSlot = s.id;
          return b;
        })
      ),
      el('p', { class: 'og-life-value', 'data-og-meal-count': String(day.meals), text: `오늘 ${day.meals}끼` })
    );
    if (!day.mealSlots && day.meals > 0) card.body.append(el('p', { class: 'og-home-note', 'data-og-meal-legacy': 'true', text: `홈에서 ${day.meals}끼로 적었어요. 어느 끼니인지 고르면 고른 내용으로 바뀝니다.` }));
    /* the last seven days, as written — no average, no target */
    const today = dateKey(now());
    const days = Array.from({ length: 7 }, (_, i) => addDays(today, -i));
    const recorded = new Set(dailyLife.recordedDates());
    card.body.append(
      el('h4', { class: 'og-life-sub', text: '최근 7일' }),
      el(
        'ul',
        { class: 'og-life-days', 'aria-label': '최근 7일 식사' },
        days.map((d) => {
          const rec = recorded.has(d) ? dailyLife.get(d) : null;
          const detail = rec && rec.mealSlots ? MEAL_SLOTS.filter((s) => rec.mealSlots[s.id]).map((s) => s.label).join(' · ') : '';
          return el('li', {}, el('span', { class: 'og-life-days__date', text: d === today ? '오늘' : formatDateKey(d) }), el('span', { text: rec ? `${rec.meals}끼${detail ? ` (${detail})` : ''}` : '적은 내용 없음' }));
        })
      ),
      el('p', { class: 'og-home-note', text: '직접 적는 기록입니다. 식단을 평가하거나 열량을 계산하지 않습니다.' })
    );
    if (focusSlot) {
      const target = card.body.querySelector(`[data-og-meal-slot="${focusSlot}"]`);
      if (target) target.focus();
    }
  }

  render();
  return { card, render: () => render() };
}

/* ───────── 운동 ───────── */

export function createExerciseSection({ dailyLife }) {
  const card = createCard({ area: 'life', slot: 'exercise', title: '운동', level: 2, lead: '오늘 걷거나 운동했는지 적어 두세요.' });

  function render(focusSelector) {
    const day = dailyLife.get();
    clear(card.body);
    const save = (patch, message, focus) => {
      const r = dailyLife.update(patch);
      card.say(r.ok ? message : '저장하지 못했습니다.');
      render(focus);
    };
    const yes = choiceButton({ label: '했어요', pressed: day.exercise === true, onChoose: () => save({ exercise: true }, '오늘 운동을 ‘했어요’로 적었습니다.', '[data-og-exercise="yes"]') });
    yes.dataset.ogExercise = 'yes';
    const no = choiceButton({ label: '아직이에요', pressed: day.exercise === false, onChoose: () => save({ exercise: false }, '오늘 운동을 ‘아직이에요’로 적었습니다.', '[data-og-exercise="no"]') });
    no.dataset.ogExercise = 'no';
    card.body.append(el('div', { class: 'og-picks', role: 'group', 'aria-label': '오늘 걷기·운동' }, yes, no));

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
        const r = Number.isNaN(value) ? { ok: false } : dailyLife.update({ exerciseMinutes: value, exerciseMemo: memo.get() });
        if (!r.ok) {
          minutes.input.setAttribute('aria-invalid', 'true');
          error.textContent = '시간은 1에서 600 사이 숫자로 적어 주세요.';
          minutes.input.focus();
          return;
        }
        card.say('운동 기록을 저장했습니다.');
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

export function createSleepSection({ sleep, now = () => Date.now(), onChange }) {
  const card = createCard({ area: 'life', slot: 'sleep', title: '수면', level: 2, lead: '지난밤 잠을 적어 두세요. 날짜는 일어난 날입니다.' });
  const errors = { INVALID_DATE: '날짜를 다시 골라 주세요.', INVALID_BED_TIME: '잠든 시간을 다시 골라 주세요.', INVALID_WAKE_TIME: '일어난 시간을 다시 골라 주세요.', EMPTY_RECORD: '시간, 느낌, 메모 가운데 하나는 적어 주세요.' };
  const save = (values) => sleep.save({ date: values.date, bedTime: values.bedTime, wakeTime: values.wakeTime, quality: values.quality, memo: values.memo });
  const list = createListCard({
    card,
    config: {
      itemName: '수면 기록',
      listLabel: '최근 수면 기록',
      emptyText: '적어 둔 수면 기록이 없어요.',
      addLabel: '수면 기록 추가',
      checkable: false,
      afterChange: onChange,
      note: '느낌은 스스로 적는 말입니다. 수면 상태를 판단하거나 조언하지 않습니다.',
      fields: [
        { name: 'date', label: '일어난 날', type: 'date', required: true, initial: () => dateKey(now()), errors: ['INVALID_DATE'] },
        { name: 'bedTime', label: '잠든 시간', type: 'time', required: false, errors: ['INVALID_BED_TIME', 'EMPTY_RECORD'] },
        { name: 'wakeTime', label: '일어난 시간', type: 'time', required: false, errors: ['INVALID_WAKE_TIME'] },
        { name: 'quality', label: '어땠나요?', type: 'select', required: false, options: SLEEP_QUALITIES },
        { name: 'memo', label: '메모', type: 'text', required: false, maxlength: LIFE_LIMITS.memo },
      ],
      /* one record per date, so the date is the item id */
      getItems: () => sleep.recent(14).map((r) => ({ ...r, id: r.date })),
      describe: (item) => ({
        title: item.date === dateKey(now()) ? `${formatDateKey(item.date)} (오늘)` : formatDateKey(item.date),
        meta: [item.bedTime ? `잠든 시간 ${formatTime(item.bedTime)}` : '', item.wakeTime ? `일어난 시간 ${formatTime(item.wakeTime)}` : '', labelOf(SLEEP_QUALITIES, item.quality)].filter(Boolean),
        text: item.memo,
      }),
      onAdd: save,
      onUpdate: (id, values) => {
        const r = save(values);
        if (r.ok && values.date !== id) sleep.remove(id);
        return r;
      },
      onRemove: (id) => sleep.remove(id),
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
    },
  });
  list.render();
  return { card, render: list.reset, openAdd: list.openAdd };
}

export { countMeals };
