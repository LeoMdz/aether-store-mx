import { animate } from "animejs/animation";
import { storeConfig } from "../config";
import {
  customRate,
  quoteCustomOrder,
  findBetterPackage,
  customOrderMessage,
  formatPesos,
} from "../utils/custom-pricing";

export function CustomOrderBuilder(theme, pricing) {
  if (pricing.personalizadoHabilitado === false) return "";
  const options = pricing.planes ? Object.values(pricing.planes) : [pricing];
  const first = options[0];
  return `<section class="custom-order" data-custom-game="${theme.id}" aria-labelledby="custom-title-${theme.id}">
    <div class="custom-heading"><span class="custom-symbol" aria-hidden="true">+</span><div><h4 id="custom-title-${theme.id}">¿No encuentras tu cantidad? <span>Personalízala.</span></h4><p>Tu cantidad exacta. Tu precio al instante.</p></div></div>
    ${
      pricing.planes
        ? `<label class="custom-plan-label" for="custom-plan-${theme.id}">Plan Xbox</label><select id="custom-plan-${theme.id}" class="custom-plan">${Object.entries(
            pricing.planes,
          )
            .map(
              ([id, plan]) => `<option value="${id}">${plan.nombre}</option>`,
            )
            .join("")}</select>`
        : ""
    }
    <div class="custom-controls"><div class="custom-inputs"><div class="custom-quantity-row"><label for="custom-number-${theme.id}">Cantidad de ${first.unidad}</label><input id="custom-number-${theme.id}" class="custom-number" type="number" inputmode="numeric" min="${first.minimoPersonalizado}" max="${first.maximoPersonalizado}" step="1" value="${first.minimoPersonalizado}" required aria-describedby="custom-range-${theme.id} custom-error-${theme.id}"></div>
    <input id="custom-slider-${theme.id}" class="custom-slider" type="range" min="${first.minimoPersonalizado}" max="${first.maximoPersonalizado}" step="1" value="${first.minimoPersonalizado}" aria-label="Elegir cantidad de ${first.unidad}">
    <div class="custom-range" id="custom-range-${theme.id}"><span data-min>${formatPesos(first.minimoPersonalizado)}</span><span data-max>${formatPesos(first.maximoPersonalizado)} ${first.unidad}</span></div><p class="custom-error" id="custom-error-${theme.id}" role="status"></p></div>
    <div class="custom-total"><span>PRECIO CALCULADO</span><output aria-label="Precio personalizado de ${theme.name}"><span aria-hidden="true">$</span><span data-custom-price>${formatPesos(quoteCustomOrder(first.minimoPersonalizado, first))}</span> <small>MXN</small></output><span class="sr-only" data-custom-announcement role="status"></span><p data-custom-rate></p></div></div>
    <div class="custom-suggestion" hidden role="status"><p></p><button type="button" class="outline-button" data-suggest-package>Elegir paquete recomendado</button></div>
    ${theme.id === "gta" ? '<p class="delivery-warning">30 millones diarios máximo, resto pendiente 24h+. Tarifa del paquete más cercano; en empate se usa el menor.</p><label class="payment-label">Método de pago<select class="custom-payment"><option>PayPal</option><option>Transferencia/Depósito (solo México)</option><option value="Throne">Throne</option></select></label>' : ""}<div class="custom-actions"><p>${theme.id === "fortnite" ? "Cotización de pavos. Confirma disponibilidad y modalidad de entrega en tu ticket." : "Confirma disponibilidad y entrega antes de pagar."}</p><button type="button" class="game-button custom-quote">Cotizar mi pedido <i data-lucide="arrow-up-right"></i></button></div>
    <div class="custom-handoff" hidden><p class="custom-contact-status" role="status"></p><label class="sr-only" for="custom-summary-${theme.id}">Resumen de cotización de ${theme.name}</label><textarea id="custom-summary-${theme.id}" readonly></textarea><a class="outline-button" href="${storeConfig.discordUrl}" target="_blank" rel="noopener noreferrer">Abrir Discord y crear ticket <i data-lucide="arrow-up-right"></i></a><p class="custom-ticket-note">Abre un ticket en el servidor y pega este resumen. No se ha enviado un pedido ni realizado un cobro.</p></div>
  </section>`;
}

