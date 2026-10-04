/*
 * My Life — 건강 group (Phase 3): 안부와 몸 상태 · 증상 · 복약 · 건강 메모 · 최근 건강 기록, for one chosen day.
 *
 * The day comes from the same date bar as the 생활 cards (life-daily.js createDayNav): one bar, moved between
 * the two tabs, so 생활 and 건강 always show the same day. Today and up to 365 days back; never a future day.
 *
 * These are the user's own notes about their day. Nothing here diagnoses, names an illness, estimates a risk,
 * scores health, recommends a medicine or a dose, or raises an alarm because a symptom was written down.
 * Everything stays on this device (privacy.js: HEALTH_ADJACENT — never synced, searched or shared).
 *
 *   안부와 몸 상태   checkins        one record per day: 기분 (= Home's 오늘의 안부) · 몸 상태 · 에너지 · 통증 · 메모
 *   증상             symptoms        one record per day: chosen symptoms · 기타 · how strong it felt (own word) · 메모
 *   복약             medicationLogs  the day's medications with the mark (Home's 복약 card writes the same log)
 *   내 약 목록       medications     the plan: name · time · days · memo (Home's 복약 card edits the same list)
 *   건강 메모        healthNotes     several free notes per day
 *   건강 수치        healthMeasures  numbers the user wrote down (체중 · 혈압 · 혈당 · 맥박), several per day — kept as written,
 *                                    never judged (no normal range, no high/low word, no colour); plus the last few of each kind
 *   최근 건강 기록   all of the above, last seven days, one line each — a date opens that day in the cards
 */
import { el, clear } from './dom.js';
import { createCard, choiceButton, makeField, nextId } from './home-ui.js';
import { createListCard, STORAGE_ERROR_TEXT } from './home-list.js';
import { LIFE_LIMITS, CHECKIN_STATUSES, CHECKIN_BODY, CHECKIN_ENERGY, CHECKIN_PAIN, SYMPTOM_TYPES, SYMPTOM_FEELINGS, ALL_DAYS, MEASURE_TYPES, MEASURE_TIMINGS, MEASURE_LIMITS, measureText, measureType } from './life-contracts.js';
import { dateKey, addDays, formatDateKey, formatTime, WEEKDAY_LABELS } from './dates.js';
import { dayWord, DAILY_BACK_DAYS } from './life-daily.js';

const labelOf = (options, id) => (options.find((o) => o.id === id) || { label: '' }).label;
export const HEALTH_SAFETY_NOTE = 'ONGIL의 건강 기록은 생활 기록을 위한 기능이며 의료 진단을 대신하지 않습니다.';
export const DAY_OPTIONS = Object.freeze(WEEKDAY_LABELS.map((label, id) => Object.freeze({ id, label })));

/* "매일" or "월 · 수 · 금" */
export function daysText(days) {
  const list = Array.isArray(days) ? days : [];
  if (list.length === 0 || ALL_DAYS.every((d) => list.includes(d))) return '매일';
  return list.map((d) => WEEKDAY_LABELS[d]).join(' · ');
}

/* one line per kind for a day, from what was written — used by 최근 건강 기록. Counts and the user's own choices only. */
export function describeHealthDay({ checkIn, symptoms, medication, healthNotes, healthMeasures }, date) {
  const parts = [];
  const c = checkIn.get(date);
  if (c) {
    const said = [c.status ? `기분 ${labelOf(CHECKIN_STATUSES, c.status)}` : '', c.body ? `몸 ${labelOf(CHECKIN_BODY, c.body)}` : ''].filter(Boolean).join(', ');
    parts.push(said ? `안부 (${said})` : '안부 적음');
  }
  const s = symptoms.get(date);
  if (s) parts.push(s.symptoms.length ? `증상 ${s.symptoms.length}가지` : '증상 메모');
  const meds = medication.historyForDate(date);
  if (meds.length) parts.push(`약 ${meds.length}개 중 ${meds.filter((m) => m.taken).length}개 먹음`);
  const notes = healthNotes.countForDate(date);
  if (notes) parts.push(`메모 ${notes}건`);
  /* how many numbers were written, never which numbers */
  const measures = healthMeasures ? healthMeasures.countForDate(date) : 0;
  if (measures) parts.push(`수치 ${measures}건`);
  return parts;
}

