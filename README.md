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

`CustomOrderBuilder` comparte el tema de cada pestaña. Los JSON contienen `unidad`, `tasaBase`, límites y `paquetesFijos`. Free Fire usa $850 / 5,600 diamantes (rango 50–10,000); Fortnite usa $380 / 3,800 pavos (rango 100–10,000). El total se redondea a pesos, sin redondear primero la tasa. Fortnite sigue siendo una cotización de regalos según su valor en pavos. Xbox conserva únicamente paquetes fijos por decisión del propietario: personalización deshabilitada y tasa/límites no aplicables (`null`).

La cotización genera y copia un resumen con juego, cantidad exacta e importe; después el usuario abre Discord y lo pega en su ticket. Si falla el portapapeles, el resumen queda seleccionado para copiarlo manualmente. No se usa WhatsApp ni se crea un ticket automáticamente. Si un paquete fijo proporciona la misma cantidad o más por un precio igual o menor, se recomienda con una opción para agregarlo al carrito.

## Recursos

Referencias y logos proporcionados por el propietario. Arte de portada derivado de esas referencias con la herramienta integrada de generación de imágenes, para eliminar textos de los carteles y adaptar las paletas. La tipografía se aloja localmente. La tienda es independiente de los titulares de las marcas.
