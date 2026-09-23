import "@fontsource/nunito-sans/latin-400.css";
import "@fontsource/nunito-sans/latin-800.css";
import { catalog } from "./data/catalog";
import {
  ReviewsCarousel,
  initReviewsCarousel,
} from "./components/ReviewsCarousel";
import { initProductViews } from "./components/ProductViews";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/barlow-condensed/latin-800.css";
import "@fontsource/chakra-petch/latin-400.css";
import "@fontsource/chakra-petch/latin-500.css";
import "@fontsource/chakra-petch/latin-600.css";
import "./styles/tailwind.css";
import "animate.css/source/_base.css";
import "animate.css/source/fading_entrances/fadeInUp.css";
import "./styles/base.css";
import "./styles/themes.css";
import "./styles/gift-bundle.css";
import {
  createIcons,
  Search,
  ShoppingBag,
  UserRound,
  Menu,
  Gem,
  Gamepad2,
  Disc3,
  CircleDollarSign,
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Zap,
  ShieldCheck,
  BadgeCheck,
  Info,
  Plus,
  Minus,
  X,
  Check,
  Copy,
  MessageCircle,
  Trash2,
} from "lucide";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { GameCard } from "./components/GameCard";
import { PriceTable, money } from "./components/PriceTable";
import { TrustBar } from "./components/TrustBar";
import { themeList, themes } from "./themes";
import { storeConfig } from "./config";
import { setupThemeSwitcher } from "./utils/theme-switcher";
import { initLenis } from "./lib/lenis";
import { observeAssets, initAnimations } from "./lib/animations";
import { SplashScreen } from "./components/SplashScreen";
import { initGiftBundleBuilders } from "./components/GiftBundleBuilder";

const icons = {
  Search,
  ShoppingBag,
  UserRound,
  Menu,
  Gem,
  Gamepad2,
  Disc3,
  CircleDollarSign,
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Zap,
  ShieldCheck,
  BadgeCheck,
  Info,
  Plus,
  Minus,
  X,
  Check,
  Copy,
  MessageCircle,
  Trash2,
};
const renderIcons = () =>
  createIcons({
    icons,
    attrs: { "stroke-width": 1.65, "aria-hidden": "true" },
  });
const data = catalog;
const products = themeList.flatMap((theme) =>
  data[theme.id].paquetesFijos
    .filter((p) => !p.reference)
    .map((p) => ({ ...p, game: theme.id })),
);
const findProduct = (id) => products.find((p) => p.id === id);
let cart = [];
try {
  const saved = JSON.parse(localStorage.getItem("aether-cart") || "[]");
  if (Array.isArray(saved))
    cart = saved
      .filter(
        (p) =>
          p &&
          findProduct(p.id) &&
          Number.isInteger(p.quantity) &&
          p.quantity > 0 &&
          p.quantity <= 99,
      )
      .map(({ id, quantity }) => ({ id, quantity }));
} catch {
  /* Unavailable storage or corrupted content should not block shopping. */
}

