import { GiftBundleBuilder } from "./GiftBundleBuilder";
import { gtaCheteo } from "../data/catalog";
export const money = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
const table = (theme, products, heading = "") =>
  `<div class="price-table-wrap">${heading ? `<h4 class="table-title">${heading}</h4>` : ""}<table><caption class="sr-only">Precios ${heading} de ${theme.name} en pesos mexicanos</caption><thead><tr><th scope="col">PRODUCTO</th><th scope="col">PRECIO / MXN</th><th scope="col"><span class="sr-only">Agregar</span></th></tr></thead><tbody>${products
    .filter((p) => !p.reference)
    .map(
      (p) =>
        `<tr><th scope="row"><span class="product-label">${p.label}</span>${p.featured ? '<span class="product-badge">DESTACADO</span>' : ""}${theme.id === "gta" ? `<small class="payment-note">PayPal · Transferencia/Depósito (México)${p.amount > 12 ? " · Throne" : ""}</small>` : ""}</th><td class="price">$${money(p.price)}<small> MXN</small>${p.ahorro ? `<span class="saving-badge">−${p.ahorro}%</span>` : ""}</td><td><button class="add-button" data-add="${p.id}" data-theme-id="${theme.id}" aria-label="Agregar ${p.label} de ${theme.name} al carrito"><i data-lucide="plus"></i><span>Agregar</span></button></td></tr>`,
    )
    .join(
      "",
    )}</tbody></table><p class="table-footnote">${theme.id === "spotify" ? "Ahorro frente a $90 MXN al mes. Porcentajes redondeados." : "Precios en MXN. Confirma disponibilidad antes de pagar."}</p></div>`;
function variants(id, labels, contents) {
  return `<div class="product-views" data-product-views><div class="product-tabs" role="tablist" aria-label="Productos de ${id}">${labels.map((label, i) => `<button role="tab" id="${id}-view-tab-${i}" aria-controls="${id}-view-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${label}</button>`).join("")}</div>${contents.map((body, i) => `<div class="product-view" role="tabpanel" id="${id}-view-${i}" aria-labelledby="${id}-view-tab-${i}" ${i ? "hidden" : ""}>${body}</div>`).join("")}</div>`;
}
function gtaPlans() {
  return `<p class="delivery-warning">${gtaCheteo.nota}</p><p class="service-note">PC Enhanced · PayPal · Throne · Transferencia/Depósito (solo México)</p><div class="level-grid">${gtaCheteo.planes.map((p, i) => `<article class="level-card" data-level="${p.id}"><span class="level-medal" aria-hidden="true">${["🥇", "🥈", "🥉"][i]}</span><h4>${p.nombre}</h4><strong class="price" data-level-price>$${p.precio} <small>MXN</small></strong><ul>${p.caracteristicas.map((f) => `<li>${f}</li>`).join("")}</ul>${p.garantia ? `<label class="warranty-option"><input type="checkbox" data-warranty> Garantía opcional +$${p.garantia} MXN</label>` : '<p class="warranty-option">Garantía incluida gratis</p>'}<button class="game-button" data-quote-level="${p.id}">Cotizar ${p.nombre}</button></article>`).join("")}</div><p class="service-note">Garantía: reemplazo por otra cuenta del nivel contratado si hay un baneo. Confirma condiciones en tu ticket.</p><div data-product-handoff hidden></div>`;
}
export function PriceTable(theme, pricing, active = false) {
  let content = table(theme, pricing.paquetesFijos);
  if (theme.id === "fortnite")
    content = variants(
      "fortnite",
      ["Recargar Pavos", "Tienda de Regalos"],
      [
        table(theme, pricing.paquetesFijos.filter((p) => p.group === "Pavos")) +
          `<article class="crew-card"><div><span class="product-badge">DESTACADO</span><h4>${pricing.crew.nombre}</h4><p>${pricing.crew.duracion}</p><span class="saving-badge">Ahorro del ${pricing.crew.ahorro}%</span></div><strong class="price">$${money(pricing.crew.precio)} <small>MXN</small></strong><button class="game-button" data-add="fn-crew" aria-label="Agregar Fortnite Crew al carrito">Agregar Crew</button></article>`,
        GiftBundleBuilder(),
      ],
    );
  if (theme.id === "gta")
    content = variants(
      "gta",
      ["Cheteo de cuenta", "Millones"],
      [
        gtaPlans(),
        `<p class="delivery-warning">${pricing.nota}</p>${table(
          theme,
          pricing.paquetesFijos.filter((p) => p.group === "Básicos"),
          "Paquetes básicos",
        )}${table(
          theme,
          pricing.paquetesFijos.filter((p) => p.group === "Grandes"),
          "Paquetes grandes",
        )}`,
      ],
    );
  return `<div class="price-panel" id="panel-${theme.id}" role="tabpanel" aria-labelledby="tab-${theme.id}" tabindex="0" data-theme="${theme.id}" ${active ? "" : "hidden"}><div class="price-intro"><span class="large-icon"><i data-lucide="${theme.icon}"></i></span><h3>${theme.name}<br><span>${theme.unit}</span></h3><p>${theme.description}</p><div class="delivery-note"><i data-lucide="shield-check"></i><span>${theme.delivery}</span></div><p class="reference-note">Elige tu producto y confirma tu pedido en Discord.</p></div><div class="product-content">${content}</div></div>`;
}
