export function customRate(quantity, pricing) {
  if (pricing.modoTarifa !== "paquete-cercano") return pricing.tasaBase;
  const nearest = [...pricing.paquetesFijos].sort(
    (a, b) =>
      Math.abs(a.amount - quantity) - Math.abs(b.amount - quantity) ||
      a.amount - b.amount,
  )[0];
  return nearest.price / nearest.amount;
}
export const formatPesos = (value) =>
  new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);

export function quoteCustomOrder(quantity, pricing) {
  const valid =
    Number.isSafeInteger(quantity) &&
    quantity >= pricing.minimoPersonalizado &&
    quantity <= pricing.maximoPersonalizado &&
    Number.isFinite(pricing.tasaBase) &&
    pricing.tasaBase > 0;
  if (!valid) return null;
  // Absorb floating-point noise at exact half-peso boundaries; do not round the rate.
  return Math.round(quantity * customRate(quantity, pricing) + 1e-9);
}

export function findBetterPackage(quantity, total, packages) {
  // Never recommend fewer units than requested or compare different Xbox plans.
  return (
    packages
      .filter(
        (product) =>
          !product.reference &&
          product.amount >= quantity &&
          product.price <= total &&
          (product.amount > quantity || product.price < total),
      )
      .sort((a, b) => a.price - b.price || b.amount - a.amount)[0] || null
  );
}

export function customOrderMessage(theme, quantity, total, unit, plan = "") {
  return `Hola, quiero confirmar un pedido personalizado en Aether Store MX.\nJuego: ${theme.name}${plan ? ` · ${plan}` : ""}\nCantidad: ${quantity} ${unit}\nPrecio calculado: $${formatPesos(total)} MXN\n¿Me confirman disponibilidad y forma de pago?`;
}