document.querySelector("#app").innerHTML = `${Header()}<main>${Hero()}
 <section class="catalog-section container" id="catalogo" aria-labelledby="catalog-title"><div class="section-heading" data-reveal><div><h2 id="catalog-title">ELIGE TU <span>UNIVERSO.</span></h2><p id="catalog-count">5 universos. Infinitas posibilidades.</p></div><div class="filters" role="group" aria-label="Filtrar catálogo"><button data-filter="all" aria-pressed="true">Todos</button>${themeList.map((t) => `<button data-filter="${t.id}" aria-pressed="false">${t.name}</button>`).join("")}</div></div><div class="game-grid">${themeList.map(GameCard).join("")}</div></section>
 ${ReviewsCarousel()}${TrustBar()}
 <section class="pricing-section container" id="precios" aria-labelledby="pricing-title"><div class="section-heading" data-reveal><div><h2 id="pricing-title">TU PRÓXIMO <span>POWER-UP.</span></h2><p>El paquete perfecto. El precio claro. Todo en MXN.</p></div><span class="pricing-caption"><i data-lucide="shield-check"></i> SIN COMPLICACIONES</span></div><div class="pricing-box"><div class="price-tabs" role="tablist" aria-label="Precios por juego">${themeList.map((t, i) => `<button id="tab-${t.id}" role="tab" data-tab="${t.id}" data-theme="${t.id}" aria-selected="${i === 0}" aria-controls="panel-${t.id}" tabindex="${i === 0 ? 0 : -1}"><i data-lucide="${t.icon}"></i>${t.name}<span>${t.unit}</span></button>`).join("")}</div>${themeList.map((t, i) => PriceTable(t, data[t.id], i === 0)).join("")}</div></section>
 <section class="how-section container" aria-labelledby="how-title"><h2 id="how-title">DEL CATÁLOGO<br><span>A LA PARTIDA.</span></h2><ol><li><span>01</span><h3>Elige tu power-up</h3><p>Agrega tus productos al carrito y copia el resumen.</p></li><li><span>02</span><h3>Abre tu ticket</h3><p>Entra a nuestro Discord y comparte tu pedido en un ticket.</p></li><li><span>03</span><h3>Listo. A jugar.</h3><p>Confirma disponibilidad y pago con el equipo. Nosotros te guiamos.</p></li></ol></section>
 <section class="contact-section container" id="contacto" aria-labelledby="contact-title"><div class="contact-symbol"><i data-lucide="message-circle"></i></div><div><h2 id="contact-title">TU SQUAD TAMBIÉN ESTÁ AQUÍ.</h2><p>¿Dudas o listo para comprar? Te esperamos en Discord.</p></div><a class="neutral-button" href="${storeConfig.discordUrl}" target="_blank" rel="noopener noreferrer">Entrar al servidor <i data-lucide="arrow-up-right"></i></a></section>
 </main><footer class="site-footer"><div class="container footer-top"><a class="brand" href="#inicio"><span class="brand-mark"><img src="/assets/images/logo.webp" alt="" width="58" height="58"></span><span>AETHER<span class="brand-sub">STORE <b>MX</b></span></span></a><p>TU TIENDA GAMER. TU SIGUIENTE NIVEL.</p><a href="${storeConfig.discordUrl}" target="_blank" rel="noopener noreferrer">Hablemos en Discord <i data-lucide="arrow-up-right"></i></a></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} Aether Store MX</span><p>Tienda independiente. Free Fire, Xbox, Fortnite, GTA Online y Spotify pertenecen a sus respectivas marcas.</p><span>HECHO PARA JUGAR.</span></div></footer>
 <dialog id="store-dialog" aria-labelledby="dialog-title" data-lenis-prevent><div class="dialog-header"><h2 id="dialog-title"></h2><button class="icon-button" aria-label="Cerrar ventana" data-close><i data-lucide="x"></i></button></div><div id="dialog-body"></div></dialog><div id="toast" role="status" aria-live="polite"></div>`;

