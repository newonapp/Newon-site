/**
 * Business Contact page kit — the ONGIL Contact page (render-ongil-site.mjs contactMain) as a shared component for
 * LIVON · SHAREON · BABYLOG · PETLOG · MY WORLD (owner, 2026-10-26: "6개 사업 각각 … 문의 누르면 보이는 화면 기능이랑
 * 디자인 ONGIL 문의 화면처럼 해 줘"). Same section order, same component types, same markup and CSS (derived from
 * ongil-site.css by build-biz-contact-css.mjs → /biz-contact.css), each in its own brand colour (data-bct-biz).
 *
 * Section order (ONGIL): channels → route ("where to go first") → inquiry types grouped by audience as rows →
 * what happens next (steps) → before you get in touch (checklist + callouts) → FAQ → black closing band.
 * A section is rendered only when the business has that content (nothing is invented).
 *
 * Every inquiry action is ONE "문의하기" / "Contact us" button to the unified page
 * /{lang}/contact/?platform=<biz>&type=<type>&source=<biz>-contact (see unified-contact-links.mjs).
 * The e-mail address stays only as a text address in the channels panel.
 *
 * The markup is written with ONGIL's class names and renamed on output (ogs-* → bct-*, nls-* → bctn-*), exactly
 * like the CSS, so the two never drift apart.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { cicon as icon, contactMock, typeJump, typeIcon, groupIcon } from "./biz-contact-v4.mjs";
import { unifiedContactHref } from "./unified-contact-links.mjs";

const e = (s) => escapeHtml(s == null ? "" : String(s));
const nl = (s) => e(s).replace(/\n/g, "<br>");
const enAttr = (t) => (/^[\x20-\x7E·–—→↓]+$/.test(t || "") ? ' lang="en"' : "");

/** "문의하기" / "Contact us" — the single inquiry label (owner, 2026-10-26). */
export const CONTACT_CTA = { ko: "문의하기", en: "Contact us" };
/** Hero scroll button to the inquiry types (same wording as ONGIL's contact hero). */
export const SEE_TYPES = { ko: "문의 유형 보기 ↓", en: "See inquiry types ↓" };
export const ctaLabel = (contentLang) => (contentLang === "ko" ? CONTACT_CTA.ko : CONTACT_CTA.en);

/** id of the inquiry-types section (hero "see types" buttons scroll here). */
export const TYPES_ID = "bct-types";

function sec(id, inner, { tone = "", cls = "" } = {}) {
  const t =
    tone === "tint" ? " nls-block--band ogs-band ogs-tint" : tone === "ink" ? " nls-block--ink ogs-band ogs-ink" : "";
  return `<section id="${id}" class="nls-block ogs-sec${t}${cls ? " " + cls : ""}" data-hs-section aria-labelledby="${id}-t">
    ${inner}
  </section>`;
}
function head(id, kicker, title, lead, { split = false } = {}) {
  return `<header class="ogs-head${split ? " ogs-head--split" : ""}">
      <div class="ogs-head__main">
        ${kicker ? `<p class="ogs-eyebrow"${enAttr(kicker)}>${e(kicker)}</p>` : ""}
        <h2 class="ogs-h2" id="${id}-t">${nl(title)}</h2>
      </div>
      ${lead ? `<p class="ogs-lead">${e(lead)}</p>` : ""}
    </header>`;
}
const tile = (name, mod = "") => `<span class="ogs-tile${mod ? " ogs-tile--" + mod : ""}">${icon(name)}</span>`;
const mark = (name) => `<span class="ogs-mark">${icon(name)}</span>`;
const ticks = (items) => `<ul class="ogs-ticks">${(items || []).map((t) => `<li>${mark("check")}<span>${e(t)}</span></li>`).join("")}</ul>`;

/** ONGIL class names → kit class names (class attributes only). */
function renameClasses(html) {
  return html.replace(/\bclass="([^"]*)"/g, (m, cls) =>
    `class="${cls
      .split(/\s+/)
      .filter(Boolean)
      .map((c) => c.replace(/^ogs-/, "bct-").replace(/^nls__/, "bctn__").replace(/^nls-/, "bctn-"))
      .join(" ")}"`
  );
}

/**
 * @param {object} m  contact model (see the five adapters in biz-contact-data.mjs)
 *   m.biz, m.lang (page language), m.contentLang (ko | en), m.cta (label)
 *   m.channels { kicker, title, items: [{ k, v, href, text, icon, ask?: type }] }
 *   m.route?   { kicker, title, lead, items: [{ t, text, where?, ask?: type, alert? }] }
 *   m.types    { kicker, title, lead, groups: [{ title, en?, lead?, notes?: [], rows: [{ n?, name, text, ask, topic? }] }], notice? }
 *              (topic: a CONTACT_TOPICS id from contact-taxonomy.mjs; partnership rows get "<biz>-partnership")
 *   m.after?   { kicker, title, steps: [{ n, name, text }] }
 *   m.guard?   { kicker, title, checklistTitle?, checklist?: [{ g, items }], callouts: [{ icon, text, alert? }], noteHtml? }
 *   m.faq?     { kicker, title, items: [{ q, a, aHtml? }] }
 *   m.close    { kicker, titleHtml, lead, note? }
 */
