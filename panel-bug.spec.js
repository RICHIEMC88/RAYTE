const { test } = require('playwright/test');

test('profesional tabs work', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (['error','warning'].includes(msg.type())) errors.push(`console:${msg.type()}: ${msg.text()}`); });
  page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', req => errors.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`));

  await page.goto('http://127.0.0.1:3000/profesional');
  await page.getByRole('button', { name: /Médico a Domicilio/i }).click();
  for (const tab of ['Agenda','Historial de citas','Pacientes y expedientes','Agendar','Servicios','Mis documentos']) {
    await page.getByRole('button', { name: new RegExp(tab, 'i') }).click();
  }
  if (errors.length) throw new Error(errors.join('\n'));
});