const dialog = document.querySelector("#store-dialog");
const body = document.querySelector("#dialog-body");
let currentDialog = "";
let toastTimer;
function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 2800);
}
function saveCart() {
  try {
    localStorage.setItem("aether-cart", JSON.stringify(cart));
  } catch {
    toast("El carrito se conservará durante esta visita.");
  }
  updateCount();
}
function updateCount() {
  const count = cart.reduce((sum, p) => sum + p.quantity, 0);
  const badge = document.querySelector("#cart-count");
  badge.textContent = count;
  badge.hidden = !count;
  document
    .querySelector(".cart-trigger")
    .setAttribute(
      "aria-label",
      `Abrir carrito${count ? `, ${count} productos` : ""}`,
    );
}
function addProduct(id) {
  if (!findProduct(id)) return;
  const existing = cart.find((p) => p.id === id);
  if (existing) {
    if (existing.quantity >= 99) {
      toast("Máximo 99 unidades por producto.");
      return;
    }
    existing.quantity++;
  } else cart.push({ id, quantity: 1 });
  saveCart();
  toast(`${findProduct(id).label} agregado al carrito`);
}
function orderText() {
  return `PEDIDO · AETHER STORE MX\n\n${cart
    .map((item) => {
      const p = findProduct(item.id);
      return `${item.quantity} × ${themes[p.game].name} — ${p.label}: $${money(p.price * item.quantity)} MXN${p.game === "gta" ? " (PC Enhanced; entrega: 30 millones diarios máximo, resto 24h+; PayPal / Transferencia México" + (p.amount > 12 ? " / Throne" : "") + ")" : ""}`;
    })
    .join(
      "\n",
    )}\n\nTotal: $${money(cart.reduce((sum, item) => sum + findProduct(item.id).price * item.quantity, 0))} MXN\nPor favor, confirmar disponibilidad y método de pago.`;
}
function showCart() {
  document.querySelector("#dialog-title").textContent = "TU CARRITO";
  if (!cart.length) {
    body.innerHTML =
      '<div class="empty-state"><i data-lucide="shopping-bag"></i><h3>Tu próxima partida te espera.</h3><p>Aún no agregas productos. Explora los paquetes y encuentra tu siguiente power-up.</p><button class="neutral-button" data-close>Seguir explorando</button></div>';
    renderIcons();
    return;
  }
  body.innerHTML = `<div class="cart-items">${cart
    .map((item) => {
      const p = findProduct(item.id);
      return `<div class="cart-item"><div><small>${themes[p.game].name}</small><h3>${p.label}</h3><span class="price">$${money(p.price * item.quantity)} MXN</span></div><div class="quantity"><button aria-label="Quitar una unidad de ${p.label}" data-quantity="${p.id}" data-change="-1"><i data-lucide="minus"></i></button><span>${item.quantity}</span><button aria-label="Agregar una unidad de ${p.label}" data-quantity="${p.id}" data-change="1" ${item.quantity >= 99 ? "disabled" : ""}><i data-lucide="plus"></i></button></div></div>`;
    })
    .join(
      "",
    )}</div><div class="cart-total"><span>TOTAL</span><strong>$${money(cart.reduce((sum, p) => sum + findProduct(p.id).price * p.quantity, 0))} <small>MXN</small></strong></div><div class="checkout-note"><h3>Finaliza tu pedido en Discord</h3><p>Copia el resumen, entra al servidor y abre un ticket. El equipo confirmará disponibilidad, entrega y forma de pago. No se ha realizado ningún cobro.</p></div><div class="checkout-actions"><button class="neutral-button" id="copy-order"><i data-lucide="copy"></i> Copiar pedido</button><a class="outline-button" href="${storeConfig.discordUrl}" target="_blank" rel="noopener noreferrer">Abrir Discord <i data-lucide="arrow-up-right"></i></a></div><textarea class="order-fallback" aria-label="Resumen para copiar manualmente" readonly hidden></textarea>`;
  renderIcons();
}
function searchResults(query = "") {
  const q = query.trim().toLocaleLowerCase("es");
  const results = products.filter((p) =>
    `${p.label} ${themes[p.game].name} ${p.group}`
      .toLocaleLowerCase("es")
      .includes(q),
  );
  document.querySelector("#search-results").innerHTML = results.length
    ? results
        .map(
          (p) =>
            `<button class="search-result" data-search-game="${p.game}"><span><small>${themes[p.game].name}</small>${p.label}</span><span class="price">$${money(p.price)} <small>MXN</small></span><i data-lucide="arrow-up-right"></i></button>`,
        )
        .join("")
    : '<p class="search-empty">No encontramos productos. Prueba con “diamantes”, “Core” o “skin”.</p>';
  document.querySelector("#search-status").textContent =
    `${results.length} productos encontrados`;
  renderIcons();
}
function openDialog(type) {
  currentDialog = type;
  if (type === "cart") showCart();
  if (type === "search") {
    document.querySelector("#dialog-title").textContent =
      "ENCUENTRA TU POWER-UP";
    body.innerHTML =
      '<label for="product-search" class="search-label">Buscar por juego o producto</label><input id="product-search" type="search" placeholder="Diamantes, Game Pass, skins…" autocomplete="off"><p id="search-status" class="sr-only" role="status"></p><div id="search-results"></div>';
    searchResults();
  }
  if (type === "account") {
    document.querySelector("#dialog-title").textContent =
      "TUS PEDIDOS, EN DISCORD";
    body.innerHTML = `<div class="empty-state"><i data-lucide="user-round"></i><h3>Te atendemos en tu ticket.</h3><p>Por ahora no necesitas crear una cuenta en la web. Consulta tus pedidos y recibe ayuda desde nuestro servidor de Discord.</p><a class="neutral-button" href="${storeConfig.discordUrl}" target="_blank" rel="noopener noreferrer">Ir a Discord <i data-lucide="arrow-up-right"></i></a></div>`;
  }
  renderIcons();
  if (!dialog.open) dialog.showModal();
  if (type === "search") document.querySelector("#product-search").focus();
}
const switcher = setupThemeSwitcher();
observeAssets();
initGiftBundleBuilders();
SplashScreen({ lenis: initLenis() }).then(() => initAnimations());
updateCount();
renderIcons();

