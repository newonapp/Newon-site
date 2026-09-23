import { t } from "../copy";
import { aboutText } from "../data";
import { AnimatedText } from "./AnimatedText";
import { FadeIn } from "./FadeIn";

export function About() {
  return (
    <section id="about" className="flex min-h-screen items-center px-5 py-20 sm:px-8 md:px-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <FadeIn y={40}>
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight"
            style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
          >
            {t.aboutHeading}
          </h2>
        </FadeIn>
        <AnimatedText
          text={aboutText}
          className="mt-10 max-w-[560px] text-center font-medium leading-relaxed text-mist sm:mt-14 md:mt-16"
          style={{ fontSize: "clamp(1rem, 2vw, 1.35rem)" }}
        />
        <FadeIn delay={0.2} className="mt-16 sm:mt-20 md:mt-24">
          <a
            href="#contact"
            className="inline-flex rounded-full bg-mist px-8 py-3 text-sm font-medium uppercase tracking-widest text-ink transition-opacity duration-200 hover:opacity-80 sm:px-10 sm:py-3.5"
          >
            {t.contactMe}
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
