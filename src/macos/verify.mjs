import { chromium, devices } from "playwright-core";
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=swiftshader"] });
const ctx = await browser.newContext({ ...devices["iPhone 13"], defaultBrowserType: "chromium" });
const page = await ctx.newPage();
const shot = (n) => page.screenshot({ path: `/tmp/mac8/${n}.png` });

await page.goto("http://localhost:4173/", { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(3400);

// Welcome opens fullscreen on first visit
await shot("01-welcome-mobile");
await page.locator('button:has-text("Skip")').click();
await page.waitForTimeout(600);

// Home screen
await shot("02-home");

// Open Arcade via dock — zoom animation
await page.locator('button[aria-label="Arcade"]').last().click();
await page.waitForTimeout(700);
await shot("03-arcade-fullscreen");

// Snake with touch controls
await page.locator('button:has-text("Snake")').click();
await page.waitForTimeout(500);
await shot("04-snake-touchpad");

// Action button starts game
await page.locator('button[aria-label="Action"]').dispatchEvent("pointerdown");
await page.waitForTimeout(600);
await page.locator('button[aria-label="Up"]').dispatchEvent("pointerdown");
await page.waitForTimeout(500);
await shot("05-snake-running");

// Swipe-up home indicator to exit
const indicator = page.locator('span.h-1\\.5.w-32').last();
const box = await indicator.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + 3);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2, box.y - 130, { steps: 8 });
await shot("06-swipe-up-mid");
await page.mouse.up();
await page.waitForTimeout(700);
await shot("07-back-home");

// Long-press CV icon → action sheet
const cv = page.locator('button:has(img[alt="Preview"])').first();
const cvBox = await cv.boundingBox();
await page.mouse.move(cvBox.x + 20, cvBox.y + 20);
await page.mouse.down();
await page.waitForTimeout(650);
await page.mouse.up();
await page.waitForTimeout(400);
await shot("08-action-sheet");
await page.locator('button:has-text("Cancel")').click();
await page.waitForTimeout(300);

// Search pill
await page.locator('button:has-text("Search")').first().click();
await page.waitForTimeout(400);
await page.keyboard.type("term");
await page.waitForTimeout(300);
await shot("09-search");
await page.locator('button[aria-label="Close search"]').click();

// Safari fullscreen
await page.locator('button[aria-label="Safari"]').last().click();
await page.waitForTimeout(700);
await shot("10-safari-mobile");

await browser.close();
console.log("done");
