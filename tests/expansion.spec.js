import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("aether-welcome-seen", "1"),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
});
test("GTA rates, payment boundary and warranty quote", async ({ page }) => {
  await page.goto("/?juego=gta");
  await page.locator("#tab-gta").click();
  const panel = page.locator("#panel-gta");
  await panel.locator("[data-warranty]").first().check();
  await panel.getByRole("button", { name: "Cotizar Nivel 1" }).click();
  await expect(panel.locator("[data-product-handoff] textarea")).toHaveValue(
    /Total: \$210 MXN/,
  );
  await panel.getByRole("tab", { name: "Millones", exact: true }).click();
  const builder = panel.locator(".custom-order");
  for (const [n, total] of [
    [3, 8],
    [12, 26],
    [13, 28],
    [30, 48],
    [75, 88],
    [201, 248],
  ]) {
    await builder.getByRole("spinbutton").fill(String(n));
    await expect(builder.locator("[data-custom-price]")).toHaveText(
      String(total),
    );
    expect(
      await builder
        .locator('[value="Throne"]')
        .evaluate((el) => el.disabled && el.hidden),
    ).toBe(n <= 12);
  }
  await builder.getByRole("spinbutton").fill("13");
  await builder.locator("select").selectOption("Throne");
  await builder.getByRole("spinbutton").fill("12");
  await expect(builder.locator("select")).toHaveValue("PayPal");
  await builder.getByRole("button", { name: "Cotizar mi pedido" }).click();
  await expect(builder.locator("textarea")).toHaveValue(/Pago: PayPal/);
  await expect(builder.locator("textarea")).toHaveValue(/24h/);
});
test("Fortnite gifts switch without navigation, exact prices and Discord summary", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#tab-fortnite").click();
  const start = page.url();
  const panel = page.locator("#panel-fortnite");
  await expect(panel.locator(".custom-order")).toBeVisible();
  await panel.getByRole("tab", { name: "Regalos de la Tienda" }).click();
  await expect(panel.locator(".custom-order")).toBeHidden();
  await expect(panel.locator(".gift-card")).toHaveCount(5);
  await expect(panel.locator(".gift-badge")).toHaveCount(5);
  await panel.locator('[data-quote-gift="3"]').click();
  await expect(panel.locator("[data-product-handoff] textarea")).toHaveValue(
    /Lotes · 2400 pavos/,
  );
  await expect(panel.locator("[data-product-handoff] textarea")).toHaveValue(
    /\$240 MXN/,
  );
  await expect(panel.locator("[data-product-handoff] a")).toHaveAttribute(
    "href",
    "https://discord.gg/KGnEsCutW",
  );
  expect(page.url()).toBe(start);
  await panel.getByRole("tab", { name: "Recargar Pavos" }).click();
  await expect(panel.locator(".custom-order")).toBeVisible();
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
        await panel.getByRole("tab", { name: "Regalos de la Tienda" }).click();
      await page.screenshot({ path: `../validation/${name}-${id}-new.png` });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
    await page.locator("#tab-spotify").click();
    await expect(page.locator(".saving-badge")).toHaveText([
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
