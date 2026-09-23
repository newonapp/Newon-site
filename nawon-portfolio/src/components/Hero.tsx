import { useLayoutEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { t } from "../copy";
import { publicUrl } from "../data";
import { FadeIn } from "./FadeIn";
import { Magnet } from "./Magnet";

function placeSideWords(img: HTMLImageElement, ceo: HTMLSpanElement, developer: HTMLSpanElement) {
  const box = ceo.offsetParent as HTMLElement | null;
  if (!box || !img.complete || !img.naturalWidth) return;
  const ir = img.getBoundingClientRect();
  const br = box.getBoundingClientRect();
  if (ir.width < 2 || ir.height < 2 || br.width < 2) return;

  const scale = Math.min(1, 560 / ir.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(ir.width * scale));
  canvas.height = Math.max(1, Math.round(ir.height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const edgesAt = (offset: number) => {
    const y = Math.max(0, Math.min(canvas.height - 1, Math.round((br.top + offset - ir.top) * scale)));
    const row = ctx.getImageData(0, y, canvas.width, 1).data;
    let hairL = -1;
    let hairR = -1;
    for (let x = 0; x < canvas.width; x += 1) {
      if (row[x * 4 + 3] > 28) {
        if (hairL < 0) hairL = x;
        hairR = x;
      }
    }
    if (hairL < 0 || hairR < 0) return null;
    return {
      headL: ir.left - br.left + hairL / scale,
      headR: ir.left - br.left + hairR / scale,
    };
  };

  const edges = edgesAt(22) || edgesAt(48) || edgesAt(8);
  const headL = edges ? edges.headL : 0;
  const headR = edges ? edges.headR : br.width;
  const leftGap = headL;
  const rightGap = br.width - headR;
  const gap = Math.min(leftGap, rightGap);

  const probe = parseFloat(getComputedStyle(developer).fontSize) || 32;
  const ratio = developer.getBoundingClientRect().width / probe;
  if (!Number.isFinite(ratio) || ratio < 2) return;

  if (gap < 72) {
    const fallback = Math.max(15, Math.min(22, (br.width * 0.46) / ratio));
    ceo.style.fontSize = `${fallback}px`;
    developer.style.fontSize = `${fallback}px`;
    const ceoW = ceo.getBoundingClientRect().width;
    const devW = developer.getBoundingClientRect().width;
    const margin = 12;
    ceo.style.left = `${margin + ceoW / 2}px`;
    developer.style.left = `${br.width - margin - devW / 2}px`;
    return;
  }

  const size = Math.min(Math.max((gap * 0.7) / ratio, 18), br.width * 0.056);
  const leftCenter = leftGap / 2;
  const rightCenter = headR + rightGap / 2;
  ceo.style.fontSize = `${size}px`;
  developer.style.fontSize = `${size}px`;
  ceo.style.left = `${leftCenter}px`;
  developer.style.left = `${rightCenter}px`;
}

export function Hero() {
  const imgRef = useRef<HTMLImageElement>(null);
  const ceoRef = useRef<HTMLSpanElement>(null);
  const developerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const img = imgRef.current;
    const ceo = ceoRef.current;
    const developer = developerRef.current;
    if (!img || !ceo || !developer) return;

    const place = () => placeSideWords(img, ceo, developer);
    place();
    img.addEventListener("load", place);
    const view = img.ownerDocument.defaultView || window;
    view.addEventListener("resize", place);
    const observer = new ResizeObserver(place);
    observer.observe(img);
    const header = img.closest("header");
    if (header) observer.observe(header);
    return () => {
      img.removeEventListener("load", place);
      view.removeEventListener("resize", place);
      observer.disconnect();
    };
  }, []);

  return (
    <header className="relative flex h-[100svh] flex-col overflow-x-clip">
      <div className="relative min-h-0 flex-1">
        <FadeIn delay={0.15} y={40} className="pointer-events-none absolute inset-x-0 top-1 z-20 overflow-hidden px-2 sm:top-2">
          <h1
            className="hero-title w-full whitespace-nowrap text-center text-[9.2vw] font-black uppercase leading-none tracking-tight sm:text-[10.6vw] lg:text-[12.4vw]"
          >
            {t.heroTitle}
          </h1>
        </FadeIn>

        <FadeIn delay={0.28} y={24} className="pointer-events-none absolute inset-x-0 top-[27%] z-20 h-0 sm:top-[25%] lg:top-[23%]">
          <span
            ref={ceoRef}
            className="hero-title absolute top-0 -translate-x-1/2 whitespace-nowrap text-[clamp(1.35rem,4.6vw,3.6rem)] font-black uppercase leading-none tracking-tight"
            style={{ left: "18%" }}
          >
            CEO
          </span>
          <span
            ref={developerRef}
            className="hero-title absolute top-0 -translate-x-1/2 whitespace-nowrap text-[clamp(1.35rem,4.6vw,3.6rem)] font-black uppercase leading-none tracking-tight"
            style={{ left: "82%" }}
          >
            DEVELOPER
          </span>
        </FadeIn>

        <FadeIn delay={0.4} y={30} className="absolute inset-x-0 bottom-0 top-[calc(0.35rem+9.6vw)] z-10 flex justify-center sm:top-[calc(0.4rem+11vw)] lg:top-[calc(0.45rem+12.8vw)]">
          <Magnet className="flex h-full items-start justify-center">
            <img
              ref={imgRef}
              src={publicUrl("nawon-cutout.png?v=shirt")}
              alt={t.portraitAlt}
              width={1024}
              height={1024}
              className="h-[158%] w-auto max-w-none -translate-y-[18%] object-contain object-top"
              draggable={false}
            />
          </Magnet>
        </FadeIn>
      </div>

      <div className="pointer-events-none relative z-30 flex items-end justify-between gap-4 px-5 pb-6 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
        <FadeIn delay={0.7} y={20} className="pointer-events-auto">
          <a
            href="#projects"
            className="inline-flex rounded-full border-2 border-mist px-4 py-2.5 text-center text-[0.68rem] font-medium uppercase tracking-widest text-mist transition-colors duration-200 hover:bg-mist/10 sm:px-7 sm:py-3 sm:text-sm"
          >
            {t.viewWork}
          </a>
        </FadeIn>
        <FadeIn delay={0.7} y={20} className="pointer-events-auto">
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-mist px-4 py-2.5 text-[0.68rem] font-medium uppercase tracking-widest text-ink transition-opacity duration-200 hover:opacity-80 sm:px-7 sm:py-3 sm:text-sm"
          >
            {t.contactMe}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </FadeIn>
      </div>
    </header>
  );
}
