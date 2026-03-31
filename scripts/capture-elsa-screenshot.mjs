/**
 * Captures a 1280×720 PNG of the Elsa Bloodstone preset (same frame as in-app export).
 * Requires: dev server running (`npm run dev`) or set BASE_URL to a running instance.
 * Run: node scripts/capture-elsa-screenshot.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outPath = join(root, 'public/downloads/elsa-bloodstone-ability-page.png');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';

const browser = await chromium.launch();
try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.getByRole('button', { name: 'Load Elsa Bloodstone' }).click();
    // Desktop layout still mounts a second (md:hidden) preview — use the main panel’s canvas
    const canvas = page.getByTestId('ability-page-canvas').first();
    await canvas.waitFor({ state: 'visible', timeout: 30_000 });
    // Preset swap shows a short loading overlay; wait for it to disappear
    await canvas.locator('.no-export').waitFor({ state: 'detached', timeout: 45_000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 45_000 }).catch(() => {});
    await page.waitForTimeout(1500);
    await canvas.screenshot({ path: outPath, type: 'png' });
    console.log('Saved', outPath);
} finally {
    await browser.close();
}
