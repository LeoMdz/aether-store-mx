export function Header() {
  return `<a class="skip-link" href="#catalogo">Saltar al catálogo</a>
  <div class="announcement">TU PRÓXIMA PARTIDA EMPIEZA AQUÍ <span> / </span> RECARGAS DIGITALES · MÉXICO</div>
  <header class="site-header"><div class="header-inner container">
    <a href="#inicio" class="brand" aria-label="Aether Store MX, inicio"><span class="brand-mark"><img src="/assets/images/logo.webp" alt="" width="58" height="58"></span><span>AETHER<span class="brand-sub">STORE <b>MX</b></span></span></a>
    <nav aria-label="Principal" id="main-nav"><a href="#inicio">Inicio</a><a href="#catalogo">Catálogo</a><a href="#precios" data-select="freefire">Free Fire</a><a href="#precios" data-select="xbox">Xbox</a><a href="#precios" data-select="fortnite">Fortnite</a><a href="#precios" data-select="gta">GTA Online</a><a href="#precios" data-select="spotify">Spotify</a><a href="#contacto">Contacto</a></nav>
    <div class="header-actions"><button class="icon-button" data-open="search" aria-label="Buscar productos"><i data-lucide="search"></i></button><button class="icon-button cart-trigger" data-open="cart" aria-label="Abrir carrito"><i data-lucide="shopping-bag"></i><span id="cart-count" hidden>0</span></button><button class="icon-button" data-open="account" aria-label="Mi cuenta"><i data-lucide="user-round"></i></button><button class="icon-button menu-trigger" aria-controls="main-nav" aria-expanded="false" aria-label="Abrir menú"><i data-lucide="menu"></i></button></div>
  </div></header>`;
}
