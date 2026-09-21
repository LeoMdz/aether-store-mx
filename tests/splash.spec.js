import { test, expect } from "@playwright/test";

test("welcome appears once, locks scroll, offers skip and releases the page within 2.5 seconds", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-09-21T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-21T12:00:01Z"));
  await page.goto("/");
  const splash = page.getByRole("dialog", {
    name: "Bienvenido a Aether Store MX",
  });
  await expect(splash).toBeVisible();
  await expect(page.locator("#app")).toHaveAttribute("inert", "");
  await expect(page.locator("html")).toHaveClass(/lenis-stopped/);
  await expect(page.getByRole("button", { name: "Saltar" })).toBeHidden();
  await page.clock.runFor(999);
  await expect(page.getByRole("button", { name: "Saltar" })).toBeHidden();
  await page.clock.runFor(1);
  await expect(page.getByRole("button", { name: "Saltar" })).toBeVisible();
  await page.screenshot({ path: "../validation/splash-desktop.png" });
  await page.clock.runFor(1400);
  await expect(splash).toHaveCount(0);
  await expect(page.locator("#app")).not.toHaveAttribute("inert", "");
  await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
  await page.reload();
  await expect(splash).toHaveCount(0);
  expect(
    await page.evaluate(() => sessionStorage.getItem("aether-welcome-seen")),
  ).toBe("1");
});

test("skip dismisses early and a separate session shows welcome again", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Saltar" }).click();
  await expect(page.locator(".splash-screen")).toHaveCount(0);
  const other = await browser.newContext();
  const fresh = await other.newPage();
  await fresh.goto(new URL("/", page.url()).href);
  await expect(fresh.locator(".splash-screen")).toBeVisible();
  await other.close();
});

test("reduced-motion welcome is static for 600ms and restores native scroll", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install({ time: new Date("2026-09-21T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-21T12:00:01Z"));
  await page.goto("/");
  await expect(page.locator(".splash-screen")).toBeVisible();
  expect(
    await page
      .locator(".splash-screen")
      .evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await page.clock.runFor(599);
  await expect(page.locator(".splash-screen")).toBeVisible();
  await page.clock.runFor(1);
  await expect(page.locator(".splash-screen")).toHaveCount(0);
  expect(
    await page.evaluate(() => document.documentElement.style.overflow),
  ).toBe("");
});

test("storage failure and unavailable logo do not trap the visitor", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new Error("Storage denied");
      },
    }),
  );
  await page.route("**/assets/images/logo.webp", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".splash-screen")).toHaveCount(0, {
    timeout: 3000,
  });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#app")).not.toHaveAttribute("inert", "");
});
