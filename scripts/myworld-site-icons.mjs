/** Line icons (24×24, stroke = currentColor) for the MY WORLD business site. Decorative only. */
const P = {
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7.5h8M8 11h6"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4M7.5 14h3M7.5 17h6"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  wallet: '<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h12.5v3"/><rect x="3.5" y="8" width="17" height="12" rx="1.5"/><path d="M16 14h4.5"/><circle cx="16" cy="14" r=".6"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M8.8 12.2l2.2 2.2 4.2-4.4"/>',
  plane: '<path d="M10.2 13.8L3 11.5l1.5-1.5 7.7.8 4.6-4.6a2.1 2.1 0 0 1 3 3l-4.6 4.6.8 7.7-1.5 1.5-2.3-7.2-3 3v2.5l-1.3 1.3-1.5-3.2-3.2-1.5 1.3-1.3h2.5z"/>',
  bed: '<path d="M3 18V6M3 13h18v5M21 18v-3a3 3 0 0 0-3-3h-7v1"/><circle cx="7" cy="10" r="1.8"/><path d="M3 18h18"/>',
  suitcase: '<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V4.5h6V7M9 11v5M15 11v5M7 22v-2M17 22v-2"/>',
  ticket: '<path d="M3.5 8.5V6h17v2.5a2.5 2.5 0 0 0 0 5V16h-17v-2.5a2.5 2.5 0 0 0 0-5z"/><path d="M14 6v10" stroke-dasharray="1.6 1.8"/>',
  bag: '<path d="M5 8h14l-1 12.5H6z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
  recycle: '<path d="M7.5 9.5L10 5.2a2.3 2.3 0 0 1 4 0l1.3 2.2"/><path d="M17.5 11.5l2.2 3.8a2.3 2.3 0 0 1-2 3.5H14"/><path d="M9.5 18.8H6.3a2.3 2.3 0 0 1-2-3.5l1.6-2.8"/><path d="M13.8 6.2l1.5 1.2 1.8-.6M16 17l-2 1.8 2 1.7M5 13.5l.9-1.6 1.8.5"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 20c.6-3.4 3-5.3 6-5.3s5.4 1.9 6 5.3"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16.5 14.8c2.4.2 4 1.8 4.5 4.6"/>',
  chat: '<path d="M4 5h16v11H9.5L5 20v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/>',
  camera: '<path d="M4 8h3.5L9 5.5h6L16.5 8H20v11H4z"/><circle cx="12" cy="13.3" r="3.3"/>',
  map: '<path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
  briefcase: '<rect x="3.5" y="7.5" width="17" height="12" rx="1.5"/><path d="M9 7.5V5h6v2.5M3.5 12.5h17M11 12.5v2h2v-2"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><path d="M16.75 13.5v6.5M13.5 16.75H20"/>',
  phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.2"/><path d="M10.5 18.5h3"/>',
  home: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 9.5V20h12V9.5M10 20v-5.5h4V20"/>',
  car: '<path d="M5 16.5V12l1.8-4.5h10.4L19 12v4.5"/><path d="M3.5 12h17v4.5h-17zM7 19.5v-3M17 19.5v-3"/><circle cx="7.5" cy="14.2" r=".7"/><circle cx="16.5" cy="14.2" r=".7"/>',
  flag: '<path d="M5 21V4M5 4.5h11l-2 3.7 2 3.8H5"/>',
  building: '<path d="M4 21h16M6 21V9.5l6-4.5 6 4.5V21"/><path d="M9.5 21v-4h5v4M9 12h1.5M13.5 12H15"/>',
  code: '<path d="M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5M13.5 5l-3 14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
};

export function icon(name, cls = "mws-ico") {
  const body = P[name] || P.globe;
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}
