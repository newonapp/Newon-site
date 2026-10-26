/**
 * NEWON unified Contact — inquiry taxonomy (owner spec 2 §3–§5, 2026-10-26).
 *
 * One source of truth for the /{lang}/contact/ form, its URL preselection and the redirect stubs that retire
 * /{lang}/business/contact/, /{lang}/studio/contact/ and (most of) /{lang}/business/inquiry/.
 *
 *   Level 1  inquirer       who is asking            (개인 · 기업 · 기관·단체 · 투자자 · 언론 · 기타)
 *   Level 2  inquiry type   what the inquiry is about (일반 문의 … 기타)
 *   Level 3  topic          platform-specific detail (LIVON / ONGIL / SHAREON / BABYLOG / PETLOG / MY WORLD / NEWON)
 *
 * The page's six existing categories (personal · business · public · partnership · investment · media — the cards in
 * "01 / CONTACT CATEGORIES" and the URL `type`) are kept: a category is a preset of level 1 + level 2, and the
 * category recorded with a submission is derived from the visitor's final level 1 + level 2 choice.
 *
 * URL contract (both agents):
 *   platform = livon | ongil | shareon | babylog | petlog | myworld | newon | other   (alias my-world → myworld)
 *   type     = category id or one of its aliases (CONTACT_TYPE_PRESETS)
 *   inquirer = level-1 id (optional)      inquiry = level-2 id (optional)
 *   topic    = level-3 id from CONTACT_TOPICS (optional; implies its platform)
 *   source   = free-form origin code, carried into the submission only
 * Unknown or mismatched values are ignored; the visitor can change every preselected value.
 *
 * Topic status — nothing may read as available today unless it is:
 *   "available" — offered now (no badge)
 *   "prep"      — part of an app whose launch is in preparation (앱 출시 준비 중)
 *   "planned"   — a long-term plan, not built yet (향후 계획)
 *   null        — not a feature (bug reports, partnership proposals …)
 * All six platforms are "앱 출시 준비 중" (none runs a web version), so no platform topic is "available".
 */

export const CONTACT_PLATFORM_IDS = ["newon", "livon", "ongil", "shareon", "babylog", "petlog", "myworld", "other"];
export const CONTACT_PLATFORM_ALIASES = { "my-world": "myworld", my_world: "myworld" };

/** Level 1 — inquirer. */
export const CONTACT_INQUIRERS = [
  { id: "personal", ko: "개인", en: "Individual" },
  { id: "company", ko: "기업", en: "Company" },
  { id: "organization", ko: "기관·단체", en: "Institution" },
  { id: "investor", ko: "투자자", en: "Investor" },
  { id: "media", ko: "언론", en: "Press" },
  { id: "other", ko: "기타", en: "Other" },
];
export const CONTACT_INQUIRER_IDS = CONTACT_INQUIRERS.map((x) => x.id);

/** Level 2 — inquiry type. */
export const CONTACT_INQUIRY_TYPES = [
  { id: "general", ko: "일반 문의", en: "General inquiry" },
  { id: "service", ko: "서비스 이용", en: "Using a service" },
  { id: "support", ko: "계정·기술 지원", en: "Account & technical support" },
  { id: "bug", ko: "오류 신고", en: "Report a bug" },
  { id: "partnership", ko: "제휴·파트너십", en: "Partnership & alliance" },
  { id: "listing", ko: "입점·서비스 제공", en: "Listing or providing a service" },
  { id: "investment", ko: "투자·IR", en: "Investment & IR" },
  { id: "advertising", ko: "광고·홍보", en: "Advertising & promotion" },
  { id: "institution", ko: "기관 협력", en: "Institutional cooperation" },
  { id: "privacy", ko: "개인정보·계정 관련", en: "Personal data & account requests" },
  { id: "other", ko: "기타", en: "Other" },
];
export const CONTACT_INQUIRY_IDS = CONTACT_INQUIRY_TYPES.map((x) => x.id);

/** The page's six categories (cards + URL `type`). */
export const CONTACT_CATEGORY_IDS = ["personal", "business", "public", "partnership", "investment", "media"];