export function initCustomOrderBuilders(themes, catalog) {
  const cleanups = [];
  document.querySelectorAll("[data-custom-game]").forEach((root) => {
    const theme = themes[root.dataset.customGame];
    const entry = catalog[theme.id];
    const number = root.querySelector(".custom-number");
    const slider = root.querySelector(".custom-slider");
    const plan = root.querySelector(".custom-plan");
    const output = root.querySelector("[data-custom-price]");
    const quote = root.querySelector(".custom-quote");
    const error = root.querySelector(".custom-error");
    const suggestion = root.querySelector(".custom-suggestion");
    const handoff = root.querySelector(".custom-handoff");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const counter = { value: 0 };
    let animation;
    let announcementTimer;
    let recommended;
    let visible = false;
    let latestTotal = 0;
    const currentPricing = () =>
      entry.planes ? entry.planes[plan.value] : entry;
    const packages = () =>
      entry.paquetesFijos.filter(
        (product) => !entry.planes || product.group === currentPricing().nombre,
      );
    const stopAnimation = () => {
      animation?.cancel();
      output.textContent =
        latestTotal === null ? "—" : formatPesos(latestTotal);
      counter.value = latestTotal || 0;
    };
    const observer = new IntersectionObserver(
      ([observation]) => {
        visible = observation.isIntersecting;
        if (!visible) stopAnimation();
      },
      { threshold: 0.1 },
    );
    observer.observe(root);

    const update = (shouldAnimate = true) => {
      const pricing = currentPricing();
      const raw = number.value;
      const quantity = raw.trim() === "" ? NaN : Number(raw);
      const total = quoteCustomOrder(quantity, pricing);
      const payment = root.querySelector(".custom-payment");
      if (payment) {
        const throne = payment.querySelector('[value="Throne"]');
        throne.hidden = !(quantity > 12);
        throne.disabled = !(quantity > 12);
        if (throne.disabled && payment.value === "Throne")
          payment.value = "PayPal";
      }
      latestTotal = total;
      animation?.cancel();
      clearTimeout(announcementTimer);
      recommended = null;
      root.querySelector("[data-suggest-package]").removeAttribute("data-add");
      suggestion.hidden = true;
      number.setAttribute("aria-invalid", String(total === null));
      quote.disabled = total === null;
      handoff.hidden = true;
      if (total === null) {
        error.textContent = `Escribe una cantidad entera entre ${formatPesos(pricing.minimoPersonalizado)} y ${formatPesos(pricing.maximoPersonalizado)}.`;
        output.textContent = "—";
        return;
      }
      error.textContent = "";
      slider.value = String(quantity);
      slider.setAttribute("aria-valuetext", `${quantity} ${pricing.unidad}`);
      if (shouldAnimate && visible && !motion.matches && !document.hidden) {
        animation = animate(counter, {
          value: total,
          duration: 280,
          ease: "outCubic",
          onUpdate: () => {
            output.textContent = formatPesos(Math.round(counter.value));
          },
        });
      } else {
        counter.value = total;
        output.textContent = formatPesos(total);
      }
      announcementTimer = setTimeout(() => {
        root.querySelector("[data-custom-announcement]").textContent =
          `Precio: ${formatPesos(total)} pesos mexicanos`;
      }, 300);
      const rate = new Intl.NumberFormat("es-MX", {
        maximumFractionDigits: 6,
      }).format(customRate(quantity, pricing));
      root.querySelector("[data-custom-rate]").textContent =
        `$${rate} MXN / ${pricing.unidad} · total redondeado a pesos`;
      recommended = findBetterPackage(quantity, total, packages());
      if (recommended) {
        suggestion.hidden = false;
        root.querySelector("[data-suggest-package]").dataset.add =
          recommended.id;
        suggestion.querySelector("p").textContent =
          `Te conviene el paquete de ${recommended.label}: $${formatPesos(recommended.price)} MXN por ${formatPesos(recommended.amount)} ${pricing.unidad}${recommended.price < total ? `; ahorras $${formatPesos(total - recommended.price)} MXN.` : " al mismo precio."}`;
      }
    };
    root.querySelector(".custom-payment")?.addEventListener("change", () => {
      handoff.hidden = true;
    });
    number.addEventListener("input", () => update());
    slider.addEventListener("input", () => {
      number.value = slider.value;
      update();
    });
    quote.addEventListener("click", async () => {
      const quantity = Number(number.value);
      const pricing = currentPricing();
      const total = quoteCustomOrder(quantity, pricing);
      if (total === null) return;
      let message = customOrderMessage(
        theme,
        quantity,
        total,
        pricing.unidad,
        pricing.nombre,
      );
      const payment = root.querySelector(".custom-payment");
      if (payment)
        message += `\nPago: ${payment.value}\nEntrega: ${pricing.nota}`;
      handoff.hidden = false;
      const summary = handoff.querySelector("textarea");
      const status = handoff.querySelector(".custom-contact-status");
      summary.value = message;
      try {
        await navigator.clipboard.writeText(message);
        status.textContent =
          "Cotización copiada. Abre Discord y pégala en tu ticket.";
      } catch {
        status.textContent =
          "Copia este resumen y pégalo en tu ticket de Discord.";
        summary.focus();
        summary.select();
      }
    });
    plan?.addEventListener("change", () => {
      const pricing = currentPricing();
      [number, slider].forEach((input) => {
        input.min = pricing.minimoPersonalizado;
        input.max = pricing.maximoPersonalizado;
        input.value = pricing.minimoPersonalizado;
      });
      root.querySelector("[data-min]").textContent = formatPesos(
        pricing.minimoPersonalizado,
      );
      root.querySelector("[data-max]").textContent =
        `${formatPesos(pricing.maximoPersonalizado)} ${pricing.unidad}`;
      update(false);
    });
    motion.addEventListener("change", stopAnimation);
    update(false);
    cleanups.push(() => {
      observer.disconnect();
      animation?.cancel();
      clearTimeout(announcementTimer);
      motion.removeEventListener("change", stopAnimation);
    });
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
