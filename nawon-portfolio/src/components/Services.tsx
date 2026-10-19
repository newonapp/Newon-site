import { isKo, type PanelItem } from "../copy";
import { FadeIn } from "./FadeIn";

/** White numbered panel (the former "What I do" section), reused for Overview and Highlights. */
export function Services({
  id,
  heading,
  title,
  lead,
  items,
}: {
  id: string;
  heading: string;
  title: string;
  lead: string;
  items: PanelItem[];
}) {
  return (
    <section
      id={id}
      className="rounded-t-[40px] bg-white px-5 py-20 text-ink sm:rounded-t-[50px] sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <h2
        className="mb-16 text-center font-black uppercase leading-none sm:mb-20 md:mb-28"
        style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
      >
        {heading}
      </h2>
      <FadeIn y={24} className="mx-auto max-w-5xl pb-2">
        <h3 className="font-medium" style={{ fontSize: "clamp(1rem, 2.2vw, 2.1rem)" }}>
          {title}
        </h3>
        <p
          className="mt-2 max-w-2xl font-light leading-relaxed opacity-60"
          style={{ fontSize: "clamp(0.85rem, 1.6vw, 1.25rem)" }}
        >
          {lead}
        </p>
      </FadeIn>
      <ol className="mx-auto max-w-5xl">
        {items.map((item, index) => (
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
              {item.body.map((line) => (
                <p
                  key={line}
                  className="mt-2 max-w-2xl font-light leading-relaxed opacity-60"
                  style={{ fontSize: "clamp(0.85rem, 1.6vw, 1.25rem)" }}
                >
                  {line}
                </p>
              ))}
              {item.link ? (
                <p
                  className="mt-2 max-w-2xl font-light leading-relaxed opacity-60"
                  style={{ fontSize: "clamp(0.85rem, 1.6vw, 1.25rem)" }}
                >
                  <a href={item.link.href} target="_top" className="underline-offset-4 hover:underline">
                    {item.link.label}
                  </a>
                </p>
              ) : null}
            </div>
          </FadeIn>
        ))}
      </ol>
    </section>
  );
}
