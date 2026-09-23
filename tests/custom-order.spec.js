import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import prices from "../src/data/fortnite-prices.json" with { type: "json" };
import gifts from "../src/data/fortnite-regalos.json" with { type: "json" };

const fixed = [[800,125],[2400,290],[4500,490],[12500,1150]];
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("aether-welcome-seen", "1"));
});
async function openBundle(page) {
  await page.goto("/");
  await page.locator("#tab-fortnite").click();
  await page.getByRole("tab", { name: "Tienda de Regalos" }).click();
  return page.locator("[data-gift-bundle]");
}
const message = async (builder) => builder.locator("[data-bundle-message]").inputValue();

test("fixed catalogs and Crew replace all free-quantity controls", async ({ page }) => {
  expect(prices.paquetes.map(p => [p.pavos,p.precio])).toEqual(fixed);
  expect(gifts.pavosBase).toEqual(prices.paquetes);
  await page.goto("/");
  for (const [id, rows] of [["freefire",6],["gta",11],["fortnite",4],["xbox",5],["spotify",4]]) {
    await page.locator(`#tab-${id}`).click();
    const panel = page.locator(`#panel-${id}`);
    if (id === 'gta') await panel.getByRole('tab',{name:'Millones',exact:true}).click();
    await expect(panel.locator('tbody tr')).toHaveCount(rows);
    await expect(panel.locator('input[type="range"],input[type="number"],[data-custom-game]')).toHaveCount(0);
    if (id !== 'fortnite') await expect(panel.locator('[data-gift-bundle]')).toHaveCount(0);
  }
  await page.locator('#tab-fortnite').click();
  const reload = page.locator('#fortnite-view-0');
  await expect(reload.locator('td.price')).toHaveText(['$125 MXN','$290 MXN','$490 MXN','$1,150 MXN']);
  await expect(reload.locator('[data-gift-bundle],.bundle-summary')).toHaveCount(0);
  await expect(reload.locator('.crew-card')).toContainText('Fortnite Crew');
  await expect(reload.locator('.crew-card')).toContainText('$135 MXN');
  await expect(reload.locator('.saving-badge')).toHaveText('Ahorro del 45%');
  await reload.getByRole('button',{name:'Agregar Fortnite Crew al carrito'}).click();
  await reload.locator('[data-add="fn-pavos-800"]').click();
  await page.getByRole('button',{name:/Abrir carrito/}).click();
  await expect(page.locator('.cart-total')).toContainText('$260');
});

test("base plus two extras, removal, duplicates and Discord ticket handoff", async ({ page, context }) => {
  const builder = await openBundle(page);
  await builder.getByRole('combobox').selectOption('1');
  await builder.locator('[data-bundle-add="0"]').click();
  await builder.locator('[data-bundle-add="2"]').click();
  await expect(builder.locator('[data-bundle-price]')).toHaveText('490');
  await expect(builder.locator('[data-bundle-items] li')).toHaveCount(3);
  expect(await message(builder)).toContain('Pavos base: 2,400 pavos · $290 MXN');
  expect(await message(builder)).toContain('Extra: Emote · 500 pavos · $50 MXN');
  expect(await message(builder)).toContain('Extra: Skin · 1,500 pavos · $150 MXN');
  expect(await message(builder)).toContain('Total: $490 MXN');
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await builder.getByRole('button',{name:'Cotizar mi lote'}).click();
  await expect(builder.locator('[data-bundle-status]')).toContainText('Lote copiado');
  expect((await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,"\n")).toBe(await message(builder));
  await expect(builder.getByRole('link',{name:'Abrir Discord y crear ticket'})).toHaveAttribute('href','https://discord.gg/KGnEsCutW');
  await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0);

  await builder.getByRole('button',{name:'Quitar Emote · 500 pavos'}).click();
  await expect(builder.locator('[data-bundle-price]')).toHaveText('440');
  await expect(builder.locator('[data-bundle-handoff]')).toBeHidden();
  expect(await message(builder)).not.toContain('Emote');
  await builder.locator('[data-bundle-add="2"]').click();
  await expect(builder.locator('[data-bundle-price]')).toHaveText('590');
  expect((await message(builder)).match(/Extra: Skin/g)).toHaveLength(2);
  await builder.getByRole('combobox').selectOption('3');
  await expect(builder.locator('[data-bundle-price]')).toHaveText('1,450');
  await builder.locator('[data-bundle-remove]').first().click();
  await builder.locator('[data-bundle-remove]').first().click();
  await expect(builder.locator('[data-bundle-price]')).toHaveText('1,150');
  expect(await message(builder)).not.toContain('Extra:');
});

test("all bases, optional extras, rapid changes and tab persistence", async ({ page }) => {
  const builder = await openBundle(page);
  for (const [i,[pavos,price]] of fixed.entries()) {
    await builder.getByRole('combobox').selectOption(String(i));
    await expect(builder.locator('[data-bundle-price]')).toHaveText(price.toLocaleString('es-MX'));
    expect(await message(builder)).toContain(`Pavos base: ${pavos.toLocaleString('es-MX')} pavos`);
  }
  await builder.getByRole('combobox').selectOption('0');
  for(let i=0;i<5;i++) await builder.locator(`[data-bundle-add="${i}"]`).click();
  await expect(builder.locator('[data-bundle-price]')).toHaveText('1,065');
  await page.getByRole('tab',{name:'Recargar Pavos'}).click();
  await expect(builder).toBeHidden();
  await page.locator('#tab-freefire').click();
  await page.locator('#tab-fortnite').click();
  await page.getByRole('tab',{name:'Tienda de Regalos'}).click();
  await expect(builder.locator('[data-bundle-price]')).toHaveText('1,065');
  await builder.evaluate(root => {
    const add = root.querySelector('[data-bundle-add="0"]');
    add.click(); add.click();
    root.querySelector('[data-bundle-remove]').click();
  });
  expect(await message(builder)).toContain('Total: $1,115 MXN');
  await expect(builder.locator('[data-bundle-price]')).toHaveText('1,115');
});

for (const [name,width,height] of [['mobile',390,844],['desktop',1440,1000]]) {
  test(`${name}: bundle keyboard, reduced motion, accessibility and layout`, async ({ page }) => {
    await page.setViewportSize({width,height});
    await page.emulateMedia({reducedMotion:'reduce'});
    const errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    const builder=await openBundle(page);
    await builder.getByRole('combobox').focus();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(builder.locator('[data-bundle-price]')).toHaveText('340');
    await builder.locator('[data-bundle-add="2"]').click();
    await expect(builder.locator('[data-bundle-price]')).toHaveText('490');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    const audit=await new AxeBuilder({page}).include('#panel-fortnite').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
    expect(errors).toEqual([]);
    await builder.screenshot({path:`../validation/bundle-${name}.png`});
  });
}

test('clipboard denial provides selectable Discord summary', async ({page}) => {
  const builder=await openBundle(page);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('Denied'))},configurable:true}));
  await builder.locator('[data-bundle-add="0"]').click();
  await builder.getByRole('button',{name:'Cotizar mi lote'}).click();
  await expect(builder.locator('[data-bundle-status]')).toContainText('Copia este resumen');
  await expect(builder.getByRole('textbox')).toBeFocused();
  await expect(builder.getByRole('textbox')).toHaveValue(/Total: \$175 MXN/);
  await expect(builder.getByRole('link',{name:'Abrir Discord y crear ticket'})).toBeVisible();
});
