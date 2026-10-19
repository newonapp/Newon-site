import { siteHref, t } from "./copy";

export function publicUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

export type Project = {
  id: string;
  number: string;
  name: string;
  type: string;
  summary: string;
  slogan: string[];
  lead: string;
  role: string;
  href: string;
  cta: string;
  images: string[];
  alts: string[];
};

export type Film = {
  src: string;
  alt: string;
};

export const businessFilms: Film[] = [
  {
    src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260330_153826_e9005cf7-a1c7-4c7d-886f-fea22d644a9c.mp4",
    alt: "Apps opening film",
  },
  {
    src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260723_145606_ab143199-b593-4941-bb1b-9afca215416b.mp4",
    alt: "AI opening film",
  },
  {
    src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_102608_5fa1187d-9ac6-44fb-82ab-54376200abc0.mp4",
    alt: "LivOn opening film",
  },
  {
    src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260323_071151_38c3924f-c312-48af-a196-3fbb80e4226f.mp4",
    alt: "Ongil opening film",
  },
  {
    src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204103_f607742e-09da-4cf5-bb06-4e67b0a531de.mp4",
    alt: "Business opening film",
  },
  {
    src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_202655_a7f5aca0-2f80-4bc9-bcb5-96ac95662003.mp4",
    alt: "Studio opening film",
  },
  {
    src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_230900_ef8565a6-16eb-4fe9-98e4-4b972d3f436d.mp4",
    alt: "Games opening film",
  },
];

export const appLogos = [
  { src: "/ox-month-logo.png", alt: "OX MONTH" },
  { src: "/savy-logo.png", alt: "SAVY" },
  { src: "/goalup-logo.png", alt: "GoalUp" },
  { src: "/subping-logo.png", alt: "SubPing" },
  { src: "/babylog-logo.png", alt: "BabyLog" },
  { src: "/pillmate-logo.png", alt: "Pillmate" },
  { src: "/petlog-logo.png", alt: "PetLog" },
  { src: "/myworld-logo.png", alt: "My World" },
  { src: "/countup-logo.png", alt: "CountUp" },
  { src: "/piggyup-logo.png", alt: "PiggyUp" },
  { src: "/newon-plus-logo.png", alt: "Newon+" },
];

/** Each platform card plays the film used on that platform's own page. */
const platformFilms: Record<string, string> = {
  babylog: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_202655_a7f5aca0-2f80-4bc9-bcb5-96ac95662003.mp4",
  petlog: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204221_5339e40b-e73d-4ab0-9c65-79c18c66fd50.mp4",
  myworld: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260407_043131_ebe2f0b5-9acc-4a4f-b2c1-7297f1a3beb9.mp4",
  shareon: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4",
  livon: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_102608_5fa1187d-9ac6-44fb-82ab-54376200abc0.mp4",
  ongil: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260323_071151_38c3924f-c312-48af-a196-3fbb80e4226f.mp4",
};

export const platforms: Project[] = t.platforms.map((p, i) => ({
  id: p.id,
  number: String(i + 1).padStart(2, "0"),
  name: p.name,
  type: p.type,
  summary: p.summary,
  slogan: p.slogan,
  lead: p.lead,
  role: p.role,
  href: siteHref(`${p.id}/`),
  cta: t.platformCta,
  images: [platformFilms[p.id]],
  alts: [`${p.name} film`],
}));
