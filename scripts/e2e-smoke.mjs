import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const PORT = process.env.SMOKE_PORT || '3101';
const BASE_URL = `http://127.0.0.1:${PORT}`;

function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok || res.status < 500) return resolve();
      } catch {
        // retry
      }

      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Server did not start within ${timeoutMs}ms`));
        return;
      }

      setTimeout(tick, 800);
    };

    tick();
  });
}

async function run() {
  const devServer = spawn('npm', ['run', 'dev', '--', '--port', PORT], {
    stdio: 'inherit',
    shell: true,
    env: process.env
  });

  let browser;
  try {
    await waitForServer(`${BASE_URL}/login`);

    browser = await chromium.launch();
    const page = await browser.newPage();

    const uniqueEmail = `smoke-${Date.now()}@example.com`;

    await page.goto(`${BASE_URL}/register`);
    await page.getByPlaceholder('Max Mustermann').fill('Smoke Test');
    await page.getByPlaceholder('name@firma.de').fill(uniqueEmail);
    await page.getByPlaceholder('Mind. 6 Zeichen').fill('smoke123');
    await page.getByRole('button', { name: 'Konto erstellen' }).click();

    await page.waitForURL('**/dashboard**', { timeout: 20_000 });

    const projectName = `Smoke Project ${Date.now()}`;
    await page.getByPlaceholder('Projektname').fill(projectName);
    await page.getByRole('button', { name: 'Projekt erstellen' }).click();
    await page.getByText(projectName).waitFor({ timeout: 10_000 });

    await page.goto(`${BASE_URL}/dashboard/library`);
    await page.getByPlaceholder('Schlüssel (z.B. dsgvo-compliance)').fill('smoke-key');
    await page.getByPlaceholder('Titel').fill('Smoke Antwort');
    await page.getByPlaceholder('Antworttext').fill('Dies ist ein Smoke-Test-Antworttext mit ausreichend Länge.');
    await page.getByRole('button', { name: 'Erstellen' }).click();

    await page.getByText('Baustein erstellt.').waitFor({ timeout: 10_000 });

    console.log('✅ E2E smoke test passed');
  } finally {
    if (browser) await browser.close();
    devServer.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error('❌ E2E smoke test failed');
  console.error(error);
  process.exitCode = 1;
});
