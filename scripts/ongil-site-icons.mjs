/** Line icons (24×24, stroke = currentColor) for the ONGIL business site (/{ko,en}/ongil/…). Decorative only (aria-hidden).
 *  Simple abstract line marks — no app screenshots, no raster images. */
const P = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/><path d="M7.5 12h2.3l1.2-2 2 4 1.2-2h2.3"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 20c.6-3.4 3-5.3 6-5.3s5.4 1.9 6 5.3"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16.5 14.8c2.4.2 4 1.8 4.5 4.6"/>',
  person: '<circle cx="12" cy="7.5" r="3.5"/><path d="M5 20.5c.8-4 3.6-6.3 7-6.3s6.2 2.3 7 6.3"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M8.8 12.2l2.2 2.2 4.2-4.4"/>',
  hands: '<path d="M12 20.5s-6-3.6-6-8a3.4 3.4 0 0 1 6-2.2 3.4 3.4 0 0 1 6 2.2c0 4.4-6 8-6 8z"/><path d="M3 14.5l3 2M21 14.5l-3 2"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7.5h8M8 11h6"/>',
  chat: '<path d="M4 5h16v11H9.5L5 20v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19l7-7"/>',
  star: '<path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.4l-5.1 2.7 1-5.6-4.1-4 5.7-.8z"/>',
  home: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 9.5V20h12V9.5"/><path d="M12 17.5s-2.6-1.6-2.6-3.4a1.4 1.4 0 0 1 2.6-.8 1.4 1.4 0 0 1 2.6.8c0 1.8-2.6 3.4-2.6 3.4z"/>',
  homeShield: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 9.5V20h12V9.5"/><path d="M12 11.5l3 1.2v2.1c0 1.8-1.3 3.2-3 3.7-1.7-.5-3-1.9-3-3.7v-2.1z"/>',
  building: '<path d="M4 21h16M6 21V9.5l6-4.5 6 4.5V21"/><path d="M9.5 21v-4h5v4M9 12h1.5M13.5 12H15"/>',
  landmark: '<path d="M3.5 9L12 4l8.5 5z"/><path d="M5.5 9.5v8M9.8 9.5v8M14.2 9.5v8M18.5 9.5v8M3.5 20.5h17"/>',
  route: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/>',
  bowl: '<path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 20h6M9 4.5c0 1.5 1.5 1.5 1.5 3M13 4.5c0 1.5 1.5 1.5 1.5 3"/>',
  bag: '<path d="M5 8h14l-1 12.5H6z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
  ticket: '<path d="M3.5 8.5V6h17v2.5a2.5 2.5 0 0 0 0 5V16h-17v-2.5a2.5 2.5 0 0 0 0-5z"/><path d="M14 6v10" stroke-dasharray="1.6 1.8"/>',
  info: '<rect x="4.5" y="3" width="15" height="18" rx="2"/><path d="M12 10.5v6M12 7.3v.2"/>',
  briefcase: '<rect x="3.5" y="7.5" width="17" height="12" rx="1.5"/><path d="M9 7.5V5h6v2.5M3.5 12.5h17M11 12.5v2h2v-2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4M7.5 14h3M7.5 17h6"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  clipboard: '<rect x="5" y="4.5" width="14" height="16.5" rx="1.8"/><path d="M9 4.5V3h6v1.5M8.5 10h7M8.5 13.5h7M8.5 17h4"/>',
  type: '<path d="M4 19l4.5-12h1L14 19M5.5 15h6"/><path d="M15 19v-5.5a2.5 2.5 0 0 1 5 0V19M15 16h5"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><path d="M16.75 13.5v6.5M13.5 16.75H20"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.2"/><path d="M10.5 18.5h3"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.8"/><path d="M3.5 7l8.5 6.2L20.5 7"/>',
  form: '<rect x="4.5" y="3" width="15" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h4.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="1.8"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2.5"/>',
  alert: '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.2v.2"/>',
  check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  layers: '<path d="M12 3.5l9 4.8-9 4.8-9-4.8z"/><path d="M3 12.2l9 4.8 9-4.8M3 16.2l9 4.8 9-4.8"/>',
  box: '<path d="M3.5 8L12 4l8.5 4v8.5L12 20.5l-8.5-4z"/><path d="M3.5 8L12 12l8.5-4M12 12v8.5M7.8 6l8.4 4"/>',
  watch: '<rect x="7" y="7" width="10" height="10" rx="2.5"/><path d="M9 7l.6-3.5h4.8L15 7M9 17l.6 3.5h4.8L15 17M12 10v2.2l1.4 1"/>',
  pill: '<rect x="3.2" y="8.6" width="17.6" height="6.8" rx="3.4" transform="rotate(-35 12 12)"/><path d="M9.6 8.6l4.8 6.8"/>',
  bus: '<rect x="4.5" y="4" width="15" height="13" rx="2"/><path d="M4.5 11h15M8 17v2.5M16 17v2.5"/><path d="M8 14h.1M16 14h.1"/>',
};

