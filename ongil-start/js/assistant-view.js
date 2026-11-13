/*
 * ONGIL 도우미 panel (Phase 10) — a header panel like 통합검색 and 알림, opened and closed by panels.js.
 *
 * It is not a chat: a typed request is matched against what ONGIL can already do (assistant-intents.js), served by
 * one tool (assistant-tools.js) and shown as a result. No language model is connected and the panel says so.
 *
 *   request box · examples that really work · the last few requests with their results · 닫기
 *
 * A change (a calendar entry, a task) is only ever PREPARED here: the draft is shown with 확인 / 취소 and nothing is
 * saved until 확인 — once. Requests and results live in this module's memory for the visit; nothing is stored.
 * Everything is text (el() / textContent); a result can only link to a screen inside ONGIL.
 */
import { el, clear, announce } from './dom.js';
import { HISTORY_MAX } from './assistant-tools.js';
import { INPUT_MAX } from './assistant-intents.js';

export const ASSISTANT_INTRO = 'ONGIL에서 할 일을 찾아드려요. 정해진 요청만 알아듣고, 자유로운 대화는 아직 하지 않아요.';
export const STATUS_WORDS = Object.freeze({ SUCCESS: '', EMPTY: '없음', UNAVAILABLE: '할 수 없음', ERROR: '문제가 생김', NEEDS_CONFIRMATION: '확인 필요' });

const put = (node, ...kids) => node.append(...kids.flat().filter((k) => k !== null && k !== undefined && k !== false));

