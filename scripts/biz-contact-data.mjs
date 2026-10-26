/**
 * Contact-page models for the ONGIL-style Contact kit (biz-contact-kit.mjs), one adapter per business.
 * Each adapter only RE-GROUPS the business's existing Contact copy into the ONGIL structure — no new inquiry types
 * and no new facts. `ask` = the unified page's primary type that fits the inquiry row
 * (personal · business · public · partnership · investment · media, scripts/contact-page-copy.mjs).
 *
 * Content language: KO pages use the Korean copy; every other locale uses the business's English copy (the same
 * fallback each business site already uses).
 */
import { siteCopy, CONTACT_GROUPS, CONTACT_TYPES } from "./livon-site-data.mjs";
import { c30 as livonC30, v3 as livonV3 } from "./livon-site-content30.mjs";
import { getShareonCopy } from "./shareon-copy.mjs";
import { getBabylogCopy, copyLangFor as babylogLang, BL_SLUG } from "./babylog-site-copy.mjs";
import { CONTACT as PL_CONTACT, V3 as PL_V3, OVERVIEW as PL_OVERVIEW, STORE as PL_STORE } from "./petlog-site-content.mjs";
import { getMyWorldSiteCopy } from "./myworld-site-copy.mjs";
import { escapeHtml } from "./hub-utils.mjs";
import { ctaLabel } from "./biz-contact-kit.mjs";

const e = (s) => escapeHtml(s == null ? "" : String(s));
const MAIL = "newon@newon.app";
const koOrEn = (lang) => (lang === "ko" ? "ko" : "en");

/* ─────────────────────────── LIVON ─────────────────────────── */
const LIVON_TYPE = { support: "personal", other: "media", partnership: "partnership", business: "business" };
const LIVON_ROW_TYPE = (y) => (/공공기관|Public bodies/.test(y.ko + y.en) ? "public" : LIVON_TYPE[y.type] || "personal");
const LIVON_PURPOSE = { personal: "personal", feature: "personal", welfare: "business", service: "business", public: "public", tech: "partnership", media: "media", invest: "investment" };

export function livonContactModel(lang) {
  const L = koOrEn(lang);
  const c = siteCopy(L);
  const k = c.contact;
  const x = livonC30(L).contact;
  const y = livonV3(L);
  const ch = y.channels;
  const chItem = (id) => ch.items.find(([i]) => i === id) || [];
  const [, unifiedT, unifiedB] = chItem("unified");
  const [, mailT, mailB] = chItem("mail");
  const [, noneT, noneB] = chItem("none");
  return {
    biz: "livon",
    lang,
    contentLang: L,
    cta: ctaLabel(L),
    channels: {
      kicker: ch.kicker,
      title: ch.title,
      items: [
        { k: mailT, v: MAIL, href: `mailto:${MAIL}`, text: mailB, icon: "mail" },
        { k: unifiedT, ask: "personal", text: unifiedB, icon: "form" },
      ],
    },
    route: {
      kicker: x.purposeKicker,
      title: x.purposeTitle,
      lead: x.purposeLead,
      items: [
        ...x.items.map(([id, t, what]) => ({ t, text: what, ask: LIVON_PURPOSE[id] })),
        ...(noneT ? [{ t: noneT, text: noneB, where: L === "ko" ? "공식 기관 · SHAREON" : "Official bodies · SHAREON" }] : []),
      ],
    },
    types: {
      kicker: k.kicker,
      title: k.title,
      lead: "",
      groups: Object.entries(CONTACT_GROUPS).map(([gid, g]) => ({
        title: L === "ko" ? g.ko : g.en,
        en: L === "ko" ? g.en : "",
        rows: CONTACT_TYPES.filter((t) => t.g === gid).map((t) => {
          const label = L === "ko" ? t.ko : t.en;
          return { name: label, text: `${k.subjectLabel} · [LIVON] ${label}`, ask: LIVON_ROW_TYPE(t) };
        }),
      })),
    },
    guard: {
      kicker: "Before you write",
      title: k.tipsTitle,
      checklistTitle: x.f.include,
      checklist: [{ g: L === "ko" ? "모든 문의" : "Every inquiry", items: k.tips }, ...x.items.map(([, t, , include]) => ({ g: t, items: [include] }))],
      callouts: [
        { icon: "lock", text: x.privacy },
        ...(k.note ? [{ icon: "info", text: k.note }] : []),
      ],
    },
    faq: { kicker: y.cFaq.kicker, title: y.cFaq.title, items: y.cFaq.items.map(([q, a]) => ({ q, a })) },
    close: { kicker: "Contact", titleHtml: e(k.heroTitle).replace(/\n/g, "<br>"), lead: "", note: c.appStatus },
  };
}