document.addEventListener("click", async (event) => {
  const open = event.target.closest("[data-open]");
  if (open) openDialog(open.dataset.open);
  if (event.target.closest("[data-close]")) dialog.close();
  const add = event.target.closest("[data-add]");
  if (add) addProduct(add.dataset.add);
  const quantity = event.target.closest("[data-quantity]");
  if (quantity) {
    const item = cart.find((p) => p.id === quantity.dataset.quantity);
    if (item) {
      item.quantity = Math.min(
        99,
        item.quantity + Number(quantity.dataset.change),
      );
      cart = cart.filter((p) => p.quantity > 0);
      saveCart();
      showCart();
    }
  }
  const search = event.target.closest("[data-search-game]");
  if (search) {
    switcher.selectTheme(search.dataset.searchGame);
    dialog.close();
    document.querySelector("#precios").scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  if (event.target.closest("#copy-order")) {
    try {
      await navigator.clipboard.writeText(orderText());
      toast("Pedido copiado. Pégalo en tu ticket de Discord.");
      document.querySelector("#copy-order").textContent = "¡Pedido copiado!";
    } catch {
      const text = document.querySelector(".order-fallback");
      text.hidden = false;
      text.value = orderText();
      text.focus();
      text.select();
      toast("Selecciona y copia el resumen manualmente.");
    }
  }
  const menu = document.querySelector(".menu-trigger");
  if (event.target.closest(".menu-trigger")) {
    const expanded = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", String(!expanded));
    document.querySelector("#main-nav").classList.toggle("is-open", !expanded);
  }
  if (event.target.closest("#main-nav a")) {
    menu.setAttribute("aria-expanded", "false");
    document.querySelector("#main-nav").classList.remove("is-open");
  }
});
document.addEventListener("input", (event) => {
  if (event.target.id === "product-search") searchResults(event.target.value);
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  }
});
window.addEventListener("storage", (event) => {
  if (event.key === "aether-cart") {
    try {
      const saved = JSON.parse(event.newValue || "[]");
      cart = Array.isArray(saved)
        ? saved.filter(
            (p) =>
              p &&
              findProduct(p.id) &&
              Number.isInteger(p.quantity) &&
              p.quantity > 0 &&
              p.quantity <= 99,
          )
        : [];
      updateCount();
      if (dialog.open && currentDialog === "cart") showCart();
    } catch {}
  }
});

initReviewsCarousel();
initProductViews();
