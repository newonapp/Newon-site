/**
 * Studio service detail hero visuals — one unique panel per service keyword.
 * Reuses Business bs-visual shell (mono, editorial, live indicators).
 */

function panelShell({ mod, live, meta, body }) {
  return `<div class="bs-visual bs-visual--studio bs-visual--${mod}" aria-hidden="true">
  <div class="bs-sv">
    <div class="bs-sv__head">
      <span class="bs-sv__live"><i></i> ${live}</span>
      <span class="bs-sv__meta">${meta}</span>
    </div>
    <div class="bs-sv__body">${body}</div>
  </div>
</div>`;
}

/** Brand Strategy — positioning board */
export function visualStrategy() {
  return panelShell({
    mod: "strategy",
    live: "POSITIONING BOARD",
    meta: "STRATEGY",
    body: `
      <div class="bs-sv-strategy">
        <aside class="bs-sv-strategy__side">
          <p class="bs-sv__k">INPUTS</p>
          <ul class="bs-sv-strategy__list">
            <li class="is-on"><span>01</span><strong>Market</strong></li>
            <li class="is-on"><span>02</span><strong>Audience</strong></li>
            <li><span>03</span><strong>Competitors</strong></li>
            <li><span>04</span><strong>Message</strong></li>
          </ul>
        </aside>
        <div class="bs-sv-strategy__map">
          <p class="bs-sv__k">WHERE THE BRAND STANDS</p>
          <div class="bs-sv-strategy__canvas">
            <span class="bs-sv-strategy__axis y">Premium</span>
            <span class="bs-sv-strategy__axis x">Niche</span>
            <span class="bs-sv-strategy__axis xr">Mass</span>
            <span class="bs-sv-strategy__dot" style="left:28%;top:32%">A</span>
            <span class="bs-sv-strategy__dot" style="left:62%;top:24%">B</span>
            <span class="bs-sv-strategy__dot" style="left:74%;top:58%">C</span>
            <span class="bs-sv-strategy__you" style="left:46%;top:48%">YOU</span>
            <span class="bs-sv-strategy__zone"></span>
          </div>
          <div class="bs-sv-strategy__out">
            <div><span>POSITION</span><strong>Clear</strong></div>
            <div><span>MESSAGE</span><strong>Defined</strong></div>
            <div><span>NEXT</span><strong>Naming</strong></div>
          </div>
        </div>
      </div>`,
  });
}

/** Naming — naming process board */
export function visualNaming() {
  return panelShell({
    mod: "naming",
    live: "NAMING PROCESS",
    meta: "NAMING",
    body: `
      <div class="bs-sv-naming">
        <div class="bs-sv-naming__cols">
          <div class="bs-sv-naming__col">
            <p class="bs-sv__k">BRAND</p>
            <div class="bs-sv-naming__chips">
              <span class="is-on">Brand / Product</span>
            </div>
            <p class="bs-sv__k">KEYWORDS</p>
            <div class="bs-sv-naming__chips">
              <span class="is-on">Core meaning</span>
            </div>
            <p class="bs-sv__k">DIRECTIONS</p>
            <div class="bs-sv-naming__chips">
              <span class="is-on">Descriptive</span>
              <span>Compound</span>
              <span class="is-on">Evocative</span>
              <span>Invented</span>
            </div>
          </div>
          <div class="bs-sv-naming__col">
            <p class="bs-sv__k">CANDIDATES</p>
            <ul class="bs-sv-naming__cands">
              <li class="is-on"><strong>Name A</strong><em>Shortlist</em></li>
              <li><strong>Name B</strong><em>Explore</em></li>
              <li><strong>Name C</strong><em>Explore</em></li>
            </ul>
            <p class="bs-sv__k">FINAL</p>
            <ul class="bs-sv-naming__cands">
              <li class="is-on"><strong>Recommended Name</strong><em>Selected</em></li>
            </ul>
          </div>
        </div>
        <div class="bs-sv-naming__criteria">
          <div><span>Meaning</span><strong>Reviewed</strong></div>
          <div><span>Pronunciation</span><strong>Reviewed</strong></div>
          <div><span>Expansion</span><strong>Considered</strong></div>
        </div>
      </div>`,
  });
}

