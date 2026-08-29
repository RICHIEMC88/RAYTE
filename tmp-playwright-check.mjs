import { chromium } from 'playwright';

const browser = await chromium.launch({headless: true});
const page = await browser.newPage();
const errors = [];
page.on('console', msg => {
  if (['error','warning'].includes(msg.type())) errors.push(`console:${msg.type()}: ${msg.text()}`);
});
page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
page.on('requestfailed', req => errors.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`));

await page.goto('http://127.0.0.1:3000/profesional', { waitUntil: 'networkidle' });
console.log('title', await page.title());

const serviceButton = page.locator('button').filter({ hasText: 'Médico a Domicilio' }).first();
await serviceButton.click();
await page.waitForLoadState('networkidle');

const tabTexts = ['Agenda','Historial de citas','Pacientes y expedientes','Agendar','Servicios','Mis documentos'];
for (const text of tabTexts) {
  const btn = page.locator('button').filter({ hasText: text }).first();
  await btn.click();
  await page.waitForTimeout(300);
  console.log('clicked tab', text, 'visible=', await btn.isVisible());
}

console.log('errors', JSON.stringify(errors, null, 2));
await page.screenshot({ path: '/home/user/rayte/profesional-check.png', fullPage: true });
await browser.close();
