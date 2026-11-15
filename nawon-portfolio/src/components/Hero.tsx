import { useCallback, useEffect, useRef, useState } from "react";
import { t } from "../copy";

/**
 * 01 · HERO — "NEW · pill · ON".
 * The page opens on white with NEWON and a hairline between W and O. The line opens into a slit,
 * a circle, then a wide pill that pushes "NEW" and "ON" apart and shows a looping island film.
 * Paper and white lines fade in behind, the inner nav drops in and the footer rises.
 * One 2.1 s Web Animations timeline; "Let's Go" plays it in reverse and opens it again.
 * Phones (≤ 720 px) stack NEW / pill / ON and open the pill vertically.
 */

const VIDEO = "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/175fbbcd-e50a-480c-bab2-ca16d4678322.mp4";
const POSTER = "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/726b168c-da47-4682-a255-cc3e02f89bae.jpg";
const DURATION = 2100;
const PHONE = "(max-width: 720px)";

type Kf = Keyframe[];

/** Gentle S-curves sweeping up and to the right (deterministic, viewBox 1000 × 600). */
const LINES = Array.from({ length: 15 }, (_, i) => {
  const y = 90 + i * 42;
  const lift = 150 + ((i * 37) % 90);
  const w = 1.2 + ((i * 7) % 10) * 0.3;
  const o = 0.55 + ((i * 3) % 7) * 0.05;
  return { d: `M -60 ${y + 120} C 220 ${y + 150}, 420 ${y - 40}, 600 ${y - lift * 0.55} S 900 ${y - lift - 40}, 1080 ${y - lift - 120}`, w, o };
});

