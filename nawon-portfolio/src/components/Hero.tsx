import { ArrowUpRight } from "lucide-react";
import { t } from "../copy";
import { publicUrl } from "../data";
import { FadeIn } from "./FadeIn";
import { Magnet } from "./Magnet";

export function Hero() {
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

        <FadeIn delay={0.4} y={30} className="absolute inset-x-0 bottom-0 top-[calc(0.35rem+9.6vw)] z-10 flex justify-center sm:top-[calc(0.4rem+11vw)] lg:top-[calc(0.45rem+12.8vw)]">
          <Magnet className="flex h-full items-start justify-center">
            <img
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
