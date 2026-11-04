/*
 * Background films (ONGIL-local replacement for the shared film-keep.js on this page).
 *
 * film-keep.js restarts a video whenever it is paused, so it cannot offer a pause control. Here:
 *   - only the film of the view that is showing is loaded and played (the other six are not downloaded);
 *   - every film has a visible "영상 멈춤 / 영상 재생" button (WCAG 2.2.2 Pause, Stop, Hide);
 *   - with the device's "reduce motion" setting, or the user's own choice, films start still.
 * The look of the films (cover, framing, text reveal) is unchanged.
 */
import { el } from './dom.js';

/* pure: preference ('system' | 'on' | 'off') + device setting → play or not */
export function motionAllowed(preference, systemReduced) {
  if (preference === 'on') return true;
  if (preference === 'off') return false;
  return !systemReduced;
}

export function createFilms({ doc, win, getMotion, setMotion }) {
  const reduceQuery = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const films = [...doc.querySelectorAll('[data-og-film]')];
  let activeView = null;

  const allowed = () => motionAllowed(getMotion(), reduceQuery.matches);

  function prepare(video) {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    if (!video.getAttribute('src') && video.dataset.ogSrc) video.setAttribute('src', video.dataset.ogSrc);
  }

  function play(video) {
    prepare(video);
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }

  function still(video) {
    try {
      video.pause();
    } catch {
      /* ignore */
    }
  }

  function reveal(film) {
    if (!film.classList.contains('is-ready')) {
      const video = film.querySelector('video');
      const go = () => film.classList.add('is-ready');
      if (!video || video.readyState >= 2) go();
      else video.addEventListener('loadeddata', go, { once: true });
      win.setTimeout(go, 700);
    }
    for (const node of film.querySelectorAll('[data-og-fade]')) win.requestAnimationFrame(() => node.classList.add('is-in'));
  }

  /* The home title is black, drawn for a bright film frame. Until a frame has actually been painted
     (slow network, a blocked video, a still film on browsers that paint nothing before play) it would be
     black on black, so the hero is marked blank and the title takes the ink colour instead. */
  function watchFrame(film) {
    const video = film.querySelector('video');
    if (!video || !film.classList.contains('og-hero')) return;
    /* a poster attribute (none exists yet; add poster="…" to the <video> when the asset is ready) also counts as a picture */
    const update = () => film.classList.toggle('is-blank', video.readyState < 2 && !video.getAttribute('poster'));
    video.addEventListener('loadeddata', update);
    video.addEventListener('emptied', update);
    video.addEventListener('error', update);
    update();
  }

  function refreshButtons() {
    const playing = allowed();
    for (const btn of doc.querySelectorAll('[data-og-motion-toggle]')) {
      btn.setAttribute('aria-pressed', playing ? 'false' : 'true');
      btn.querySelector('[data-og-motion-label]').textContent = playing ? '영상 멈춤' : '영상 재생';
    }
    doc.documentElement.dataset.ogMotion = playing ? 'on' : 'off';
  }

  function apply() {
    const playing = allowed();
    for (const film of films) {
      const screen = film.closest('[data-og-screen]');
      const on = !!screen && screen.getAttribute('data-og-screen') === activeView;
      const video = film.querySelector('video');
      if (on) reveal(film);
      if (!video) continue;
      if (on && playing) play(video);
      else {
        if (on) {
          /* still frame: fetch just enough to paint the first picture */
          prepare(video);
          video.preload = 'metadata';
        }
        still(video);
      }
    }
    refreshButtons();
  }

  for (const film of films) {
    if (!film.querySelector('video')) continue;
    watchFrame(film);
    film.append(
      el(
        'button',
        {
          type: 'button',
          class: 'og-motion og-liquid-glass',
          'data-og-motion-toggle': true,
          'aria-pressed': 'false',
          onclick: () => {
            setMotion(allowed() ? 'off' : 'on');
            apply();
          },
        },
        el('span', { 'data-og-motion-label': true, text: '영상 멈춤' })
      )
    );
  }

  if (typeof reduceQuery.addEventListener === 'function') reduceQuery.addEventListener('change', apply);
  doc.addEventListener('visibilitychange', () => {
    if (doc.visibilityState === 'visible') apply();
  });

  return Object.freeze({
    show(view) {
      activeView = view;
      apply();
    },
    apply,
  });
}
