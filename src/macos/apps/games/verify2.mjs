import { chromium, devices } from "playwright-core";
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=swiftshader"] });
const ctx = await browser.newContext({ ...devices["iPhone 13"] });
const page = await ctx.newPage();
await page.goto("http://localhost:4173/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3400);
const skip = page.locator('button:has-text("Skip")');
if (await skip.count()) { await skip.click(); await page.waitForTimeout(500); }
await page.locator('button[aria-label="Arcade"]').last().click();
await page.waitForTimeout(700);
await page.locator('button:has-text("Snake")').click();
await page.waitForTimeout(500);
const overflow = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  const r = c.getBoundingClientRect();
  return { canvasRight: Math.round(r.right), vw: innerWidth, fits: r.right <= innerWidth };
});
console.log("snake fit:", JSON.stringify(overflow));
await page.screenshot({ path: "/tmp/mac8/11-snake-fit.png" });
await browser.close();
console.log("done");
