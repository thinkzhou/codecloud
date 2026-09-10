import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto('http://127.0.0.1:8000/v035/?ci=1', { waitUntil: 'load' });
await page.waitForFunction(() => document.title === 'CI_PASS', null, { timeout: 10000 });
const checks = await page.locator('#ci-result').innerText();
for (const required of ['PASS world created','PASS map layered buildings','PASS path available','PASS true map action','PASS NPC count']) {
  if (!checks.includes(required)) throw new Error(`Missing check: ${required}\n${checks}`);
}

await page.goto('http://127.0.0.1:8000/v035/', { waitUntil: 'load' });
await page.locator('#new').click();
await page.waitForTimeout(300);
await page.locator('#nav button').first().click();
await page.locator('#bigmap').waitFor({ state: 'visible' });
const mapText = await page.locator('#mbody').innerText();
if (!mapText.includes('真实道路') || !mapText.includes('不会瞬移')) throw new Error('Real map UX text missing');
if (await page.locator('.mapgrid,.place').count()) throw new Error('Old teleport-button map UI returned');
if (errors.length) throw new Error('Browser errors:\n' + errors.join('\n'));

console.log('V035_BROWSER_OK');
await browser.close();
