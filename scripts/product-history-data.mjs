/**
 * Newon Product History — curated studio timeline.
 *
 * Rules:
 * - Never invent day-level store launch dates.
 * - Use datePrecision: "day" | "month" | "year".
 * - type: launch | update | feature | project | milestone | product
 * - "launch" only when a first-ship date is verified.
 * - "product" = live product in the Newon catalog (year-level ok when ship day unknown).
 *
 * News articles with showInTimeline !== false are merged at render time.
 */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTH_FULL = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

export const PRODUCT_HISTORY = [
  {
    id: "hist-404-human-2026",
    date: "2026",
    datePrecision: "year",
    product: "404-human",
    type: "project",
    icon: "/404-human-logo.png",
    productUrl: "/{{LANG}}/404-human/",
    copy: {
      ko: {
        title: "Game Project",
        description: "AI 시대의 마지막 인간을 다루는 인터랙티브 게임 프로젝트.",
      },
      en: {
        title: "Game Project",
        description: "An interactive game about the last human in the age of AI.",
      },
    },
  },
  {
    id: "hist-myworld-2026",
    date: "2026",
    datePrecision: "year",
    product: "myworld",
    type: "product",
    icon: "/myworld-logo.png",
    productUrl: "../portfolio/myworld/",
    copy: {
      ko: {
        title: "여행 기록과 세계지도",
        description: "여행 기록과 세계지도를 연결하는 여행 서비스.",
      },
      en: {
        title: "Travel records & world map",
        description: "A travel service that connects trip records with a world map.",
      },
    },
  },
  {
    id: "hist-newon-plus-2026",
    date: "2026",
    datePrecision: "year",
    product: "newon-plus",
    type: "product",
    icon: "/newon-plus-logo.png",
    productUrl: "../portfolio/newon-plus/",
    copy: {
      ko: {
        title: "Newon 통합 앱 허브",
        description: "Newon의 앱과 서비스를 한곳에서 이어 주는 허브.",
      },
      en: {
        title: "Newon app hub",
        description: "A hub that connects Newon’s apps and services in one place.",
      },
    },
  },
  {
    id: "hist-countup-2026",
    date: "2026",
    datePrecision: "year",
    product: "countup",
    type: "product",
    icon: "/countup-logo.png",
    productUrl: "../portfolio/countup/",
    copy: {
      ko: {
        title: "카운트 기반 성장 기록",
        description: "카운트 기반 목표 및 성장 기록.",
      },
      en: {
        title: "Count-based progress",
        description: "Count-based goals and growth records.",
      },
    },
  },
  {
    id: "hist-goalup-2026",
    date: "2026",
    datePrecision: "year",
    product: "goalup",
    type: "product",
    icon: "/goalup-logo.png",
    productUrl: "../portfolio/goalup/",
    copy: {
      ko: {
        title: "목표 · 습관 · 챌린지",
        description: "목표 · 습관 · 챌린지 경험.",
      },
      en: {
        title: "Goals, habits, challenges",
        description: "Goals, habits, and challenges in one flow.",
      },
    },
  },
  {
    id: "hist-piggyup-2026",
    date: "2026",
    datePrecision: "year",
    product: "piggyup",
    type: "product",
    icon: "/piggyup-logo.png",
    productUrl: "../portfolio/piggyup/",
    copy: {
      ko: {
        title: "절약 기록",
        description: "절약 기록과 AI 분석 경험.",
      },
      en: {
        title: "Savings records",
        description: "Savings logs with insight into spending patterns.",
      },
    },
  },
  {
    id: "hist-petlog-product-2026",
    date: "2026",
    datePrecision: "year",
    product: "petlog",
    type: "product",
    icon: "/petlog-logo.png",
    productUrl: "../portfolio/petlog/",
    copy: {
      ko: {
        title: "반려동물 일상 기록",
        description: "반려동물 기록 · 건강 · 가족 공유.",
      },
      en: {
        title: "Pet life records",
        description: "Pet logs, health tracking, and family sharing.",
      },
    },
  },
  {
    id: "hist-pillmate-2026",
    date: "2026",
    datePrecision: "year",
    product: "pillmate",
    type: "product",
    icon: "/pillmate-logo.png",
    productUrl: "../portfolio/pillmate/",
    copy: {
      ko: {
        title: "복약 기록과 알림",
        description: "복약 기록 및 알림 서비스.",
      },
      en: {
        title: "Medication records & reminders",
        description: "Medication logs and reminder service.",
      },
    },
  },
  {
    id: "hist-savy-2026",
    date: "2026",
    datePrecision: "year",
    product: "savy",
    type: "product",
    icon: "/savy-logo.png",
    productUrl: "../portfolio/savy/",
    copy: {
      ko: {
        title: "소비 기록과 분석",
        description: "소비 기록과 분석 경험.",
      },
      en: {
        title: "Spending records & insight",
        description: "Spending logs and analysis.",
      },
    },
  },
  {
    id: "hist-ox-month-2026",
    date: "2026",
    datePrecision: "year",
    product: "ox-month",
    type: "product",
    icon: "/ox-month-logo.png",
    productUrl: "../portfolio/ox-month/",
    copy: {
      ko: {
        title: "O/X 기반 습관 기록",
        description: "O/X 기반 습관 기록 경험.",
      },
      en: {
        title: "O/X habit tracking",
        description: "O/X-based habit tracking.",
      },
    },
  },
  {
    id: "hist-subping-2026",
    date: "2026",
    datePrecision: "year",
    product: "subping",
    type: "product",
    icon: "/subping-logo.png",
    productUrl: "../portfolio/subping/",
    copy: {
      ko: {
        title: "구독 · 결제 관리",
        description: "구독 · 결제일 · 비용 관리.",
      },
      en: {
        title: "Subscriptions & billing",
        description: "Subscriptions, payment dates, and cost management.",
      },
    },
  },
  {
    id: "hist-babylog-2026",
    date: "2026",
    datePrecision: "year",
    product: "babylog",
    type: "product",
    icon: "/babylog-logo.png",
    productUrl: "../portfolio/babylog/",
    copy: {
      ko: {
        title: "육아 · 성장 기록",
        description: "육아 · 성장 · 가족 기록.",
      },
      en: {
        title: "Parenting & growth logs",
        description: "Parenting, growth, and family records.",
      },
    },
  },
];

