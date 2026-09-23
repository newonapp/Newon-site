import { isKo, t } from "../copy";
import { services } from "../data";
import { FadeIn } from "./FadeIn";

export function Services() {
  return (
    <section
      id="services"
      className="rounded-t-[40px] bg-white px-5 py-20 text-ink sm:rounded-t-[50px] sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <h2
        className="mb-16 text-center font-black uppercase leading-none sm:mb-20 md:mb-28"
        style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
      >
        {t.servicesHeading}
      </h2>
      <ol className="mx-auto max-w-5xl">
        {services.map((item, index) => (
          <FadeIn
            as="li"
            key={item.number}
            delay={index * 0.1}
            y={24}
            className="grid items-end gap-4 border-t py-8 sm:grid-cols-[auto_1fr] sm:gap-10 sm:py-10 md:py-12"
            style={{ borderColor: "rgba(12, 12, 12, 0.15)" }}
          >
            <span className="font-black leading-none" style={{ fontSize: "clamp(3rem, 10vw, 140px)" }}>
              {item.number}
            </span>
            <div className="pb-2">
              <h3 className={`font-medium ${isKo ? "" : "uppercase"}`} style={{ fontSize: "clamp(1rem, 2.2vw, 2.1rem)" }}>
                {item.name}
              </h3>
              <p
                className="mt-2 max-w-2xl font-light leading-relaxed opacity-60"
                style={{ fontSize: "clamp(0.85rem, 1.6vw, 1.25rem)" }}
              >
                {item.body}
              </p>
            </div>
          </FadeIn>
        ))}
      </ol>
    </section>
  );
}
