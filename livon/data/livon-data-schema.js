/*
 * LIVON Real Data Layer — entity schema, sanitising and validation.
 *
 * External data is untrusted. Every provider record passes through validateEntity() before the
 * repository or any UI sees it:
 *   - text is reduced to plain text (tags, scripts, control characters and bidi overrides removed)
 *   - links must be http(s) with a real host; javascript:, data:, file: … are dropped
 *   - dates must parse; coordinates must be in range and come in pairs
 *   - missing optional fields stay null — nothing is invented to "fill" a card
 * Type-specific rules: a policy must carry an official source URL; an event must have a source URL
 * and a start date; an expert is never marked verified by LIVON.
 */
(function (root) {
  "use strict";
  var CFG = root.LivonDataConfig || { limits: { titleMax: 200, summaryMax: 500, descriptionMax: 5000, tagMax: 20, tagLength: 40 } };
  var L = CFG.limits;

  var TYPES = ["expert", "program", "place", "event", "policy", "public"];
  var TYPE_LABEL = { expert: "전문가", program: "클래스·프로그램", place: "장소", event: "행사", policy: "정책·지원", public: "공공 정보" };
  var PRICING = ["free", "paid", "varies", "unknown"];
  var AVAILABILITY = ["open", "closed", "upcoming", "ended", "unknown"];
  var EVENT_STATUS = ["scheduled", "cancelled", "postponed", "ended", "unknown"];
  /* why an expert record exists (see docs/livon/real-data-providers.md#experts):
     public_designated       — a public body published the person as the holder of a public consultation role
     registered_professional — an official register shows a current registration (not used yet)
     partner_verified        — a LIVON partner check was completed (not used yet)
     business_listing        — a business record only; no personal qualification (not used for experts) */
  var TRUST_LEVELS = ["public_designated", "registered_professional", "partner_verified", "business_listing"];

  /* type-specific fields (all optional unless listed in REQUIRED) */
  var TYPE_FIELDS = {
    expert: { text: ["name", "organization", "serviceArea", "role", "trustLevel", "sourceOrganization", "sourceDataset"], list: ["specialties", "credentials", "serviceTypes", "consultationMethods"], url: ["externalBookingUrl"], date: ["designationStart", "designationEnd"] },
    program: { text: ["organizer", "format", "eligibility", "duration", "instructor", "venue", "days", "timeText", "applyMethod", "selectionMethod"], number: ["capacity"], date: ["registrationStart", "registrationEnd"], url: ["registrationUrl"] },
    place: { text: ["placeType", "openingHours", "accessibility", "mapProvider"], list: ["facilities"], url: ["officialUrl", "mapUrl", "homepageUrl", "reservationUrl"], number: ["distanceMeters"] },
    event: { text: ["organizer", "venue", "eventStatus", "eventType"], bool: ["registrationRequired"], url: ["registrationUrl"], date: ["registrationStart", "registrationEnd"] },
    policy: { text: ["agency", "jurisdiction", "eligibility", "benefits"], period: ["applicationPeriod"], url: ["applicationUrl", "officialSource"], date: ["lastVerifiedAt"] },
    public: {}
  };

  function isObj(x) { return !!x && typeof x === "object" && !Array.isArray(x); }

  /* Plain text only: decode a few entities, drop tags (and the contents of script/style), control and bidi chars. */
  var NEEDS_CLEANING = /[<>&\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/;
  function cleanText(v, max) {
    if (v == null) return null;
    if (typeof v !== "string" && typeof v !== "number") return null;
    var s = String(v);
    /* most curated strings contain no markup, entity or control character: only whitespace needs normalising */
    if (!NEEDS_CLEANING.test(s)) {
      s = s.replace(/\s+/g, " ").trim();
      if (!s) return null;
      return max && s.length > max ? s.slice(0, max - 1) + "…" : s;
    }
    s = s
      .replace(/<(script|style|iframe|object|embed|template)[\s\S]*?<\/\1\s*>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, "\"").replace(/&#39;/gi, "'")
      .replace(/<[^>]*>/g, " ") /* again: entities may have produced new tags */
      .replace(/[<>]/g, "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‪-‮⁦-⁩]/g, "")
      .replace(/\s+/g, " ").trim();
    if (!s) return null;
    return max && s.length > max ? s.slice(0, max - 1) + "…" : s;
  }
  function cleanList(v, max, itemMax) {
    if (!Array.isArray(v)) v = v == null ? [] : [v];
    var seen = {}, out = [];
    v.forEach(function (x) {
      var s = cleanText(x, itemMax || L.tagLength);
      if (s && !seen[s.toLowerCase()]) { seen[s.toLowerCase()] = 1; out.push(s); }
    });
    return out.slice(0, max || L.tagMax);
  }
  /* http(s) only, real hostname, no credentials in the URL */
  function safeUrl(v) {
    if (typeof v !== "string") return null;
    var s = v.trim();
    if (!/^https?:\/\//i.test(s)) return null;
    try {
      var u = new URL(s);
      if (u.protocol !== "https:" && u.protocol !== "http:") return null;
      if (u.username || u.password) return null;
      if (!/^([a-z0-9-]+\.)+[a-z][a-z0-9-]{1,}$/i.test(u.hostname)) return null;
      return u.href;
    } catch (e) { return null; }
  }
  function safeEmail(v) {
    var s = cleanText(v, 254);
    return s && /^[^\s@<>()"]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(s) ? s : null;
  }
  function safePhone(v) {
    var s = cleanText(v, 40);
    return s && /^[+0-9()\-.\s]{6,40}$/.test(s) && /\d{3,}/.test(s.replace(/\D/g, "")) ? s : null;
  }
  /* ISO-like date or datetime → ISO string; invalid → null */
  function isoDate(v, endOfDay) {
    if (v == null || v === "") return null;
    if (typeof v === "number") { var dn = new Date(v); return isNaN(dn) ? null : dn.toISOString(); }
    if (typeof v !== "string") return null;
    var s = v.trim();
    if (!/^\d{4}-\d{2}-\d{2}([T ][0-9:.]+(Z|[+-]\d{2}:?\d{2})?)?$/.test(s)) return null;
    /* a date without time is a whole day in Korea time; deadlines ("end") last until 23:59:59 */
    var d = new Date(s.length === 10 ? s + (endOfDay ? "T23:59:59+09:00" : "T00:00:00+09:00") : s.replace(" ", "T"));
    if (isNaN(d)) return null;
    var y = d.getUTCFullYear();
    return y < 1990 || y > 2100 ? null : d.toISOString();
  }
  function num(v, min, max) {
    var n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
    return typeof n === "number" && isFinite(n) && (min == null || n >= min) && (max == null || n <= max) ? n : null;
  }
  function oneOf(v, list, dflt) { return list.indexOf(v) >= 0 ? v : dflt; }
  function slug(v) { return String(v == null ? "" : v).trim().replace(/[^\w.\-가-힣]/g, "-").replace(/-+/g, "-").slice(0, 120); }

  function normSource(src, errors) {
    src = isObj(src) ? src : {};
    var out = {
      providerName: cleanText(src.providerName, 120),
      sourceUrl: safeUrl(src.sourceUrl),
      fetchedAt: isoDate(src.fetchedAt),
      updatedAt: isoDate(src.updatedAt),
      license: cleanText(src.license, 200),
      attribution: cleanText(src.attribution, 300)
    };
    if (!out.providerName) errors.push("source.providerName");
    if (src.sourceUrl && !out.sourceUrl) errors.push("source.sourceUrl:invalid");
    return out;
  }
  function normLocation(loc, warnings) {
    if (!isObj(loc)) return null;
    var lat = num(loc.latitude, -90, 90), lng = num(loc.longitude, -180, 180);
    if ((loc.latitude != null || loc.longitude != null) && (lat == null || lng == null)) { warnings.push("location.coordinates:dropped"); lat = lng = null; }
    if (lat === 0 && lng === 0) { warnings.push("location.coordinates:null-island"); lat = lng = null; }
    var out = {
      country: cleanText(loc.country, 60), region: cleanText(loc.region, 60), city: cleanText(loc.city, 60), district: cleanText(loc.district, 60),
      address: cleanText(loc.address, 300), roadAddress: cleanText(loc.roadAddress, 300), detailAddress: cleanText(loc.detailAddress, 300), latitude: lat, longitude: lng
    };
    return Object.keys(out).some(function (k) { return out[k] != null; }) ? out : null;
  }
  function normSchedule(sc, warnings) {
    if (!isObj(sc)) return null;
    var out = { startAt: isoDate(sc.startAt), endAt: isoDate(sc.endAt, true), timezone: cleanText(sc.timezone, 60) || (sc.startAt ? "Asia/Seoul" : null), recurrence: cleanText(sc.recurrence, 200) };
    if (sc.startAt && !out.startAt) warnings.push("schedule.startAt:invalid");
    if (sc.endAt && !out.endAt) warnings.push("schedule.endAt:invalid");
    if (out.startAt && out.endAt && out.endAt < out.startAt) { warnings.push("schedule.endAt:before-start"); out.endAt = null; }
    return out.startAt || out.endAt || out.recurrence ? out : null;
  }
  function normPricing(p) {
    if (!isObj(p)) return null;
    var out = { type: oneOf(p.type, PRICING, "unknown"), amount: num(p.amount, 0), currency: cleanText(p.currency, 3) || (p.amount != null || p.min != null ? "KRW" : null), min: num(p.min, 0), max: num(p.max, 0) };
    if (out.min != null && out.max != null && out.max < out.min) out.max = null;
    return out;
  }
  function normPeriod(p, warnings, name) {
    if (!isObj(p)) return null;
    var out = { start: isoDate(p.start), end: isoDate(p.end, true), note: cleanText(p.note, 200) };
    if (p.end && !out.end) warnings.push(name + ".end:invalid");
    return out.start || out.end || out.note ? out : null;
  }

  /*
   * validateEntity(raw) → { ok, entity, errors, warnings }
   * errors reject the record; warnings only drop the offending field.
   */
  function validateEntity(raw) {
    var errors = [], warnings = [];
    if (!isObj(raw)) return { ok: false, entity: null, errors: ["not-an-object"], warnings: warnings };
    var type = TYPES.indexOf(raw.type) >= 0 ? raw.type : null;
    if (!type) errors.push("type");
    var provider = slug(raw.provider), providerId = slug(raw.providerId);
    if (!provider) errors.push("provider");
    if (!providerId) errors.push("providerId");
    var title = cleanText(raw.title || (type === "expert" ? raw.name : null), L.titleMax);
    if (!title) errors.push("title");
    var e = {
      id: provider && providerId && type ? provider + ":" + type + ":" + providerId : null,
      type: type, provider: provider, providerId: providerId,
      title: title,
      summary: cleanText(raw.summary, L.summaryMax),
      description: cleanText(raw.description, L.descriptionMax),
      category: cleanText(raw.category, 60),
      tags: cleanList(raw.tags),
      lifeStages: cleanList(raw.lifeStages, 7, 3).filter(function (s) { return /^[1-7]0$/.test(s); }),
      interests: cleanList(raw.interests),
      topicIds: cleanList(raw.topicIds, 30, 80).filter(function (s) { return /^[1-7]0s\.[\w-]+$/.test(s); }),
      source: normSource(raw.source, errors),
      location: normLocation(raw.location, warnings),
      schedule: normSchedule(raw.schedule, warnings),
      pricing: normPricing(raw.pricing),
      availability: isObj(raw.availability) ? { status: oneOf(raw.availability.status, AVAILABILITY, "unknown"), externalUrl: safeUrl(raw.availability.externalUrl) } : null,
      contact: isObj(raw.contact) ? { website: safeUrl(raw.contact.website), phone: safePhone(raw.contact.phone), email: safeEmail(raw.contact.email) } : null,
      media: isObj(raw.media) ? { thumbnail: safeUrl(raw.media.thumbnail), images: (Array.isArray(raw.media.images) ? raw.media.images : []).map(safeUrl).filter(Boolean).slice(0, 10) } : null,
      metadata: {}
    };
    if (raw.contact && raw.contact.website && !(e.contact && e.contact.website)) warnings.push("contact.website:invalid");

    /* type-specific */
    var spec = TYPE_FIELDS[type] || {};
    (spec.text || []).forEach(function (k) { e[k] = cleanText(raw[k], 300); });
    (spec.list || []).forEach(function (k) { e[k] = cleanList(raw[k], 20, 80); });
    (spec.url || []).forEach(function (k) { e[k] = safeUrl(raw[k]); if (raw[k] && !e[k]) warnings.push(k + ":invalid"); });
    (spec.date || []).forEach(function (k) { e[k] = isoDate(raw[k], /End$/.test(k)); if (raw[k] && !e[k]) warnings.push(k + ":invalid"); });
    (spec.number || []).forEach(function (k) { e[k] = num(raw[k], 0); });
    (spec.bool || []).forEach(function (k) { e[k] = typeof raw[k] === "boolean" ? raw[k] : null; });
    (spec.period || []).forEach(function (k) { e[k] = normPeriod(raw[k], warnings, k); });

    if (type === "place") {
      /* label/value rows exactly as a provider gives them (e.g. TourAPI 소개정보); empty values dropped */
      e.info = (Array.isArray(raw.info) ? raw.info : []).slice(0, 30).map(function (r) {
        return isObj(r) ? { label: cleanText(r.label, 40), value: cleanText(r.value, 300) } : null;
      }).filter(function (r) { return r && r.label && r.value; });
      /* photos keep their licence and credit; a photo without a stated licence is dropped */
      e.photos = (Array.isArray(raw.photos) ? raw.photos : []).slice(0, 20).map(function (ph) {
        if (!isObj(ph)) return null;
        var o = { url: safeUrl(ph.url), thumb: safeUrl(ph.thumb) || safeUrl(ph.url), name: cleanText(ph.name, 120), license: cleanText(ph.license, 20), licenseLabel: cleanText(ph.licenseLabel, 80), credit: cleanText(ph.credit, 120) };
        return o.url && o.license && o.credit ? o : null;
      }).filter(Boolean);
    }
    if (type === "expert") {
      if (!e.name) e.name = title;
      /* LIVON has not verified anyone: provider-claimed credentials are kept as text, never as a badge */
      e.verifiedByLivon = false;
      e.trustLevel = TRUST_LEVELS.indexOf(e.trustLevel) >= 0 ? e.trustLevel : null;
      /* only a partner flow may ever set partner_verified; a data feed cannot */
      if (e.trustLevel === "partner_verified") e.trustLevel = null;
    }
    if (type === "event") {
      e.eventStatus = oneOf(e.eventStatus, EVENT_STATUS, "unknown");
      if (!e.source.sourceUrl) errors.push("event:source.sourceUrl");
      if (!e.schedule || !e.schedule.startAt) errors.push("event:schedule.startAt");
    }
    if (type === "policy") {
      e.officialSource = e.officialSource || e.source.sourceUrl;
      if (!e.officialSource) errors.push("policy:officialSource");
      if (!e.agency) warnings.push("policy:agency-missing");
    }
    /* a map page (e.g. 카카오맵) is never promoted to an "official" URL */
    if (type === "place") e.officialUrl = e.officialUrl || (e.mapUrl ? null : e.source.sourceUrl || (e.contact && e.contact.website)) || null;

    /* metadata: flat scalars only — no raw payloads or nested objects reach the UI */
    if (isObj(raw.metadata)) Object.keys(raw.metadata).slice(0, 20).forEach(function (k) {
      var v = raw.metadata[k];
      if (typeof v === "string") { var t = cleanText(v, 200); if (t) e.metadata[slug(k)] = t; }
      else if (typeof v === "number" && isFinite(v)) e.metadata[slug(k)] = v;
      else if (typeof v === "boolean") e.metadata[slug(k)] = v;
    });
    return { ok: !errors.length, entity: errors.length ? null : e, errors: errors, warnings: warnings };
  }

  root.LivonDataSchema = {
    TYPES: TYPES, TYPE_LABEL: TYPE_LABEL, TYPE_FIELDS: TYPE_FIELDS, TRUST_LEVELS: TRUST_LEVELS,
    validateEntity: validateEntity, cleanText: cleanText, cleanList: cleanList, safeUrl: safeUrl, isoDate: isoDate
  };
})(typeof window !== "undefined" ? window : globalThis);