export const HISTORY_TYPE_FILTERS = ["all", "launch", "update", "milestone"];

/** Map entry type → toolbar filter bucket */
export function historyFilterBucket(type) {
  if (type === "launch") return "launch";
  if (type === "update" || type === "feature") return "update";
  return "milestone"; // product | project | milestone
}

export function historyTypeLabelKey(type) {
  if (type === "launch") return "news.typeLaunch";
  if (type === "update" || type === "feature") return "news.typeUpdate";
  if (type === "project") return "news.typeProject";
  if (type === "milestone") return "news.typeMilestone";
  return "news.typeProduct";
}

/** Normalize any date string into sortable parts. */
export function parseHistoryDate(date, precision = "day") {
  const raw = String(date || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return {
      precision: precision === "month" || precision === "year" ? precision : "day",
      year: raw.slice(0, 4),
      month: raw.slice(5, 7),
      day: raw.slice(8, 10),
      sortKey: raw,
    };
  }
  if (/^\d{4}-\d{2}$/.test(raw)) {
    return {
      precision: precision === "year" ? "year" : "month",
      year: raw.slice(0, 4),
      month: raw.slice(5, 7),
      day: "",
      sortKey: `${raw}-00`,
    };
  }
  if (/^\d{4}$/.test(raw)) {
    return {
      precision: "year",
      year: raw,
      month: "",
      day: "",
      sortKey: `${raw}-00-00`,
    };
  }
  return { precision: "year", year: "", month: "", day: "", sortKey: "0000-00-00" };
}

export function formatHistoryDisplayDate(date, precision) {
  const p = parseHistoryDate(date, precision);
  if (p.precision === "day" && p.month && p.day) {
    const mi = parseInt(p.month, 10) - 1;
    return `${MONTHS[mi] || p.month} ${parseInt(p.day, 10)}`;
  }
  if (p.precision === "month" && p.month) {
    const mi = parseInt(p.month, 10) - 1;
    return MONTHS[mi] || p.month;
  }
  return p.year || "";
}

export function historyMonthGroupKey(date, precision) {
  const p = parseHistoryDate(date, precision);
  if (p.precision === "year" || !p.month) return "earlier";
  return `${p.year}-${p.month}`;
}

export function historyMonthGroupLabel(date, precision) {
  const p = parseHistoryDate(date, precision);
  if (p.precision === "year" || !p.month) return "EARLIER";
  const mi = parseInt(p.month, 10) - 1;
  return MONTH_FULL[mi] || MONTHS[mi] || p.month;
}

export function historyDatetimeAttr(date, precision) {
  const p = parseHistoryDate(date, precision);
  if (p.precision === "day") return `${p.year}-${p.month}-${p.day}`;
  if (p.precision === "month") return `${p.year}-${p.month}`;
  return p.year || "";
}

/**
 * Build unified timeline entries from curated history + news articles.
 * Newest first. Dedupes news-derived ids against curated when same product+day.
 */
