/**
 * Newon+ subscription packages shown on /saas/.
 * Apps lists are only what the product copy / user-confirmed catalog supports.
 * Prices are omitted when the repo has no live IAP amounts.
 */
export const PLUS_SUBSCRIBE_PLAY =
  "https://play.google.com/store/apps/details?id=com.newon.newon&pcampaignid=web_share";
export const PLUS_DETAIL_HREF = "../portfolio/newon-plus/";
export const PLUS_HOME_HREF = "../#newon-plus-app";

/** Confirmed member apps in the Newon+ membership (home / Newon+ copy). Excludes Newon+ itself. */
export const PLUS_MEMBER_APPS = [
  "ox-month",
  "goalup",
  "countup",
  "savy",
  "subping",
  "piggyup",
  "pillmate",
  "babylog",
  "petlog",
  "myworld",
  "eaton",
  "fiton",
];

/**
 * Only apps confirmed for each pack.
 * Growth / Life: do not invent extra apps beyond the confirmed set.
 */
export const PLUS_PACKAGES = [
  {
    id: "productivity",
    n: "01",
    apps: ["ox-month", "goalup", "countup"],
    priceMonthly: "",
    priceYearly: "",
  },
  {
    id: "finance",
    n: "02",
    apps: ["savy", "piggyup", "subping"],
    priceMonthly: "",
    priceYearly: "",
  },
  {
    id: "growth",
    n: "03",
    apps: ["ox-month", "goalup", "countup", "piggyup"],
    priceMonthly: "",
    priceYearly: "",
  },
  {
    id: "wellbeing",
    n: "04",
    apps: ["pillmate", "countup", "goalup"],
    priceMonthly: "",
    priceYearly: "",
  },
  {
    id: "family",
    n: "05",
    apps: ["babylog", "pillmate", "petlog"],
    priceMonthly: "",
    priceYearly: "",
  },
  {
    id: "life",
    n: "06",
    apps: ["ox-month", "goalup", "countup", "piggyup", "savy"],
    priceMonthly: "",
    priceYearly: "",
  },
  {
    id: "ultimate",
    n: "07",
    apps: PLUS_MEMBER_APPS.slice(),
    priceMonthly: "",
    priceYearly: "",
  },
];