function refocus(root, selector) {
  if (!selector) return;
  const target = root.querySelector(selector);
  if (target && !target.disabled) target.focus();
}

/* a question with large single-choice buttons; pressing the chosen one again takes the choice back */
function question({ key, title, options, value, onPick }) {
  const id = nextId('q');
  return el(
    'div',
    { class: 'og-health-q' },
    el('h4', { class: 'og-life-sub', id, text: title }),
    el(
      'div',
      { class: 'og-picks', role: 'group', 'aria-labelledby': id },
      options.map((o) => {
        const b = choiceButton({ label: o.label, pressed: value === o.id, onChoose: () => onPick(value === o.id ? '' : o.id, o) });
        b.dataset.ogHealthPick = `${key}:${o.id}`;
        return b;
      })
    )
  );
}

/* "지우기" with a confirmation step, like every delete in ONGIL */
function deleteControl({ label, question: ask, onConfirm, focusKey }) {
  const box = el('div', { class: 'og-confirm', role: 'group', 'aria-label': '지우기 확인', hidden: true });
  const open = el('button', {
    type: 'button',
    class: 'og-btn og-btn--text',
    'data-og-health-delete': focusKey,
    'aria-expanded': 'false',
    text: label,
    onclick: () => {
      box.hidden = false;
      open.setAttribute('aria-expanded', 'true');
      box.querySelector('button').focus();
    },
  });
  box.append(
    el('p', { text: ask }),
    el(
      'div',
      { class: 'og-form__actions' },
      el('button', {
        type: 'button',
        class: 'og-btn og-btn--ghost',
        text: '취소',
        onclick: () => {
          box.hidden = true;
          open.setAttribute('aria-expanded', 'false');
          open.focus();
        },
      }),
      el('button', { type: 'button', class: 'og-btn og-btn--danger', 'data-og-health-confirm': focusKey, text: '지우기', onclick: onConfirm })
    )
  );
  return el('div', { class: 'og-health-delete' }, el('div', { class: 'og-form__actions' }, open), box);
}

/* ───────── 안부와 몸 상태 ───────── */

