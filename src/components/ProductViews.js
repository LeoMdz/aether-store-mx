import { gtaCheteo } from "../data/catalog";
import { storeConfig } from "../config";
export function initProductViews() {
  document.querySelectorAll("[data-product-views]").forEach((root) => {
    const tabs = [...root.querySelectorAll('.product-tabs [role="tab"]')];
    const select = (i) => {
      tabs.forEach((t, n) => {
        t.setAttribute("aria-selected", String(n === i));
        t.tabIndex = n === i ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden =
          n !== i;
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(i));
      t.addEventListener("keydown", (e) => {
        let n;
        if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") n = (i + tabs.length - 1) % tabs.length;
        if (e.key === "Home") n = 0;
        if (e.key === "End") n = tabs.length - 1;
        if (n !== undefined) {
          e.preventDefault();
          select(n);
          tabs[n].focus();
        }
      });
    });
  });
  document.querySelectorAll("[data-warranty]").forEach((input) =>
    input.addEventListener("change", () => {
      const card = input.closest("[data-level]");
      const p = gtaCheteo.planes.find((p) => p.id === card.dataset.level);
      card.querySelector("[data-level-price]").innerHTML =
        `$${p.precio + (input.checked ? p.garantia : 0)} <small>MXN</small>`;
      card
        .closest(".product-view")
        .querySelector("[data-product-handoff]").hidden = true;
    }),
  );
  document.addEventListener("click", async (e) => {
    const button = e.target.closest("[data-quote-level]");
    if (!button) return;
    const p = gtaCheteo.planes.find(
      (p) => p.id === button.dataset.quoteLevel,
    );
    const warranty =
      button.closest("[data-level]").querySelector("[data-warranty]")
        ?.checked || !p.garantia;
    const message = `Pedido Aether Store MX\nGTA Online · Cheteo de cuenta · PC Enhanced\n${p.nombre}\n${p.caracteristicas.join(", ")}\nGarantía: ${warranty ? "incluida en este pedido" : "sin garantía opcional"}\nTotal: $${p.precio + (warranty ? p.garantia : 0)} MXN\n${gtaCheteo.nota}\nPago: ${gtaCheteo.metodosPago.join(" / ")}. Confirmar método en ticket.`;
    const root = button.closest(".product-view");
    const handoff = root.querySelector("[data-product-handoff]");
    handoff.hidden = false;
    handoff.className = "product-handoff";
    handoff.innerHTML = `<p role="status">Copia el resumen y pégalo en tu ticket.</p><textarea aria-label="Resumen del pedido" readonly></textarea><a class="outline-button" href="${storeConfig.discordUrl}" target="_blank" rel="noopener noreferrer">Abrir Discord y crear ticket ↗</a><p>No se ha enviado un pedido ni realizado un cobro.</p>`;
    handoff.querySelector("textarea").value = message;
    try {
      await navigator.clipboard.writeText(message);
      handoff.querySelector('[role="status"]').textContent =
        "Resumen copiado. Pégalo en tu ticket de Discord.";
    } catch {
      handoff.querySelector("textarea").focus();
      handoff.querySelector("textarea").select();
    }
    handoff.scrollIntoView({ block: "nearest", behavior: "instant" });
  });
}
