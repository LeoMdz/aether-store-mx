import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("aether-welcome-seen", "1"),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
});
test("GTA fixed tables and warranty quote", async ({ page }) => {
  await page.goto("/?juego=gta");
  await page.locator("#tab-gta").click();
  const panel = page.locator("#panel-gta");
  await panel.locator("[data-warranty]").first().check();
  await panel.getByRole("button", { name: "Cotizar Nivel 1" }).click();
  await expect(panel.locator("[data-product-handoff] textarea")).toHaveValue(
    /Total: \$210 MXN/,
  );
  await panel.getByRole("tab", { name: "Millones", exact: true }).click();
  await expect(panel.locator('input[type="range"],input[type="number"]')).toHaveCount(0);
  await expect(panel.locator('table')).toHaveCount(2);
});

test("Reviews load near viewport and support arrows, dots and keyboard", async ({
  page,
}) => {
  await page.goto("/");
  expect(await page.locator(".review-slide img[src]").count()).toBe(0);
  await page.locator(".reviews-section").scrollIntoViewIfNeeded();
  await expect(page.locator(".review-slide img[src]")).toHaveCount(2);
  await page.getByRole("button", { name: "Reseña siguiente" }).click();
  await expect(page.locator("[data-review-status]")).toHaveText(
    "Reseña 2 de 16",
  );
  await page
    .getByRole("button", { name: "Ver reseña 16", exact: true })
    .click();
  await expect(page.locator("[data-review-status]")).toHaveText(
    "Reseña 16 de 16",
  );
  await page.locator(".review-track").focus();
  await page.keyboard.press("Home");
  await expect(page.locator("[data-review-status]")).toHaveText(
    "Reseña 1 de 16",
  );
});
for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["tablet", 768, 1024],
  ["mobile", 390, 844],
])
  test(`${name}: five identities and readable prices`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.locator(".game-card")).toHaveCount(5);
    for (const id of ["xbox", "gta", "spotify", "fortnite"]) {
      await page.locator(`#tab-${id}`).click();
      const panel = page.locator(`#panel-${id}`);
      await panel.scrollIntoViewIfNeeded();
      if (id === "fortnite")
        await panel.getByRole("tab", { name: "Tienda de Regalos" }).click();
      await page.screenshot({ path: `../validation/${name}-${id}-new.png` });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
    await page.locator("#tab-spotify").click();
    await expect(page.locator("#panel-spotify .saving-badge")).toHaveText([
      "−30%",
      "−28%",
      "−40%",
    ]);
    const colors = await page
      .locator("#panel-xbox,#panel-gta,#panel-spotify")
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).getPropertyValue("--accent")),
      );
    expect(new Set(colors).size).toBe(3);
    expect(
      await page
        .locator(".site-header")
        .evaluate((el) => getComputedStyle(el).getPropertyValue("--accent")),
    ).toBe("");
    const a = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      a.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
