#!/usr/bin/env node
/**
 * Adds the PETLOG business-row mega-menu keys (nav.petlog*) to locales/*.json. Only these keys are touched.
 * Review status: ko source, en meaning-checked; ja/es/pt-br/fr/de/hi/id are UNREVIEWED Claude translation
 * candidates. Menu titles keep the English section names (Overview, Platform…) in every locale except ko,
 * matching the PETLOG page eyebrows.
 * Run: node scripts/apply-petlog-nav-locales.mjs   (idempotent)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PETLOG_NAV_REVIEW = { ko: "source", en: "meaning checked", ja: "UNREVIEWED", es: "UNREVIEWED", "pt-br": "UNREVIEWED", fr: "UNREVIEWED", de: "UNREVIEWED", hi: "UNREVIEWED", id: "UNREVIEWED" };

const KEYS = [
  "petlogMenuLabel", "petlogMenuLead", "petlogExploreCta",
  "petlogMenuOverview", "petlogMenuOverviewDesc", "petlogMenuPlatform", "petlogMenuPlatformDesc",
  "petlogMenuBusiness", "petlogMenuBusinessDesc", "petlogMenuPartnerships", "petlogMenuPartnershipsDesc",
  "petlogMenuContact", "petlogMenuContactDesc",
];
const EN_TITLES = ["Overview", "Platform", "Business", "Partnerships", "Contact"];
const T = {
  ko: ["PETLOG", "종합 반려생활 플랫폼", "PETLOG 알아보기 →", "소개", "반려동물의 모든 순간을, 하나의 연결로", "서비스", "기록부터 쇼핑과 돌봄까지 18개 영역", "비즈니스", "반려생활 산업을 잇는 20개 사업군", "파트너십", "함께할 14개 파트너 유형", "문의", "PETLOG와 함께할 가능성"],
  en: ["PETLOG", "All-in-one pet life platform", "Explore PETLOG →", ...[["Every moment with your pet, connected"], ["18 areas from records to shopping and care"], ["20 lines across the pet industry"], ["14 kinds of partners"], ["Talk to PETLOG"]].flatMap((d, i) => [EN_TITLES[i], d[0]])],
  ja: ["PETLOG", "総合ペットライフプラットフォーム", "PETLOGを見る →", ...["ペットとのすべての瞬間を、ひとつのつながりに", "記録からショッピング、ケアまで18の領域", "ペット産業をつなぐ20の事業", "14タイプのパートナー", "PETLOGへのお問い合わせ"].flatMap((d, i) => [EN_TITLES[i], d])],
  es: ["PETLOG", "Plataforma integral para la vida con mascotas", "Ver PETLOG →", ...["Cada momento con tu mascota, conectado", "18 áreas, de los registros a las compras y el cuidado", "20 líneas de negocio del sector mascotas", "14 tipos de socios", "Habla con PETLOG"].flatMap((d, i) => [EN_TITLES[i], d])],
  "pt-br": ["PETLOG", "Plataforma completa para a vida com pets", "Ver PETLOG →", ...["Cada momento com seu pet, conectado", "18 áreas, dos registros às compras e cuidados", "20 linhas de negócio do setor pet", "14 tipos de parceiros", "Fale com o PETLOG"].flatMap((d, i) => [EN_TITLES[i], d])],
  fr: ["PETLOG", "Plateforme complète de la vie avec un animal", "Découvrir PETLOG →", ...["Chaque moment avec votre animal, relié", "18 domaines, du suivi aux achats et aux soins", "20 activités du secteur animalier", "14 types de partenaires", "Contacter PETLOG"].flatMap((d, i) => [EN_TITLES[i], d])],
  de: ["PETLOG", "Komplettplattform für das Leben mit Haustieren", "PETLOG ansehen →", ...["Jeder Moment mit Ihrem Tier, verbunden", "18 Bereiche von Aufzeichnungen bis Einkauf und Pflege", "20 Geschäftsfelder der Heimtierbranche", "14 Arten von Partnern", "PETLOG kontaktieren"].flatMap((d, i) => [EN_TITLES[i], d])],
  hi: ["PETLOG", "पालतू जीवन का संपूर्ण प्लेटफ़ॉर्म", "PETLOG देखें →", ...["पालतू के साथ हर पल, एक जुड़ाव में", "रिकॉर्ड से खरीदारी और देखभाल तक 18 क्षेत्र", "पालतू उद्योग की 20 व्यवसाय शाखाएँ", "14 प्रकार के साझेदार", "PETLOG से संपर्क करें"].flatMap((d, i) => [EN_TITLES[i], d])],
  id: ["PETLOG", "Platform lengkap kehidupan hewan peliharaan", "Lihat PETLOG →", ...["Setiap momen bersama hewan peliharaan, terhubung", "18 area dari catatan hingga belanja dan perawatan", "20 lini bisnis industri hewan peliharaan", "14 jenis mitra", "Hubungi PETLOG"].flatMap((d, i) => [EN_TITLES[i], d])],
};

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const [lang, arr] of Object.entries(T)) {
    if (arr.length !== KEYS.length) throw new Error(`${lang}: ${arr.length} strings, expected ${KEYS.length}`);
    const file = path.join(ROOT, "locales", `${lang}.json`);
    const raw = fs.readFileSync(file, "utf8");
    const data = JSON.parse(raw);
    data.nav = data.nav || {};
    KEYS.forEach((k, i) => (data.nav[k] = arr[i]));
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
  }
  console.log(`apply-petlog-nav-locales: ${KEYS.length} keys × ${Object.keys(T).length} locales`);
}