/** Inline SVG for one icon key (falls back to "spark"). */
export function icon(name, cls = "ogs-ico") {
  const d = P[name] || P.spark;
  return `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
}

/** Overview */
export const FACT_ICONS = ["clock", "phone", "users", "shield"];
export const VALUE_ICONS = ["compass", "link", "leaf", "shield", "hands", "star"];
export const JOURNEY_ICONS = ["heart", "users", "chat", "bag", "building", "spark", "hands"];
export const CORE_ICONS = ["sun", "route", "users", "ticket", "building"];
export const PEOPLE_ICONS = ["person", "users", "hands", "lock"];
export const LAYER_ICONS = ["home", "hands", "building", "globe"];
export const NEXT_ICONS = ["users", "briefcase", "mail"];

/** Platform areas, keyed by section id. */
export const AREA_ICONS = {
  "senior-profile": "person",
  "health-record": "heart",
  medication: "pill",
  "daily-life": "sun",
  "family-care": "users",
  "care-tasks": "calendar",
  "care-matching": "hands",
  "home-care": "home",
  "care-facilities": "building",
  "medical-access": "route",
  safety: "homeShield",
  community: "chat",
  activities: "ticket",
  jobs: "briefcase",
  welfare: "info",
  mobility: "bus",
  housing: "home",
  "senior-market": "bag",
  subscription: "layers",
  "ongil-ai": "spark",
  devices: "phone",
  trust: "shield",
  "business-saas": "clipboard",
  partners: "link",
  global: "globe",
  "life-box": "box",
  friends: "users",
  "safe-band": "watch",
  giving: "hands",
};

/** Platform group letters A–G. */
export const GROUP_ICONS = { A: "heart", B: "users", C: "chat", D: "bag", E: "building", F: "spark", G: "hands" };

/** Business categories, keyed by category id. */
export const CATEGORY_ICONS = {
  "daily-wellness": "sun",
  "family-care": "users",
  "care-facilities": "building",
  "commerce-lifestyle": "bag",
  "community-education": "book",
  "welfare-safety": "shield",
  "business-solutions": "clipboard",
  "institutions-global": "globe",
};

/** Partnerships: 16 partner types in content order (15–16: giving cooperation possibilities). */
export const PARTNER_ICONS = ["building", "home", "building", "hands", "landmark", "route", "watch", "phone", "shield", "bag", "box", "book", "briefcase", "globe", "hands", "heart"];
export const PROCESS_ICONS = ["mail", "clipboard", "chat", "form", "spark"];

/** Abstract "warm road" line illustration (온길 = a warm path): a soft winding path with stops. Decorative. */
export function roadArt(cls = "ogs-road") {
  return `<svg class="${cls}" viewBox="0 0 320 120" fill="none" aria-hidden="true" focusable="false">
      <path class="ogs-road__track" d="M8 92C58 92 62 30 112 30s58 62 108 62 54-52 92-52" />
      <path class="ogs-road__line" d="M8 92C58 92 62 30 112 30s58 62 108 62 54-52 92-52" />
      <circle class="ogs-road__stop" cx="8" cy="92" r="5" />
      <circle class="ogs-road__stop" cx="112" cy="30" r="5" />
      <circle class="ogs-road__stop" cx="220" cy="92" r="5" />
      <circle class="ogs-road__stop ogs-road__stop--on" cx="312" cy="40" r="7" />
    </svg>`;
}
