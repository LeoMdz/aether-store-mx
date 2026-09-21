export function TrustBar() {
  return `<section class="trust-bar" aria-label="Compra con confianza"><div class="container trust-inner">${[
    ["user-round", "Recarga por ID/Cuenta", "Directo a donde juegas"],
    ["zap", "Entrega en Minutos", "Menos espera, más juego"],
    ["shield-check", "Compra 100% Segura", "Confirma antes de pagar"],
    ["badge-check", "Garantía Aether", "Tu pedido, con respaldo"],
  ]
    .map(
      ([icon, title, copy]) =>
        `<div class="trust-item"><i data-lucide="${icon}"></i><div><h2>${title}</h2><p>${copy}</p></div></div>`,
    )
    .join("")}</div></section>`;
}
