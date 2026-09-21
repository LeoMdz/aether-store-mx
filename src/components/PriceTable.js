import { CustomOrderBuilder } from "./CustomOrderBuilder";
export const money = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
export function PriceTable(theme, pricing, active = false) {
  const products = pricing.paquetesFijos;
  const reference = products.find((product) => product.reference);
  return `<div class="price-panel" id="panel-${theme.id}" role="tabpanel" aria-labelledby="tab-${theme.id}" tabindex="0" data-theme="${theme.id}" ${active ? "" : "hidden"}><div class="price-intro"><span class="large-icon"><i data-lucide="${theme.icon}"></i></span><h3>${theme.name}<br><span>${theme.unit}</span></h3><p>${theme.description}</p><div class="delivery-note"><i data-lucide="shield-check"></i><span>${theme.delivery}</span></div>${reference ? `<p class="reference-note">${reference.label} = <strong>$${money(reference.price)} MXN</strong> como referencia de regalos. No es una recarga de pavos independiente.</p>` : '<p class="reference-note">Elige tu paquete y agrégalo a tu pedido.</p>'}</div><div class="price-table-wrap"><table><caption class="sr-only">Precios de ${theme.name} en pesos mexicanos</caption><thead><tr><th scope="col">${theme.id === "freefire" ? "PAQUETE" : "PRODUCTO"}</th><th scope="col">PRECIO / MXN</th><th scope="col"><span class="sr-only">Agregar al carrito</span></th></tr></thead><tbody>${products
    .filter((p) => !p.reference)
    .map(
      (p) =>
        `<tr><th scope="row"><span class="product-label">${p.label}</span>${p.featured ? '<span class="product-badge">DESTACADO</span>' : ""}</th><td class="price">$${money(p.price)}<small> MXN</small></td><td><button class="add-button" data-add="${p.id}" data-theme-id="${theme.id}" aria-label="Agregar ${p.label} de ${theme.name} al carrito"><i data-lucide="plus"></i><span>Agregar</span></button></td></tr>`,
    )
    .join(
      "",
    )}</tbody></table><p class="table-footnote"><i data-lucide="info"></i> Precios en pesos mexicanos. Confirma disponibilidad antes de pagar.</p></div>${CustomOrderBuilder(theme, pricing)}</div>`;
}
