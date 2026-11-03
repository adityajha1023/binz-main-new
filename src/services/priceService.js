import { requestJson } from './requestJson';

const hindiNames = {
  Iron: 'लोहा',
  Steel: 'स्टील',
  Aluminium: 'एल्युमिनियम',
  Copper: 'तांबा',
  Brass: 'पीतल',
  Lead: 'सीसा',
  Zinc: 'जस्ता',
};

function normalizePrice(price) {
  return {
    ...price,
    category: price.materialName,
    categoryHindi: hindiNames[price.materialName] || price.materialName,
    currentPrice: price.price,
    unit: price.unit,
    previousPrice: null,
    change: null,
    direction: 'stable',
    trend: [price.price],
  };
}

export async function getCurrentPrices({ location = 'Greater Noida', date } = {}) {
  const query = new URLSearchParams({ location });
  if (date) query.set('date', date);
  const result = await requestJson(`/scrap-prices?${query.toString()}`);
  return {
    ...result,
    prices: (Array.isArray(result.prices) ? result.prices : []).map(normalizePrice),
  };
}

export async function getPriceCategories(options) {
  const { prices } = await getCurrentPrices(options);
  return prices.map(({ category, categoryHindi }) => ({ name: category, nameHindi: categoryHindi }));
}
