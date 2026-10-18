/**
 * BABYLOG corporate site — guard tests (information-only, 5 menus, public/private revenue split).
 * BL-1 the committed tree passes the full static check
 * BL-2 a price in a public page fails the check
 * BL-3 a missing menu item fails the check
 * BL-4 a form control fails the check
 * BL-5 an unverified store URL fails the check
 * BL-6 the copy module carries no price or internal revenue figure
 * BL-7/8 child-safety guards · BL-9 copy follows the content master plan (counts)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const QA = path.join(ROOT, "scripts", "qa-babylog-site.mjs");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

function run(root) {
  return spawnSync(process.execPath, [QA, "--root", root], { encoding: "utf8", maxBuffer: 1 << 26 });
}

function scratch() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bl-qa-"));
  const cp = (rel) => {
    const src = path.join(ROOT, rel);
    if (!fs.existsSync(src)) return;
    fs.cpSync(src, path.join(dir, rel), { recursive: true });
  };
  for (const l of LANGS) cp(`${l}/babylog`);
  cp("babylog");
  cp("sitemap.xml");
  cp("ko/business/inquiry/index.html");
  return dir;
}

function mutate(dir, rel, fn) {
  const f = path.join(dir, rel);
  fs.writeFileSync(f, fn(fs.readFileSync(f, "utf8")));
}

test("BL-1 committed BABYLOG pages pass the full static check", () => {
  const r = run(ROOT);
  assert.equal(r.status, 0, r.stdout.split("\n").filter((l) => l.startsWith("FAIL")).slice(0, 5).join("\n"));
});

test("BL-2 a price in a public BABYLOG page fails the check", () => {
  const d = scratch();
  try {
    mutate(d, "ko/babylog/business/index.html", (h) => h.replace("이 페이지는 가격을 공개하지 않습니다.", "월 ₩19,900 확정."));
    const r = run(d);
    assert.notEqual(r.status, 0);
    assert.match(r.stdout, /FAIL revenue ko\/business/);
  } finally {
    fs.rmSync(d, { recursive: true, force: true });
  }
});

test("BL-3 a missing menu item fails the check", () => {
  const d = scratch();
  try {
    mutate(d, "en/babylog/platform/index.html", (h) => h.replace(/<li><a class="fsn__a" href="\/en\/babylog\/contact\/"[\s\S]*?<\/a><\/li>/, ""));
    const r = run(d);
    assert.notEqual(r.status, 0);
    assert.match(r.stdout, /FAIL menu en\/platform/);
  } finally {
    fs.rmSync(d, { recursive: true, force: true });
  }
});

test("BL-4 a form control in a BABYLOG page fails the check", () => {
  const d = scratch();
  try {
    mutate(d, "de/babylog/contact/index.html", (h) => h.replace('<ol class="bl-ctable__list">', '<form><input name="email"></form><ol class="bl-ctable__list">'));
    const r = run(d);
    assert.notEqual(r.status, 0);
    assert.match(r.stdout, /FAIL info-only de\/contact/);
  } finally {
    fs.rmSync(d, { recursive: true, force: true });
  }
});

test("BL-5 an unverified store URL fails the check", () => {
  const d = scratch();
  try {
    mutate(d, "ko/babylog/platform/index.html", (h) => h.replace(/https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.newon\.babylog[^"]*/, "https://play.google.com/store/apps/details?id=com.example.other"));
    const r = run(d);
    assert.notEqual(r.status, 0);
    assert.match(r.stdout, /FAIL stores/);
  } finally {
    fs.rmSync(d, { recursive: true, force: true });
  }
});

test("BL-6 the copy module carries no price or internal revenue figure", () => {
  const src = fs.readFileSync(path.join(ROOT, "scripts", "babylog-site-copy.mjs"), "utf8");
  const body = src.slice(src.indexOf("const STATUS"));
  for (const re of [/₩\s?\d/, /\d[\d,]*\s?원(?!칙)/, /\d+\s?%/, /19,?900/, /169,?000/]) {
    assert.ok(!re.test(body), `copy module matches ${re}`);
  }
});

test("BL-7 a link to an unverified external site inside the child-safety area fails the check", () => {
  const d = scratch();
  try {
    mutate(d, "ko/babylog/platform/index.html", (h) => h.replace('id="bl-cs-missing"', 'id="bl-cs-missing"').replace("공식 신고 경로", '<a href="https://example.org/report">공식 신고 경로</a>'));
    const r = run(d);
    assert.notEqual(r.status, 0);
    assert.match(r.stdout, /FAIL child-safety ko\/platform/);
  } finally {
    fs.rmSync(d, { recursive: true, force: true });
  }
});

test("BL-8 removing the emergency routing note from a child-safety page fails the check", () => {
  const d = scratch();
  try {
    mutate(d, "en/babylog/contact/index.html", (h) => h.replace(/bl-emergency/g, "bl-removed"));
    const r = run(d);
    assert.notEqual(r.status, 0);
    assert.match(r.stdout, /FAIL (child-safety|sections) en\/contact/);
  } finally {
    fs.rmSync(d, { recursive: true, force: true });
  }
});

test("BL-9 the copy follows the content master plan: 21 services, 32 businesses, 15 partner and 17 contact categories", async () => {
  const m = await import("../../scripts/babylog-site-copy.mjs");
  assert.equal(m.PLATFORM_STATUS.length, 21);
  assert.equal(m.BUSINESS_STATUS.length, 32);
  assert.equal(m.PARTNER_CODES.length, 15);
  assert.equal(m.CONTACT_CODES.length, 17);
  for (const lang of ["ko", "en"]) {
    const c = m.getBabylogCopy(lang);
    assert.equal(c.platform.groups.reduce((n, g) => n + g.items.length, 0), 21);
    assert.deepEqual(c.platform.groups.map((g) => g.id), m.PLATFORM_GROUP_CODES);
    assert.equal(c.business.groups.length, 8);
    assert.equal(c.business.groups.reduce((n, g) => n + g.items.length, 0), 32);
    assert.equal(c.business.models.rows.length, 5);
    assert.equal(c.partnerships.cats.items.length, 15);
    assert.equal(c.partnerships.principles.items.length, 6);
    assert.equal(c.contact.cats.items.length, 17);
    assert.equal(c.overview.journey.items.length, 7);
    assert.equal(c.overview.core.items.length, 6);
  }
});