/* ─────────────────────────── SHAREON ─────────────────────────── */
/** Rows with a clearly matching unified-page topic (contact-taxonomy.mjs). */
const SHAREON_TOPIC = { "04": "shareon-business" };
const SHAREON_TYPE = { "01": "personal", "02": "personal", "03": "personal", "04": "business", "05": "business", "06": "business", "07": "partnership", "08": "public", "09": "partnership", "10": "media", "11": "investment" };

export function shareonContactModel(lang) {
  const c = getShareonCopy(lang);
  const L = c.contentLang;
  const k = c.contact;
  const byN = Object.fromEntries(k.items.map((it) => [it.n, it]));
  const ch = k.channels || {};
  return {
    biz: "shareon",
    lang,
    contentLang: L,
    cta: ctaLabel(L),
    channels: {
      kicker: "Channels",
      title: ch.title,
      items: [
        { k: ch.mailK, v: MAIL, href: `mailto:${MAIL}`, text: ch.mailText, icon: "mail" },
        { k: ch.formK, ask: "personal", text: ch.formText, icon: "form" },
      ],
    },
    route: {
      kicker: k.chooser.kicker,
      title: k.chooser.title,
      lead: k.chooser.lead,
      items: k.chooser.rows.map((r) => ({ t: r.need, text: "", where: `${r.n} ${byN[r.n].title}`, whereHref: `#bct-c-${r.n}` })),
    },
    types: {
      kicker: k.kicker,
      title: k.title,
      lead: k.lead,
      groups: Object.keys(k.groups).map((gid) => ({
        title: k.groups[gid],
        rows: k.items.filter((it) => it.g === gid).map((it) => ({ n: it.n, name: it.title, text: it.body, ask: SHAREON_TYPE[it.n], topic: SHAREON_TOPIC[it.n] })),
      })),
    },
    after: { kicker: k.steps.kicker, title: k.steps.title, steps: k.steps.items.map((s) => ({ n: s.n, name: s.title, text: s.body })) },
    guard: {
      kicker: k.guide.kicker,
      title: k.guide.title,
      checklistTitle: k.answer.title.replace(/\n/g, " "),
      checklist: [
        { g: k.answer.doTitle, items: k.answer.do },
        { g: k.answer.dontTitle, items: k.answer.dont },
      ],
      callouts: k.guide.items.map((t, i) => ({ icon: i < 3 ? "lock" : "info", text: t })),
      noteHtml: `<a href="/${e(lang)}/privacy/">${e(k.guide.privacy)} →</a>`,
    },
    close: { kicker: "NEWON · SHAREON", titleHtml: e(k.hero.title).replace(/\n/g, "<br>"), lead: k.hero.lead },
  };
}

/* ─────────────────────────── BABYLOG ─────────────────────────── */
const BABYLOG_TYPE = {
  general: "personal", app: "personal", pregnancy: "partnership", growth: "partnership", health: "partnership", family: "partnership",
  commerce: "business", brand: "business", services: "business", education: "public", saas: "business", corporate: "business",
  public: "public", welfare: "public", tech: "partnership", global: "partnership", other: "media",
  csprevent: "public", csedu: "partnership", csinst: "public", csprotect: "public", csadoption: "public", csdonation: "partnership",
  csindep: "public", cspublic: "public", cscsr: "business",
};
const BABYLOG_PURPOSE = { "babylog:general": "personal", "babylog:app": "personal", "biz:brand": "business", "biz:institution": "public", "biz:technology": "partnership" };

