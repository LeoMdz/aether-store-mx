import { animate } from "animejs/animation";

// Shared animated summary, reused exclusively by the Fortnite gift bundle.
export function CustomOrderBuilder() {
  return `<section class="bundle-summary" aria-labelledby="bundle-summary-title">
    <h4 id="bundle-summary-title">Tu lote</h4>
    <ul data-bundle-items></ul>
    <div class="bundle-total"><span>TOTAL</span><strong class="price" aria-hidden="true">$<span data-bundle-price>0</span> <small>MXN</small></strong></div>
    <p class="sr-only" data-bundle-announcement role="status"></p>
    <a class="game-button" data-bundle-order target="_blank" rel="noopener noreferrer">Armar mi lote</a>
    <p class="service-note">Continúa en WhatsApp para confirmar los regalos y su disponibilidad.</p>
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
