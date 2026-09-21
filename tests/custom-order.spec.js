import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("aether-welcome-seen", "1"),
  );
});

for (const [game, cases] of [
  [
    "freefire",
    [
      [50, 8],
      [5600, 850],
      [10000, 1518],
    ],
  ],
  [
    "fortnite",
    [
      [100, 10],
      [1234, 123],
      [3800, 380],
    ],
  ],
]) {
  test(`${game}: three custom quantities, slider and Discord summary`, async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.locator(`#tab-${game}`).click();
    const builder = page.locator(`[data-custom-game=${game}]`);
    await builder.scrollIntoViewIfNeeded();
    for (const [quantity, price] of cases) {
      await builder.getByRole("spinbutton").fill(String(quantity));
      await expect(builder.locator("[data-custom-price]")).toHaveText(
        price.toLocaleString("es-MX"),
      );
      await expect(builder.getByRole("slider")).toHaveValue(String(quantity));
      await builder.getByRole("button", { name: "Cotizar mi pedido" }).click();
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toContain(
        `Cantidad: ${quantity} ${game === "freefire" ? "diamantes" : "pavos"}`,
      );
      expect(copied).toContain(
        `Precio calculado: $${price.toLocaleString("es-MX")} MXN`,
      );
      expect(copied).toContain(
        `Juego: ${game === "freefire" ? "Free Fire" : "Fortnite"}`,
      );
      await expect(builder.getByRole("textbox")).toHaveValue(
        copied.replace(/\r\n/g, "\n"),
      );
      await expect(
        builder.getByRole("link", { name: "Abrir Discord y crear ticket" }),
      ).toHaveAttribute("href", "https://discord.gg/KGnEsCutW");
    }
    await builder.getByRole("slider").focus();
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowRight");
    const min = game === "freefire" ? 50 : 100;
    await expect(builder.getByRole("spinbutton")).toHaveValue(String(min + 1));
    await expect(builder.locator(".custom-handoff")).toBeHidden();
    await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0);
  });
}

test("invalid quantities cannot produce or send a quote", async ({ page }) => {
  await page.goto("/");
  const builder = page.locator("[data-custom-game=freefire]");
  for (const invalid of ["49", "10001", "50.5", ""]) {
    await builder.getByRole("spinbutton").fill(invalid);
    await expect(
      builder.getByRole("button", { name: "Cotizar mi pedido" }),
    ).toBeDisabled();
    await expect(builder.getByRole("spinbutton")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(builder.locator("[data-custom-price]")).toHaveText("—");
    await expect(builder.locator(".custom-error")).toContainText(
      "entre 50 y 10,000",
    );
  }
  await builder.getByRole("spinbutton").fill("500");
  await expect(
    builder.getByRole("button", { name: "Cotizar mi pedido" }),
  ).toBeEnabled();
  await expect(builder.locator(".custom-error")).toBeEmpty();
});

test("better fixed package is suggested and can be added to cart", async ({
  page,
}) => {
  await page.goto("/");
  const builder = page.locator("[data-custom-game=fortnite]");
  await page.locator("#tab-fortnite").click();
  await builder.getByRole("spinbutton").fill("499");
  await expect(builder.locator(".custom-suggestion")).toContainText(
    "500 pavos",
  );
  await expect(builder.locator(".custom-suggestion")).toContainText(
    "al mismo precio",
  );
  await builder
    .getByRole("button", { name: "Elegir paquete recomendado" })
    .click();
  await page.getByRole("button", { name: /Abrir carrito/ }).click();
  await expect(page.getByRole("dialog")).toContainText("Emote · 500 pavos");
  await expect(page.locator(".cart-total")).toContainText("$50");
});

test("clipboard failure offers the exact selectable order and Xbox remains fixed", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("Denied")) },
      configurable: true,
    }),
  );
  const builder = page.locator("[data-custom-game=freefire]");
  await builder.getByRole("spinbutton").fill("1234");
  await builder.getByRole("button", { name: "Cotizar mi pedido" }).click();
  await expect(builder.locator(".custom-contact-status")).toContainText(
    "Copia este resumen",
  );
  await expect(builder.getByRole("textbox")).toHaveValue(
    /Cantidad: 1234 diamantes/,
  );
  await expect(builder.getByRole("textbox")).toBeFocused();
  await page.locator("#tab-xbox").click();
  await expect(page.locator("#panel-xbox [data-custom-game]")).toHaveCount(0);
  await expect(page.locator("#panel-xbox tbody tr")).toHaveCount(5);
});

for (const [device, width, height] of [
  ["mobile", 390, 844],
  ["desktop", 1440, 1000],
]) {
  test(`${device}: personalized builder visual and accessibility`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("[data-custom-game=freefire]").scrollIntoViewIfNeeded();
    await page.locator("#custom-number-freefire").fill("5599");
    await expect(
      page.locator("[data-custom-game=freefire] .custom-suggestion"),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    const results = await new AxeBuilder({ page })
      .include("#panel-freefire")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await page
      .locator("[data-custom-game=freefire]")
      .screenshot({ path: `../validation/custom-${device}.png` });
  });
}
