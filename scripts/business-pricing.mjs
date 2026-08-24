/**
 * Business package pricing — single source of truth.
 * Display as starting-from; final quote varies by scope.
 */
export const BUSINESS_PACKAGES = [
  {
    id: "start",
    nameKey: "studio.pkgStartName",
    descKey: "studio.pkgStartDesc",
    priceKo: "₩500,000~",
    priceEn: "₩500,000~",
  },
  {
    id: "build",
    nameKey: "studio.pkgBuildName",
    descKey: "studio.pkgBuildDesc",
    priceKo: "₩1,000,000~",
    priceEn: "₩1,000,000~",
  },
  {
    id: "mvp",
    nameKey: "studio.pkgMvpName",
    descKey: "studio.pkgMvpDesc",
    priceKo: "₩1,500,000~",
    priceEn: "₩1,500,000~",
  },
  {
    id: "custom",
    nameKey: "studio.pkgCustomName",
    descKey: "studio.pkgCustomDesc",
    priceKo: "별도 견적",
    priceEn: "Custom quote",
  },
];

export const BUSINESS_SERVICES = [
  { id: "mvp", num: "01", titleKey: "studio.svcMvpTitle", descKey: "studio.svcMvpDesc", itemsKey: "studio.svcMvpItems" },
  { id: "website", num: "02", titleKey: "studio.svcWebsiteTitle", descKey: "studio.svcWebsiteDesc", itemsKey: "studio.svcWebsiteItems" },
  { id: "ai", num: "03", titleKey: "studio.svcAiTitle", descKey: "studio.svcAiDesc", itemsKey: "studio.svcAiItems" },
  { id: "app", num: "04", titleKey: "studio.svcAppTitle", descKey: "studio.svcAppDesc", itemsKey: "studio.svcAppItems" },
  { id: "whitelabel", num: "05", titleKey: "studio.svcWhitelabelTitle", descKey: "studio.svcWhitelabelDesc", itemsKey: "studio.svcWhitelabelItems" },
  { id: "improve", num: "06", titleKey: "studio.svcImproveTitle", descKey: "studio.svcImproveDesc", itemsKey: "studio.svcImproveItems" },
  { id: "design", num: "07", titleKey: "studio.svcDesignTitle", descKey: "studio.svcDesignDesc", itemsKey: "studio.svcDesignItems" },
];
