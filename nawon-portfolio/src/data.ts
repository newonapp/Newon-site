import { t } from "./copy";

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

export const projects: Project[] = [
  {
    id: "apps",
    number: "01",
    name: t.projects[0].name,
    type: t.projects[0].type,
    summary: t.projects[0].summary,
    slogan: t.projects[0].slogan,
    lead: t.projects[0].lead,
    role: t.role,
    href: "/ko/apps/",
    images: [businessFilms[0].src],
    alts: [businessFilms[0].alt],
  },
  {
    id: "ai",
    number: "02",
    name: t.projects[1].name,
    type: t.projects[1].type,
    summary: t.projects[1].summary,
    slogan: t.projects[1].slogan,
    lead: t.projects[1].lead,
    role: t.role,
    href: "/ko/ai/",
    images: [businessFilms[1].src],
    alts: [businessFilms[1].alt],
  },
  {
    id: "livon",
    number: "03",
    name: t.projects[2].name,
    type: t.projects[2].type,
    summary: t.projects[2].summary,
    slogan: t.projects[2].slogan,
    lead: t.projects[2].lead,
    role: t.role,
    href: "/ko/lifestage/",
    images: [businessFilms[2].src],
    alts: [businessFilms[2].alt],
  },
  {
    id: "ongil",
    number: "04",
    name: t.projects[3].name,
    type: t.projects[3].type,
    summary: t.projects[3].summary,
    slogan: t.projects[3].slogan,
    lead: t.projects[3].lead,
    role: t.role,
    href: "/ko/ongil/",
    images: [businessFilms[3].src],
    alts: [businessFilms[3].alt],
  },
  {
    id: "business",
    number: "05",
    name: t.projects[4].name,
    type: t.projects[4].type,
    summary: t.projects[4].summary,
    slogan: t.projects[4].slogan,
    lead: t.projects[4].lead,
    role: t.role,
    href: "/ko/business/",
    images: [businessFilms[4].src],
    alts: [businessFilms[4].alt],
  },
  {
    id: "studio",
    number: "06",
    name: t.projects[5].name,
    type: t.projects[5].type,
    summary: t.projects[5].summary,
    slogan: t.projects[5].slogan,
    lead: t.projects[5].lead,
    role: t.role,
    href: "/ko/studio/",
    images: [businessFilms[5].src],
    alts: [businessFilms[5].alt],
  },
  {
    id: "games",
    number: "07",
    name: t.projects[6].name,
    type: t.projects[6].type,
    summary: t.projects[6].summary,
    slogan: t.projects[6].slogan,
    lead: t.projects[6].lead,
    role: t.role,
    href: "/ko/games/",
    images: [businessFilms[6].src],
    alts: [businessFilms[6].alt],
  },
];

export const services = t.services;

export const aboutText = t.aboutText;
