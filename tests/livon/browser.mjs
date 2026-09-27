// Run with PLAYWRIGHT_MODULE set to the installed playwright entry point; local preview must be running.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--no-sandbox'] });
const base = process.env.LIVON_TEST_URL || 'http://127.0.0.1:8899';
await mkdir('.tmp-livon-qa', { recursive: true });
try {
  for (const [name, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    await context.addInitScript(() => localStorage.setItem("livon.platform.v1", JSON.stringify({ onboardSkipped: true })));
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    let mode = 'ok', calls = [];
    await page.route('**/api/health', route => route.fulfill({ json: { status: 'ok', aiConfigured: true, protectionConfigured: true } }));
    await page.route('**/api/livon/chat', async route => {
      calls.push(route.request().postDataJSON());
      await new Promise(resolve => setTimeout(resolve, 150));
      if (mode === 'network') return route.abort('failed');
      if (mode === 'error') return route.fulfill({ status: 429, json: { success: false, code: 'RATE_LIMIT', error: '요청이 많습니다. 잠시 후 다시 시도해 주세요.' } });
      return route.fulfill({ json: { success: true, message: calls.length > 1 ? '앞서 말씀하신 서울 데이트를 실내로 정리했습니다.' : '서울 데이트 아이디어입니다. <script>window.xss=true</script>' } });
    });
    await page.goto(base + '/livon/#ai-chat');
    await page.locator('[data-lv-ai-chat-q]').waitFor({ state: 'visible' });
    await page.locator('[data-lv-ai-send]').waitFor({ state: 'visible' });
    const countUsers = () => page.locator('.lv-ai-bubble--user').count();
    await page.locator('[data-lv-ai-chat-q]').fill(' ');
    assert.equal(await page.locator('[data-lv-ai-send]').isDisabled(), true);
    await page.evaluate(() => { window.LivonAI.sendMessage('이번 주말 서울에서 데이트하고 싶어.'); window.LivonAI.sendMessage('중복 클릭'); });
    await page.locator('.lv-ai-bubble--ai').waitFor();
    assert.equal(calls.length, 1); assert.equal(await countUsers(), 1);
    assert.equal(await page.evaluate(() => window.xss), undefined);
    await page.evaluate(() => window.LivonAI.sendMessage('실내로만 해줘.'));
    assert.equal(calls[1].conversation[0].content, '이번 주말 서울에서 데이트하고 싶어.');
    assert.equal(calls[1].conversation[1].role, 'assistant');
    await page.reload();
    await page.locator('.lv-ai-bubble--ai').nth(1).waitFor();
    assert.equal(await countUsers(), 2);
    mode = 'error';
    await page.evaluate(() => window.LivonAI.sendMessage('실패 요청'));
    await page.locator('.lv-ai-bubble--error').waitFor();
    assert.equal(await countUsers(), 3);
    const failed = calls.at(-1);
    mode = 'ok';
    await page.locator('[data-lv-ai-retry]').click();
    await page.waitForFunction(() => !document.querySelector('[data-lv-ai-stop]') || document.querySelector('[data-lv-ai-stop]').hidden);
    assert.equal(await countUsers(), 3); assert.deepEqual(calls.at(-1), failed);
    assert.equal(await page.locator('.lv-ai-bubble--error').count(), 0);
    await page.evaluate(() => window.LivonAI.sendMessage('x'.repeat(4001)));
    assert.equal(calls.length, 4);
    mode = 'network';
    await page.evaluate(() => window.LivonAI.sendMessage('네트워크 오류'));
    assert.match(await page.locator('.lv-ai-bubble--error').innerText(), /네트워크/);
    // Response must stay attached to original thread even while user opens a new chat.
    mode = 'ok';
    await page.evaluate(() => { window.LivonAI.sendMessage('대화방 전환'); document.querySelector('[data-lv-ai-new]').click(); });
    await page.waitForTimeout(400);
    assert.equal(await page.locator('.lv-ai-bubble--ai').count(), 0);
    const threads = await page.evaluate(() => JSON.parse(localStorage.getItem('livon.aiStore.v1')).threads);
    assert.equal(threads[0].messages.at(-1).role, 'assistant');
    await page.reload(); await page.locator('[data-lv-ai-chat-q]').waitFor({ state: 'visible' });
    await page.locator('[data-lv-ai-chat-q]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `.tmp-livon-qa/${name}.png` });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    assert.deepEqual(errors, []);
    console.log(name + ': multi-turn, duplicate guard, retry snapshot, reload, length, network, thread isolation, XSS and viewport PASS');
    await context.close();
  }
  const page = await browser.newPage();
  const health = await page.request.get(base + '/api/health');
  assert.equal(health.status(), 200);
  const r = await page.request.post(base + '/api/livon/chat', { data: { message: '키 없음 테스트' } });
  assert.equal(r.status(), 503); assert.equal((await r.json()).code, 'AI_NOT_CONFIGURED');
  for (const path of ['/ko/', '/en/', '/livon/']) assert.equal((await page.request.get(base + path)).status(), 200);
  console.log('real local API missing-key + Newon page smoke PASS');
} finally { await browser.close(); }
