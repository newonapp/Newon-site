import { siteHref, t } from "../copy";
import { publicUrl } from "../data";
import { FadeIn } from "./FadeIn";

/**
 * The printed NEWON business card (Canva PDF, back side), shown right after the hero.
 * The card is the PDF itself converted to SVG, so type, spacing and the 3D N stay exact.
 * Transparent links sit over the phone, email and website lines.
 */
const HOTSPOTS = [
  { href: "tel:+821039238904", label: "M. 010-3923-8904", box: { left: "50.99%", top: "64.52%", width: "27.93%", height: "6.68%" } },
  { href: "mailto:newon@newon.app", label: "E. newon@newon.app", box: { left: "50.99%", top: "71.88%", width: "31.51%", height: "7.6%" } },
  { href: siteHref(""), label: "W. newon.app", box: { left: "50.82%", top: "79.18%", width: "20.96%", height: "7.6%" }, top: true },
];

export function BusinessCard() {
  return (
    <section className="bcard" aria-label={t.cardSection.label}>
      <FadeIn y={40} className="bcard__wrap">
        <figure className="bcard__card">
          <img
            src={publicUrl("newon-business-card.svg")}
            alt={t.cardSection.alt}
            width={1065}
            height={612}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          {HOTSPOTS.map((h) => (
            <a
              key={h.href}
              className="bcard__link"
              href={h.href}
              target={h.top ? "_top" : undefined}
              aria-label={h.label}
              style={h.box}
            />
          ))}
        </figure>
      </FadeIn>
    </section>
  );
}
