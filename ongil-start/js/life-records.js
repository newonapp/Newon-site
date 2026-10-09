/*
 * My Life — 기록 group: 생활비 · 기록(일기) · 메모 (My Life V2). All three are PRIVATE (privacy.js): kept on this device only,
 * never synced, never shared with family, never offered to search or notifications.
 * 생활비 is a plain list with a monthly sum — no advice and no judgement of spending.
 */
import { el } from './dom.js';
import { formatDateTimeShort } from './life-today.js';
import { createCard } from './home-ui.js';
import { createListCard } from './home-list.js';
import { EXPENSE_CATEGORIES, JOURNAL_MOODS, JOURNAL_KINDS, LIFE_LIMITS } from './life-contracts.js';
import { formatWon } from './expenses.js';
import { dateKey, monthKey, formatMonth, shiftMonth, formatDateKey } from './dates.js';

const labelOf = (options, id) => (options.find((o) => o.id === id) || { label: '' }).label;
export const PRIVATE_NOTE = '이 기기에만 저장됩니다. 다른 사람에게 전달되지 않고, 검색에도 나오지 않습니다.';

/* ───────── 생활비 ───────── */

export function createExpensesSection({ expenses, now = () => Date.now(), onChange }) {
  const card = createCard({ area: 'life', slot: 'expenses', title: '생활비', level: 2 });
  let month = monthKey(dateKey(now()));
  const errors = { INVALID_AMOUNT: '금액은 1원에서 1억 원 사이 숫자로 적어 주세요.', INVALID_DATE: '날짜를 다시 골라 주세요.', INVALID_CATEGORY: '분류를 골라 주세요.', LIMIT: '기록이 너무 많습니다. 지난 기록을 지워 주세요.' };

  const move = (delta, focus) => {
    month = shiftMonth(month, delta);
    list.reset();
    card.say(`${formatMonth(month)}을 보고 있습니다.`);
    const target = card.body.querySelector(`[data-og-expense-nav="${focus}"]`);
    if (target) target.focus();
  };

  const list = createListCard({
    card,
    config: {
      itemName: '생활비',
      listLabel: () => `${formatMonth(month)} 생활비`,
      emptyText: () => `${formatMonth(month)}에 적은 생활비가 없어요.`,
      addLabel: '생활비 적기',
      checkable: false,
      afterChange: onChange,
      note: `${PRIVATE_NOTE} 쓴 돈을 평가하거나 조언하지 않습니다.`,
      before: () =>
        el(
          'div',
          { class: 'og-cal' },
          el(
            'div',
            { class: 'og-cal__nav' },
            el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-expense-nav': 'prev', text: '이전 달', onclick: () => move(-1, 'prev') }),
            el('p', { class: 'og-cal__month', text: formatMonth(month) }),
            el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-expense-nav': 'next', text: '다음 달', onclick: () => move(1, 'next') })
          ),
          el('p', { class: 'og-life-value', 'data-og-expense-total': String(expenses.monthTotal(month)), text: `합계 ${formatWon(expenses.monthTotal(month))} · ${expenses.countForMonth(month)}건` })
        ),
      fields: [
        { name: 'date', label: '날짜', type: 'date', required: true, initial: () => (month === monthKey(dateKey(now())) ? dateKey(now()) : `${month}-01`), errors: ['INVALID_DATE'] },
        { name: 'category', label: '분류', type: 'select', required: true, options: EXPENSE_CATEGORIES, initial: 'food', errors: ['INVALID_CATEGORY'] },
        { name: 'amount', label: '금액 (원)', type: 'amount', required: true, hint: '숫자만 적어 주세요. 예: 12000', errors: ['INVALID_AMOUNT'] },
        { name: 'memo', label: '메모', type: 'text', required: false, maxlength: LIFE_LIMITS.memo },
      ],
      getItems: () => expenses.listForMonth(month),
      describe: (item) => ({ title: `${labelOf(EXPENSE_CATEGORIES, item.category)} ${formatWon(item.amount)}`, meta: [formatDateKey(item.date)], text: item.memo }),
      onAdd: (values) => expenses.add(values),
      onUpdate: (id, values) => expenses.update(id, values),
      onRemove: (id) => expenses.remove(id),
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
    },
  });
  list.render();
  return { card, render: list.reset, month: () => month };
}

/* ───────── 기록 (일기) ───────── */

export const JOURNAL_PAGE = 20;