function timelines(phone: boolean, pillHeight: number): { pill: Kf; clip: Kf; row: Kf } {
  if (phone) {
    const h = pillHeight;
    return {
      pill: [
        { height: "1.5px", offset: 0 },
        { height: "1.5px", offset: 0.14, easing: "cubic-bezier(.5,0,.3,1)" },
        { height: `${h * 0.1}px`, offset: 0.3, easing: "cubic-bezier(.45,0,.3,1)" },
        { height: `${h * 0.55}px`, offset: 0.58, easing: "cubic-bezier(.4,0,.2,1)" },
        { height: `${h}px`, offset: 1 },
      ],
      clip: [
        { clipPath: "inset(0 50%)", offset: 0 },
        { clipPath: "inset(0 0%)", offset: 0.14 },
        { clipPath: "inset(0 0%)", offset: 1 },
      ],
      row: [
        { rowGap: "0.03em", offset: 0 },
        { rowGap: "0.03em", offset: 0.14 },
        { rowGap: "0.06em", offset: 0.58 },
        { rowGap: "0.1em", offset: 1 },
      ],
    };
  }
  return {
    pill: [
      { width: "0.012em", offset: 0 },
      { width: "0.012em", offset: 0.14, easing: "cubic-bezier(.5,0,.3,1)" },
      { width: "0.16em", offset: 0.3, easing: "cubic-bezier(.45,0,.3,1)" },
      { width: "1.81em", offset: 0.58, easing: "cubic-bezier(.4,0,.2,1)" },
      { width: "3.62em", offset: 1 },
    ],
    clip: [
      { clipPath: "inset(50% 0)", offset: 0 },
      { clipPath: "inset(0% 0)", offset: 0.14 },
      { clipPath: "inset(0% 0)", offset: 1 },
    ],
    row: [
      { columnGap: "0.026em", offset: 0 },
      { columnGap: "0.026em", offset: 0.14 },
      { columnGap: "0.05em", offset: 0.58 },
      { columnGap: "0.085em", offset: 1 },
    ],
  };
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const anims = useRef<Animation[]>([]);
  const busy = useRef(false);
  const [sound, setSound] = useState(false);

  const build = useCallback(() => {
    const el = root.current;
    if (!el) return;
    anims.current.forEach((a) => a.cancel());
    anims.current = [];
    const q = <T extends Element>(s: string) => el.querySelector(s) as T;
    const phone = window.matchMedia(PHONE).matches;
    const pill = q<HTMLElement>(".wh-pill");
    // Phones: width ÷ 1.85, capped on short screens so the word never meets the footer.
    const pillHeight = phone ? Math.min(pill.parentElement!.clientWidth / 1.85, window.innerHeight * 0.24) : 0;
    el.style.setProperty("--pill-h", `${pillHeight}px`);
    const tl = timelines(phone, pillHeight);
    const opts: KeyframeAnimationOptions = { duration: DURATION, fill: "both", easing: "linear" };
    const add = (target: Element | null, kf: Kf) => target && anims.current.push(target.animate(kf, opts));

    add(pill, tl.pill);
    add(pill, tl.clip);
    add(q(".wh-row"), tl.row);
    add(q(".wh-hair"), [{ opacity: 1, offset: 0 }, { opacity: 1, offset: 0.14 }, { opacity: 0, offset: 0.3 }, { opacity: 0, offset: 1 }]);
    add(q(".wh-bg"), [{ opacity: 0, offset: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1, offset: 0.78 }, { opacity: 1, offset: 1 }]);
    add(q(".wh-nav"), [
      { transform: "translateY(-140%)", opacity: 0, offset: 0 },
      { transform: "translateY(-140%)", opacity: 0, offset: 0.5, easing: "cubic-bezier(.2,.8,.2,1)" },
      { transform: "translateY(0)", opacity: 1, offset: 0.86 },
      { transform: "translateY(0)", opacity: 1, offset: 1 },
    ]);
    add(q(".wh-foot"), [
      { transform: "translateY(160%)", opacity: 0, offset: 0 },
      { transform: "translateY(160%)", opacity: 0, offset: 0.52, easing: "cubic-bezier(.2,.8,.2,1)" },
      { transform: "translateY(0)", opacity: 1, offset: 0.9 },
      { transform: "translateY(0)", opacity: 1, offset: 1 },
    ]);
    add(q(".wh-rule"), [
      { transform: "scaleX(0)", offset: 0 },
      { transform: "scaleX(0)", offset: 0.4, easing: "cubic-bezier(.4,0,.2,1)" },
      { transform: "scaleX(1)", offset: 0.95 },
      { transform: "scaleX(1)", offset: 1 },
    ]);
    el.querySelectorAll(".wh-icon").forEach((icon) =>
      add(icon, [{ opacity: 0, offset: 0 }, { opacity: 0, offset: 0.8 }, { opacity: 0.85, offset: 1 }]),
    );
    return anims.current;
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const video = el.querySelector("video");
    const rec = new URLSearchParams(window.location.search).get("rec") === "1";

    if (reduce) {
      // Final state, film paused on its poster.
      const list = build();
      list?.forEach((a) => a.finish());
      video?.pause();
      el.dataset.ready = "true";
      return;
    }

    let cancelled = false;
    let recTimer = 0;
    const start = () => {
      if (cancelled) return;
      const list = build();
      el.dataset.ready = "true";
      list?.forEach((a) => {
        a.currentTime = 0;
        a.play();
      });
      if (rec) {
        recTimer = window.setTimeout(() => anims.current.forEach((a) => a.reverse()), 4900);
      }
    };
    // Start once the type is ready so the word does not reflow mid-animation.
    const ready = document.fonts?.ready ?? Promise.resolve();
    Promise.race([ready, new Promise((r) => setTimeout(r, 1500))]).then(start);

    if (rec && video) {
      (window as unknown as { __recVideo: (t: number) => number }).__recVideo = (t: number) => {
        const d = video.duration || 4.25;
        const v = (t % d) + 1 / 120;
        video.currentTime = v;
        return v;
      };
    }

    // Resize: finish anything running and rebuild at the new size (final state).
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (busy.current) busy.current = false;
        const list = build();
        list?.forEach((a) => a.finish());
      });
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.clearTimeout(recTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      anims.current.forEach((a) => a.cancel());
    };
  }, [build]);

  // "Let's Go": collapse to the hairline with everything leaving, then open again.
  const replay = useCallback(async () => {
    if (busy.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    busy.current = true;
    const list = anims.current;
    list.forEach((a) => {
      a.finish();
      a.playbackRate = -1;
      a.play();
    });
    await Promise.all(list.map((a) => a.finished.catch(() => undefined)));
    if (!busy.current) return;
    list.forEach((a) => {
      a.playbackRate = 1;
      a.currentTime = 0;
      a.play();
    });
    await Promise.all(list.map((a) => a.finished.catch(() => undefined)));
    busy.current = false;
  }, []);

  const h = t.hero;
  return (
    <header ref={root} className="wh" data-ready="false">
      <div className="wh-bg" aria-hidden="true">
        <svg viewBox="0 0 1000 600" preserveAspectRatio="none">
          {LINES.map((l, i) => (
            <path key={i} d={l.d} fill="none" stroke="#fff" strokeWidth={l.w} strokeOpacity={l.o} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>

      <nav className="wh-nav" aria-label={h.navLabel}>
        <ul>
          {h.nav.map((n) => (
            <li key={n.label}>
              <a href={n.href} target={n.top ? "_top" : undefined}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <ul className="wh-social">
          <li>
            <a href="https://www.instagram.com/newon.app" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </li>
          <li>
            <a href="https://www.threads.com/@newon.app.dev" target="_blank" rel="noopener noreferrer">
              Threads
            </a>
          </li>
        </ul>
      </nav>

      <div className="wh-stage">
        <h1 className="sr-only">NEWON</h1>
        <div className="wh-row">
          <span className="wh-part" aria-hidden="true">
            NEW
          </span>
          <span className="wh-pill">
            <video className="wh-video" src={VIDEO} poster={POSTER} muted loop playsInline autoPlay preload="auto" aria-hidden="true" />
            <span className="wh-hair" aria-hidden="true" />
            <svg className="wh-icon wh-icon--breeze" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M3 8h10a3 3 0 1 0-3-3" />
              <path d="M3 12h15a3 3 0 1 1-3 3" />
              <path d="M3 16h7" />
            </svg>
            <button type="button" className="wh-icon wh-sound" aria-pressed={sound} aria-label={h.soundLabel} onClick={() => setSound((v) => !v)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
                {sound ? (
                  <>
                    <path d="M15.5 9a4 4 0 0 1 0 6" />
                    <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
                  </>
                ) : (
                  <path d="M16 10l4 4M20 10l-4 4" />
                )}
              </svg>
            </button>
          </span>
          <span className="wh-part" aria-hidden="true">
            ON
          </span>
        </div>
      </div>

      <footer className="wh-foot">
        <p className="wh-copy">{h.copy}</p>
        <span className="wh-rule" aria-hidden="true" />
        <button type="button" className="wh-cta" onClick={replay}>
          {h.cta}
        </button>
      </footer>
    </header>
  );
}
