# Aether Store MX

Tienda frontend de productos digitales para México. Vite + JavaScript, Tailwind CSS, Anime.js v4, Lenis y Lottie. Los pedidos se preparan en el carrito local y se finalizan mediante un ticket en el servidor de Discord del negocio. No hay cobros ni autenticación simulados.

## Desarrollo

```sh
npm ci
npm run dev
npm run build
npx playwright install chromium
npm test
```

Componentes GameCard y PriceTable compartidos entre juegos; precios en `src/data/*.json`, tokens en `src/themes/` y `src/styles/themes.css`. El servidor de Discord está centralizado en `src/config.js`.

Las pruebas cubren escritorio, tablet y móvil, precios, tabs/teclado, carrito, búsqueda, Discord, accesibilidad WCAG AA con axe, neutralidad de header/footer, carga diferida por categoría y movimiento reducido. Capturas y resultados se guardan en `../validation` al ejecutar Playwright.

La bienvenida usa el logo original con Anime.js, una vez por sesión de pestaña (`sessionStorage`). Dura unos 2.15 segundos, con un límite independiente de 2.4 segundos y opción de saltar desde el primer segundo. Lenis se detiene y el contenido queda inerte mientras está visible. Con movimiento reducido se muestra un logo estático durante 600 ms. El antiguo loader Lottie queda disponible como recurso, pero no se inicia ni descarga en el flujo actual.

Fortnite usa cuatro paquetes fijos: 800/$125, 2,400/$290, 4,500/$490 y 12,500/$1,150 MXN. Crew se ofrece aparte por $135/mes con el badge de ahorro del 45%. Free Fire, Xbox, GTA y Spotify conservan paquetes fijos.

`GiftBundleBuilder` es el único armador personalizado: una base fija y cero o más extras, incluidos extras repetidos. Reutiliza `CustomOrderBuilder` para el resumen y la animación del total con Anime.js, respetando movimiento reducido. El botón «Cotizar mi lote» copia la base, cada extra y el total exacto y muestra el acceso al servidor para abrir un ticket de Discord. Si falla el portapapeles, el resumen queda seleccionado para copiarlo manualmente. Todos los pedidos se finalizan en Discord.

## Recursos

Referencias y logos proporcionados por el propietario. Arte de portada derivado de esas referencias con la herramienta integrada de generación de imágenes, para eliminar textos de los carteles y adaptar las paletas. La tipografía se aloja localmente. La tienda es independiente de los titulares de las marcas.

## Categorías y reseñas

Cinco temas locales: Free Fire, Xbox, Fortnite, GTA Online y Spotify. GameCard y PriceTable siguen siendo componentes únicos. Las pestañas internas de Fortnite y GTA no afectan las pestañas de categorías. GiftBundleBuilder prepara el lote de regalos y ProductViews gestiona los selectores y las garantías de GTA.

GTA tiene dos fuentes: gta-cheteo.json (tres planes PC Enhanced y garantías opcionales) y gta-millones.json (tablas Básicos/Grandes). Throne se ofrece solo por encima de 12 millones. La entrega de 30 millones diarios y resto 24h+ se muestra antes de comprar y se incluye en los resúmenes.

Spotify usa los cuatro precios proporcionados. Por confirmación del propietario, el ahorro se compara con $90 al mes: 30%, 28% y 40%, redondeado. Los porcentajes del cartel original no se usan en las tablas de venta. No se atribuyen estos planes a Individual, Duo o Family sin datos confirmados.

ReviewsCarousel conserva las 16 imágenes originales del ZIP. Avance manual mediante scroll-snap, gesto táctil, flechas, teclado y puntos; Anime.js anima scrollLeft. Sin avance automático que interrumpa la lectura. Solo se asigna src a la reseña visible y sus vecinas cuando la sección entra al viewport, además de loading=lazy. Las capturas no se recrean ni se recortan.
