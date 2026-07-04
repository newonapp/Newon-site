#!/usr/bin/env node
/** Replace O/X MONTH & SubPing hero stats copy with app-focused descriptions. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES = path.join(__dirname, "..", "locales");

const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

const OX_GLOBAL_REACH_SUMMARY = {
  ko: "O/X 한 번의 체크로 습관을 쌓고, 월간 기록과 통계로 변화를 확인하는 습관 관리 앱입니다.",
  en: "Build habits with a simple O/X check—track your month with logs and stats in one habit app.",
  ja: "O/Xのチェックで習慣を積み重ね、月間記録と統計で変化を確認できる習慣管理アプリです。",
  es: "Crea hábitos con un simple check O/X y ve tu mes de cambio con registros y estadísticas en una sola app.",
  "pt-br":
    "Crie hábitos com um check O/X simples e veja seu mês de mudança com registros e estatísticas em um só app.",
  fr: "Construisez des habitudes avec un simple O/X et suivez votre mois grâce aux journaux et statistiques.",
  de: "Gewohnheiten mit einem einfachen O/X-Check aufbauen—Monatsprotokoll und Statistik in einer App.",
  hi: "सरल O/X चेक से आदतें बनाएँ—लॉग और आँकड़ों से महीने का बदलाव एक ही ऐप में देखें।",
  id: "Bangun kebiasaan dengan cek O/X sederhana—lacak bulan Anda dengan log dan statistik dalam satu app.",
};

const SP_HERO_REACH_SUMMARY = {
  ko: "넷플릭스·통신비·보험까지 모든 정기 지출을 한곳에서 정리하고, 결제 일정과 이번 달 지출을 놓치지 않게 알려주는 구독 관리 앱입니다.",
  en: "Track every subscription and recurring bill in one place—see this month's spend and upcoming payments without missing a due date.",
  ja: "Netflixや通信費・保険まで、すべての定期支払いを一か所で整理。今月の支出と次の決済日程を見逃さないサブスク管理アプリです。",
  es: "Organiza suscripciones y pagos recurrentes—desde streaming hasta el alquiler—y no pierdas de vista el gasto del mes ni las próximas fechas.",
  "pt-br":
    "Organize assinaturas e contas recorrentes—de streaming a aluguel—e acompanhe o gasto do mês e as próximas cobranças.",
  fr: "Regroupez abonnements et paiements récurrents—streaming, loyer, assurance—et gardez un œil sur le mois et les prochaines échéances.",
  de: "Abos und wiederkehrende Rechnungen an einem Ort—Streaming, Miete, Versicherung: Monatsausgaben und Termine im Blick.",
  hi: "Netflix से लीज़ तक—सभी सब्सक्रिप्शन और नियमित बिल एक जगह; इस महीने का खर्च और अगली तारीखें न चूकें।",
  id: "Kelola langganan dan tagihan berulang—dari streaming hingga sewa—dan pantau pengeluaran bulan ini serta jadwal berikutnya.",
};

for (const lang of LANGS) {
  const file = `${lang}.json`;
  const p = path.join(LOCALES, file);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  if (j.ox) {
    j.ox.globalReachSummary = OX_GLOBAL_REACH_SUMMARY[lang] || OX_GLOBAL_REACH_SUMMARY.en;
  }
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");

  const spFile = `_sp.${lang}.json`;
  const spPath = path.join(LOCALES, spFile);
  if (fs.existsSync(spPath)) {
    const sp = JSON.parse(fs.readFileSync(spPath, "utf8"));
    sp.heroReachSummary = SP_HERO_REACH_SUMMARY[lang] || SP_HERO_REACH_SUMMARY.en;
    fs.writeFileSync(spPath, JSON.stringify(sp, null, 2) + "\n", "utf8");
  }
}

console.log("apply-ox-sp-hero-copy: OK");