/** Identity — visual system */
export function visualIdentity() {
  return panelShell({
    mod: "identity",
    live: "IDENTITY SYSTEM",
    meta: "IDENTITY",
    body: `
      <div class="bs-sv-id">
        <div class="bs-sv-id__row">
          <div class="bs-sv-id__cell">
            <p class="bs-sv__k">COLOR</p>
            <div class="bs-sv-id__swatches">
              <span class="is-ink"></span><span class="is-mid"></span><span class="is-soft"></span><span class="is-paper"></span>
            </div>
          </div>
          <div class="bs-sv-id__cell">
            <p class="bs-sv__k">TYPE</p>
            <p class="bs-sv-id__specimen">Aa</p>
            <p class="bs-sv-id__meta">Display · Body</p>
          </div>
        </div>
        <div class="bs-sv-id__row">
          <div class="bs-sv-id__cell is-wide">
            <p class="bs-sv__k">GRAPHIC LANGUAGE</p>
            <div class="bs-sv-id__motif">
              <i></i><i></i><i></i><i></i><i></i><i></i>
            </div>
          </div>
        </div>
        <div class="bs-sv-id__rules">
          <span>Consistent</span><span>Scalable</span><span>Channel-ready</span>
        </div>
      </div>`,
  });
}

/** Logo — construction grid */
export function visualLogo() {
  return panelShell({
    mod: "logo",
    live: "LOGO CONSTRUCTION",
    meta: "LOGO",
    body: `
      <div class="bs-sv-logo">
        <div class="bs-sv-logo__stage">
          <div class="bs-sv-logo__grid" aria-hidden="true"></div>
          <div class="bs-sv-logo__mark"><span>N</span></div>
          <p class="bs-sv-logo__word">NEWON</p>
        </div>
        <div class="bs-sv-logo__vars">
          <div class="is-on"><strong>Primary</strong><span>Full</span></div>
          <div><strong>Mono</strong><span>1-color</span></div>
          <div><strong>Icon</strong><span>App</span></div>
        </div>
      </div>`,
  });
}

/** Web design */
export function visualWebDetail() {
  return panelShell({
    mod: "web",
    live: "SITE STRUCTURE",
    meta: "WEB",
    body: `
      <div class="bs-sv-web">
        <div class="bs-sv-web__browser">
          <div class="bs-sv-web__bar">
            <div class="bs-sv-web__dots"><i></i><i></i><i></i></div>
            <span class="bs-sv-web__url">yourbrand.com</span>
          </div>
          <div class="bs-sv-web__page">
            <nav class="bs-sv-web__nav"><span class="is-on">Home</span><span>Work</span><span>About</span><span>Contact</span></nav>
            <p class="bs-sv-web__brand">YOUR BRAND</p>
            <p class="bs-sv-web__tag">Clear structure. Trustworthy presence.</p>
            <span class="bs-sv-web__cta">Explore →</span>
            <div class="bs-sv-web__wire"><i></i><i></i><i></i></div>
          </div>
        </div>
        <aside class="bs-sv-web__ia">
          <p class="bs-sv__k">IA</p>
          <ol>
            <li class="is-on">Sitemap</li>
            <li class="is-on">Wireframe</li>
            <li>UI</li>
            <li>Handoff</li>
          </ol>
        </aside>
      </div>`,
  });
}

/** App UI/UX */
export function visualAppDetail() {
  return panelShell({
    mod: "app",
    live: "APP FLOW",
    meta: "APP UI/UX",
    body: `
      <div class="bs-sv-app">
        <div class="bs-sv-app__phone">
          <div class="bs-sv-app__notch"></div>
          <div class="bs-sv-app__screen">
            <p class="bs-sv-app__kicker">TODAY</p>
            <p class="bs-sv-app__title">Your app</p>
            <div class="bs-sv-app__cards"><i></i><i></i><i></i></div>
            <span class="bs-sv-app__btn">Continue →</span>
          </div>
        </div>
        <div class="bs-sv-app__flow">
          <p class="bs-sv__k">USER FLOW</p>
          <ol>
            <li class="is-done"><span>01</span>Onboard</li>
            <li class="is-on"><span>02</span>Core task</li>
            <li><span>03</span>Return</li>
          </ol>
          <div class="bs-sv-app__meta">
            <div><span>SCREENS</span><strong>Core set</strong></div>
            <div><span>PROTO</span><strong>Interactive</strong></div>
          </div>
        </div>
      </div>`,
  });
}