/**
 * URL `type` value → preset. `category` is what the card highlight starts from; inquirer / inquiry are preselected.
 * Includes every value that already links into /{lang}/contact/ and the two names spec 1 uses (institution, general).
 */
export const CONTACT_TYPE_PRESETS = {
  personal: { category: "personal", inquirer: "personal" },
  support: { category: "personal", inquirer: "personal", inquiry: "support" },
  "app-support": { category: "personal", inquirer: "personal", inquiry: "support" },
  business: { category: "business", inquirer: "company" },
  project: { category: "business", inquirer: "company" },
  enterprise: { category: "business", inquirer: "company" },
  public: { category: "public", inquirer: "organization", inquiry: "institution" },
  institution: { category: "public", inquirer: "organization", inquiry: "institution" },
  government: { category: "public", inquirer: "organization", inquiry: "institution" },
  partnership: { category: "partnership", inquirer: "company", inquiry: "partnership" },
  partner: { category: "partnership", inquirer: "company", inquiry: "partnership" },
  technology: { category: "partnership", inquirer: "company", inquiry: "partnership" },
  investment: { category: "investment", inquirer: "investor", inquiry: "investment" },
  invest: { category: "investment", inquirer: "investor", inquiry: "investment" },
  ir: { category: "investment", inquirer: "investor", inquiry: "investment" },
  media: { category: "media", inquirer: "media" },
  press: { category: "media", inquirer: "media" },
  // spec 1: "언론·기타: /ko/contact/?type=general"
  general: { category: "media", inquirer: "other", inquiry: "general" },
  other: { category: "media", inquirer: "other", inquiry: "other" },
};

/** type value → category id (kept for older imports). */
export const CONTACT_TYPE_ALIASES = Object.fromEntries(Object.entries(CONTACT_TYPE_PRESETS).map(([k, v]) => [k, v.category]));

/** Category recorded with a submission, from the visitor's final level 1 + level 2 choice. */
export function deriveContactCategory(inquirer, inquiry) {
  if (inquiry === "investment" || inquirer === "investor") return "investment";
  if (inquiry === "partnership") return "partnership";
  if (inquirer === "organization" || inquiry === "institution") return "public";
  if (inquirer === "media" || inquirer === "other") return "media";
  if (inquirer === "company") return "business";
  return "personal";
}

export const CONTACT_TOPIC_STATUS = {
  available: { ko: "", en: "" },
  prep: { ko: "출시 준비 중", en: "launch in preparation" },
  planned: { ko: "향후 계획", en: "future plan" },
};

/**
 * Level 3 — topics per platform. `inquiry` = level 2 preselected when the topic is chosen and no level 2 is set;
 * `ref` = show the optional "transaction / booking reference" field.
 */
const T = (id, ko, en, status, inquiry, ref = false) => ({ id, ko, en, status: status || null, inquiry: inquiry || null, ref });