export function createHealthCheckInSection({ checkIn, now = () => Date.now(), getDate = () => dateKey(now()), onChange }) {
  const card = createCard({ area: 'life', slot: 'checkin', title: '안부와 몸 상태', level: 2, lead: '그날 상태를 가볍게 골라 두세요. 하나만 골라도 됩니다.' });

  function render(focus) {
    const today = dateKey(now());
    const date = getDate();
    const word = dayWord(date, today);
    const current = checkIn.get(date);
    const value = (k) => (current && current[k]) || '';
    clear(card.body);
    card.root.dataset.ogDay = date;
    card.root.dataset.ogState = current ? 'filled' : 'empty';
    const save = (patch, message, selector) => {
      const r = checkIn.save(patch, date);
      card.say(r.ok ? message : '저장하지 못했습니다.');
      if (onChange) onChange();
      render(selector);
    };
    const pick = (key, title) => (id, o) => save({ [key]: id }, id ? `${word} ${title}을(를) ‘${o.label}’(으)로 적었습니다.` : `${word} ${title} 선택을 지웠습니다.`, `[data-og-health-pick="${key}:${o.id}"]`);
    if (!current) card.body.append(el('p', { class: 'og-home-empty', 'data-og-health-empty': 'checkin', text: `${word} 적어 둔 상태가 없어요.` }));
    card.body.append(
      question({ key: 'status', title: '기분', options: CHECKIN_STATUSES, value: value('status'), onPick: pick('status', '기분') }),
      question({ key: 'body', title: '몸 상태', options: CHECKIN_BODY, value: value('body'), onPick: pick('body', '몸 상태') }),
      question({ key: 'energy', title: '에너지', options: CHECKIN_ENERGY, value: value('energy'), onPick: pick('energy', '에너지') }),
      question({ key: 'pain', title: '아픈 곳이 있었나요?', options: CHECKIN_PAIN, value: value('pain'), onPick: pick('pain', '통증') })
    );
    if (value('status') === 'help') {
      card.body.append(el('div', { class: 'og-notice og-home-help', role: 'note' }, el('p', {}, el('strong', { text: 'ONGIL은 이 선택을 다른 사람에게 알리지 않습니다.' })), el('p', { text: '도움이 필요하면 가까운 사람에게 직접 연락해 주세요.' })));
    }
    const memo = makeField({ name: 'memo', label: '메모', type: 'text', required: false, maxlength: LIFE_LIMITS.checkinMemo, hint: `${LIFE_LIMITS.checkinMemo}자까지` }, value('memo'));
    const error = el('p', { class: 'og-form-error', role: 'alert' });
    const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': `${word} 상태 메모` }, memo.node, error, el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', 'data-og-health-save': 'checkin', text: '메모 저장' })));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = memo.get();
      if (!current && !text.trim()) {
        memo.input.setAttribute('aria-invalid', 'true');
        error.textContent = '메모를 적거나 위에서 하나를 골라 주세요.';
        memo.input.focus();
        return;
      }
      save({ memo: text }, text.trim() ? `${word} 메모를 저장했습니다.` : `${word} 메모를 지웠습니다.`, '[data-og-health-save="checkin"]');
    });
    card.body.append(form);
    if (current) {
      card.body.append(
        deleteControl({
          label: `${word} 상태 기록 지우기`,
          question: `${word} 적은 기분·몸 상태·에너지·통증·메모를 모두 지울까요? 되돌릴 수 없습니다.`,
          focusKey: 'checkin',
          onConfirm: () => {
            const removed = checkIn.remove(date);
            card.say(removed ? `${word} 상태 기록을 지웠습니다.` : STORAGE_ERROR_TEXT);
            if (removed && onChange) onChange();
            render();
            card.focusTitle();
          },
        })
      );
    }
    card.body.append(el('p', { class: 'og-home-note', text: '기분은 홈의 ‘오늘의 안부’와 같은 기록입니다. 스스로 고르는 말이며 점수를 매기지 않습니다.' }));
    refocus(card.body, focus);
  }

  render();
  return { card, render: () => render() };
}

/* ───────── 증상 ───────── */

