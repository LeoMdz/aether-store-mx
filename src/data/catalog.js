import freefire from "./freefire-prices.json";
import xbox from "./xbox-prices.json";
import fortnite from "./fortnite-prices.json";
import gta from "./gta-millones.json";
import spotifyPlans from "./spotify-plans.json";
export { default as gtaCheteo } from "./gta-cheteo.json";
export { default as gifts } from "./fortnite-regalos.json";
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
