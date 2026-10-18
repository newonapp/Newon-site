/**
 * SHAREON — original line icons (24×24, stroke = currentColor). Drawn for this site; no third-party icon set.
 */
const P = {
  everyday: '<path d="M4 20h16"/><path d="M7 20V9l5-4 5 4v11"/><path d="M10 20v-5h4v5"/>',
  electronics: '<rect x="3" y="5" width="18" height="11" rx="1.5"/><path d="M2 19h20"/><path d="M10 8.5h4"/>',
  camera: '<path d="M4 8h3l1.6-2.2h6.8L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.4"/>',
  camping: '<path d="M3 20 12 5l9 15z"/><path d="M12 5v15"/><path d="m9.5 20 2.5-5 2.5 5"/>',
  fashion: '<path d="M8 4 4 7l2 4 2-1v10h8V10l2 1 2-4-4-3"/><path d="M8 4a4 4 0 0 0 8 0"/>',
  space: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 10h18"/><path d="M10 10v10"/>',
  mobility: '<circle cx="6" cy="16.5" r="3.5"/><circle cx="18" cy="16.5" r="3.5"/><path d="M6 16.5 9.5 9h5l3.5 7.5"/><path d="M8.5 6h3"/><path d="m12 16.5-2.5-7.5"/>',
  sports: '<circle cx="12" cy="12" r="8.5"/><path d="M3.8 9.5c4.5 1 11.9 1 16.4 0"/><path d="M3.8 14.5c4.5-1 11.9-1 16.4 0"/><path d="M12 3.5v17"/>',
  pro: '<path d="M14.5 5.5a4 4 0 0 0 4.9 4.9L20 11l-9 9-3.5-3.5 9-9z"/><path d="m4 20 3.5-3.5"/><path d="M14.5 5.5 17 3"/>',
  office: '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="1.5"/><path d="M7 14h10v6H7z"/>',
  local: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  corporate: '<path d="M4 20V6l7-2v16"/><path d="M11 9h9v11"/><path d="M2 20h20"/><path d="M7 9h1M7 13h1M14.5 13h1M14.5 16h1"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5.5 5.5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 10h17"/><path d="M8 3v4M16 3v4"/><path d="m9 14.5 2 2 4-4"/>',
  payment: '<rect x="2.5" y="5.5" width="19" height="13" rx="1.5"/><path d="M2.5 9.5h19"/><path d="M6 15h4"/>',
  return: '<path d="M9 7H4V2"/><path d="M4.6 7A8.5 8.5 0 1 1 3.5 12"/><path d="m9 12 2 2 4-4"/>',
  trust: '<path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
  app: '<rect x="6.5" y="2.5" width="11" height="19" rx="2"/><path d="M10.5 18.5h3"/>',
  saas: '<rect x="3" y="3" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1"/><path d="M17.25 13.5v7.5M13.5 17.25H21"/>',
  global: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.4 3.5 5.3 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.3-3.5-8.5s1.1-6.1 3.5-8.5z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  tag: '<path d="M3.5 12.5V4h8.5l8.5 8.5-8 8z"/><circle cx="8" cy="8.5" r="1.6"/>',
  public: '<path d="M3 9.5 12 4l9 5.5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 20h18"/>',
};

export function icon(key, cls = "nsh-ico") {
  const d = P[key] || P.everyday;
  return `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
}

export const ICON_KEYS = Object.keys(P);