export function createSymptomsSection({ symptoms, now = () => Date.now(), getDate = () => dateKey(now()), onChange }) {
  const card = createCard({ area: 'life', slot: 'symptoms', title: '증상', level: 2, lead: '느낀 증상을 골라 두세요. 여러 개를 골라도 됩니다.' });

  function render(focus) {
    const today = dateKey(now());
    const date = getDate();
    const word = dayWord(date, today);
    const current = symptoms.get(date);
    const chosen = current ? current.symptoms : [];
    clear(card.body);
    card.root.dataset.ogDay = date;
    card.root.dataset.ogState = current ? 'filled' : 'empty';
    const save = (patch, message, selector) => {
      const r = symptoms.save(patch, date);
      card.say(r.ok ? message : '저장하지 못했습니다.');
      if (onChange) onChange();
      render(selector);
    };
    if (!current) card.body.append(el('p', { class: 'og-home-empty', 'data-og-health-empty': 'symptoms', text: `${word} 적어 둔 증상이 없어요.` }));
    const listId = nextId('q');
    card.body.append(
      el('h4', { class: 'og-life-sub', id: listId, text: '어떤 증상이었나요?' }),
      el(
        'div',
        { class: 'og-picks', role: 'group', 'aria-labelledby': listId },
        SYMPTOM_TYPES.map((t) => {
          const on = chosen.includes(t.id);
          const b = choiceButton({ label: t.label, pressed: on, onChoose: () => save({ symptoms: on ? chosen.filter((x) => x !== t.id) : [...chosen, t.id] }, on ? `${word} ‘${t.label}’을(를) 뺐습니다.` : `${word} ‘${t.label}’을(를) 적었습니다.`, `[data-og-symptom="${t.id}"]`) });
          b.dataset.ogSymptom = t.id;
          return b;
        })
      )
    );
    if (chosen.length) {
      card.body.append(question({ key: 'intensity', title: '느낌의 정도 (스스로 고르기)', options: SYMPTOM_FEELINGS, value: current.intensity, onPick: (id, o) => save({ intensity: id }, id ? `느낌의 정도를 ‘${o.label}’(으)로 적었습니다.` : '느낌의 정도를 지웠습니다.', `[data-og-health-pick="intensity:${o.id}"]`) }));
    }
    const fields = [];
    if (chosen.includes('other')) fields.push(makeField({ name: 'other', label: '기타 증상', type: 'text', required: false, maxlength: LIFE_LIMITS.symptomOther }, current.other));
    const note = makeField({ name: 'note', label: '메모', type: 'text', required: false, maxlength: LIFE_LIMITS.symptomNote, hint: `${LIFE_LIMITS.symptomNote}자까지` }, current ? current.note : '');
    fields.push(note);
    const error = el('p', { class: 'og-form-error', role: 'alert' });
    const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': `${word} 증상 메모` }, fields.map((f) => f.node), error, el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', 'data-og-health-save': 'symptoms', text: '메모 저장' })));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = Object.fromEntries(fields.map((f) => [f.input.name, f.get()]));
      if (!current && !values.note.trim()) {
        note.input.setAttribute('aria-invalid', 'true');
        error.textContent = '증상을 고르거나 메모를 적어 주세요.';
        note.input.focus();
        return;
      }
      save(values, `${word} 증상 메모를 저장했습니다.`, '[data-og-health-save="symptoms"]');
    });
    card.body.append(form);
    if (current) {
      card.body.append(
        deleteControl({
          label: `${word} 증상 기록 지우기`,
          question: `${word} 적은 증상과 메모를 모두 지울까요? 되돌릴 수 없습니다.`,
          focusKey: 'symptoms',
          onConfirm: () => {
            const removed = symptoms.remove(date);
            card.say(removed ? `${word} 증상 기록을 지웠습니다.` : STORAGE_ERROR_TEXT);
            if (removed && onChange) onChange();
            render();
            card.focusTitle();
          },
        })
      );
    }
    card.body.append(el('p', { class: 'og-home-note', text: '스스로 적는 기록입니다. ONGIL은 증상을 판단하거나 원인을 짐작하지 않습니다.' }));
    refocus(card.body, focus);
  }

  render();
  return { card, render: () => render() };
}

/* ───────── 복약 (the chosen day) ───────── */

export function createMedicationDaySection({ medication, now = () => Date.now(), getDate = () => dateKey(now()), onChange }) {
  const card = createCard({ area: 'life', slot: 'medication', title: '복약', level: 2, lead: '먹은 약에 표시하세요. 지난 날 표시도 고칠 수 있어요.' });
  const word = () => dayWord(getDate(), dateKey(now()));
  const list = createListCard({
    card,
    config: {
      itemName: '약',
      listLabel: () => `${word()} 먹을 약`,
      emptyText: () => (medication.count() ? `${word()} 먹을 약으로 적어 둔 것이 없어요.` : '적어 둔 약이 없어요. 아래 ‘내 약 목록’에서 추가하세요.'),
      canAdd: false,
      canEdit: false,
      fields: [],
      doneWord: '먹었어요',
      checkWord: '먹은 약으로 표시',
      getItems: () => medication.historyForDate(getDate()),
      isDone: (item) => item.taken,
      describe: (item) => {
        const today = getDate() === dateKey(now());
        const state = item.taken ? '' : item.removed ? '먹지 않음으로 표시' : today ? '아직 복용하지 않았어요' : '표시하지 않았어요';
        return { title: item.name, meta: [item.time ? formatTime(item.time) : '', state, item.removed ? '목록에서 지운 약 · 기록만 남아 있어요' : ''].filter(Boolean) };
      },
      /* a mark of a medication since removed from 내 약 목록 is history: shown as it was, not changed */
      isLocked: (item) => item.removed === true,
      toggleText: (item, checked) => (checked ? `${word()} ‘${item.name}’을(를) 먹은 약으로 표시했습니다.` : `${word()} ‘${item.name}’ 표시를 풀었습니다.`),
      onToggle: (item, checked) => medication.setTaken(item.id, checked, getDate()),
      afterChange: onChange,
    },
  });
  list.render();
  return { card, render: list.reset };
}

