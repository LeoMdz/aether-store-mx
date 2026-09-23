import { animate } from "animejs/animation";
import { storeConfig } from "../config";

// Shared animated summary, reused exclusively by the Fortnite gift bundle.
export function CustomOrderBuilder() {
  return `<section class="bundle-summary" aria-labelledby="bundle-summary-title">
    <h4 id="bundle-summary-title">Tu lote</h4>
    <ul data-bundle-items></ul>
    <div class="bundle-total"><span>TOTAL</span><strong class="price" aria-hidden="true">$<span data-bundle-price>0</span> <small>MXN</small></strong></div>
    <p class="sr-only" data-bundle-announcement role="status"></p>
    <button type="button" class="game-button" data-bundle-order>Cotizar mi lote</button>
    <p class="service-note">Copia tu lote y pégalo en un ticket de Discord para confirmar disponibilidad y pago.</p>
    <div class="product-handoff" data-bundle-handoff hidden>
      <p role="status" data-bundle-status></p>
      <textarea aria-label="Resumen del lote para Discord" data-bundle-message readonly></textarea>
      <a class="outline-button" href="${storeConfig.discordUrl}" target="_blank" rel="noopener noreferrer">Abrir Discord y crear ticket ↗</a>
    </div>
  </section>`;
}

export function createOrderTotal(root) {
  const output = root.querySelector("[data-bundle-price]");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const counter = { value: 0 };
  let animation;
  let total = 0;
  const finish = () => {
    animation?.cancel();
    counter.value = total;
    output.textContent = total.toLocaleString("es-MX");
  };
  motion.addEventListener("change", finish);
  return {
    update(value, shouldAnimate = true) {
      total = value;
      animation?.cancel();
      root.querySelector("[data-bundle-announcement]").textContent = `Total: $${total.toLocaleString("es-MX")} MXN`;
      if (shouldAnimate && !motion.matches && !document.hidden) {
        animation = animate(counter, {
          value: total,
          duration: 280,
          ease: "outCubic",
          onUpdate: () => { output.textContent = Math.round(counter.value).toLocaleString("es-MX"); },
          onComplete: finish,
        });
      } else finish();
    },
    destroy() {
      animation?.cancel();
      motion.removeEventListener("change", finish);
    },
  };
}
