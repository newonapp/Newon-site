import { chromium } from "playwright";

const URL = "http://127.0.0.1:8765/ko/ai/?v=ai5preview";

const shots = [
  { out: "_preview-shots/ai-review-01-d1440-crop.png", width: 1440, height: 900 },
  { out: "_preview-shots/ai-review-01-m390-crop.png", width: 390, height: 844 },
];

const browser = await chromium.launch();
for (const cfg of shots) {
  const page = await browser.newPage({ viewport: { width: cfg.width, height: cfg.height } });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.querySelectorAll("[data-ai-reveal]").forEach((el) => el.classList.add("is-in"));
    document.querySelectorAll(".ai-flow__step").forEach((el, i) => {
      el.classList.toggle("is-active", i === 0);
    });
    const target = document.querySelector("#ai-review");
    if (target) {
      const y = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo(0, y);
    }
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: cfg.out, fullPage: false });
  console.log("wrote", cfg.out);
  await page.close();
}
await browser.close();