/* ───────── 내 약 목록 (the plan) ───────── */

export function createMedicationPlanSection({ medication, onChange }) {
  const card = createCard({ area: 'life', slot: 'medication-plan', title: '내 약 목록', level: 3, lead: '약 이름, 먹는 시간과 요일을 직접 적어 두세요.' });
  const errors = { INVALID_NAME: '약 이름을 적어 주세요.', INVALID_TIME: '시간을 다시 골라 주세요.', LIMIT: '약 목록이 가득 찼습니다.' };
  const list = createListCard({
    card,
    config: {
      itemName: '약',
      listLabel: '내 약 목록',
      emptyText: '적어 둔 약이 없어요.',
      addLabel: '약 추가',
      checkable: false,
      note: '직접 적어 두는 메모입니다. ONGIL은 약이나 복용량을 정하거나 권하지 않습니다. 고친 내용은 앞으로의 날에 쓰이고, 이미 표시한 날의 기록은 그대로 남습니다. 약을 목록에서 지워도 표시해 둔 날의 기록은 남습니다.',
      fields: [
        { name: 'name', label: '약 이름', type: 'text', required: true, maxlength: LIFE_LIMITS.medicationName, errors: ['INVALID_NAME'] },
        { name: 'time', label: '먹는 시간', type: 'time', required: false, errors: ['INVALID_TIME'] },
        { name: 'daysOfWeek', label: '먹는 요일', type: 'days', required: false, options: DAY_OPTIONS, hint: '고르지 않으면 매일로 적습니다.' },
        { name: 'memo', label: '메모', type: 'text', required: false, maxlength: LIFE_LIMITS.memo },
      ],
      getItems: () => medication.list(),
      describe: (item) => ({ title: item.name, meta: [item.time ? formatTime(item.time) : '시간 없음', daysText(item.daysOfWeek), item.memo].filter(Boolean) }),
      onAdd: (values) => medication.add(values),
      onUpdate: (id, values) => medication.update(id, values),
      onRemove: (id) => medication.remove(id),
      afterChange: onChange,
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
    },
  });
  list.render();
  return { card, render: list.reset, openAdd: list.openAdd };
}

/* ───────── 건강 메모 ───────── */

export function createHealthNotesSection({ healthNotes, now = () => Date.now(), getDate = () => dateKey(now()), onChange }) {
  const card = createCard({ area: 'life', slot: 'health-notes', title: '건강 메모', level: 2, lead: '병원에 다녀온 일, 몸이 어땠는지 같은 일을 자유롭게 남기세요.' });
  const errors = { INVALID_TEXT: '메모를 적어 주세요.', LIMIT: '이 날 메모가 가득 찼습니다. 지난 메모를 지우거나 고쳐 주세요.', FUTURE_DATE: '아직 오지 않은 날에는 적을 수 없어요.' };
  const word = () => dayWord(getDate(), dateKey(now()));
  const list = createListCard({
    card,
    config: {
      itemName: '건강 메모',
      listLabel: () => `${word()} 건강 메모`,
      emptyText: () => `${word()} 남긴 건강 메모가 없어요.`,
      addLabel: '건강 메모 쓰기',
      checkable: false,
      fields: [{ name: 'text', label: '메모', type: 'textarea', required: true, maxlength: LIFE_LIMITS.healthNoteText, hint: `${LIFE_LIMITS.healthNoteText}자까지`, errors: ['INVALID_TEXT', 'LIMIT'] }],
      getItems: () => healthNotes.listForDate(getDate()),
      describe: (item) => ({ title: `${formatDateKey(item.date)} 메모`, meta: [], text: item.text }),
      onAdd: (values) => healthNotes.add({ text: values.text, date: getDate() }),
      onUpdate: (id, values) => healthNotes.update(id, { text: values.text }),
      onRemove: (id) => healthNotes.remove(id),
      afterChange: onChange,
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
    },
  });
  list.render();
  return { card, render: list.reset, openAdd: list.openAdd };
}

/* ───────── 건강 수치 ───────── */

export const MEASURE_NOTE = '적은 숫자를 그대로 보관합니다. 높고 낮음을 판단하지 않아요. 수치가 걱정되면 의료진과 상담하세요.';

