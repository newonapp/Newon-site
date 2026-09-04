/**
 * Newon analytics — category_action naming, no PII in payloads.
 */
(function (global) {
  "use strict";

  var EVENTS = {
    PAGE_VIEW: "page_view",
    PRODUCT_VIEW: "product_view",
    PRODUCT_CTA_CLICK: "product_cta_click",
    BUSINESS_CTA_CLICK: "business_cta_click",
    BUSINESS_SERVICE_VIEW: "business_service_view",
    BUSINESS_SERVICE_CTA_CLICK: "business_service_cta_click",
    BUSINESS_INQUIRY_START: "business_inquiry_start",
    BUSINESS_INQUIRY_SUBMIT: "business_inquiry_submit",
    BUSINESS_FORM_START: "business_form_start",
    BUSINESS_FORM_SUBMIT: "business_form_submit",
    BUSINESS_FORM_SUCCESS: "business_form_success",
    BUSINESS_FORM_ERROR: "business_form_error",
    CREATIVE_INQUIRY: "creative_inquiry",
    INSIGHT_VIEW: "insight_view",
    REPORT_BUY_CLICK: "report_buy_click",
    AFFILIATE_CLICK: "affiliate_click",
    EXPERIMENT_VIEW: "experiment_view",
    CHARACTER_DOWNLOAD: "character_download",
    TOOL_START: "tool_start",
    TOOL_OPEN: "tool_open",
    TOOL_USE: "tool_use",
    TOOL_COMPLETE: "tool_complete",
    TOOL_COPY: "tool_copy",
    TOOL_SHARE: "tool_share",
    RESOURCE_DOWNLOAD: "resource_download",
    STORE_PRODUCT_VIEW: "store_product_view",
    STORE_BUY_CLICK: "store_buy_click",
    NEWSLETTER_SIGNUP: "newsletter_signup",
    NEWSLETTER_ERROR: "newsletter_error",
    WAITLIST_VIEW: "waitlist_view",
    WAITLIST_START: "waitlist_start",
    WAITLIST_SIGNUP: "waitlist_signup",
    WAITLIST_ERROR: "waitlist_error",
    BLOG_VIEW: "blog_view",
    GAME_PLAY_CLICK: "game_play_click",
    AI_PRODUCT_INTEREST: "ai_product_interest",
    SEARCH_OPEN: "search_open",
    SEARCH_QUERY: "search_query",
    SEARCH_RESULT_CLICK: "search_result_click",
  };

  var PII_KEYS = /^(email|phone|name|message|description|company|_replyto)$/i;

  function sanitizeProps(props) {
    if (!props || typeof props !== "object") return {};
    var out = {};
    Object.keys(props).forEach(function (k) {
      if (!PII_KEYS.test(k)) out[k] = props[k];
    });
    return out;
  }

  function track(name, props) {
    var payload = { event: name, ts: Date.now(), props: sanitizeProps(props || {}) };
    try {
      global.dataLayer = global.dataLayer || [];
      global.dataLayer.push(payload);
    } catch (e) {}
    if (global.location && /[?&]debug_analytics=1/.test(global.location.search)) {
      console.info("[newonTrack]", payload);
    }
  }

  function propsFromEl(el) {
    var props = {};
    if (el.dataset.analyticsProduct) props.productId = el.dataset.analyticsProduct;
    if (el.dataset.analyticsTool) props.toolId = el.dataset.analyticsTool;
    if (el.dataset.analyticsStore) props.storeId = el.dataset.analyticsStore;
    if (el.dataset.itemId) props.itemId = el.dataset.itemId;
    if (el.dataset.itemId) props.product_slug = el.dataset.itemId;
    if (el.dataset.productName) props.product_name = el.dataset.productName;
    if (el.dataset.price) props.price = el.dataset.price;
    if (el.dataset.currency) props.currency = el.dataset.currency;
    if (el.dataset.category) props.category = el.dataset.category;
    if (el.dataset.categoryProp) props.category = el.dataset.categoryProp;
    if (el.dataset.source) props.source = el.dataset.source;
    if (el.dataset.page) props.page = el.dataset.page;
    if (el.dataset.analyticsPage) props.page = el.dataset.analyticsPage;
    if (!props.page && document.documentElement) {
      props.page = (global.location && global.location.pathname) || "";
    }
    return props;
  }

  global.newonAnalyticsEvents = EVENTS;
  global.newonTrack = track;

  document.addEventListener("DOMContentLoaded", function () {
    track(EVENTS.PAGE_VIEW, {
      path: (global.location && global.location.pathname) || "",
      lang: (document.documentElement && document.documentElement.lang) || "",
    });
  });

  document.addEventListener("click", function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest("[data-analytics]") : null;
    if (!el) return;
    var name = el.getAttribute("data-analytics");
    if (!name) return;
    track(name, propsFromEl(el));
  });
})(typeof window !== "undefined" ? window : globalThis);
