import freefire from "./freefire-prices.json";
import xbox from "./xbox-prices.json";
import fortnitePrices from "./fortnite-prices.json";
import gta from "./gta-millones.json";
import spotifyPlans from "./spotify-plans.json";
export { default as gtaCheteo } from "./gta-cheteo.json";
export { default as gifts } from "./fortnite-regalos.json";
const fortnite = {
  ...fortnitePrices,
  paquetesFijos: [
    ...fortnitePrices.paquetes.map((p) => ({
      id: `fn-pavos-${p.pavos}`,
      label: `${p.pavos.toLocaleString("es-MX")} pavos`,
      amount: p.pavos,
      price: p.precio,
      group: "Pavos",
    })),
    {
      id: "fn-crew",
      label: `${fortnitePrices.crew.nombre} · ${fortnitePrices.crew.duracion}`,
      price: fortnitePrices.crew.precio,
      group: "Crew",
    },
  ],
};
const spotify = {
  personalizadoHabilitado: false,
  paquetesFijos: spotifyPlans.planes.map((p, i) => ({
    id: `spotify-${i}`,
    label: `Premium · ${p.duracion}`,
    price: p.precio,
    ahorro: p.ahorro,
  })),
};
export const catalog = { freefire, xbox, fortnite, gta, spotify };
