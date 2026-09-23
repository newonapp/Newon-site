import { isKo, t } from "../copy";

export function Contact() {
  return (
    <section id="contact" className="bg-ink px-5 py-24 sm:px-8 md:px-10 md:py-32">
      <div className="mx-auto max-w-5xl">
        <h2
          className="hero-heading font-black uppercase leading-[0.9] tracking-tight"
          style={{ fontSize: "clamp(3rem, 11vw, 148px)" }}
        >
          {t.contactHeading}
        </h2>
        <p className="mt-8 max-w-md text-lg font-light leading-snug text-mist sm:text-2xl">
          {t.contactLead}
          <br />
          {t.contactTalk}
        </p>
        <a
          href="mailto:newon@newon.app"
          className="mt-10 inline-flex rounded-full bg-mist px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-ink transition-opacity duration-200 hover:opacity-80 sm:px-12 sm:py-4 sm:text-base"
        >
          {t.contactMe}
        </a>
        <p className="mt-6 text-base text-mist/80">
          <a href="mailto:newon@newon.app" className="underline-offset-4 hover:underline">
            newon@newon.app
          </a>
        </p>
        <ul className={`mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist/70 ${isKo ? "tracking-normal" : "uppercase tracking-widest"}`}>
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