/** Landing */
export function visualLandingDetail() {
  return panelShell({
    mod: "landing",
    live: "CONVERSION PAGE",
    meta: "LANDING",
    body: `
      <div class="bs-sv-lp">
        <div class="bs-sv-lp__page">
          <section class="is-hero">
            <span>HERO</span>
            <strong>One page. One action.</strong>
            <em>Start →</em>
          </section>
          <section><span>VALUE</span><i></i><i></i></section>
          <section class="is-on"><span>CTA</span><em>Get access →</em></section>
        </div>
        <aside class="bs-sv-lp__funnel">
          <p class="bs-sv__k">FUNNEL</p>
          <div class="bs-sv-lp__steps">
            <div><span>01</span><strong>ATTENTION</strong></div>
            <div><span>02</span><strong>VALUE</strong></div>
            <div class="is-on"><span>03</span><strong>PROOF</strong></div>
            <div><span>04</span><strong>ACTION</strong></div>
          </div>
        </aside>
      </div>`,
  });
}

/** Product design */
export function visualProductDesign() {
  return panelShell({
    mod: "product",
    live: "PRODUCT SYSTEM",
    meta: "PRODUCT",
    body: `
      <div class="bs-sv-product">
        <div class="bs-sv-product__arch">
          <p class="bs-sv__k">ARCHITECTURE</p>
          <div class="bs-sv-product__nodes">
            <span class="is-on">Core</span>
            <span>→</span>
            <span>Modules</span>
            <span>→</span>
            <span>UI System</span>
          </div>
        </div>
        <div class="bs-sv-product__grid">
          <div><p class="bs-sv__k">FLOW</p><div class="bs-sv-product__bars"><i></i><i></i><i></i></div></div>
          <div><p class="bs-sv__k">SCREENS</p><div class="bs-sv-product__frames"><i></i><i></i><i></i></div></div>
          <div class="is-wide"><p class="bs-sv__k">COMPONENTS</p>
            <div class="bs-sv-product__comps"><span>Button</span><span>Input</span><span>Card</span><span>Nav</span></div>
          </div>
        </div>
      </div>`,
  });
}

/** Social content */
export function visualSocial() {
  return panelShell({
    mod: "social",
    live: "CONTENT SYSTEM",
    meta: "SOCIAL",
    body: `
      <div class="bs-sv-social">
        <div class="bs-sv-social__feed">
          <p class="bs-sv__k">FEED</p>
          <div class="bs-sv-social__posts">
            <article class="is-on"><i></i><span>Pillar A</span></article>
            <article><i></i><span>Pillar B</span></article>
            <article><i></i><span>Pillar C</span></article>
            <article><i></i><span>Template</span></article>
          </div>
        </div>
        <aside class="bs-sv-social__side">
          <p class="bs-sv__k">PILLARS</p>
          <ul>
            <li class="is-on">Brand</li>
            <li>Product</li>
            <li>Culture</li>
          </ul>
          <p class="bs-sv__k">FORMATS</p>
          <div class="bs-sv-social__formats"><span>1:1</span><span>4:5</span><span>9:16</span></div>
        </aside>
      </div>`,
  });
}

/** Campaign */
export function visualCampaign() {
  return panelShell({
    mod: "campaign",
    live: "CAMPAIGN BOARD",
    meta: "CAMPAIGN",
    body: `
      <div class="bs-sv-campaign">
        <div class="bs-sv-campaign__kv">
          <p class="bs-sv__k">KEY VISUAL</p>
          <div class="bs-sv-campaign__frame">
            <strong>ONE MESSAGE</strong>
            <span>Launch moment</span>
          </div>
        </div>
        <div class="bs-sv-campaign__channels">
          <p class="bs-sv__k">CHANNELS</p>
          <div class="bs-sv-campaign__chips">
            <span class="is-on">Social</span>
            <span class="is-on">Landing</span>
            <span>Email</span>
            <span>Ads</span>
          </div>
          <div class="bs-sv-campaign__msg">
            <span>KEY MESSAGE</span>
            <strong>One idea. Many touchpoints.</strong>
          </div>
        </div>
      </div>`,
  });
}