export function createAssistantView({ root, assistant, onNavigate = null, onEvent = null }) {
  const button = root.querySelector('[data-og-tool="assistant"]');
  const panel = root.querySelector('#og-panel-assistant');
  const form = panel.querySelector('[data-og-assistant-form]');
  const input = form.querySelector('input');
  const status = panel.querySelector('[data-og-assistant-status]');
  /* a visible line for what has no result of its own (nothing typed, an example put in the box) */
  const hint = panel.querySelector('[data-og-assistant-hint]');
  const host = panel.querySelector('[data-og-assistant]');
  const closeBtn = panel.querySelector('[data-og-assistant-close]');
  /* newest first; at most HISTORY_MAX — memory only */
  let entries = [];
  let busy = false;
  let serial = 0;

  /* observers (counting only) and navigation can never break the panel */
  const tell = (name, detail) => {
    if (typeof onEvent !== 'function') return;
    try {
      onEvent(name, detail);
    } catch {
      /* ignore */
    }
  };

  function suggestions() {
    return el(
      'div',
      { class: 'og-assist__examples', 'data-og-assistant-examples': 'true' },
      el('p', { class: 'og-panel__group', id: 'og-assistant-examples-title', text: '이렇게 해 볼 수 있어요' }),
      el(
        'ul',
        { class: 'og-assist__chips', 'aria-labelledby': 'og-assistant-examples-title' },
        assistant.suggestions.map((s) =>
          el('li', {}, el('button', { type: 'button', class: 'og-panel__btn', 'data-og-assistant-example': s.id, 'data-og-assistant-kind': s.kind, text: s.label, onclick: () => (s.kind === 'run' ? submit(s.text) : fill(s.text)) }))
        )
      )
    );
  }

  function pendingBlock(entry) {
    const p = entry.result.pending;
    const current = assistant.pending();
    const waiting = !!current && current.id === p.id && !entry.settled;
    const rows = el('ul', { class: 'og-assist__summary', 'aria-label': '추가할 내용' }, p.summary.map(([k, v]) => el('li', {}, el('span', { class: 'og-panel__result-desc', text: k }), el('span', { class: 'og-panel__result-title', text: v }))));
    if (!waiting) return [rows, el('p', { class: 'og-panel__note', 'data-og-assistant-stale': 'true', text: '이 요청은 더 기다리지 않아요. 필요하면 다시 요청해 주세요.' })];
    const settle = async (kind) => {
      /* one answer only: a second click or a repeated Enter does nothing */
      if (entry.settled) return;
      entry.settled = true;
      for (const b of host.querySelectorAll(`[data-og-assistant-pending="${p.id}"] button`)) b.disabled = true;
      let answer;
      try {
        answer = kind === 'confirm' ? await assistant.confirm(p.id) : assistant.cancel(p.id);
      } catch {
        answer = { toolId: p.toolId, result: { status: 'ERROR', title: '', message: '지금은 처리하지 못했어요. 잠시 뒤 다시 해 주세요.', items: [], route: '', routeLabel: '' } };
      }
      entry.result = answer.result;
      tell(kind === 'confirm' ? 'confirmed' : 'cancelled', { tool: p.toolId, status: answer.result.status });
      render();
      say(entry.result);
      focusEntry(entry);
    };
    return [
      rows,
      el(
        'div',
        { class: 'og-panel__actions', role: 'group', 'aria-label': '추가 확인', 'data-og-assistant-pending': p.id },
        el('button', { type: 'button', class: 'og-panel__btn og-assist__primary', 'data-og-assistant-confirm': p.id, text: '확인', onclick: () => settle('confirm') }),
        el('button', { type: 'button', class: 'og-panel__btn', 'data-og-assistant-cancel': p.id, text: '취소', onclick: () => settle('cancel') })
      ),
      el('p', { class: 'og-panel__note', text: '확인을 누르기 전에는 아무것도 저장하지 않아요.' }),
    ];
  }

  function entryNode(entry) {
    const r = entry.result;
    const word = STATUS_WORDS[r.status] || '';
    return el(
      'li',
      { class: 'og-assist__entry', 'data-og-assistant-entry': String(entry.id), 'data-og-assistant-result': r.status, 'data-og-assistant-intent': entry.intent },
      el('p', { class: 'og-panel__result-desc', 'data-og-assistant-asked': 'true', text: `요청: ${entry.text}` }),
      el('p', { class: 'og-panel__result-title', tabindex: '-1', 'data-og-assistant-title': 'true', text: [word, r.title].filter(Boolean).join(' · ') || '결과' }),
      r.message ? el('p', { class: 'og-panel__note', text: r.message }) : null,
      r.items.length
        ? el(
            'ul',
            { class: 'og-panel__list', 'aria-label': r.title || '결과' },
            r.items.map((it) => {
              const inner = [el('span', { class: 'og-panel__result-title', text: it.title }), it.detail ? el('span', { class: 'og-panel__result-desc', text: it.detail }) : null];
              return el('li', {}, it.route ? el('a', { href: it.route }, inner) : el('span', {}, inner));
            })
          )
        : null,
      r.more ? el('p', { class: 'og-panel__note', 'data-og-assistant-more': String(r.more), text: `이 밖에 ${r.more}개가 더 있어요.` }) : null,
      r.status === 'NEEDS_CONFIRMATION' && r.pending ? pendingBlock(entry) : null,
      r.route ? el('a', { class: 'og-panel__btn', href: r.route, 'data-og-assistant-open': 'true', text: r.routeLabel || '화면 열기' }) : null
    );
  }

  function render() {
    clear(host);
    const latest = entries[0];
    host.dataset.ogAssistantState = latest ? latest.result.status : 'EMPTY_PANEL';
    if (entries.length) put(host, el('ol', { class: 'og-assist__entries', 'aria-label': '요청과 결과' }, entries.map(entryNode)));
    /* examples: before the first request, and again whenever a request could not be served */
    if (!latest || latest.result.suggest || latest.result.status === 'ERROR') put(host, suggestions());
  }
  const say = (r) => announce(status, [STATUS_WORDS[r.status], r.title, r.message].filter(Boolean).join('. '));
  function focusEntry(entry) {
    const node = host.querySelector(`[data-og-assistant-entry="${entry.id}"] [data-og-assistant-title]`);
    if (node) node.focus();
  }
  function note(message) {
    if (hint) {
      hint.textContent = message;
      hint.hidden = !message;
    }
    if (message) announce(status, message);
  }
  function fill(text) {
    input.value = text;
    input.focus();
    note('예시를 적어 두었어요. 날짜와 내용을 바꾼 뒤 요청을 눌러 주세요.');
  }

  async function submit(text) {
    if (busy) return;
    busy = true;
    host.setAttribute('aria-busy', 'true');
    const shown = String(text || '').replace(/\s+/g, ' ').trim().slice(0, INPUT_MAX);
    let answer;
    try {
      answer = await assistant.handle(text);
    } catch {
      answer = { intent: 'UNSUPPORTED', toolId: '', reason: '', result: { status: 'ERROR', title: '', message: '지금은 처리하지 못했어요. 잠시 뒤 다시 해 주세요.', items: [], route: '', routeLabel: '' } };
    }
    busy = false;
    host.setAttribute('aria-busy', 'false');
    tell('intent', { intent: answer.intent, status: answer.result.status });
    if (!shown) {
      /* nothing was typed: say so, keep the list as it is */
      note(answer.result.message);
      input.focus();
      return;
    }
    serial += 1;
    const entry = { id: serial, text: shown, intent: answer.intent, result: answer.result, settled: false };
    entries = [entry, ...entries].slice(0, HISTORY_MAX);
    input.value = '';
    note('');
    render();
    say(entry.result);
    if (entry.result.navigate && entry.result.route && typeof onNavigate === 'function') {
      try {
        onNavigate(entry.result.route);
      } catch {
        /* the link in the result still works */
      }
      return;
    }
    focusEntry(entry);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submit(input.value);
  });
  /* panels.js has already toggled the panel when this runs */
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-expanded') !== 'true') return;
    render();
    tell('open');
  });
  if (closeBtn) closeBtn.addEventListener('click', () => button.click());

  render();
  return Object.freeze({ render, submit, entries: () => entries.length });
}
