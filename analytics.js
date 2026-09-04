/**
 * Newon Growth Foundation analytics — single public tracking helper.
 * Source of Truth: pushes sanitized events to dataLayer (GTM/GA-ready shape).
 * No PII. No new SDK unless a measurement ID is already present on the page.
 */
(function (global) {
  "use strict";

  var UTM_KEY = "newon_utm_v1";
  var PAGE_VIEWED = false;
  var recent = Object.create(null);

  /** Canonical event names (Growth Foundation taxonomy). */
  var EVENTS = {
    PAGE_VIEW: "page_view",
    CTA_CLICK: "cta_click",
    PRODUCT_VIEW: "product_view",
    PORTFOLIO_VIEW: "portfolio_view",
    BUSINESS_SERVICE_VIEW: "business_service_view",
    INQUIRY_START: "inquiry_start",
    INQUIRY_SUBMIT: "inquiry_submit",
    INQUIRY_SUCCESS: "inquiry_success",
    STORE_CLICK: "store_click",
    APP_STORE_CLICK: "app_store_click",
    PLAY_STORE_CLICK: "play_store_click",
    EXTERNAL_LINK_CLICK: "external_link_click",
    PRICING_VIEW: "pricing_view",
    SERVICE_SELECT: "service_select",
    PORTFOLIO_TO_INQUIRY: "portfolio_to_inquiry",
    BUSINESS_TO_INQUIRY: "business_to_inquiry",

    /* Legacy keys → same canonical strings (call sites keep working). */
    PRODUCT_CTA_CLICK: "cta_click",
    BUSINESS_CTA_CLICK: "cta_click",
    BUSINESS_SERVICE_CTA_CLICK: "cta_click",
    BUSINESS_INQUIRY_START: "inquiry_start",
    BUSINESS_INQUIRY_SUBMIT: "inquiry_submit",
    BUSINESS_FORM_START: "inquiry_start",
    BUSINESS_FORM_SUBMIT: "inquiry_submit",
    BUSINESS_FORM_SUCCESS: "inquiry_success",
    BUSINESS_FORM_ERROR: "inquiry_error",
    CREATIVE_INQUIRY: "inquiry_submit",
    INSIGHT_VIEW: "insight_view",
    REPORT_BUY_CLICK: "store_click",
    AFFILIATE_CLICK: "external_link_click",
    EXPERIMENT_VIEW: "experiment_view",
    CHARACTER_DOWNLOAD: "resource_download",
    TOOL_START: "tool_start",
    TOOL_OPEN: "tool_open",
    TOOL_USE: "tool_use",
    TOOL_COMPLETE: "tool_complete",
    TOOL_COPY: "tool_copy",
    TOOL_SHARE: "tool_share",
    RESOURCE_DOWNLOAD: "resource_download",
    STORE_PRODUCT_VIEW: "store_product_view",
    STORE_BUY_CLICK: "store_click",
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

  var NAME_ALIASES = {
    business_form_start: "inquiry_start",
    business_form_submit: "inquiry_submit",
    business_form_success: "inquiry_success",
    business_inquiry_start: "inquiry_start",
    business_inquiry_submit: "inquiry_submit",
    business_cta_click: "cta_click",
    business_service_cta_click: "cta_click",
    product_cta_click: "cta_click",
    studio_service_cta_click: "cta_click",
    studio_explore_cta: "cta_click",
    business_pillar_cta: "cta_click",
    store_buy_click: "store_click",
  };

  var PII_KEYS =
    /^(email|phone|name|message|description|company|company_name|contact|contact_name|_replyto|firebase_uid|uid|address|password)$/i;

  var PRODUCT_SLUGS = [
    "ox-month",
    "subping",
    "savy",
    "pillmate",
    "babylog",
    "petlog",
    "piggyup",
    "goalup",
    "countup",
    "newon-plus",
    "myworld",
    "my-world",
  ];

  var PLAY_PACKAGE_TO_PRODUCT = {
    "com.newon.ox.month": "ox-month",
    "com.newon.subping": "subping",
    "com.newon.savy": "savy",
    "com.newon.pill.mate": "pillmate",
    "com.newon.babylog": "babylog",
    "com.newon.petlog": "petlog",
    "com.newon.piggyup": "piggyup",
    "goalup.newon.app": "goalup",
    "com.newon.countup": "countup",
    "com.newon.newon": "newon-plus",
    "com.newon.myworld": "myworld",
  };

  function isDebug() {
    return !!(global.location && /[?&]debug_analytics=1/.test(global.location.search));
  }

  function isLocalHost() {
    var h = ((global.location && global.location.hostname) || "").toLowerCase();
    return (
      h === "localhost" ||
      h === "127.0.0.1" ||
      h === "0.0.0.0" ||
      h === "::1" ||
      h === "[::1]" ||
      h.endsWith(".local")
    );
  }

  function isProductionHost() {
    var h = ((global.location && global.location.hostname) || "").toLowerCase();
    return h === "newon.app" || h === "www.newon.app" || h.endsWith(".newon.app");
  }

  function pathname() {
    return (global.location && global.location.pathname) || "";
  }

  function localeFromPath() {
    var segs = pathname().replace(/\/index\.html$/i, "").split("/").filter(Boolean);
    var langs = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
    if (segs.length && langs.indexOf(segs[0]) !== -1) return segs[0];
    return (document.documentElement && document.documentElement.lang) || "";
  }

  function pathWithoutLocale() {
    var p = pathname().replace(/\/index\.html$/i, "");
    var loc = localeFromPath();
    if (loc && (p === "/" + loc || p.indexOf("/" + loc + "/") === 0)) {
      p = p.slice(loc.length + 1) || "/";
    }
    if (!p) p = "/";
    if (p.charAt(0) !== "/") p = "/" + p;
    return p.replace(/\/$/, "") || "/";
  }

  function classifyPageType(path) {
    var p = path || pathWithoutLocale();
    if (p === "/" || p === "") return "home";
    if (p.indexOf("/business/inquiry") === 0) return "inquiry";
    if (p === "/business" || p === "/business/") return "business";
    if (p.indexOf("/business/") === 0) return "business_service";
    if (p === "/portfolio" || p === "/portfolio/") return "portfolio";
    if (p.indexOf("/portfolio/") === 0) return "portfolio_detail";
    if (p === "/apps" || p === "/apps/" || p === "/products" || p === "/products/") return "products";
    if (p.indexOf("/resources/store") === 0) return "store";
    if (p.indexOf("/studio/") === 0) return "studio";
    if (p.indexOf("/tools/") === 0) return "tool";
    for (var i = 0; i < PRODUCT_SLUGS.length; i++) {
      var slug = PRODUCT_SLUGS[i];
      if (p === "/" + slug || p.indexOf("/" + slug + "/") === 0) return "product";
    }
    return "other";
  }

  function productIdFromPath() {
    var p = pathWithoutLocale();
    for (var i = 0; i < PRODUCT_SLUGS.length; i++) {
      var slug = PRODUCT_SLUGS[i];
      if (p === "/" + slug || p.indexOf("/" + slug + "/") === 0) {
        return slug === "my-world" ? "myworld" : slug;
      }
      if (p === "/portfolio/" + slug || p.indexOf("/portfolio/" + slug + "/") === 0) {
        return slug === "my-world" ? "myworld" : slug;
      }
    }
    return "";
  }

  function serviceIdFromPage() {
    var root = document.querySelector(".bs-page[data-bs-service], .bs-page[data-bs-analytics]");
    if (root) {
      return (
        root.getAttribute("data-bs-analytics") ||
        root.getAttribute("data-bs-service") ||
        ""
      );
    }
    var p = pathWithoutLocale();
    if (p.indexOf("/business/") === 0) {
      var rest = p.slice("/business/".length).replace(/\/$/, "");
      if (!rest || rest.indexOf("inquiry") === 0) return "";
      return rest.split("/")[0] || "";
    }
    return "";
  }

  function readQueryUtm() {
    try {
      var p = new URLSearchParams(global.location.search || "");
      return {
        utm_source: p.get("utm_source") || "",
        utm_medium: p.get("utm_medium") || "",
        utm_campaign: p.get("utm_campaign") || "",
        utm_content: p.get("utm_content") || "",
      };
    } catch (e) {
      return { utm_source: "", utm_medium: "", utm_campaign: "", utm_content: "" };
    }
  }

  function captureUtm() {
    var q = readQueryUtm();
    var has = q.utm_source || q.utm_medium || q.utm_campaign || q.utm_content;
    if (!has) return getStoredUtm();
    try {
      sessionStorage.setItem(
        UTM_KEY,
        JSON.stringify({
          utm_source: q.utm_source,
          utm_medium: q.utm_medium,
          utm_campaign: q.utm_campaign,
          utm_content: q.utm_content,
          landing_path: pathname(),
          captured_at: Date.now(),
        })
      );
    } catch (e) {}
    return q;
  }

  function getStoredUtm() {
    try {
      var raw = sessionStorage.getItem(UTM_KEY);
      if (!raw) return readQueryUtm();
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") return readQueryUtm();
      return {
        utm_source: data.utm_source || "",
        utm_medium: data.utm_medium || "",
        utm_campaign: data.utm_campaign || "",
        utm_content: data.utm_content || "",
      };
    } catch (e) {
      return readQueryUtm();
    }
  }

  function sanitizeProps(props) {
    if (!props || typeof props !== "object") return {};
    var out = {};
    Object.keys(props).forEach(function (k) {
      if (PII_KEYS.test(k)) return;
      var v = props[k];
      if (v == null || v === "") return;
      if (typeof v === "object") return;
      out[k] = v;
    });
    return out;
  }

  function baseContext() {
    var utm = getStoredUtm();
    var ctx = {
      page_path: pathname(),
      page_type: classifyPageType(),
      locale: localeFromPath(),
      environment: isProductionHost() ? "production" : isLocalHost() ? "development" : "other",
    };
    if (utm.utm_source) ctx.utm_source = utm.utm_source;
    if (utm.utm_medium) ctx.utm_medium = utm.utm_medium;
    if (utm.utm_campaign) ctx.utm_campaign = utm.utm_campaign;
    if (utm.utm_content) ctx.utm_content = utm.utm_content;
    var pid = productIdFromPath();
    if (pid) ctx.product_id = pid;
    var sid = serviceIdFromPage();
    if (sid) ctx.service_id = sid;
    return ctx;
  }

  function normalizeName(name) {
    var n = String(name || "").trim();
    if (!n) return "";
    if (NAME_ALIASES[n]) return NAME_ALIASES[n];
    return n;
  }

  function dedupeKey(name, props) {
    return (
      name +
      "|" +
      (props.destination || "") +
      "|" +
      (props.cta_id || "") +
      "|" +
      (props.product_id || "") +
      "|" +
      (props.service_id || "")
    );
  }

  function shouldDedupe(name, props) {
    var key = dedupeKey(name, props || {});
    var now = Date.now();
    var prev = recent[key] || 0;
    if (now - prev < 600) return true;
    recent[key] = now;
    return false;
  }

  function pushDataLayer(flat) {
    try {
      global.dataLayer = global.dataLayer || [];
      global.dataLayer.push(flat);
    } catch (e) {}
  }

  function forwardGtag(name, params) {
    try {
      if (typeof global.gtag === "function") {
        global.gtag("event", name, params);
      }
    } catch (e) {}
  }

  function track(name, props) {
    var eventName = normalizeName(name);
    if (!eventName) return;
    var merged = Object.assign({}, baseContext(), sanitizeProps(props || {}));
    if (shouldDedupe(eventName, merged)) return;

    /* Never ship localhost noise to production GA if present; dataLayer still ok for debug. */
    var skipRemote = isLocalHost() && !isDebug();

    var flat = Object.assign({ event: eventName }, merged);
    pushDataLayer(flat);

    if (!skipRemote) forwardGtag(eventName, merged);

    if (isDebug()) {
      try {
        console.info("[newonTrack]", flat);
      } catch (e) {}
    }
  }

  function propsFromEl(el) {
    var props = {};
    if (!el || !el.getAttribute) return props;
    var ds = el.dataset || {};
    if (ds.analyticsProduct) props.product_id = ds.analyticsProduct;
    if (ds.productId) props.product_id = ds.productId;
    if (ds.itemId && !props.product_id) props.product_id = ds.itemId;
    if (ds.analyticsTool) props.tool_id = ds.analyticsTool;
    if (ds.analyticsStore) props.store_id = ds.analyticsStore;
    if (ds.analyticsService) props.service_id = ds.analyticsService;
    if (ds.serviceId) props.service_id = ds.serviceId;
    if (ds.ctaId) props.cta_id = ds.ctaId;
    if (ds.ctaLocation) props.cta_location = ds.ctaLocation;
    if (ds.bsCta && !props.cta_location) props.cta_location = ds.bsCta;
    if (ds.analyticsPage) props.page = ds.analyticsPage;
    if (ds.source) props.source = ds.source;
    if (ds.category) props.category = ds.category;
    if (ds.price) props.price = ds.price;
    if (ds.currency) props.currency = ds.currency;
    if (el.getAttribute("href")) props.destination = el.getAttribute("href");
    return props;
  }

  function productIdFromHref(href) {
    if (!href) return "";
    try {
      var u = new URL(href, global.location.origin);
      if (u.hostname.indexOf("play.google.com") !== -1) {
        var id = u.searchParams.get("id") || "";
        if (PLAY_PACKAGE_TO_PRODUCT[id]) return PLAY_PACKAGE_TO_PRODUCT[id];
      }
    } catch (e) {}
    return "";
  }

  function inferProductNear(el) {
    var node = el;
    while (node && node !== document.body) {
      if (node.getAttribute) {
        var pid =
          node.getAttribute("data-product-id") ||
          node.getAttribute("data-analytics-product") ||
          node.getAttribute("data-item-id") ||
          node.getAttribute("data-app-slug") ||
          node.getAttribute("data-slug");
        if (pid) return pid === "my-world" ? "myworld" : pid;
      }
      node = node.parentElement;
    }
    return productIdFromPath() || "";
  }

  function ctaLocationNear(el) {
    if (!el) return "unknown";
    if (el.closest && el.closest("header, .site-header, .gnav, [data-chrome-header]")) return "header";
    if (el.closest && el.closest("footer, .site-footer, [data-chrome-footer]")) return "footer";
    if (el.closest && el.closest(".bs-hero, .bp-hero, .hero")) return "hero";
    if (el.closest && el.closest("[data-bs-cta]")) {
      return el.getAttribute("data-bs-cta") || el.closest("[data-bs-cta]").getAttribute("data-bs-cta") || "service";
    }
    if (el.closest && el.closest(".pf-page, .portfolio, [data-portfolio]")) return "portfolio";
    if (el.closest && el.closest(".bs-page, .bp-page, [data-bs-service]")) return "business";
    return classifyPageType();
  }

  function handleStoreOrExternal(anchor) {
    var href = anchor.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) {
      return false;
    }
    var abs = href;
    try {
      abs = new URL(href, global.location.origin).href;
    } catch (e) {}

    var isApple = /apps\.apple\.com/i.test(abs);
    var isPlay = /play\.google\.com/i.test(abs);
    if (!isApple && !isPlay) {
      try {
        var u = new URL(abs);
        var host = (global.location && global.location.hostname) || "";
        if (u.hostname && u.hostname !== host && u.hostname.indexOf("newon.app") === -1) {
          /* Skip social icons spam — only explicit data-analytics or store. */
          return false;
        }
      } catch (e2) {}
      return false;
    }

    var productId = inferProductNear(anchor) || productIdFromHref(abs);
    var loc =
      (anchor.dataset && anchor.dataset.ctaLocation) ||
      ctaLocationNear(anchor);
    var common = {
      product_id: productId || undefined,
      locale: localeFromPath(),
      cta_location: loc,
      destination: abs,
      platform: isApple ? "ios" : "android",
    };

    if (isApple) track(EVENTS.APP_STORE_CLICK, common);
    if (isPlay) track(EVENTS.PLAY_STORE_CLICK, common);
    return true;
  }

  function isInquiryHref(href) {
    if (!href) return false;
    if (/\/business\/inquiry/i.test(href)) return true;
    try {
      var u = new URL(href, global.location.href);
      return /\/business\/inquiry(\/|$)/i.test(u.pathname);
    } catch (e) {
      return /inquiry\/?\?/i.test(href) || /inquiry\/?#/i.test(href) || /\/inquiry\/?$/i.test(href);
    }
  }

  function handleInquiryLink(anchor) {
    var href = anchor.getAttribute("href") || "";
    if (!isInquiryHref(href)) return false;
    if (anchor.getAttribute("data-analytics")) return false;

    var pageType = classifyPageType();
    var loc = ctaLocationNear(anchor);
    var props = {
      cta_id: "inquiry",
      cta_location: loc,
      destination: href,
      service_id: serviceIdFromPage() || undefined,
      product_id: productIdFromPath() || undefined,
    };

    track(EVENTS.CTA_CLICK, props);
    if (pageType === "portfolio" || pageType === "portfolio_detail") {
      track(EVENTS.PORTFOLIO_TO_INQUIRY, props);
    } else if (pageType === "business" || pageType === "business_service" || pageType === "studio") {
      track(EVENTS.BUSINESS_TO_INQUIRY, props);
    }
    return true;
  }

  function autoPageEvents() {
    if (PAGE_VIEWED) return;
    PAGE_VIEWED = true;
    captureUtm();

    var pageType = classifyPageType();
    var props = {};
    var rs = document.querySelector(".rs-page[data-rs-analytics], .rs-page[data-rs-hub]");
    if (rs) {
      props.resources_hub = rs.getAttribute("data-rs-analytics") || rs.getAttribute("data-rs-hub") || "";
    }
    track(EVENTS.PAGE_VIEW, props);

    if (pageType === "product") {
      track(EVENTS.PRODUCT_VIEW, { product_id: productIdFromPath() });
    }
    if (pageType === "portfolio" || pageType === "portfolio_detail") {
      var pfId = productIdFromPath();
      track(EVENTS.PORTFOLIO_VIEW, {
        product_id: pfId || undefined,
      });
      if (pageType === "portfolio_detail" && pfId) {
        track(EVENTS.PRODUCT_VIEW, { product_id: pfId, cta_location: "portfolio" });
      }
    }
    /* business_service_view is emitted by business-service.js to avoid duplicates. */

    observePricingOnce();
  }

  function observePricingOnce() {
    var nodes = document.querySelectorAll(
      "[data-analytics-section='pricing'], [data-bs-pricing], .bs-pricing, .bz-pricing, #pricing, .bp-price, .bz-product-matrix"
    );
    if (!nodes.length) return;
    var sent = false;
    function fire() {
      if (sent) return;
      sent = true;
      track(EVENTS.PRICING_VIEW, {
        service_id: serviceIdFromPage() || undefined,
        product_id: productIdFromPath() || undefined,
      });
    }
    if (!("IntersectionObserver" in global)) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          fire();
          io.disconnect();
        });
      },
      { threshold: 0.35 }
    );
    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  global.newonAnalyticsEvents = EVENTS;
  global.newonTrack = track;
  global.newonAnalyticsUtm = getStoredUtm;

  document.addEventListener("DOMContentLoaded", function () {
    autoPageEvents();
  });

  document.addEventListener(
    "click",
    function (ev) {
      var el = ev.target && ev.target.closest ? ev.target.closest("a,button,[data-analytics]") : null;
      if (!el) return;

      var named = el.getAttribute("data-analytics");
      if (named) {
        var fromEl = propsFromEl(el);
        if (!fromEl.cta_location) fromEl.cta_location = ctaLocationNear(el);
        track(named, fromEl);
        if (el.tagName === "A") {
          handleStoreOrExternal(el);
          /* Funnel companions without a second cta_click. */
          var hrefNamed = el.getAttribute("href") || "";
          if (isInquiryHref(hrefNamed)) {
            var funnelProps = {
              cta_id: "inquiry",
              cta_location: fromEl.cta_location,
              destination: hrefNamed,
              service_id: fromEl.service_id || serviceIdFromPage() || undefined,
              product_id: fromEl.product_id || productIdFromPath() || undefined,
            };
            var pt = classifyPageType();
            if (pt === "portfolio" || pt === "portfolio_detail") {
              track(EVENTS.PORTFOLIO_TO_INQUIRY, funnelProps);
            } else if (
              pt === "business" ||
              pt === "business_service" ||
              pt === "studio"
            ) {
              track(EVENTS.BUSINESS_TO_INQUIRY, funnelProps);
            }
          }
        }
        return;
      }

      if (el.tagName === "A") {
        if (handleStoreOrExternal(el)) return;
        handleInquiryLink(el);
      }
    },
    true
  );
})(typeof window !== "undefined" ? window : globalThis);
