import { chromium } from "playwright-core";
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:4173/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3200);

// Dock with tint + phone icon
await page.screenshot({ path: "/tmp/mac5/10-dock-tinted.png", clip: { x: 330, y: 780, width: 780, height: 120 } });

// phone href check
const tel = await page.locator('a[aria-label="Call Saleh"]').getAttribute("href");
console.log("phone href:", tel);

// glass over a window: drag Safari down behind dock
const bar = page.locator('p:text-is("Safari")');
const bb = await bar.boundingBox();
await page.mouse.move(bb.x + bb.width / 2, bb.y + 5);
await page.mouse.down();
await page.mouse.move(720, 830, { steps: 12 });
await page.mouse.up();
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/mac5/11-glass-over-window.png", clip: { x: 330, y: 740, width: 780, height: 160 } });

// menu bar strip
await page.screenshot({ path: "/tmp/mac5/12-menubar.png", clip: { x: 0, y: 0, width: 1440, height: 34 } });
await browser.close();
console.log("done");
