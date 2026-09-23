import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
const shots = "../validation";

for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["tablet", 768, 1024],
  ["mobile", 390, 844],
]) {
  test(`${name}: layout, assets, accessibility and screenshot`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const failed = [];
    page.on("response", (response) => {
      if (response.status() >= 400 && response.url().includes("127.0.0.1"))
        failed.push(response.url());
    });
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "POTENCIA",
    );
    await expect(page.locator(".game-card")).toHaveCount(5);
    for (const card of await page.locator(".game-card").all())
      await card.scrollIntoViewIfNeeded();
    for (const section of ["#catalogo", "#precios", "#contacto"])
      await page.locator(section).scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page
          .locator(".game-card img")
          .evaluateAll((images) =>
            images.every((img) => img.complete && img.naturalWidth > 0),
          ),
      )
      .toBeTruthy();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    const findings = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      findings.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
    await mkdir(shots, { recursive: true });
    await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true });
    await page.screenshot({ path: `${shots}/${name}-hero.png` });
  });
}
test("all prices and tabs, keyboard navigation and global neutral identity", async ({
  page,
}) => {
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const initial = await page
    .locator(".site-header,.site-footer")
    .evaluateAll((els) =>
      els.map((el) => ({
        background: getComputedStyle(el).backgroundColor,
        accent: getComputedStyle(el).getPropertyValue("--accent"),
      })),
    );
  for (const [id, prices, accent] of [
    ["freefire", [18, 55, 89, 185, 370, 850], "#ff334c"],
    ["xbox", [270, 850, 450, 930, 1299], "#83f750"],
    ["fortnite", [125, 290, 490, 1150], "#42dfff"],
  ]) {
    await page.locator(`#tab-${id}`).click();
    const panel = page.locator(`#panel-${id}`);
    await expect(panel).toBeVisible();

    expect(
      await panel
        .locator("td.price")
        .allTextContents(),
    ).toEqual(prices.map((p) => `$${p.toLocaleString("en-US")} MXN`));
    expect(
      await panel.evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--accent").trim(),
      ),
    ).toBe(accent);
    for (const color of await panel
      .locator("td.price")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).color)))
      expect(color).toBe("rgb(255, 230, 106)");
    expect(
      await page.locator(".site-header,.site-footer").evaluateAll((els) =>
        els.map((el) => ({
          background: getComputedStyle(el).backgroundColor,
          accent: getComputedStyle(el).getPropertyValue("--accent"),
        })),
      ),
    ).toEqual(initial);
  }

  await page.locator("#tab-fortnite").press("ArrowRight");
  await expect(page.locator("#tab-gta")).toBeFocused();
  await expect(page.locator("#panel-gta")).toBeVisible();
  await page.locator("#tab-gta").press("End");
  await expect(page.locator("#tab-spotify")).toBeFocused();
});
test("filtered entry loads only requested assets until needed", async ({
  page,
}) => {
  const requested = [];
  page.on("request", (req) => requested.push(req.url()));
  await page.goto("/?juego=freefire");
  await expect(
    page.locator(".hero-world[data-game=freefire] img"),
  ).toHaveAttribute("src", /freefire/);
  await page.locator("#catalogo").scrollIntoViewIfNeeded();
  await expect(page.locator(".game-card:visible")).toHaveCount(1);
  expect(
    requested.filter((url) => /assets\/images\/(xbox|fortnite)/.test(url)),
  ).toEqual([]);
  await page.getByRole("button", { name: "Xbox", exact: true }).click();
  await expect(page.locator(".game-card:visible")).toHaveCount(1);
  await expect(page.locator(".game-card[data-game=xbox] img")).toHaveAttribute(
    "src",
    /xbox/,
  );
  expect(
    requested.some((url) => url.includes("/images/fortnite/")),
  ).toBeFalsy();
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  await expect(page.locator(".game-card:visible")).toHaveCount(5);
  await expect(
    page.locator(".game-card[data-game=fortnite] img"),
  ).toHaveAttribute("src", /fortnite/);
});
test("cart totals, persistence, copy-ready Discord order and quantity controls", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Agregar 520 diamantes de Free Fire al carrito",
      exact: true,
    })
    .click();
  await page.getByRole("tab", { name: /Xbox/ }).click();
  await page
    .getByRole("button", {
      name: "Agregar Ultimate · 1 mes de Xbox al carrito",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: /Abrir carrito/ }).click();
  await expect(page.locator(".cart-total")).toContainText("$359");
  await page
    .getByRole("button", {
      name: "Agregar una unidad de 520 diamantes",
      exact: true,
    })
    .click();
  await expect(page.locator(".cart-total")).toContainText("$448");
  await page
    .getByRole("button", { name: "Copiar pedido", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Total: $448 MXN",
  );
  await expect(
    page.getByRole("link", { name: "Abrir Discord", exact: true }),
  ).toHaveAttribute("href", "https://discord.gg/KGnEsCutW");
  await page.keyboard.press("Escape");
  await page.reload();
  await page.getByRole("button", { name: /Abrir carrito/ }).click();
  await expect(page.locator(".cart-total")).toContainText("$448");
  await page
    .getByRole("button", {
      name: "Quitar una unidad de Ultimate · 1 mes",
      exact: true,
    })
    .click();
  await expect(page.locator(".cart-total")).toContainText("$178");
});
test("search, empty state, account explanation and mobile menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menú", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Principal" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Principal" })
    .getByRole("link", { name: "Fortnite", exact: true })
    .click();
  await expect(page.locator("#panel-fortnite")).toBeVisible();
  await page
    .getByRole("button", { name: "Buscar productos", exact: true })
    .click();
  await page.getByRole("searchbox").fill("zzzzzzz");
  await expect(page.locator("#search-results")).toContainText("No encontramos");
  await page.getByRole("searchbox").fill("Core");
  await expect(page.locator(".search-result")).toHaveCount(3);
  await page.locator(".search-result").first().click();
  await expect(page.locator("#panel-xbox")).toBeVisible();
  await page.getByRole("button", { name: "Mi cuenta", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "no necesitas crear una cuenta",
  );
  await page.keyboard.press("Escape");
});
test("motion is viewport-bound after the one-shot splash", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".splash-screen")).toHaveCount(0, {
    timeout: 3000,
  });
  await page.locator("#contacto").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator(".hero")
        .evaluate(
          (el) =>
            el
              .getAnimations({ subtree: true })
              .filter((a) => a.playState === "running").length,
        ),
    )
    .toBe(0);
  expect(errors).toEqual([]);
});
test("reduced motion does not fetch Lottie or start perpetual animation", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (req) => requests.push(req.url()));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    requests.some(
      (url) => url.includes("lottie_light") || url.includes("logo-intro.json"),
    ),
  ).toBeFalsy();
  expect(
    await page
      .locator(".hero")
      .evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === "running").length,
      ),
  ).toBe(0);
});