export function babylogContactModel(lang) {
  const C = getBabylogCopy(lang);
  const L = babylogLang(lang);
  const c = C.contact;
  const CX = C.x.contact;
  const PU = C.c30.contact.purpose;
  const KW = C.v3.contact.write;
  const KF = C.v3.contact.faq;
  const ch = c.channels || {};
  const row = (it) => {
    const ask = BABYLOG_TYPE[it.code] || "personal";
    return { n: it.n, name: it.name, text: it.lead, ask, topic: ask === "public" ? "babylog-institution" : "" };
  };
  return {
    biz: "babylog",
    lang,
    contentLang: L,
    cta: ctaLabel(L),
    channels: {
      kicker: "Channels",
      title: ch.title,
      items: [
        { k: ch.mailK, v: MAIL, href: `mailto:${MAIL}`, text: ch.mailText, icon: "mail" },
        { k: ch.formK, ask: "personal", text: ch.formText, icon: "form" },
      ],
    },
    route: {
      kicker: PU.kicker,
      title: PU.title,
      lead: PU.lead,
      items: PU.items.map((it, i) => ({
        t: it.name,
        text: it.lead,
        ask: BABYLOG_PURPOSE[it.to] || (i === PU.items.length - 1 ? "investment" : "media"),
      })),
    },
    types: {
      kicker: c.list.kicker,
      title: c.list.title,
      lead: c.list.lead,
      groups: [
        { title: `${L === "ko" ? "문의 분야" : "Contact categories"} 01–08`, en: L === "ko" ? c.list.kicker : "", rows: c.list.items.map(row) },
        { title: CX.more.title.replace(/\n/g, " ").replace(/\.$/, ""), en: L === "ko" ? CX.more.kicker : "", lead: CX.more.lead, rows: CX.more.items.map(row) },
        { title: CX.cs.title.replace(/\n/g, " ").replace(/\.$/, ""), en: L === "ko" ? CX.cs.kicker : "", lead: CX.cs.lead, notes: [C.ui.csNote, C.ui.koreaNote], rows: CX.cs.items.map(row) },
      ],
    },
    guard: {
      kicker: c.guide.kicker,
      title: c.guide.title,
      checklistTitle: KW.title.replace(/\n/g, " "),
      checklist: KW.items.map(([g, what]) => ({ g, items: [what] })),
      callouts: [
        ...c.guide.items.map((it, i) => ({ icon: ["mail", "link", "chat"][i % 3], text: `${it.name} · ${it.body}` })),
        { icon: "lock", text: `${C.c30.contact.sensitive.name} · ${C.c30.contact.sensitive.body}` },
        { alert: true, text: `${C.ui.emergencyTitle} ${C.ui.emergencyBody} ${C.ui.noChildData}` },
      ],
      noteHtml: `${e(C.ui.privacyNote)} <a href="/${e(lang)}/privacy/">${e(C.ui.privacyLink)}</a>`,
    },
    faq: {
      kicker: KF.kicker,
      title: KF.title,
      items: KF.items.map((f) => ({
        q: f.q,
        a: f.a,
        aHtml: f.link === "delete" ? `${e(f.a)} <a href="/${e(lang)}/${BL_SLUG}/delete-account/">${e(KF.deleteLink)}</a>` : "",
      })),
    },
    close: { kicker: c.closeKicker, titleHtml: c.closeTitleHtml, lead: c.closeLead, note: C.ui.infoOnly },
  };
}

/* ─────────────────────────── PETLOG ─────────────────────────── */
/** Rows with a clearly matching unified-page topic (contact-taxonomy.mjs). */
const PETLOG_TOPIC = { "booking-provider": "petlog-providers", sitting: "petlog-providers", brand: "petlog-business", "group-buying": "petlog-business", "insurance-adoption": "petlog-shelter" };
export const PETLOG_TYPE = {
  general: "personal", "app-support": "personal", content: "partnership", vet: "partnership", "booking-provider": "business", sitting: "business",
  brand: "business", "group-buying": "business", "insurance-adoption": "partnership", saas: "business", public: "public", global: "partnership",
};
const PETLOG_PURPOSE = { general: "personal", app: "personal", biz: "business", public: "public", tech: "partnership", press: "media", invest: "investment" };

export function petlogContactModel(lang) {
  const L = koOrEn(lang);
  const c = PL_CONTACT[L];
  const X = PL_V3.contact[L];
  const close = PL_OVERVIEW[L].close;
  const typeOf = Object.fromEntries(c.types.map(([key, name, body], i) => [key, { n: String(i + 1).padStart(2, "0"), name, body }]));
  const d = c.direct;
  const store = (h) => (h === "ios" ? PL_STORE.ios : h === "android" ? PL_STORE.android : h);
  return {
    biz: "petlog",
    lang,
    contentLang: L,
    cta: ctaLabel(L),
    channels: {
      kicker: c.directKicker,
      title: c.directTitle,
      items: [
        { k: d[0].name, v: MAIL, href: `mailto:${MAIL}`, text: "", icon: "mail" },
        { k: d[1].name, ask: "personal", text: d[1].body, icon: "form" },
        { k: d[2].name, v: "App Store →", href: store(d[2].href), text: d[2].body, icon: "phone" },
        { k: d[3].name, v: "Google Play →", href: store(d[3].href), text: d[3].body, icon: "phone" },
      ],
    },
    route: {
      kicker: c.purposeKicker,
      title: c.purposeTitle,
      lead: c.purposeLead,
      items: c.purposes.map((p) => ({ t: p.name, text: p.body, ask: PETLOG_PURPOSE[p.key] || "personal" })),
    },
    types: {
      kicker: c.kicker,
      title: c.listTitle,
      lead: c.listLead,
      groups: X.groups.map(([name, keys]) => ({
        title: name,
        rows: keys.map((key) => ({ n: typeOf[key].n, name: typeOf[key].name, text: typeOf[key].body, ask: PETLOG_TYPE[key] || "personal", topic: PETLOG_TOPIC[key] || "" })),
      })),
    },
    after: { kicker: X.afterKicker, title: X.afterTitle, steps: X.after.map(([name, text], i) => ({ n: String(i + 1).padStart(2, "0"), name, text })) },
    guard: {
      kicker: c.guideKicker,
      title: c.guideTitle,
      callouts: c.guide.map((t, i) => (i === 1 ? { alert: true, text: t } : { icon: i === 2 || i === 3 ? "lock" : "info", text: t })),
    },
    faq: { kicker: X.faqKicker, title: X.faqTitle, items: X.faq.map(([q, a]) => ({ q, a })) },
    close: { kicker: close.kicker, titleHtml: close.titleHtml, lead: close.lead },
  };
}

