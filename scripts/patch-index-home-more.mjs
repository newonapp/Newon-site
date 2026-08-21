#!/usr/bin/env node
/**
 * Insert About-hub sections (WHAT WE BUILD / EXPLORE / Ideas / close)
 * into the home page, without running full build-i18n.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LANGS = [
  { dir: "ko", file: "ko.json" },
  { dir: "en", file: "en.json" },
  { dir: "ja", file: "ja.json" },
  { dir: "es", file: "es.json" },
  { dir: "pt-br", file: "pt-br.json" },
  { dir: "fr", file: "fr.json" },
  { dir: "de", file: "de.json" },
  { dir: "hi", file: "hi.json" },
  { dir: "id", file: "id.json" },
];

const START = "<!-- HOME_MORE_START -->";
const END = "<!-- HOME_MORE_END -->";
const PANEL = 'class="co-goal-panel co-newon-plus-panel"';

const BLOCK = `        ${START}
        <div class="home-more" id="explore">
          <div class="about-hub-inner">
            <section class="about-hub-section reveal-on-scroll" aria-labelledby="home-build-title">
              <p class="about-hub-kicker">{{t:about.buildLabel}}</p>
              <h2 id="home-build-title">{{t:about.buildTitle}}</h2>
              <p>{{t:about.buildLead}}</p>
              <ol class="about-hub-build-list">
                <li>
                  <span class="n">01</span>
                  <span class="cat">{{t:about.build1Cat}}</span>
                  <span class="body">{{t:about.build1Body}}</span>
                </li>
                <li>
                  <span class="n">02</span>
                  <span class="cat">{{t:about.build2Cat}}</span>
                  <span class="body">{{t:about.build2Body}}</span>
                </li>
                <li>
                  <span class="n">03</span>
                  <span class="cat">{{t:about.build3Cat}}</span>
                  <span class="body">{{t:about.build3Body}}</span>
                </li>
                <li>
                  <span class="n">04</span>
                  <span class="cat">{{t:about.build4Cat}}</span>
                  <span class="body">{{t:about.build4Body}}</span>
                </li>
              </ol>
              <h3 class="visually-hidden">{{t:about.appsHeading}}</h3>
              <ul class="about-apps" aria-label="{{t:about.appsHeading}}">
                <li>OX MONTH</li>
                <li>GoalUp</li>
                <li>CountUp</li>
                <li>Savy</li>
                <li>SubPing</li>
                <li>PiggyUp</li>
                <li>Pillmate</li>
                <li>BabyLog</li>
                <li>PetLog</li>
                <li>My World</li>
                <li>Newon+</li>
              </ul>
            </section>

            <section id="home-explore" class="about-hub-section reveal-on-scroll" aria-labelledby="home-explore-title">
              <p class="about-hub-kicker">{{t:about.exploreLabel}}</p>
              <h2 id="home-explore-title">{{t:about.exploreTitle}}</h2>
              <p>{{t:about.exploreLead}}</p>
              <div class="about-hub-navs">
                <a class="about-hub-nav" href="portfolio/">
                  <span class="about-hub-nav__num">01</span>
                  <span>
                    <span class="about-hub-nav__title">{{t:about.nav1Title}}</span>
                    <span class="about-hub-nav__desc">{{t:about.nav1Body}}</span>
                  </span>
                  <span class="about-hub-nav__go">{{t:about.nav1Go}}</span>
                </a>
                <a class="about-hub-nav" href="news/">
                  <span class="about-hub-nav__num">02</span>
                  <span>
                    <span class="about-hub-nav__title">{{t:about.nav2Title}}</span>
                    <span class="about-hub-nav__desc">{{t:about.nav2Body}}</span>
                  </span>
                  <span class="about-hub-nav__go">{{t:about.nav2Go}}</span>
                </a>
                <a class="about-hub-nav" href="ideas/">
                  <span class="about-hub-nav__num">03</span>
                  <span>
                    <span class="about-hub-nav__title">{{t:about.nav3Title}}</span>
                    <span class="about-hub-nav__desc">{{t:about.nav3Body}}</span>
                  </span>
                  <span class="about-hub-nav__go">{{t:about.nav3Go}}</span>
                </a>
                <a class="about-hub-nav" href="business/">
                  <span class="about-hub-nav__num">04</span>
                  <span>
                    <span class="about-hub-nav__title">{{t:about.nav4Title}}</span>
                    <span class="about-hub-nav__desc">{{t:about.nav4Body}}</span>
                  </span>
                  <span class="about-hub-nav__go">{{t:about.nav4Go}}</span>
                </a>
              </div>
            </section>
          </div>

          <section class="about-hub-ideas reveal-on-scroll" aria-labelledby="home-ideas-title">
            <div class="about-hub-inner">
              <p class="about-hub-kicker">{{t:about.ideasKicker}}</p>
              <h2 id="home-ideas-title">{{t:about.ideasTitle}}</h2>
              <p>{{t:about.ideasLead}}</p>
              <a class="btn btn-primary" href="ideas/">{{t:about.ideasCta}}</a>
              <p class="hint">{{t:about.ideasHint}}</p>
            </div>
          </section>

          <section class="about-hub-final reveal-on-scroll" aria-labelledby="home-final-title">
            <div class="about-hub-inner">
              <p class="about-hub-kicker">{{t:about.finalLabel}}</p>
              <h2 id="home-final-title">{{t:about.finalTitle}}</h2>
              <p>{{t:about.finalLead}}</p>
              <div class="about-hub-final-cta">
                <a class="btn btn-primary" href="portfolio/">{{t:about.finalPortfolio}}</a>
                <a class="btn btn-ghost" href="ideas/">{{t:about.finalIdeas}}</a>
                <a class="btn btn-ghost" href="business/">{{t:about.finalBusiness}}</a>
              </div>
            </div>
          </section>
        </div>
        ${END}`;

function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "locales", file), "utf8"));
}

function flatten(obj, prefix = "") {
  const out = {};
  if (obj == null) return out;
  if (typeof obj !== "object") {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`)));
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

function fillMissing(target, source) {
  if (source == null || typeof source !== "object") return target;
  if (Array.isArray(source)) return target;
  const out = target && typeof target === "object" && !Array.isArray(target) ? { ...target } : {};
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = fillMissing(out[k], v);
    } else if (out[k] === undefined || out[k] === null || out[k] === "") {
      out[k] = v;
    }
  }
  return out;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pick(flat, flatEn, key) {
  let val = flat[key];
  if (val === undefined || val === null || val === "") val = flatEn[key];
  return val;
}

function applyTemplate(template, flat, flatEn) {
  return template.replace(/\{\{t:([^}]+)\}\}/g, (_, key) => {
    const val = pick(flat, flatEn, key);
    if (val === undefined || val === null) return "";
    return escapeHtml(String(val));
  });
}

function injectReplace(html, block) {
  if (html.includes(START) && html.includes(END)) {
    const start = html.indexOf(START);
    const end = html.indexOf(END) + END.length;
    return html.slice(0, start) + block.trim() + html.slice(end);
  }
  const idx = html.indexOf(PANEL);
  if (idx < 0) throw new Error("home numbers panel not found");
  const close = html.indexOf("      </main>", idx);
  if (close < 0) throw new Error("home </main> not found");
  return `${html.slice(0, close)}${block}\n\n${html.slice(close)}`;
}

const enData = loadJson("en.json");
const flatEn = flatten(enData);

const tplPath = path.join(ROOT, "templates", "index.html");
fs.writeFileSync(tplPath, injectReplace(fs.readFileSync(tplPath, "utf8"), BLOCK));

const rootPath = path.join(ROOT, "index.html");
const koFlat = flatten(fillMissing(loadJson("ko.json"), enData));
fs.writeFileSync(rootPath, injectReplace(fs.readFileSync(rootPath, "utf8"), applyTemplate(BLOCK, koFlat, flatEn)));

for (const { dir, file } of LANGS) {
  const pagePath = path.join(ROOT, dir, "index.html");
  const flat = flatten(fillMissing(loadJson(file), enData));
  fs.writeFileSync(pagePath, injectReplace(fs.readFileSync(pagePath, "utf8"), applyTemplate(BLOCK, flat, flatEn)));
}

const pub = path.join(ROOT, "_publish");
if (fs.existsSync(pub)) {
  fs.copyFileSync(path.join(ROOT, "styles.css"), path.join(pub, "styles.css"));
  fs.copyFileSync(rootPath, path.join(pub, "index.html"));
  for (const { dir } of LANGS) {
    const dest = path.join(pub, dir, "index.html");
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(ROOT, dir, "index.html"), dest);
  }
}

console.log("patch-index-home-more: inserted About sections on home for 9 languages");