/** Visual content */
export function visualAssets() {
  return panelShell({
    mod: "assets",
    live: "ASSET STUDIO",
    meta: "VISUAL",
    body: `
      <div class="bs-sv-assets">
        <div class="bs-sv-assets__wall">
          <div class="is-lg is-on"><span>Product</span></div>
          <div><span>Web</span></div>
          <div><span>Social</span></div>
          <div class="is-wide"><span>Campaign set</span></div>
        </div>
        <div class="bs-sv-assets__meta">
          <div><span>DIRECTION</span><strong>Locked</strong></div>
          <div><span>SIZES</span><strong>Multi</strong></div>
          <div><span>DELIVERY</span><strong>Ready</strong></div>
        </div>
      </div>`,
  });
}

/** Character Lab */
export function visualCharacterLab() {
  return panelShell({
    mod: "char",
    live: "CHARACTER SHEET",
    meta: "LAB",
    body: `
      <div class="bs-sv-char">
        <div class="bs-sv-char__figure">
          <div class="bs-sv-char__avatar"><span>★</span></div>
          <p class="bs-sv-char__name">Concept</p>
        </div>
        <div class="bs-sv-char__info">
          <p class="bs-sv__k">PERSONALITY</p>
          <div class="bs-sv-char__traits">
            <span class="is-on">Curious</span><span>Warm</span><span>Bold</span>
          </div>
          <p class="bs-sv__k">EXPRESSIONS</p>
          <div class="bs-sv-char__faces"><i></i><i class="is-on"></i><i></i><i></i></div>
          <p class="bs-sv__k">WORLD</p>
          <p class="bs-sv-char__note">Basic setting · Digital use</p>
        </div>
      </div>`,
  });
}

/** Digital stickers */
export function visualStickers() {
  return panelShell({
    mod: "stickers",
    live: "STICKER PACK",
    meta: "COMING SOON",
    body: `
      <div class="bs-sv-stickers">
        <div class="bs-sv-stickers__sheet">
          <span></span><span class="is-on"></span><span></span>
          <span></span><span></span><span class="is-on"></span>
        </div>
        <p class="bs-sv-stickers__note">Character expressions for messengers &amp; digital use.<br />Currently in preparation.</p>
      </div>`,
  });
}

/** Newon Character — internal */
export function visualNewonCharacter() {
  return panelShell({
    mod: "newonchar",
    live: "INTERNAL PROJECT",
    meta: "NEWON",
    body: `
      <div class="bs-sv-newonchar">
        <div class="bs-sv-newonchar__mark"><span>N</span></div>
        <div>
          <p class="bs-sv__k">NEWON CHARACTER</p>
          <p class="bs-sv-newonchar__lead">Newon brand IP in development.</p>
          <p class="bs-sv-newonchar__note">Not a client service.</p>
        </div>
      </div>`,
  });
}

/** Experimental IP */
export function visualExperimentalIp() {
  return panelShell({
    mod: "expip",
    live: "EXPERIMENT BOARD",
    meta: "EXPLORING",
    body: `
      <div class="bs-sv-expip">
        <div class="bs-sv-expip__tracks">
          <article class="is-on"><span>01</span><strong>Character</strong><em>Active</em></article>
          <article><span>02</span><strong>Content</strong><em>Queued</em></article>
          <article><span>03</span><strong>Game</strong><em>Explore</em></article>
          <article><span>04</span><strong>Product</strong><em>Explore</em></article>
        </div>
        <p class="bs-sv-expip__note">Custom scope · No fixed package</p>
      </div>`,
  });
}

/** @param {string} slug */
export function studioHeroVisual(slug) {
  const map = {
    "brand-strategy": visualStrategy,
    naming: visualNaming,
    identity: visualIdentity,
    "logo-design": visualLogo,
    "web-design": visualWebDetail,
    "app-ui-ux": visualAppDetail,
    "landing-page-design": visualLandingDetail,
    "product-design": visualProductDesign,
    "social-content": visualSocial,
    campaign: visualCampaign,
    "visual-content": visualAssets,
    "character-lab": visualCharacterLab,
    "digital-stickers": visualStickers,
    "newon-character": visualNewonCharacter,
    "experimental-ip": visualExperimentalIp,
  };
  const fn = map[slug];
  return fn ? fn() : visualStrategy();
}