/* ─────────────────────────── MY WORLD ─────────────────────────── */
/** Rows with a clearly matching unified-page topic (contact-taxonomy.mjs). */
const MYWORLD_TOPIC = { 5: "myworld-agencies", 6: "myworld-agencies", 7: "myworld-agencies", 8: "myworld-agencies", 12: "myworld-tourism" };
const MYWORLD_TYPE = [
  "personal", "personal", "personal", "personal",
  "business", "business", "business", "business", "business", "partnership",
  "business", "public", "partnership", "partnership",
  "media", "investment",
];

export function myworldContactModel(lang, stores = {}) {
  const { copy, contentLang } = getMyWorldSiteCopy(lang);
  const c = copy.contact;
  const ui = copy.ui;
  const chs = c.channels.items;
  const next = copy.overview.next;
  const pad = (n) => String(n).padStart(2, "0");
  return {
    biz: "myworld",
    lang,
    contentLang,
    cta: ctaLabel(contentLang),
    channels: {
      kicker: c.channels.kicker,
      title: c.channels.title,
      items: [
        { k: chs[0].name, v: MAIL, href: `mailto:${MAIL}`, text: "", icon: "mail" },
        { k: chs[1].name, ask: "personal", text: chs[1].body, icon: "form" },
        { k: chs[2].name, v: `${chs[2].name} →`, href: `/${lang}/myworld/delete-account/`, text: chs[2].body, icon: "shield" },
        { k: chs[3].name, v: `${chs[3].name} →`, href: `/${lang}/privacy/`, text: chs[3].body, icon: "book" },
        ...(stores.googlePlay ? [{ k: "MY WORLD · Google Play", v: `${ui.appCta} ↗`, href: stores.googlePlay, text: "", icon: "phone" }] : []),
        ...(stores.appStore ? [{ k: "MY WORLD · App Store", v: `${ui.appStoreCta} ↗`, href: stores.appStore, text: "", icon: "phone" }] : []),
      ],
    },
    types: {
      kicker: c.typesKicker,
      title: c.typesTitle,
      lead: "",
      groups: c.groups.map((g) => ({
        title: g.name,
        en: contentLang === "ko" ? g.en : "",
        lead: g.lead,
        rows: g.items.map((n) => ({ n: pad(n), name: c.items[n - 1].name, text: c.items[n - 1].body, ask: MYWORLD_TYPE[n - 1], topic: MYWORLD_TOPIC[n] || "" })),
      })),
    },
    after: { kicker: c.how.kicker, title: c.how.title, steps: c.how.steps.map((s, i) => ({ n: pad(i + 1), name: s.name, text: s.body })) },
    guard: {
      kicker: c.prep.kicker,
      title: c.prep.title,
      lead: c.prep.lead,
      checklistTitle: c.prep.colInclude,
      checklist: c.prep.items.map((it) => ({ g: it.name, items: [it.body] })),
      callouts: [
        { icon: "lock", text: `${c.privacy.label} · ${ui.sensitiveNote}` },
        { icon: "info", text: ui.scopeNote },
      ],
    },
    faq: { kicker: c.faq.kicker, title: c.faq.title, items: c.faq.items.map((f) => ({ q: f.q, a: f.a })) },
    close: { kicker: next.kicker, titleHtml: e(next.title).replace(/\n/g, "<br>"), lead: next.lead },
  };
}

export const BIZ_CONTACT_MODELS = {
  livon: livonContactModel,
  shareon: shareonContactModel,
  babylog: babylogContactModel,
  petlog: petlogContactModel,
  myworld: myworldContactModel,
};