export const CONTACT_TOPICS = {
  livon: [
    T("livon-lifecycle", "생애주기", "Life stages", "prep", "service"),
    T("livon-welfare", "복지·행정", "Welfare & public services", "prep", "service"),
    T("livon-living", "생활 서비스", "Everyday-life services", "planned", "service"),
    T("livon-account", "계정", "Accounts", "planned", "support"),
    T("livon-ai", "AI", "AI features", "planned", "service"),
    T("livon-experts", "전문가·기관 연계", "Experts & institutions", "planned", "listing"),
    T("livon-bug", "오류", "Bugs", null, "bug"),
    T("livon-partnership", "제휴", "Partnerships", null, "partnership"),
  ],
  ongil: [
    T("ongil-senior", "어르신", "Older adults", "prep", "service"),
    T("ongil-guardian", "보호자", "Family & guardians", "planned", "service"),
    T("ongil-caregiver", "돌봄 제공자", "Care providers", "planned", "listing"),
    T("ongil-health", "건강·안전", "Health & safety", "prep", "service"),
    T("ongil-welfare", "복지·요양기관", "Welfare & care institutions", "planned", "institution"),
    T("ongil-services", "서비스 연계", "Linked services", "planned", "listing"),
    T("ongil-bug", "오류", "Bugs", null, "bug"),
    T("ongil-partnership", "제휴", "Partnerships", null, "partnership"),
  ],
  shareon: [
    T("shareon-sharing", "공유·대여", "Sharing & rental", "prep", "service"),
    T("shareon-booking", "예약", "Rental requests", "prep", "service", true),
    T("shareon-trade", "거래", "Trades", "prep", "service", true),
    T("shareon-deposit", "보증금", "Deposits", "planned", "service", true),
    T("shareon-payment", "결제·정산", "Payment & settlement", "planned", "service", true),
    T("shareon-dispute", "분쟁", "Disputes", "planned", "service", true),
    T("shareon-report", "신고", "Reporting a user or listing", null, "service", true),
    T("shareon-provider", "개인 제공자", "Individual providers", "prep", "listing"),
    T("shareon-business", "기업 입점", "Business listings", "planned", "listing"),
    T("shareon-partnership", "제휴", "Partnerships", null, "partnership"),
  ],
  babylog: [
    T("babylog-pregnancy", "임신·출산", "Pregnancy & birth", "planned", "service"),
    T("babylog-parenting", "육아", "Parenting", "prep", "service"),
    T("babylog-growth", "성장·건강", "Growth & health", "prep", "service"),
    T("babylog-family", "가족 계정", "Family accounts", "planned", "support"),
    T("babylog-school", "학교·교육", "School & education", "planned", "service"),
    T("babylog-safety", "아동 안전", "Child safety", "planned", "service"),
    T("babylog-institution", "기관 협력", "Institutional cooperation", null, "institution"),
    T("babylog-bug", "오류", "Bugs", null, "bug"),
    T("babylog-partnership", "제휴", "Partnerships", null, "partnership"),
  ],
  petlog: [
    T("petlog-records", "반려동물 기록", "Pet records", "prep", "service"),
    T("petlog-health", "건강", "Health", "prep", "service"),
    T("petlog-booking", "예약·돌봄", "Booking & care", "planned", "service", true),
    T("petlog-providers", "병원·미용·훈련", "Vets, grooming & training", "planned", "listing"),
    T("petlog-shelter", "보호소·구조동물", "Shelters & rescued animals", "planned", "institution"),
    T("petlog-business", "기업 입점", "Business listings", "planned", "listing"),
    T("petlog-bug", "오류", "Bugs", null, "bug"),
    T("petlog-partnership", "제휴", "Partnerships", null, "partnership"),
  ],
  myworld: [
    T("myworld-map", "세계 지도", "World map", "prep", "service"),
    T("myworld-visits", "방문 기록", "Visit records", "prep", "service"),
    T("myworld-trips", "여행 기록", "Travel records", "prep", "service"),
    T("myworld-travel-services", "여행 서비스", "Travel services", "planned", "service"),
    T("myworld-booking", "예약", "Booking", "planned", "service", true),
    T("myworld-agencies", "여행 업체", "Travel businesses", "planned", "listing"),
    T("myworld-tourism", "관광기관", "Tourism organizations", null, "institution"),
    T("myworld-bug", "오류", "Bugs", null, "bug"),
    T("myworld-partnership", "제휴", "Partnerships", null, "partnership"),
  ],
  newon: [
    T("newon-company", "NEWON 회사·서비스 전반", "NEWON in general", null, "general"),
    T("newon-business", "NEWON Business 사업 협력", "NEWON Business cooperation", null, null),
    T("newon-saas", "기업용 SaaS·솔루션 도입", "Enterprise SaaS & solutions", "planned", "service"),
    T("newon-studio", "NEWON Studio 제품·구매", "NEWON Studio products & purchase", "available", "service"),
    T("newon-studio-license", "NEWON Studio 라이선스", "NEWON Studio licences", null, "service"),
    T("newon-studio-support", "NEWON Studio 다운로드·사용 지원", "NEWON Studio download & usage support", null, "support"),
    T("newon-studio-business", "NEWON Studio 기업용 제품", "NEWON Studio business products", "planned", "service"),
    T("newon-partnership", "파트너십 제안", "Partnership proposals", null, "partnership"),
    T("newon-global", "글로벌 협력", "Global cooperation", "planned", "partnership"),
    T("newon-ir", "투자·IR 자료", "Investment & IR materials", null, "investment"),
    T("newon-press", "언론·보도", "Press & coverage", null, "general"),
    T("newon-privacy", "개인정보 열람·삭제 요청", "Personal-data access & deletion requests", null, "privacy"),
  ],
};