export function createHealthMeasuresSection({ healthMeasures, now = () => Date.now(), getDate = () => dateKey(now()), onChange }) {
  const card = createCard({ area: 'life', slot: 'health-measures', title: '건강 수치', level: 2, lead: '체중계, 혈압계, 혈당계에서 본 숫자를 적어 두세요.' });
  const errors = {
    INVALID_TYPE: '무엇을 쟀는지 골라 주세요.',
    INVALID_VALUE: '숫자를 확인해 주세요. 체중은 62.5, 혈압은 120/80, 혈당은 105, 맥박은 72처럼 적어요.',
    INVALID_TIME: '시간을 확인해 주세요.',
    LIMIT: '이 날 기록이 가득 찼습니다. 지난 기록을 지우거나 고쳐 주세요.',
    FUTURE_DATE: '아직 오지 않은 날에는 적을 수 없어요.',
  };
  const word = () => dayWord(getDate(), dateKey(now()));
  const valueText = (item) => (item.type === 'bloodPressure' ? `${item.value}/${item.value2}` : String(item.value));
  const list = createListCard({
    card,
    config: {
      itemName: '건강 수치',
      listLabel: () => `${word()} 건강 수치`,
      emptyText: () => `${word()} 적은 건강 수치가 없어요.`,
      addLabel: '건강 수치 적기',
      checkable: false,
      fields: [
        { name: 'type', label: '무엇을 쟀나요', type: 'select', required: true, options: MEASURE_TYPES.map((t) => ({ id: t.id, label: `${t.label} (${t.unit})` })), initial: 'weight', errors: ['INVALID_TYPE'] },
        { name: 'text', label: '숫자', type: 'text', required: true, maxlength: 7, hint: '체중 62.5 · 혈압 120/80 · 혈당 105 · 맥박 72', read: valueText, errors: ['INVALID_VALUE', 'LIMIT'] },
        { name: 'timing', label: '언제 쟀나요', type: 'select', required: false, options: MEASURE_TIMINGS },
        { name: 'time', label: '잰 시간', type: 'time', required: false, errors: ['INVALID_TIME'] },
        { name: 'memo', label: '메모', type: 'text', required: false, maxlength: MEASURE_LIMITS.memo, hint: `${MEASURE_LIMITS.memo}자까지` },
      ],
      getItems: () => healthMeasures.listForDate(getDate()),
      describe: (item) => ({
        title: `${(measureType(item.type) || { label: '' }).label} ${measureText(item)}`,
        meta: [item.time ? formatTime(item.time) : '', item.timing ? labelOf(MEASURE_TIMINGS, item.timing) : ''].filter(Boolean),
        text: item.memo || '',
      }),
      onAdd: (values) => healthMeasures.add({ type: values.type, text: values.text, timing: values.timing, time: values.time, memo: values.memo, date: getDate() }),
      onUpdate: (id, values) => healthMeasures.update(id, { type: values.type, text: values.text, timing: values.timing, time: values.time, memo: values.memo }),
      onRemove: (id) => healthMeasures.remove(id),
      afterChange: onChange,
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
      /* the last five of each kind, newest first — a plain list of what was written, no line, colour or verdict */
      after: () => {
        const kinds = MEASURE_TYPES.map((t) => ({ t, rows: healthMeasures.recent(t.id, 5) })).filter((k) => k.rows.length);
        if (!kinds.length) return null;
        return el('div', { class: 'og-measure-recent', 'data-og-measure-recent': 'true' },
          el('h4', { class: 'og-life-sub', text: '최근에 적은 수치' }),
          kinds.map(({ t, rows }) =>
            el('ul', { class: 'og-life-days', 'data-og-measure-kind': t.id, 'aria-label': `최근 ${t.label} 기록` },
              rows.map((m) => el('li', {}, el('span', { class: 'og-life-days__text', text: `${t.label} · ${formatDateKey(m.date)}${m.time ? ' ' + formatTime(m.time) : ''} · ${measureText(m)}` })))
            )
          )
        );
      },
      note: MEASURE_NOTE,
    },
  });
  list.render();
  return { card, render: list.reset, openAdd: list.openAdd };
}

