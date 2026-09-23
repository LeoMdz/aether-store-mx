import { gifts } from "../data/catalog";
import { CustomOrderBuilder, createOrderTotal } from "./CustomOrderBuilder";

const format = (value) => value.toLocaleString("es-MX");
const extraLabel = (p) => `${p.tipo} · ${format(p.pavos)} pavos`;

export function GiftBundleBuilder() {
  return `<section class="gift-bundle" data-gift-bundle aria-label="Armador de lotes de Fortnite">
    <h4>1. Elige tus pavos base</h4>
    <label class="sr-only" for="bundle-base">Paquete de pavos base</label>
    <select id="bundle-base" data-bundle-base>${gifts.pavosBase.map((p, i) => `<option value="${i}">${format(p.pavos)} pavos · $${format(p.precio)} MXN</option>`).join("")}</select>
    <h4>2. Agrega extras <span>(opcional)</span></h4>
    <div class="gift-grid">${gifts.extras.map((p, i) => `<article class="gift-card"><span class="gift-symbol" aria-hidden="true">${p.tipo === "Emote" ? "♫" : p.tipo === "Skin" ? "◈" : "✦"}</span><h5>${p.tipo}</h5><p>${format(p.pavos)} pavos</p><strong class="price">$${format(p.precio)} <small>MXN</small></strong><button type="button" class="game-button" data-bundle-add="${i}" aria-label="Agregar ${extraLabel(p)}">Agregar extra</button></article>`).join("")}</div>
    ${CustomOrderBuilder()}
  </section>`;
}

export function initGiftBundleBuilders() {
  const cleanups = [];
  document.querySelectorAll("[data-gift-bundle]").forEach((root) => {
    const baseSelect = root.querySelector("[data-bundle-base]");
    const items = root.querySelector("[data-bundle-items]");
    const order = root.querySelector("[data-bundle-order]");
    const handoff = root.querySelector("[data-bundle-handoff]");
    const summary = root.querySelector("[data-bundle-message]");
    const status = root.querySelector("[data-bundle-status]");
    let revision = 0;
    const price = createOrderTotal(root);
    const selected = [];
    let nextId = 0;
    const update = (animate = true) => {
      const base = gifts.pavosBase[Number(baseSelect.value)];
      const total = base.precio + selected.reduce((sum, { extra }) => sum + extra.precio, 0);
      items.innerHTML = `<li><span>Base · ${format(base.pavos)} pavos</span><strong>$${format(base.precio)} MXN</strong></li>${selected.map(({ id, extra }) => `<li><span>${extraLabel(extra)}</span><strong>$${format(extra.precio)} MXN</strong><button type="button" class="outline-button" data-bundle-remove="${id}" aria-label="Quitar ${extraLabel(extra)}">Quitar</button></li>`).join("")}`;
      const message = [
        "Hola, quiero cotizar este lote personalizado de Fortnite en Aether Store MX.",
        `Pavos base: ${format(base.pavos)} pavos · $${format(base.precio)} MXN`,
        ...selected.map(({ extra }) => `Extra: ${extraLabel(extra)} · $${format(extra.precio)} MXN`),
        `Total: $${format(total)} MXN`,
        "¿Me confirman los regalos, disponibilidad y forma de pago?",
      ].join("\n");
      // Checkout always uses the exact total, independently of the animation.
      summary.value = message;
      revision++;
      handoff.hidden = true;
      status.textContent = "";
      price.update(total, animate);
    };
    const onChange = () => update();
    const onClick = async (event) => {
      if (event.target.closest("[data-bundle-order]")) {
        handoff.hidden = false;
        const currentRevision = revision;
        try {
          await navigator.clipboard.writeText(summary.value);
          if (currentRevision !== revision) return;
          status.textContent = "Lote copiado. Abre Discord y pégalo en tu ticket.";
        } catch {
          if (currentRevision !== revision) return;
          status.textContent = "Copia este resumen y pégalo en tu ticket de Discord.";
          summary.focus();
          summary.select();
        }
        handoff.scrollIntoView({ block: "nearest", behavior: "instant" });
      }
      const add = event.target.closest("[data-bundle-add]");
      const remove = event.target.closest("[data-bundle-remove]");
      if (add) {
        selected.push({ id: nextId++, extra: gifts.extras[Number(add.dataset.bundleAdd)] });
        update();
      }
      if (remove) {
        const index = selected.findIndex(({ id }) => id === Number(remove.dataset.bundleRemove));
        if (index < 0) return;
        selected.splice(index, 1);
        update();
        const remaining = items.querySelectorAll("[data-bundle-remove]");
        (remaining[Math.min(index, remaining.length - 1)] || order).focus();
      }
    };
    baseSelect.addEventListener("change", onChange);
    root.addEventListener("click", onClick);
    update(false);
    cleanups.push(() => {
      price.destroy();
      baseSelect.removeEventListener("change", onChange);
      root.removeEventListener("click", onClick);
    });
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
