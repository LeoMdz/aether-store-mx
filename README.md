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

El logo Lottie se reproduce una vez, solo en viewport, y se destruye. Una instancia de Lenis coordina el scroll. Las animaciones se pausan fuera de vista. Con movimiento reducido no se carga Lottie ni se inicia Lenis.

## Recursos

Referencias y logos proporcionados por el propietario. Arte de portada derivado de esas referencias con la herramienta integrada de generación de imágenes, para eliminar textos de los carteles y adaptar las paletas. La tipografía se aloja localmente. La tienda es independiente de los titulares de las marcas.
