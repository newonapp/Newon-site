import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { t } from "../copy";
import { appLogos, businessFilms } from "../data";
import { FilmPlate } from "./Film";

function Row({
  offset,
  direction,
  children,
}: {
  offset: number;
  direction: 1 | -1;
  children: ReactNode;
}) {
  const x = direction === 1 ? offset - 200 : -(offset - 200);
  return (
    <div className="overflow-hidden">
      <div className="flex w-max gap-3" style={{ transform: `translateX(${x}px)`, willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}

export function Marquee() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const onScroll = () => {
      const node = ref.current;
      if (!node) return;
      const top = node.getBoundingClientRect().top + window.scrollY;
      setOffset((window.scrollY - top + window.innerHeight) * 0.3);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduce]);

  const wordmarks = [
    ["Newon", "App"],
    ["Newon AI"],
    ["LivOn"],
    ["Ongil"],
    ["Newon Business"],
    ["Newon Studio"],
    ["404:", "HUMAN"],
  ];
  const films = [...businessFilms, ...businessFilms];
  const logos = [...appLogos, ...appLogos, ...appLogos];
  const motion = reduce ? 0 : offset;

  return (
    <section ref={ref} aria-label={t.selectedWork} className="overflow-hidden bg-ink pb-10 pt-24 sm:pt-32 md:pt-40">
      <p className="px-6 pb-6 text-sm font-medium uppercase tracking-[0.28em] text-mist/70 md:px-10">{t.selectedWork}</p>
      <div className="flex flex-col gap-3">
        <Row offset={motion} direction={1}>
          {films.map((film, index) => {
            const copy = t.projects[index % t.projects.length];
            return (
              <FilmPlate
                key={`${film.alt}-${index}`}
                src={film.src}
                label={`${wordmarks[index % wordmarks.length].join(" ")} ${copy.slogan.join(" ")}`}
                wordmark={wordmarks[index % wordmarks.length]}
                slogan={copy.slogan}
                className="h-[210px] w-[340px] shrink-0 rounded-2xl bg-ink sm:h-[260px] sm:w-[440px] md:h-[300px] md:w-[520px]"
              />
            );
          })}
        </Row>
        <Row offset={motion} direction={-1}>
          {logos.map((logo, index) => (
            <div
              key={`${logo.alt}-${index}`}
              className="flex h-[140px] w-[140px] shrink-0 items-center justify-center rounded-2xl bg-white sm:h-[168px] sm:w-[168px]"
            >
              <img src={logo.src} alt={logo.alt} width={72} height={72} className="h-16 w-16 object-contain" loading="lazy" />
            </div>
          ))}
        </Row>
      </div>
    </section>
  );
}