/** Every topic id → { platform, ...topic }. */
export const CONTACT_TOPIC_INDEX = Object.fromEntries(
  Object.entries(CONTACT_TOPICS).flatMap(([platform, list]) => list.map((t) => [t.id, { platform, ...t }]))
);
export const CONTACT_TOPIC_IDS = Object.keys(CONTACT_TOPIC_INDEX);

/**
 * Conditional fields (spec 2 §4). A field shows when the inquirer is in `inquirers` OR the inquiry type is in
 * `inquiries` OR (for `ref`) the chosen topic has ref=true. `requiredFor` lists inquirers / inquiry types for which a
 * shown field is required.
 */
export const CONTACT_CONDITIONAL_FIELDS = {
  organization: { inquirers: ["company", "organization", "investor", "media"], requiredFor: ["company", "organization", "media"] },
  position: { inquirers: ["company", "organization", "investor", "media"] },
  website: { inquirers: ["company", "organization", "investor", "media"] },
  business_purpose: { inquirers: ["company", "organization"], inquiries: ["partnership", "listing", "advertising", "institution"] },
  partnership_goal: { inquiries: ["partnership", "listing", "advertising", "institution"] },
  investor_info: { inquirers: ["investor"], inquiries: ["investment"] },
  environment: { inquiries: ["service", "support", "bug"] },
  error_detail: { inquiries: ["bug"], requiredFor: ["bug"] },
  reference_id: { ref: true },
};
/** Inquiry types whose message is a proposal (label "제안 내용"). */
export const CONTACT_PROPOSAL_INQUIRIES = ["partnership", "listing", "advertising", "institution", "investment"];

export function normalizePlatform(v) {
  const s = String(v || "").toLowerCase().trim();
  const id = CONTACT_PLATFORM_ALIASES[s] || s;
  return CONTACT_PLATFORM_IDS.includes(id) ? id : "";
}

/**
 * Resolve URL params into a form selection (pure; mirrored in contact/contact-page.js).
 * Returns { category, inquirer, inquiry, platform, topic, source } with "" for anything unknown.
 */
export function resolveContactParams(params) {
  const get = (k) => String((params && (typeof params.get === "function" ? params.get(k) : params[k])) || "").toLowerCase().trim();
  const out = { category: "", inquirer: "", inquiry: "", platform: "", topic: "", source: "" };
  const preset = Object.prototype.hasOwnProperty.call(CONTACT_TYPE_PRESETS, get("type")) ? CONTACT_TYPE_PRESETS[get("type")] : null;
  if (preset) {
    out.category = preset.category;
    out.inquirer = preset.inquirer || "";
    out.inquiry = preset.inquiry || "";
  }
  if (CONTACT_INQUIRER_IDS.includes(get("inquirer"))) out.inquirer = get("inquirer");
  if (CONTACT_INQUIRY_IDS.includes(get("inquiry"))) out.inquiry = get("inquiry");
  out.platform = normalizePlatform(get("platform"));
  const topic = CONTACT_TOPIC_INDEX[get("topic")];
  if (topic && (!out.platform || out.platform === topic.platform)) {
    out.platform = topic.platform;
    out.topic = topic.id;
    if (!out.inquiry && topic.inquiry) out.inquiry = topic.inquiry;
  }
  const raw = params && (typeof params.get === "function" ? params.get("source") : params.source);
  out.source = String(raw || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 120);
  return out;
}

/* ------------------------------------------------------------------------------------------------
 * Retired inquiry pages → unified page (spec 1 §2). Values of the old Business (bizpart) and Studio forms.
 * ---------------------------------------------------------------------------------------------- */

