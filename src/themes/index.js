import freefire from "./freefire";
import xbox from "./xbox";
import fortnite from "./fortnite";
import gta from "./gta";
import spotify from "./spotify";
import { catalog } from "../data/catalog";
export const themes = Object.fromEntries(
  [freefire, xbox, fortnite, gta, spotify].map((theme) => [
    theme.id,
    {
      ...theme,
      priceFrom: Math.min(
        ...catalog[theme.id].paquetesFijos
          .filter((p) => !p.reference)
          .map((p) => p.price),
      ),
    },
  ]),
);
export const themeList = Object.values(themes);
