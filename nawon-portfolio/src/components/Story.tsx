import { isKo, t } from "../copy";
import { FadeIn } from "./FadeIn";

export function Story() {
  return (
    <section className="relative z-10 -mt-10 rounded-t-[40px] bg-ink px-5 pb-8 pt-20 text-mist sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <h2
          className="hero-heading text-center font-black uppercase leading-none tracking-tight"
          style={{ fontSize: "clamp(2.6rem, 10vw, 120px)" }}
        >
          {t.numbersHeading}
        </h2>
        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:mt-16 lg:grid-cols-4">
          {t.stats.map((item, index) => (
            <FadeIn as="div" key={item.label} delay={index * 0.08} y={24}>
              <dt className={`text-sm ${isKo ? "tracking-normal" : "uppercase tracking-[0.18em]"} text-mist/55`}>{item.label}</dt>
              <dd className="mt-2 font-black leading-none" style={{ fontSize: "clamp(3rem, 7vw, 88px)" }}>
                {item.value}
              </dd>
              <dd className="mt-3 max-w-[16rem] text-sm font-light leading-relaxed text-mist/70 sm:text-base">{item.note}</dd>
            </FadeIn>
          ))}
        </dl>

        <h2
          className="hero-heading mt-24 text-center font-black uppercase leading-none tracking-tight sm:mt-32"
          style={{ fontSize: "clamp(2.6rem, 10vw, 120px)" }}
        >
          {t.processHeading}
        </h2>
        <ol className="mt-12 grid grid-cols-2 gap-4 sm:mt-16 sm:grid-cols-4 lg:grid-cols-7">
          {t.process.map((step, index) => (
            <FadeIn as="li" key={step.title} delay={index * 0.05} y={20} className="border-t border-mist/20 pt-4">
              <span className="text-xs tracking-[0.16em] text-mist/45">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-lg font-medium uppercase leading-tight sm:text-xl">{step.title}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-mist/70">{step.body}</p>
            </FadeIn>
          ))}
        </ol>
        <FadeIn className="mx-auto mt-12 max-w-3xl text-center sm:mt-16">
          <p className="text-xl font-medium leading-snug sm:text-2xl">{t.workflowTitle}</p>
          <p className="mt-4 text-sm font-light leading-relaxed text-mist/70 sm:text-base">{t.workflowBody}</p>
        </FadeIn>

        <h2
          className="hero-heading mt-24 text-center font-black uppercase leading-none tracking-tight sm:mt-32"
          style={{ fontSize: "clamp(2.6rem, 10vw, 120px)" }}
        >
          {t.principlesHeading}
        </h2>
        <ol className="mx-auto mt-12 max-w-4xl sm:mt-16">
          {t.principles.map((item, index) => (
            <FadeIn
              as="li"
              key={item.n}
              delay={index * 0.06}
              y={18}
              className="grid gap-3 border-t border-mist/20 py-6 sm:grid-cols-[4.5rem_1fr] sm:gap-8 sm:py-8"
            >
              <span className="text-sm tracking-[0.16em] text-mist/45">{item.n}</span>
              <div>
                <h3 className={`text-xl font-medium sm:text-2xl ${isKo ? "" : "uppercase"}`}>{item.title}</h3>
                <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-mist/70 sm:text-base">{item.body}</p>
              </div>
            </FadeIn>
          ))}
        </ol>
      </div>
    </section>
  );
}
