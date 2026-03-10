export const PRODUCT_BASE_PRICES = {
  aviator: 39999,
  "grand-valmontier": 48000,
  chronaut: 29999,
};

export const PRICE_MODIFIERS = {
  strap: {
    "Steel Bracelet": 8000,
    "Black Leather": 0,
    "Navy Leather": 0,
    "Brown Leather": 0,
    "Tan Leather": 1000,
    "Leather Strap": 0,
  },
  handColor: {
    Blue: 0,
    Black: 0,
    Steel: 0,
    Gold: 2000,
    "Blue (Lume)": 1500,
    "Black (Lume)": 1500,
    "Steel (Lume)": 1500,
    "Gold (Lume)": 3000,
  },
  dialColor: {
    "White Roman": 0,
    Ivory: 0,
    Silver: 1000,
    "Sky Blue": 2500,
    Black: 1500,
    Blue: 2500,
  },
};

export function getBuildPriceCents(slug, options = {}) {
  const base = PRODUCT_BASE_PRICES[slug] ?? 0;

  const strap = PRICE_MODIFIERS.strap[options.strap] ?? 0;
  const handColor = PRICE_MODIFIERS.handColor[options.handColor] ?? 0;
  const dialColor = PRICE_MODIFIERS.dialColor[options.dialColor] ?? 0;

  return base + strap + handColor + dialColor;
}

export function formatMoney(cents, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format((cents || 0) / 100);
}