/* ───────── 최근 건강 기록 ───────── */

/* the last seven days (never the whole year at once) plus a date field to open any kept day */
export function createHealthHistoryCard({ stores, now = () => Date.now(), getDate, onPick }) {
  const card = createCard({ area: 'life', slot: 'health-history', title: '최근 건강 기록', level: 3, lead: '날짜를 누르면 그날 기록이 위에 열려요. 지난 날은 고칠 수 있어요.' });

  function render() {
    const today = dateKey(now());
    const chosen = getDate();
    clear(card.body);
    card.body.append(
      el(
        'ul',
        { class: 'og-life-days og-life-days--pick', 'aria-label': '최근 7일 건강 기록' },
        Array.from({ length: 7 }, (_, i) => addDays(today, -i)).map((d) => {
          const parts = describeHealthDay(stores, d);
          const name = d === today ? `${formatDateKey(d)} (오늘)` : formatDateKey(d);
          return el(
            'li',
            { 'data-og-health-day': d },
            el('button', { type: 'button', class: 'og-life-days__pick', 'aria-pressed': d === chosen ? 'true' : 'false', 'aria-current': d === chosen ? 'date' : null, 'aria-label': `${name} 건강 기록 보기`, text: name, onclick: () => onPick(d) }),
            el('span', { class: 'og-life-days__text', text: parts.length ? parts.join(' · ') : '적은 내용 없음' })
          );
        })
      )
    );
    const oldest = addDays(today, -DAILY_BACK_DAYS);
    /* a year back reads the same month and day as today, so the year is said */
    const oldestText = `${oldest.slice(0, 4)}년 ${formatDateKey(oldest)}`;
    const field = makeField({ name: 'date', label: '다른 날짜 열기', type: 'date', required: false, hint: `${oldestText}부터 오늘까지` }, chosen);
    field.input.setAttribute('min', oldest);
    field.input.setAttribute('max', today);
    const error = el('p', { class: 'og-form-error', role: 'alert' });
    const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': '날짜로 건강 기록 열기' }, field.node, error, el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--ghost', 'data-og-health-open': 'date', text: '이 날짜 열기' })));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = field.get();
      if (!(value >= oldest && value <= today && /^\d{4}-\d{2}-\d{2}$/.test(value))) {
        field.input.setAttribute('aria-invalid', 'true');
        error.textContent = `${oldestText}부터 오늘 사이의 날짜를 골라 주세요.`;
        field.input.focus();
        return;
      }
      onPick(value);
    });
    card.body.append(form);
  }

  render();
  return { card, render };
}

/* ───────── the group ───────── */

export function createHealthGroup({ checkIn, symptoms, medication, healthNotes, healthMeasures = null, now = () => Date.now(), getDate, onPick }) {
  let parts = null;
  const refreshHistory = () => parts && parts.history.render();
  const refreshDay = () => {
    if (!parts) return;
    parts.medication.render();
    parts.history.render();
  };
  const shared = { now, getDate, onChange: refreshHistory };
  parts = {
    checkin: createHealthCheckInSection({ checkIn, ...shared }),
    symptoms: createSymptomsSection({ symptoms, ...shared }),
    medication: createMedicationDaySection({ medication, ...shared }),
    /* changing the plan changes which medications the day lists */
    plan: createMedicationPlanSection({ medication, onChange: refreshDay }),
    notes: createHealthNotesSection({ healthNotes, ...shared }),
    measures: healthMeasures ? createHealthMeasuresSection({ healthMeasures, ...shared }) : null,
    history: createHealthHistoryCard({ stores: { checkIn, symptoms, medication, healthNotes, healthMeasures }, now, getDate, onPick }),
  };
  const render = () => [parts.checkin, parts.symptoms, parts.medication, parts.plan, parts.notes, parts.measures, parts.history].filter(Boolean).forEach((p) => p.render());
  const intro = el('p', { class: 'og-notice og-health-intro', role: 'note', 'data-og-health-note': 'safety' }, el('strong', { text: HEALTH_SAFETY_NOTE }), ' 이 기기에만 저장되고 다른 사람에게 보내지 않습니다.');
  return { ...parts, intro, render };
}
