import freefire from "./freefire";
import xbox from "./xbox";
import fortnite from "./fortnite";
import freefirePrices from "../data/freefire-prices.json";
import xboxPrices from "../data/xbox-prices.json";
import fortnitePrices from "../data/fortnite-prices.json";
const prices = {
  freefire: freefirePrices,
  xbox: xboxPrices,
  fortnite: fortnitePrices,
};
export const themes = Object.fromEntries(
  [freefire, xbox, fortnite].map((theme) => [
    theme.id,
    {
      ...theme,
      priceFrom: Math.min(
        ...prices[theme.id]
          .filter((product) => !product.reference)
          .map((product) => product.price),
      ),
    },
  ]),
);
export const themeList = Object.values(themes);
