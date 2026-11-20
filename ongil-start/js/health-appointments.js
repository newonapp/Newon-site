/*
 * 건강·안부 › 병원 일정 · 건강검진 (Completion V2).
 *
 * Both lists read and write the ONE CalendarEvent store (schedule.js) — an event with kind MEDICAL_APPOINTMENT or
 * HEALTH_SCREENING. There is no second schedule: what is added here is on 내 생활 › 캘린더 on the same day, and a
 * change or delete made there is what this screen shows the next time it is drawn (it is drawn every time 건강·안부
 * is opened).
 *
 * ONGIL keeps the date only. It does not book, confirm, judge a result, give advice or say anything is normal or
 * not — the copy says so. These records stay on this device: no search provider, family share, community, index
 * or analytics content reads them.
 */
import { el, clear } from './dom.js';
import { createCard } from './home-ui.js';
import { createListCard } from './home-list.js';
import { LIFE_LIMITS } from './life-contracts.js';
import { dateKey, formatTime, formatDateKey } from './dates.js';

export const HEALTH_SCHEDULE_NOTE = 'ONGIL은 날짜와 메모만 적어 둡니다. 예약을 대신하거나 확정하지 않고, 검진 결과를 판단하거나 의료 조언을 하지 않습니다.';

const KINDS = Object.freeze({
  MEDICAL_APPOINTMENT: Object.freeze({
    slot: 'hospital-list',
    title: '병원 일정',
    lead: '진료 날짜와 병원을 적어 두면 내 생활 캘린더에도 같은 일정으로 보입니다.',
    itemName: '병원 일정',
    addLabel: '병원 일정 추가',
    fields: () => [
      { name: 'title', label: '병원 이름', type: 'text', required: true, maxlength: LIFE_LIMITS.eventTitle, errors: ['INVALID_TITLE'], hint: '예: 동네 내과의원' },
      null,
      { name: 'memo', label: '진료 목적·메모', type: 'textarea', required: false, maxlength: LIFE_LIMITS.eventMemo, hint: `${LIFE_LIMITS.eventMemo}자까지. 예: 정기 진료, 챙겨 갈 것` },
    ],
  }),
  HEALTH_SCREENING: Object.freeze({
    slot: 'checkup-list',
    title: '건강검진',
    lead: '검진 날짜와 기관을 적어 두면 내 생활 캘린더에도 같은 일정으로 보입니다.',
    itemName: '검진 일정',
    addLabel: '검진 일정 추가',
    fields: () => [
      { name: 'title', label: '검진 기관', type: 'text', required: true, maxlength: LIFE_LIMITS.eventTitle, errors: ['INVALID_TITLE'], hint: '예: ○○건강검진센터' },
      { name: 'screeningType', label: '검진 종류', type: 'text', required: false, maxlength: LIFE_LIMITS.screeningType, hint: '예: 국가건강검진, 위내시경' },
      { name: 'memo', label: '준비 메모', type: 'textarea', required: false, maxlength: LIFE_LIMITS.eventMemo, hint: `${LIFE_LIMITS.eventMemo}자까지. 예: 전날 저녁 9시부터 금식 안내를 받음` },
    ],
  }),
});

const ERRORS = { INVALID_TITLE: '이름을 적어 주세요.', INVALID_DATE: '날짜를 다시 골라 주세요.', INVALID_TIME: '시간을 다시 골라 주세요.', LIMIT: '일정이 너무 많습니다. 지난 일정을 지워 주세요.' };

function createKindCard({ schedule, kind, now }) {
  const k = KINDS[kind];
  const card = createCard({ area: 'health', slot: k.slot, title: k.title, level: 2, lead: k.lead });
  const today = () => dateKey(now());
  const [nameField, extraField, memoField] = k.fields();
  const fields = [
    nameField,
    extraField,
    { name: 'date', label: '날짜', type: 'date', required: true, initial: today, errors: ['INVALID_DATE'] },
    { name: 'time', label: '시간', type: 'time', required: false, errors: ['INVALID_TIME'] },
    memoField,
  ].filter(Boolean);
  const pick = (values) => {
    const out = { title: values.title, date: values.date, time: values.time, memo: values.memo };
    if (kind === 'HEALTH_SCREENING') out.screeningType = values.screeningType;
    return out;
  };
  const list = createListCard({
    card,
    config: {
      itemName: k.itemName,
      listLabel: `다가오는 ${k.title}`,
      emptyText: kind === 'MEDICAL_APPOINTMENT' ? '다가오는 병원 일정이 없어요.' : '다가오는 검진 일정이 없어요.',
      addLabel: k.addLabel,
      checkable: false,
      fields,
      getItems: () => schedule.listUpcoming(kind, today()),
      /* 일정 상세: date · time · (검진 종류) on one line, the memo under it */
      describe: (item) => ({
        title: item.title,
        meta: [item.date === today() ? `${formatDateKey(item.date)} (오늘)` : formatDateKey(item.date), item.time ? formatTime(item.time) : '시간 없음', item.screeningType || ''].filter(Boolean),
        text: item.memo || '',
      }),
      onAdd: (values) => schedule.add({ kind, ...pick(values) }),
      onUpdate: (id, values) => schedule.update(id, pick(values)),
      onRemove: (id) => schedule.remove(id),
      errorText: (reason) => ERRORS[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
      after: () => {
        const past = schedule.countPast(kind, today());
        return el(
          'p',
          { class: 'og-home-more' },
          past ? el('span', { class: 'og-home-note', 'data-og-health-past': String(past), text: `지난 ${k.title} ${past}개는 캘린더에서 볼 수 있어요. ` }) : null,
          el('a', { class: 'og-home-more__link', href: '#life/calendar', text: '내 생활 캘린더에서 보기' })
        );
      },
    },
  });
  list.render();
  return { card, render: list.reset };
}

export function createHealthSchedule({ host, schedule, now = () => Date.now() }) {
  const hospital = createKindCard({ schedule, kind: 'MEDICAL_APPOINTMENT', now });
  const screening = createKindCard({ schedule, kind: 'HEALTH_SCREENING', now });
  if (host) {
    clear(host);
    host.append(
      el(
        'div',
        { class: 'og-health-schedule', 'data-og-health-schedule': '' },
        el('p', { class: 'og-notice', role: 'note', 'data-og-health-schedule-note': '' }, HEALTH_SCHEDULE_NOTE),
        hospital.card.root,
        screening.card.root
      )
    );
  }
  return Object.freeze({
    render: () => {
      hospital.render();
      screening.render();
    },
    cards: Object.freeze({ hospital: hospital.card, screening: screening.card }),
  });
}