export function renderBizContact(m) {
  const go = (type, topic = "") => unifiedContactHref(m.lang, m.biz, { type, topic, source: `${m.biz}-contact` });
  const cta = m.cta || ctaLabel(m.contentLang);
  const out = [];

  // A · channel panels (first panel on the brand wash, like ONGIL's e-mail panel)
  const ch = m.channels;
  out.push(
    sec(
      "bct-channels",
      `${head("bct-channels", ch.kicker || "Channels", ch.title, ch.lead || "")}
      <div class="ogs-chx">
      <ul class="ogs-channels" data-n="${ch.items.length}">${ch.items
        .map((it) => {
          const href = it.ask ? go(it.ask) : it.href;
          const ext = /^https?:/.test(href || "") ? ' target="_blank" rel="noopener noreferrer"' : "";
          const v = it.ask ? `${cta} →` : it.v;
          return `<li>${tile(it.icon || (it.ask ? "form" : "mail"), "lg")}<p class="ogs-channels__k">${e(it.k)}</p>${
            href ? `<a class="ogs-channels__v" href="${e(href)}"${ext}>${e(v)}</a>` : `<p class="ogs-channels__v">${e(v)}</p>`
          }${it.text ? `<p class="ogs-channels__t">${e(it.text)}</p>` : ""}</li>`;
        })
        .join("")}</ul>
      ${contactMock(m.lang, m.contentLang, m.biz)}
      </div>`
    )
  );

  // A2 · where to go first / by purpose
  if (m.route && m.route.items && m.route.items.length) {
    const rt = m.route;
    // purposes that each open the unified page → icon cards (mobile: snap rail); "need → row" choosers stay rows
    const cards = rt.items.filter((it) => it.ask).length >= rt.items.length - 1;
    out.push(
      sec(
        "bct-route",
        `${head("bct-route", rt.kicker, rt.title, rt.lead, { split: true })}
      <ul class="ogs-routes${cards ? ` ogs-routes--cards" tabindex="0" aria-label="${e(rt.title)}` : ""}">${rt.items
        .map((it) => {
          const ic = cards ? tile(it.alert ? "alert" : it.ask ? typeIcon(m.biz, it.ask) : "info") : "";
          const right = it.ask
            ? `<p class="ogs-routes__w ogs-routes__go"><a href="${e(go(it.ask, it.topic))}" aria-label="${e(`${cta} — ${it.t}`)}">${e(cta)} →</a></p>`
            : it.whereHref
              ? `<p class="ogs-routes__w ogs-routes__go"><a href="${e(it.whereHref)}">${e(it.where)}</a></p>`
              : it.where
                ? `<p class="ogs-routes__w">${e(it.where)}</p>`
                : "";
          return `<li${it.alert ? ' class="ogs-routes__alert"' : ""}>${ic}<div><h3>${e(it.t)}</h3>${it.text ? `<p>${e(it.text)}</p>` : ""}</div>${right}</li>`;
        })
        .join("")}</ul>
      ${rt.note ? `<p class="nls-note ogs-note ogs-notice">${e(rt.note)}</p>` : ""}`
      )
    );
  }

  // B · inquiry types grouped by audience; each a row with one "문의하기" action
  const ty = m.types;
  let n = 0;
  const groups = ty.groups
    .map(
      (g, gi) => `<div class="ogs-tgroup" id="bct-g-${gi + 1}">
        <div class="ogs-tgroup__h">${tile(groupIcon(m.biz, gi))}<p class="ogs-tgroup__t">${e(g.title)}</p>${g.en ? `<p class="ogs-tgroup__en" lang="en">${e(g.en)}</p>` : ""}${
          g.lead ? `<p class="ogs-tgroup__lead">${e(g.lead)}</p>` : ""
        }${g.notes && g.notes.length ? `<div class="ogs-tgroup__notes">${g.notes.map((t) => `<p>${e(t)}</p>`).join("")}</div>` : ""}</div>
        <ol class="ogs-tlist${g.rows.length >= 4 && g.rows.every((r) => !r.n && (r.text || "").length <= 48) ? " ogs-tlist--grid" : ""}">${g.rows
          .map((r) => {
            n++;
            return `<li id="bct-c-${String(n).padStart(2, "0")}">
          <div class="ogs-tlist__x"><h3>${r.n ? `<span class="ogs-tlist__n">${e(r.n)}</span>` : ""}${e(r.name)}</h3>${r.text ? `<p>${e(r.text)}</p>` : ""}</div>
          <a class="ogs-tlist__go" href="${e(go(r.ask, r.topic))}" aria-label="${e(`${cta} — ${r.name}`)}"><span>${e(cta)} →</span></a>
        </li>`;
          })
          .join("")}</ol>
      </div>`
    )
    .join("\n");
  out.push(
    sec(
      TYPES_ID,
      `${head(TYPES_ID, ty.kicker, ty.title, ty.lead, { split: true })}
      ${typeJump(m.biz, "bct-g", ty.title.replace(/\n/g, " "), ty.groups.map((g) => ({ title: g.title, count: g.rows.length })))}
      ${groups}
      ${ty.notice ? `<p class="nls-note ogs-note ogs-notice">${e(ty.notice)}</p>` : ""}`,
      { tone: "tint" }
    )
  );

  // B2 · what happens next
  if (m.after && m.after.steps && m.after.steps.length) {
    const af = m.after;
    const icons = ["mail", "clipboard", "check", "chat"];
    const k = Math.min(Math.max(af.steps.length, 3), 4);
    out.push(
      sec(
        "bct-after",
        `${head("bct-after", af.kicker, af.title, af.lead || "", { split: true })}<ol class="ogs-steps ogs-steps--${k}">${af.steps
          .map(
            (s, i) =>
              `<li><div class="ogs-steps__top"><span class="ogs-steps__n">${e(s.n || String(i + 1).padStart(2, "0"))}</span>${mark(icons[i % icons.length])}</div><h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`
          )
          .join("")}</ol>`
      )
    );
  }

  // C · before you get in touch: checklist + callouts (alerts in red)
  if (m.guard) {
    const gd = m.guard;
    out.push(
      sec(
        "bct-guard",
        `${head("bct-guard", gd.kicker || "Privacy & Safety", gd.title, gd.lead || "", { split: true })}
      ${gd.checklist && gd.checklist.length ? `${gd.checklistTitle ? `<p class="ogs-dir__title">${e(gd.checklistTitle)}</p>` : ""}<ul class="ogs-cl${gd.checklist.length >= 4 && gd.checklist.filter((g) => (g.items || []).length === 1).length >= gd.checklist.length * 0.75 ? " ogs-cl--rows" : ""}">${gd.checklist.map((g) => `<li><h3>${e(g.g)}</h3>${ticks(g.items)}</li>`).join("")}</ul>` : ""}
      ${gd.callouts && gd.callouts.length ? `<ul class="ogs-guard${gd.callouts.length >= 5 ? " ogs-guard--list" : ""}" data-n="${gd.callouts.length}">${(gd.callouts.length >= 5 ? [...gd.callouts.filter((c) => !c.alert), ...gd.callouts.filter((c) => c.alert)] : gd.callouts)
        .map((c) => `<li${c.alert ? ' class="ogs-guard__alert"' : ""}>${tile(c.alert ? "alert" : c.icon || "info", "lg")}<p>${c.alert ? `<strong>${e(c.text)}</strong>` : e(c.text)}${c.linkHtml ? ` ${c.linkHtml}` : ""}</p></li>`)
        .join("")}</ul>` : ""}
      ${gd.noteHtml ? `<p class="nls-note ogs-note">${gd.noteHtml}</p>` : ""}`
      )
    );
  }

  // C2 · FAQ (two-column accordion)
  if (m.faq && m.faq.items && m.faq.items.length) {
    const fq = m.faq;
    out.push(
      sec(
        "bct-faq",
        `${head("bct-faq", fq.kicker || "FAQ", fq.title, "")}<div class="ogs-faq ogs-faq--2">${fq.items
          .map((f) => `<details><summary>${e(f.q)}</summary><p>${f.aHtml || e(f.a)}</p></details>`)
          .join("")}</div>`,
        { cls: "ogs-sec--rule" }
      )
    );
  }

  // D · black closing band with the one inquiry action
  const cl = m.close;
  out.push(
    sec(
      "bct-close",
      `<div class="ogs-close">
      ${cl.kicker ? `<p class="ogs-eyebrow"${enAttr(cl.kicker)}>${e(cl.kicker)}</p>` : ""}
      <h2 class="ogs-close__title" id="bct-close-t">${cl.titleHtml}</h2>
      ${cl.lead ? `<p class="ogs-close__lead">${e(cl.lead)}</p>` : ""}
      ${cl.note ? `<p class="ogs-close__lead">${e(cl.note)}</p>` : ""}
      <div class="ogs-actions"><a class="nls-btn ogs-btn--accent" href="${e(go(cl.ask || "personal"))}">${e(cta)} →</a></div>
    </div>`,
      { tone: "ink" }
    )
  );

  const langAttr = m.contentLang && m.contentLang !== m.lang ? ` lang="${e(m.contentLang)}"` : "";
  return renameClasses(`<div id="bct-contact" class="bct" data-bct-biz="${e(m.biz)}"${langAttr}>
  <div class="nls__wrap">
  ${out.join("\n")}
  </div>
</div>`);
}

/** <link> for the kit stylesheet (add to the business's Contact page head). */
export const BIZ_CONTACT_CSS = "/biz-contact.css?v=20261026v4";
