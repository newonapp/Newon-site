import { isKo, t } from "../copy";

/** Closing section (former contact block): Explore NEWON CTAs, company email and channels. */
export function Contact() {
  return (
    <section id="contact" className="bg-ink px-5 py-24 sm:px-8 md:px-10 md:py-32">
      <div className="mx-auto max-w-5xl">
        <h2
          className="hero-heading font-black uppercase leading-[0.9] tracking-tight"
          style={{ fontSize: "clamp(3rem, 11vw, 148px)" }}
        >
          {t.exploreHeading}
        </h2>
        <p className={isKo ? "mt-8 max-w-3xl text-2xl font-light leading-snug text-mist sm:text-4xl" : "mt-8 max-w-md text-lg font-light leading-snug text-mist sm:text-2xl"}>
          {t.exploreLead}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          {t.exploreCtas.map((cta) => (
            <a
              key={cta.href}
              href={cta.href}
              target="_top"
              className="inline-flex rounded-full bg-mist px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-ink transition-opacity duration-200 hover:opacity-80 sm:px-12 sm:py-4 sm:text-base"
            >
              {cta.label}
            </a>
          ))}
        </div>
        <p className="mt-6 text-base text-mist/80">
          <a href="mailto:newon@newon.app" className="underline-offset-4 hover:underline">
            newon@newon.app
          </a>
        </p>
        <ul className={`mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist/70 ${isKo ? "tracking-normal" : "uppercase tracking-widest"}`}>
          <li>
            <a href="https://www.newon.app/card-n7x4k9/" target="_top" className="hover:text-mist">
              {t.card}
            </a>
          </li>
          <li>
            <a href="https://www.newon.app/ir/" target="_top" className="hover:text-mist">
              {t.ir}
            </a>
          </li>
          <li>
            <a href="https://www.threads.com/@newon.app.dev" target="_blank" rel="noopener noreferrer" className="hover:text-mist">
              Threads
            </a>
          </li>
          <li>
            <a href="https://m.blog.naver.com/newonapp" target="_blank" rel="noopener noreferrer" className="hover:text-mist">
              {t.blog}
            </a>
          </li>
          <li>
            <a href="https://www.tiktok.com/@newon.app" target="_blank" rel="noopener noreferrer" className="hover:text-mist">
              TikTok
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
