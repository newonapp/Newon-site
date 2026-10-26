/*
 * Navigation state: marks the current view in the desktop bar, the mobile sheet and the header tools,
 * and closes the mobile sheet after an in-app link is chosen (site-chrome.js leaves hash links open).
 */
import { resolveView } from './router.js';

export function createNavigation({ doc }) {
  const links = () => [...doc.querySelectorAll('[data-og-nav]')];

  function setCurrent(view) {
    for (const link of links()) {
      const target = resolveView((link.getAttribute('href') || '').split('#')[1] || '');
      const on = target === view;
      if (on) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
      const group = link.closest('.gnav-dd');
      if (group) group.classList.toggle('gnav-dd--active', on);
    }
  }

  doc.addEventListener('click', (event) => {
    const link = event.target.closest('.gnav-mobile a[href^="#"]');
    if (!link) return;
    const close = doc.querySelector('.gnav-mobile:not([hidden]) [data-gnav-close]');
    if (close) close.click();
  });

  return Object.freeze({ setCurrent });
}