export function buildTimelineEntries(articles = [], { productBySlug, articleCopy, articleProductSlug } = {}) {
  const fromHistory = PRODUCT_HISTORY.map((entry) => {
    const parsed = parseHistoryDate(entry.date, entry.datePrecision || "day");
    return {
      id: entry.id,
      source: "history",
      date: entry.date,
      datePrecision: entry.datePrecision || parsed.precision,
      sortKey: parsed.sortKey,
      product: entry.product || "",
      type: entry.type || "product",
      icon: entry.icon || "",
      productUrl: entry.productUrl || "",
      newsSlug: entry.newsSlug || "",
      copy: entry.copy || {},
      category:
        entry.type === "feature"
          ? "feature"
          : entry.type === "update"
            ? "update"
            : entry.type === "launch" || entry.type === "product"
              ? "launch"
              : entry.type === "notice"
                ? "notice"
                : "company",
    };
  });

  const fromNews = (articles || [])
    .filter((a) => a && a.published !== false && a.showInTimeline !== false)
    .map((a) => {
      const slug = articleProductSlug ? articleProductSlug(a) : a.relatedProduct || a.product || "";
      const product = productBySlug ? productBySlug(slug) : null;
      const copyKo = articleCopy ? articleCopy(a, "ko") : (a.copy && a.copy.ko) || {};
      const copyEn = articleCopy ? articleCopy(a, "en") : (a.copy && a.copy.en) || {};
      const type =
        a.category === "launch"
          ? "launch"
          : a.category === "feature"
            ? "feature"
            : a.category === "update"
              ? "update"
              : "milestone";
      return {
        id: `news-${a.slug}`,
        source: "news",
        date: a.date,
        datePrecision: "day",
        sortKey: parseHistoryDate(a.date, "day").sortKey,
        product: slug,
        type,
        icon: (product && product.icon) || "/logo.png",
        productUrl: product
          ? product.pageHref || `../portfolio/${product.slug}/`
          : "",
        newsSlug: a.slug,
        copy: {
          ko: {
            title: copyKo.timelineLabel || copyKo.title || "",
            description: copyKo.summary || copyKo.lead || "",
          },
          en: {
            title: copyEn.timelineLabel || copyEn.title || "",
            description: copyEn.summary || copyEn.lead || "",
          },
        },
        category: a.category,
      };
    });

  const newsKeys = new Set(
    fromNews.map((e) => `${e.product}|${e.sortKey}|${e.type}`)
  );
  const curated = fromHistory.filter((e) => {
    // Prefer the news entry when both describe the same product on the same day as an update.
    if (e.datePrecision === "day" && newsKeys.has(`${e.product}|${e.sortKey}|${e.type}`)) {
      return false;
    }
    return true;
  });

  return [...fromNews, ...curated].sort((a, b) => {
    if (a.sortKey < b.sortKey) return 1;
    if (a.sortKey > b.sortKey) return -1;
    // Stable product order for same-precision ties (year/month buckets)
    const order = [
      "404-human",
      "myworld",
      "newon-plus",
      "countup",
      "goalup",
      "piggyup",
      "petlog",
      "pillmate",
      "savy",
      "ox-month",
      "subping",
      "babylog",
    ];
    const ai = order.indexOf(a.product);
    const bi = order.indexOf(b.product);
    if (ai !== -1 || bi !== -1) {
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    }
    return String(a.id).localeCompare(String(b.id));
  });
}

/** Group entries by year → month (or EARLIER). */
export function groupTimelineEntries(entries) {
  const years = [];
  let yearGroup = null;
  for (const entry of entries) {
    const parsed = parseHistoryDate(entry.date, entry.datePrecision);
    const year = parsed.year || "0000";
    if (!yearGroup || yearGroup.year !== year) {
      yearGroup = { year, months: [] };
      years.push(yearGroup);
    }
    const mk = historyMonthGroupKey(entry.date, entry.datePrecision);
    let monthGroup = yearGroup.months[yearGroup.months.length - 1];
    if (!monthGroup || monthGroup.key !== mk) {
      monthGroup = {
        key: mk,
        label: historyMonthGroupLabel(entry.date, entry.datePrecision),
        items: [],
      };
      yearGroup.months.push(monthGroup);
    }
    monthGroup.items.push(entry);
  }
  // Within each year, put EARLIER after dated months
  for (const yg of years) {
    yg.months.sort((a, b) => {
      if (a.key === "earlier") return 1;
      if (b.key === "earlier") return -1;
      return a.key < b.key ? 1 : a.key > b.key ? -1 : 0;
    });
  }
  return years;
}