/** Old Business & Partnerships contact `type` codes (BP_INQUIRY_TYPES) and /business/inquiry/ type names. */
export const LEGACY_BUSINESS_TYPES = {
  general: { type: "business", topic: "newon-business", inquiry: "general" },
  participation: { type: "business", inquiry: "listing" },
  commerce: { type: "partnership" },
  saas: { type: "business", topic: "newon-saas" },
  institution: { type: "public" },
  brand: { type: "partnership" },
  technology: { type: "partnership" },
  public: { type: "public" },
  global: { type: "partnership", topic: "newon-global" },
  other: { type: "business", inquiry: "other" },
};

/** Old NEWON Studio contact `type` codes (ST_INQUIRY_TYPES). */
export const LEGACY_STUDIO_TYPES = {
  product: { type: "personal", topic: "newon-studio" },
  purchase: { type: "personal", topic: "newon-studio" },
  usage: { type: "personal", topic: "newon-studio-support" },
  support: { type: "personal", topic: "newon-studio-support" },
  business: { type: "business", topic: "newon-studio-business" },
  license: { type: "business", topic: "newon-studio-license" },
};

/** Default target of each retired page (no usable query). */
export const LEGACY_PAGE_DEFAULTS = {
  "business-contact": { type: "business", topic: "newon-business", source: "business-contact" },
  "studio-contact": { type: "business", topic: "newon-studio", source: "studio-contact" },
  "business-inquiry": { type: "business", topic: "newon-business", source: "business-inquiry" },
};

/** Inline browser script for the redirect stubs: maps the old query to the unified one. Self-contained ES5. */
export function legacyRedirectScript(lang, kind) {
  const data = {
    lang,
    kind,
    biz: LEGACY_BUSINESS_TYPES,
    studio: LEGACY_STUDIO_TYPES,
    def: LEGACY_PAGE_DEFAULTS[kind],
    presets: Object.keys(CONTACT_TYPE_PRESETS),
    platforms: CONTACT_PLATFORM_IDS,
    aliases: CONTACT_PLATFORM_ALIASES,
    topics: CONTACT_TOPIC_IDS,
  };
  return `(function(){var D=${JSON.stringify(data).replace(/</g, "\\u003c")};
try{var q=new URLSearchParams(location.search),o=new URLSearchParams(),k=D.kind;
var t=(q.get("type")||"").toLowerCase().trim(),c=(q.get("category")||"").toLowerCase().trim(),m=null;
if(k==="studio-contact"||c==="studio")m=D.studio[t]||null;
if(!m&&k!=="studio-contact")m=D.biz[t]||null;
if(!m&&D.presets.indexOf(t)!==-1)m={type:t};
var mt=!!m;
if(!m&&k==="business-inquiry"&&(/partner/.test(t)||/partner/.test(c)||/partner/.test((q.get("service")||"").toLowerCase())))m={type:"partnership"};
if(!m&&k==="business-inquiry"&&c==="studio")m={type:"business",topic:"newon-studio"};
m=m||{};var ty=m.type||D.def.type,tp=m.topic||"",iq=m.inquiry||"";
var p=(q.get("platform")||q.get("area")||"").toLowerCase().replace(/\\s+/g,"");p=D.aliases[p]||p;
if(p==="multiple"||p==="general"||p==="store"||p==="business")p="newon";
if(D.platforms.indexOf(p)===-1){var src0=(q.get("source")||"").toLowerCase().match(/babylog|petlog|myworld|shareon|livon|ongil/);p=src0?src0[0]:"";}
if(k==="studio-contact"||c==="studio")p="newon";
var qt=(q.get("topic")||"").toLowerCase();if(D.topics.indexOf(qt)!==-1)tp=qt;
if(!tp&&!m.type&&!p)tp=D.def.topic;
if(tp&&p&&p!=="newon"&&tp.indexOf(p+"-")!==0&&tp.indexOf("newon-")===0)tp="";
if(!p&&tp)p=tp.split("-")[0];
o.set("type",ty);if(iq)o.set("inquiry",iq);if(p)o.set("platform",p);if(tp)o.set("topic",tp);
o.set("source",(q.get("source")||D.def.source).slice(0,120));
var keep=[];q.forEach(function(v,key){if(["type","platform","topic","source"].indexOf(key)===-1&&v)keep.push(key+"="+v);});
if(t&&!mt)keep.unshift("type="+t);
if(keep.length)o.set("legacy",(D.kind+": "+keep.join("&")).slice(0,200));
location.replace("/"+D.lang+"/contact/?"+o.toString()+(location.hash?"#contact-form":""));}
catch(e){location.replace("/"+D.lang+"/contact/");}})();`;
}