export function createJournalSection({ journal, now = () => Date.now(), onChange }) {
  const card = createCard({ area: 'life', slot: 'journal', title: '기록', level: 2, lead: '하루를 글로 남겨 보세요. 오늘 한 일, 다녀온 곳, 만난 사람, 기억하고 싶은 일 무엇이든 좋아요.' });
  const errors = { INVALID_TEXT: '남길 글을 적어 주세요.', INVALID_DATE: '날짜를 다시 골라 주세요.', LIMIT: '기록이 가득 찼습니다. 지난 기록을 지워 주세요.', STORAGE_UNAVAILABLE: '저장 공간이 부족합니다. 지난 기록을 지워 주세요.' };
  const list = createListCard({
    card,
    config: {
      itemName: '기록',
      listLabel: '내 기록',
      emptyText: '아직 남긴 기록이 없어요.',
      addLabel: '기록 남기기',
      checkable: false,
      afterChange: onChange,
      fields: [
        { name: 'date', label: '날짜', type: 'date', required: true, initial: () => dateKey(now()), errors: ['INVALID_DATE'] },
        /* My Life V2: what kind of record — optional, the person's own choice */
        { name: 'kind', label: '어떤 기록', type: 'select', required: false, options: JOURNAL_KINDS },
        { name: 'mood', label: '오늘 기분', type: 'select', required: false, options: JOURNAL_MOODS },
        { name: 'text', label: '글', type: 'textarea', required: true, maxlength: LIFE_LIMITS.journalText, hint: `${LIFE_LIMITS.journalText}자까지 쓸 수 있습니다.`, errors: ['INVALID_TEXT'] },
      ],
      /* Product Completion Audit V1: every entry can be reached (the list card pages with 더 보기) — an entry that cannot
         be seen cannot be changed or deleted either */
      getItems: () => journal.recent(LIFE_LIMITS.journalEntries),
      describe: (item) => ({ title: formatDateKey(item.date), meta: [labelOf(JOURNAL_KINDS, item.kind), labelOf(JOURNAL_MOODS, item.mood)].filter(Boolean), text: item.text }),
      onAdd: (values) => journal.add(values),
      onUpdate: (id, values) => journal.update(id, values),
      onRemove: (id) => journal.remove(id),
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
    },
  });
  list.render();
  card.body.after(el('p', { class: 'og-home-note og-private-note', text: PRIVATE_NOTE }));
  return { card, render: list.reset };
}

/* ───────── 메모 (My Life V2) ───────── */

/*
 * The person's own undated notes. PRIVATE like 기록: this device only, never in the global search, never shared with
 * family, never given to the assistant. 메모에서 찾기 looks through the notes on this device only; the words typed there
 * are not stored, not put in the address and not counted.
 */
export function createMemosSection({ memos, onChange }) {
  const card = createCard({ area: 'life', slot: 'memos', title: '메모', level: 2, lead: '기억해 둘 것을 적어 두세요. 날짜 없이 남겨 두는 메모예요.' });
  const errors = { INVALID_TEXT: '메모를 적어 주세요.', LIMIT: '메모가 가득 찼습니다. 지난 메모를 지워 주세요.', STORAGE_UNAVAILABLE: '저장 공간이 부족합니다. 지난 메모를 지워 주세요.' };
  let query = '';
  const PIN_OPTIONS = [{ id: 'no', label: '아니요' }, { id: 'yes', label: '예, 맨 위에 두기' }];
  const toValues = (v) => ({ text: v.text, pinned: v.pinned === 'yes' });
  const searchId = `og-memo-search-${card.titleId}`;
  const searchInput = el('input', { class: 'og-input', id: searchId, type: 'search', autocomplete: 'off', maxlength: '40', 'data-og-memo-search': '' });
  searchInput.addEventListener('input', () => {
    query = searchInput.value;
    list.render();
    /* the list redraws under the box: keep typing where the person was */
    searchInput.focus();
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    const n = memos.filter(query).length;
    card.say(query.trim() ? `메모 ${n}개를 찾았습니다.` : '모든 메모를 보여 드립니다.');
  });
  const searchBox = el('div', { class: 'og-field og-memo-search' }, el('label', { class: 'og-field__label', for: searchId, text: '메모에서 찾기' }), searchInput, el('p', { class: 'og-field__hint', text: '이 기기의 메모 안에서만 찾아요.' }));
  const list = createListCard({
    card,
    config: {
      itemName: '메모',
      listLabel: () => (query.trim() ? '찾은 메모' : '내 메모'),
      emptyText: () => (memos.count() === 0 ? '아직 적어 둔 메모가 없어요.' : '찾는 말이 들어간 메모가 없어요.'),
      addLabel: '메모 적기',
      checkable: false,
      afterChange: onChange,
      before: () => {
        searchBox.hidden = memos.count() === 0;
        return searchBox;
      },
      fields: [
        { name: 'text', label: '메모', type: 'textarea', required: true, maxlength: LIFE_LIMITS.memoText, hint: `${LIFE_LIMITS.memoText}자까지 쓸 수 있습니다.`, errors: ['INVALID_TEXT'] },
        { name: 'pinned', label: '맨 위에 둘까요?', type: 'select', required: true, options: PIN_OPTIONS, initial: 'no', read: (item) => (item.pinned ? 'yes' : 'no') },
      ],
      /* every memo can be reached (the list card pages with 더 보기) */
      getItems: () => memos.filter(query),
      describe: (item) => ({ title: item.text.split('\n')[0].slice(0, 40), meta: [item.pinned ? '맨 위에 둔 메모' : '', `고친 때 ${formatDateTimeShort(item.updatedAt)}`].filter(Boolean), text: item.text.includes('\n') || item.text.length > 40 ? item.text : '' }),
      onAdd: (values) => memos.add(toValues(values)),
      onUpdate: (id, values) => memos.update(id, toValues(values)),
      onRemove: (id) => memos.remove(id),
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
    },
  });
  list.render();
  card.body.after(el('p', { class: 'og-home-note og-private-note', text: `${PRIVATE_NOTE} 가족, 커뮤니티, ONGIL 도우미도 읽지 않아요.` }));
  return { card, render: () => { list.reset(); }, openAdd: list.openAdd };
}
