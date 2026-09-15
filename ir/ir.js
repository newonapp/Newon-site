(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LANG_KEY = "newon-ir-lang";

  var EN = {
    skip: "Skip to content",
    "nav.aria": "IR sections",
    "nav.start": "Start",
    "nav.exec": "Execution",
    "nav.products": "Products",
    "nav.company": "Company",
    "nav.web": "Web",
    "nav.studio": "Studio",
    "nav.model": "Model",
    "nav.seed": "Invest",
    "nav.contact": "Contact",
    "hero.eyebrow": 'IR<span class="ir-eyebrow__sep">·</span>Product &amp; venture studio',
    "hero.stackAria": "Key facts",
    "hero.apps": "11 apps.",
    "hero.web": "One web.",
    "hero.months": "6 months.",
    "hero.founder": "1 founder.",
    "hero.sub": "A 22-year-old solo founder who planned,<br />built, and shipped 11 apps and Newon Web<br />in 6 months",
    "hero.craft": "Plan → design → build → ship — in-house",
    "hero.ctaSeed": "Investment &amp; Partnership ↓",
    "hero.ctaContact": "Contact",
    "glance.aria": "At a glance",
    "glance.at": "At a glance",
    "glance.live": "Live",
    "glance.apps": "Apps",
    "glance.axis": "Company timeline",
    "time.now": "Now",
    "time.build": "Build",
    "time.next": "Next",
    "time.focus": "Focus",
    "time.connect": "Connect",
    "time.later": "Later",
    "time.expand": "Expand · Scale",
    "time.expandShort": "Expand",
    "life.aria": "Product lifecycle",
    "life.idea": "Idea",
    "life.plan": "Planning",
    "life.dev": "Development",
    "life.launch": "Launch",
    "life.ship": "Distribution",
    "life.ops": "Operations",
    "life.build": "Build",
    "life.auto": "Automation",
    "life.research": "Research",
    "life.solution": "Solutions",
    "p02.n": "02 / Founder execution",
    "p02.h": "One person. End to end.",
    "p02.lead":
      "A 22-year-old solo founder plans, designs, builds, and ships in-house. 11 apps are not the end — they are the start of one Newon ecosystem.",
    "p02.rowAria": "Execution facts",
    "p02.age": "Solo founder",
    "p02.time": "Build time",
    "p02.apps": "Apps",
    "p02.web": "Web",
    "p02.verbsAria": "Operating principle",
    "p02.verbs": "Build wide. Validate fast. Focus deep. Connect what works.",
    "p02.verbsEm": "Separate apps into one Newon ecosystem. Next is focus.",
    "p03.n": "03 / Why Newon",
    "p03.h": "Life is connected.<br />The services we use are not.",
    "p03.lead":
      "Newon finds repeating problems in daily life, solves them with digital products, then validates and connects what works.",
    "p03.sinkAria": "Separated life axes",
    "axis.finance": "Finance",
    "axis.health": "Health",
    "axis.habit": "Habits",
    "axis.family": "Family",
    "axis.pet": "Pets",
    "axis.travel": "Travel",
    "axis.sub": "Subscriptions",
    "p03.s1": "Problem",
    "p03.s1p": "Fragmented life services",
    "p03.s2": "Product",
    "p03.s2p": "A digital product for each",
    "p03.s3": "Focus",
    "p03.s3p": "Core products · retention · PMF",
    "p03.s4": "Connect",
    "p03.s4p": "Connect only what is proven",
    "p04.n": "04 / 11 digital products",
    "p04.eye": "Portfolio",
    "p04.h": "Arranged along the axes of daily life.",
    "p04.lead":
      "The 11 apps are an initial portfolio. Next, we do not grow everything at once. We focus on core products by response and commercial fit.",
    "p04.assetAria": "Company assets",
    "p04.asset": "11 digital products",
    "p04.apps": "Apps",
    "p04.appsEm": "Live · 11",
    "p04.aiEm": "Now on web",
    "p04.games": "Games",
    "p04.gamesEm": "Early / web",
    "p04.tools": "Tools",
    "p04.toolsEm": "Live on web",
    "p04.pathAria": "Focus path",
    "p04.path1": "Portfolio",
    "p04.path2": "Validate",
    "p04.path3": "Focus",
    "p04.path4": "Connect",
    "p04.board0": "11 digital products → one brand → Newon+ hub",
    "tag.core": "Core",
    "tag.daily": "Daily",
    "tag.challenge": "Challenge",
    "tag.travel": "Travel · Hub",
    "p05.n": "05 / Company portfolio",
    "p05.flag": "Product &amp; venture studio",
    "p05.h": "Beyond<br />11 apps.",
    "p05.lead": "The five axes are not equal. Products are the core. Web / Newon+ is infrastructure.",
    "p05.ax1": "01 · Core",
    "p05.products": "Products",
    "p05.ax1a": "11 apps <i>live</i>",
    "p05.ax1b": "AI <i>now on web</i>",
    "p05.ax1c": "Games <i>early</i>",
    "p05.ax1d": "Tools <i>live on web</i>",
    "p05.oneCo": "One company",
    "p05.five": "5 axes",
    "p05.ax2": "02 · Early revenue",
    "p05.biz": "Business",
    "p05.ax3": "03 · Market edge",
    "p05.studio": "Studio",
    "p05.brand": "Brand",
    "p05.digital": "Digital",
    "p05.content": "Content",
    "p05.ax4": "04 · Experiments",
    "p05.resource": "Resources",
    "p05.store": "Store <i>digital</i>",
    "p05.insight": "Insights",
    "p05.blog": "Blog",
    "p05.labs": "Labs <i>experiments</i>",
    "p05.ax5": "05 · Infrastructure",
    "p05.platform": "Platform",
    "p05.webLive": "Newon Web <i>live</i>",
    "p05.account": "Account",
    "p05.aiLayer": "AI layer",
    "p05.company": "Company",
    "p05.flow":
      "Core products · infrastructure Web / Newon+ · early business / studio · experimental resources · later commerce / market / booking",
    "p06.n": "06 / Product expansion",
    "p06.h": "From finance and health to automation and commerce.",
    "p06.lead": "Current features and next steps are separate. This is not a plan to do everything at once.",
    "x.sub.now": "Subscription tracking",
    "x.sub.next": "Auto add → payment detection → automation → shared plans → family/friends",
    "x.savy.now": "AI ledger",
    "x.savy.next": "Auto import → auto classify → AI analysis → budget tips → savings automation",
    "x.pill.now": "Dose · alerts · stock · family",
    "x.pill.next": "Personalized recs → supplement shopping / commerce",
    "p07.n": "07 / Product expansion",
    "p07.h": "The next step for family, challenges, and travel.",
    "p07.lead": "Community, commerce, and booking are Phase 04 expansion. The path is open. It is not live yet.",
    "x.baby.now": "Logs · AI · family share",
    "x.baby.next": "Community → shopping → used goods → booking",
    "x.pet.next": "Community → shopping → used goods → clinic/grooming/service booking",
    "x.goal.now": "Goals",
    "x.goal.next": "Challenges",
    "x.count.now": "Streaks",
    "x.count.next": "Challenges / ranking / rewards",
    "x.piggy.now": "Saving",
    "x.piggy.next": "Savings challenges / community / rewards",
    "x.world.now": "Trip logs · plans",
    "x.world.next": "AI → community → stays → flights → tours → packages → travel goods → booking",
    "p08.eye": "Connection layer",
    "p08.h": "One account.<br />Many products.",
    "p08.lead": "One Newon experience. Connect proven products to deepen relationship and retention per user.",
    "p08.rolesAria": "Newon+ roles",
    "p08.id": "Identity",
    "p08.mem": "Membership",
    "p08.sub": "Subscriptions",
    "p08.perk": "Perks",
    "p08.rec": "Recommend",
    "p08.cross": "Cross-discovery",
    "p08.fly1": "Acquire",
    "p08.fly1s": "One product",
    "p08.fly2": "Discover more",
    "p08.fly2s": "Other Newon products",
    "p08.ret": "Retention",
    "p08.eco": "Ecosystem",
    "p08.path":
      'SSO → profile → app link → subscribe → package → membership → recommend → AI → perks → <span class="ir-flag">PLANNED</span> Newon Store',
    "web.liveFlag": "Now · live",
    "web.liveH": "NEWON.APP is live.",
    "web.h": "Digital HQ · Distribution hub",
    "web.hub": "Distribution hub",
    "web.lead": "The digital HQ / distribution hub where every company axis meets.",
    "web.cap": "Now · www.newon.app",
    "web.discover": "Discover",
    "web.leadN": "Leads",
    "web.dist": "Distribution",
    "web.partner": "Partnerships",
    "web.hq": "HQ",
    "web.svc": "Service hub",
    "web.webapp": "Web apps",
    "web.store": "Store",
    "web.later": "Later · planned",
    "web.commerce": "Commerce",
    "web.market": "Marketplace",
    "web.book": "Booking",
    "p10.n": "10 / AI · automation",
    "p10.h": "NEWON Intelligence.",
    "p10.flag": "Vision · seed-funded",
    "p16.p3a": "Newon+ · account",
    "p19.t3": "Web<br />NEWON+<br />AI",
    "p10.note":
      "Shared AI infrastructure. Privacy first. User consent required. This round lays the base. Full-product expansion comes later.",
    "ai.pipe": "Pipeline",
    "ai.pipeP": "From records in each app to action.",
    "ai.rules": "Principles",
    "ai.rulesP": "Shared base. Privacy first. User consent.",
    "ai.round": "This round",
    "ai.roundP": "Lay the base. Full-product expansion comes later.",
    "ai.r1": "Shared infrastructure first",
    "ai.r2": "Nothing without consent",
    "ai.r3": "Full-product expansion later",
    "ai.kicker": "Product data → Context → AI → Personalization → Recommend → Automate → Action",
    "ai.flow": "DATA → ACTION",
    "ai.1": "Product data",
    "ai.1d": "Records from each app",
    "ai.2": "Context",
    "ai.2d": "Time, situation, intent",
    "ai.3": "AI",
    "ai.3d": "Shared infrastructure",
    "ai.4": "Personalization",
    "ai.4d": "Fit to the user",
    "ai.5d": "What comes next",
    "ai.6d": "Cut repetitive work",
    "ai.7": "Action",
    "ai.7d": "Make it happen",
    "ai.p1": "Shared AI infrastructure",
    "ai.p1d": "Every product uses the same base.",
    "ai.p2": "Privacy first",
    "ai.p2d": "Designed to protect data first.",
    "ai.p3": "User consent required",
    "ai.p3d": "Nothing without consent.",
    "ai.p4": "This round · the base",
    "ai.p4s": "Full-product expansion comes later.",
    "p11.n": "11 / Commerce · market · booking",
    "p11.flag": "PLANNED · PHASE 04 · Expansion",
    "p11.lead":
      "We do not build all of this now. After core-product validation, we connect it in Phase 04 expansion.",
    "p11.storeP": "B2C COMMERCE. Newon/brand → sells goods to users.",
    "p11.s1": "Pillmate → supplements",
    "p11.s2": "BabyLog → baby goods",
    "p11.s3": "PetLog → pet goods",
    "p11.s4": "My World → travel goods",
    "p11.marketP": "C2C / P2P MARKETPLACE. User ↔ user used-goods and trade matching.",
    "p11.m1": "BabyLog → used baby goods",
    "p11.m2": "PetLog → used pet goods",
    "p11.m3": "Later vertical markets",
    "p11.bookP": "SERVICE BOOKING. User → clinic / grooming / family services / stays / tours.",
    "p11.b1": "PetLog → clinic / grooming",
    "p11.b2": "BabyLog → family services",
    "p11.b3": "My World → stays / tours / travel",
    "p12.n": "12 / Business · studio",
    "p12.flag": "Live on web · different roles",
    "p12.h": "The axis that solves problems.<br />The axis that builds brands.",
    "p12.bizH": "Build / automate / solve",
    "p12.bizP":
      "Product build, workflow automation, research, and digital solutions for companies and founders. Not outsourcing — a way to earn revenue, customers, market data, and technical depth.",
    "p12.stH": "Creative / brand engine",
    "p12.stP": "A creative engine for Newon’s own brands and for others. Not a UI freelance page.",
    "p12.l1": "Brand — identity · strategy · naming · logo",
    "p12.l2": "Digital — web · app · landing · product",
    "p12.l3": "Content — social · campaigns · visual",
    "p12.l4": "IP — characters · stickers · experimental IP",
    "p12.loop2": "Users / data / insight",
    "p12.loop3": "Business + studio",
    "p12.loop4": "Revenue / customer problems",
    "p12.loop5": "New product insight",
    "p13.n": "13 / Revenue model",
    "p13.h": "Revenue structure.",
    "p13.lead":
      "The structure can expand Subscription → Commerce → SaaS/B2B → Platform. We separate having a model from having revenue.",
    "p13.now": "Current model",
    "p13.sub": "App subscriptions",
    "p13.subP": "Monthly/yearly per app. A live store revenue model.",
    "p13.early": "Early model",
    "p13.b2b": "Studio / B2B",
    "p13.b2bP":
      "Build · automation · research · solutions · studio. Public service offers on the web. No revenue figures.",
    "p13.planned": "Planned scale",
    "p13.scale": "Scale layer",
    "p13.scaleP": "Membership · commerce · marketplace · booking · partnerships",
    "p13.subI": "Monthly/yearly per app · live structure",
    "p13.b2bI": "Build · automation · research · solutions · studio",
    "p13.web": "Early / web",
    "p13.dstore": "Digital store",
    "p13.dstoreI": "Templates · guides · digital goods",
    "p13.plus": "NEWON+ membership",
    "p13.plusI": "Bundled membership / packages",
    "p13.cmb": "Commerce / market / booking",
    "p13.partI": "Brand challenges · distribution",
    "p14.n": "14 / Defense · loop",
    "p14.flag": "What we can claim now",
    "p14.h": "Shipping many apps<br />is not the moat.",
    "p14.lead":
      "What we can claim is speed and structure. Network effects, data moats, and market dominance are not included.",
    "p14.core": "Core",
    "p14.infra": "Infrastructure",
    "p14.early": "Early",
    "p14.exp": "Experiments",
    "p14.d1": "Fast product execution",
    "p14.d2": "Multi-product structure",
    "p14.d3": "Founder-led product development",
    "p14.d4": "Shared infrastructure",
    "p14.d5": "Cross-product expansion path",
    "p14.d6": "Web distribution",
    "p14.d7": "B2C + B2B feedback loop",
    "p15.n": "15 / Global distribution",
    "p15.flag": "Product footprint · not traction",
    "p15.h": "13 languages. Released in 177 countries.",
    "p15.lead":
      "Built in Korea. Released and distributed to 177 countries via App Store / Google Play. 177 is countries available, not users.",
    "p15.note": "Website: 9 languages · Apps: 13 languages",
    "p15.lang": "Languages",
    "p15.langS": "supported",
    "p15.release": "Release",
    "p15.releaseS": "countries",
    "p15.stores": "Stores",
    "p15.from": "Origin",
    "p15.kr": "Korea",
    "p15.fromS": "From planning to distribution",
    "p15.releaseD": "177 is countries available, not users.",
    "p16.n": "16 / Company roadmap",
    "p16.mantra": "A large vision. Focused execution.",
    "p16.h": "We do not do everything at once.",
    "p16.lead": "We accelerate focus → validate → connect. It is a company roadmap, not apps only.",
    "p16.p1": "01 Done",
    "p16.p1a": "11 apps",
    "p16.p1c": "Business · studio",
    "p16.p1d": "Resources · brand",
    "p16.p2": "02 Now",
    "p16.p2a": "Core products",
    "p16.p2b": "B2B · studio clients",
    "p16.p2c": "Users · retention · PMF",
    "p16.p2d": "Content / SEO",
    "p16.p3": "03 Next",
    "p16.p3b": "AI · web hub",
    "p16.p3c": "Cross-product",
    "p16.p4": "04 Later",
    "p16.p4a": "Commerce · store",
    "p16.p4b": "Marketplace · booking",
    "p16.p4c": "Challenges · community",
    "p16.p5": "05 Later",
    "p16.scale": "Scale",
    "p16.p5a": "B2B solutions",
    "p16.p5b": "Global · distribution",
    "p16.p5d": "New markets",
    "p17.n": "17 / Investment &amp; Partnership",
    "p17.status": "Open to Investment &amp; Strategic Partnerships",
    "p17.h": "Let's Build<br />the Next Newon",
    "p17.why":
      "This is not a round to scale all 11 services at once. It is to choose core products, validate users, retention, and profitability, and build a Newon+ connection layer for one ecosystem.",
    "p17.focusD": "Choose the core products to grow now.",
    "p17.validD": "Validate users, retention, and profitability.",
    "p17.connectD": "Build the Newon+ connection layer.",
    "p17.u1": "Deepen existing apps and expand the Newon ecosystem",
    "p17.u2": "Acquire users and grow brand / marketing",
    "p17.u3": "Commerce expansion for BabyLog, PetLog, Pillmate, and more",
    "p17.u4": "Expand SaaS, automation, and enterprise solutions",
    "p17.u5": "Acquire global users and expand overseas markets",
    "p18.n": "18 / Use of Funds",
    "p18.flag": "GROWTH PLAN",
    "p18.h": "Where growth goes.",
    "p18.lead": "We do not buy the whole vision at once. Focus follows Product · Growth · Commerce · SaaS / B2B · Global.",
    "p18.d1": "Deepen existing apps and expand the Newon ecosystem",
    "p18.d2": "Acquire users and grow brand / marketing",
    "p18.d3": "Commerce expansion for BabyLog, PetLog, Pillmate, and more",
    "p18.d4": "Expand SaaS, automation, and enterprise solutions",
    "p18.d5": "Acquire global users and expand overseas markets",
    "p18.g1": "Focus / connect",
    "p18.g2": "Validate / acquire",
    "p18.g3": "Controlled expansion",
    "p18.g4": "Enterprise / automation",
    "p18.g5": "Korea → Global",
    "p18.total": "Focus. Validate. Connect. · Korea → Global",
    "p19.n": "19 / Vision",
    "p19.today": "Today",
    "p19.t1": "11 apps<br />+ web<br />+ studio",
    "p19.t2": "Prove<br />what works",
    "p19.t4": "Commerce<br />market<br />booking",
    "p19.t5": "Global<br />platform",
    "p19.lock": "NEWON · product &amp; venture studio · building a connected lifestyle ecosystem.",
    "p20.n": "20 / Partners · investors",
    "p20.kicker": "We are looking for",
    "p20.h": "Connect.",
    "p20.lead": "Not capital only. A network that accelerates focus → validate → connect together.",
    "p20.s1": "Capital",
    "p20.s2": "Partners",
    "p20.s5": "Global network",
    "p20.seed": "Investment &amp; Partnership",
    "p20.i1": "Investors",
    "p20.i1p": "Open to follow-up meetings",
    "p20.i2p": "Connect products and channels",
    "p20.i3p": "Challenges and collabs",
    "p20.i4p": "Later vertical expansion",
    "p20.i5p": "Stores and distribution",
    "p20.i6p": "Released in 177 countries",
    "p21.n": "21 / Contact",
    "p21.name": "Nawon Kyung",
    "p21.h": "From 11 apps + web<br /><span>into one ecosystem.</span>",
    "p21.role": "Founder · App Developer",
    "p21.front": "Front",
    "p21.back": "Back · See Newon →",
    "p21.qr": "See Newon via QR",
    "p21.foot": "Newon IR · Open to Investment &amp; Strategic Partnerships",
    "title": "NEWON IR — 11 apps + Newon Web",
    "desc": "Newon IR. A 22-year-old solo founder built 11 apps and Newon Web in 6 months. Open to investment and partnership."
  };

  function currentLang() {
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q === "en" || q === "ko") return q;
    } catch (_) {}
    try {
      var stored = window.localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "ko") return stored;
    } catch (_) {}
    return "ko";
  }

  function applyLang(lang) {
    lang = lang === "en" ? "en" : "ko";
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-ir-lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!el.hasAttribute("data-i18n-ko")) {
        el.setAttribute("data-i18n-ko", el.innerHTML);
      }
      if (lang === "en" && Object.prototype.hasOwnProperty.call(EN, key)) {
        el.innerHTML = EN[key];
      } else {
        el.innerHTML = el.getAttribute("data-i18n-ko");
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (!el.hasAttribute("data-i18n-aria-ko")) {
        el.setAttribute("data-i18n-aria-ko", el.getAttribute("aria-label") || "");
      }
      if (lang === "en" && Object.prototype.hasOwnProperty.call(EN, key)) {
        el.setAttribute("aria-label", EN[key]);
      } else {
        el.setAttribute("aria-label", el.getAttribute("data-i18n-aria-ko"));
      }
    });

    var title = document.querySelector("title");
    if (title) {
      if (!title.hasAttribute("data-i18n-ko")) title.setAttribute("data-i18n-ko", title.textContent);
      title.textContent = lang === "en" ? EN.title : title.getAttribute("data-i18n-ko");
    }
    var desc = document.querySelector('meta[name="description"]');
    if (desc) {
      if (!desc.hasAttribute("data-i18n-ko")) desc.setAttribute("data-i18n-ko", desc.getAttribute("content") || "");
      desc.setAttribute("content", lang === "en" ? EN.desc : desc.getAttribute("data-i18n-ko"));
    }

    document.querySelectorAll("[data-ir-lang]").forEach(function (btn) {
      var on = btn.getAttribute("data-ir-lang") === lang;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function persistLang(lang) {
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch (_) {}
    try {
      var url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (_) {}
  }

  function bindLang() {
    document.querySelectorAll("[data-ir-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-ir-lang") === "en" ? "en" : "ko";
        persistLang(lang);
        applyLang(lang);
      });
    });
  }

  function reveal() {
    var nodes = document.querySelectorAll("[data-ir-reveal]");
    if (!nodes.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  function navSpy() {
    var links = document.querySelectorAll(".ir-nav__link");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = (a.getAttribute("href") || "").slice(1);
      if (id) map[id] = a;
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var link = map[entry.target.id];
          if (!link) return;
          links.forEach(function (el) {
            el.classList.toggle("is-on", el === link);
          });
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0.01 }
    );
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  function isPrintMode() {
    try {
      return new URLSearchParams(window.location.search).get("print") === "1";
    } catch (_) {
      return false;
    }
  }

  function boot() {
    applyLang(currentLang());
    bindLang();
    if (isPrintMode()) {
      document.documentElement.setAttribute("data-ir-print", "1");
      document.querySelectorAll("[data-ir-reveal]").forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    reveal();
    navSpy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