/**
 * Node twin of legacyRedirectScript for renderers: old page kind + old query → unified URL (tests check both agree).
 * `query` = URLSearchParams or query string.
 */
export function legacyContactUrl(lang, kind, query = "", hash = "") {
  const q = typeof query === "string" ? new URLSearchParams(query) : query;
  const def = LEGACY_PAGE_DEFAULTS[kind];
  const t = String(q.get("type") || "").toLowerCase().trim();
  const c = String(q.get("category") || "").toLowerCase().trim();
  let m = null;
  if (kind === "studio-contact" || c === "studio") m = LEGACY_STUDIO_TYPES[t] || null;
  if (!m && kind !== "studio-contact") m = LEGACY_BUSINESS_TYPES[t] || null;
  if (!m && Object.prototype.hasOwnProperty.call(CONTACT_TYPE_PRESETS, t)) m = { type: t };
  const mt = !!m;
  if (!m && kind === "business-inquiry" && (/partner/.test(t) || /partner/.test(c) || /partner/.test(String(q.get("service") || "").toLowerCase()))) m = { type: "partnership" };
  if (!m && kind === "business-inquiry" && c === "studio") m = { type: "business", topic: "newon-studio" };
  m = m || {};
  const ty = m.type || def.type;
  let tp = m.topic || "";
  const iq = m.inquiry || "";
  let p = String(q.get("platform") || q.get("area") || "").toLowerCase().replace(/\s+/g, "");
  p = CONTACT_PLATFORM_ALIASES[p] || p;
  if (["multiple", "general", "store", "business"].includes(p)) p = "newon";
  if (!CONTACT_PLATFORM_IDS.includes(p)) {
    const s = String(q.get("source") || "").toLowerCase().match(/babylog|petlog|myworld|shareon|livon|ongil/);
    p = s ? s[0] : "";
  }
  if (kind === "studio-contact" || c === "studio") p = "newon";
  const qt = String(q.get("topic") || "").toLowerCase();
  if (CONTACT_TOPIC_IDS.includes(qt)) tp = qt;
  if (!tp && !m.type && !p) tp = def.topic;
  if (tp && p && p !== "newon" && tp.indexOf(p + "-") !== 0 && tp.indexOf("newon-") === 0) tp = "";
  if (!p && tp) p = tp.split("-")[0];
  const o = new URLSearchParams();
  o.set("type", ty);
  if (iq) o.set("inquiry", iq);
  if (p) o.set("platform", p);
  if (tp) o.set("topic", tp);
  o.set("source", String(q.get("source") || def.source).slice(0, 120));
  const keep = [];
  q.forEach((v, key) => {
    if (!["type", "platform", "topic", "source"].includes(key) && v) keep.push(key + "=" + v);
  });
  if (t && !mt) keep.unshift("type=" + t);
  if (keep.length) o.set("legacy", (kind + ": " + keep.join("&")).slice(0, 200));
  return `/${lang}/contact/?${o.toString()}${hash ? "#contact-form" : ""}`;
}

/** The unified page URL a page-level button should use (for renderers). */
export function unifiedContactUrl(lang, params = {}) {
  const q = new URLSearchParams();
  for (const k of ["type", "inquirer", "inquiry", "platform", "topic", "source"]) if (params[k]) q.set(k, params[k]);
  const s = q.toString();
  return `/${lang}/contact/${s ? "?" + s : ""}${params.hash ? "#" + params.hash : ""}`;
}
