const priceRows = [
  ['Iron', 'लोहा', 26, 28, [24, 25, 26, 28]],
  ['Steel', 'स्टील', 40, 42, [37, 39, 40, 42]],
  ['Aluminium', 'एल्युमिनियम', 105, 110, [96, 101, 105, 110]],
  ['Copper', 'तांबा', 650, 665, [620, 638, 650, 665]],
  ['Brass', 'पीतल', 390, 400, [370, 382, 390, 400]],
  ['Lead', 'सीसा', 130, 128, [134, 132, 130, 128]],
  ['Zinc', 'जस्ता', 180, 184, [171, 176, 180, 184]],
].map(([name, hindi, previousPrice, currentPrice, trend]) => ({
  category: name,
  categoryHindi: hindi,
  previousPrice,
  currentPrice,
  unit: 'kg',
  change: currentPrice - previousPrice,
  direction: currentPrice > previousPrice ? 'up' : currentPrice < previousPrice ? 'down' : 'stable',
  trend,
  updatedAt: 'Indicative BinZ rate',
}));

export function getCurrentPrices({ category } = {}) {
  const prices = category ? priceRows.filter((item) => item.category === category) : priceRows;
  return Promise.resolve({ prices });
}

export function getPriceCategories() {
  return Promise.resolve(priceRows.map(({ category, categoryHindi }) => ({ name: category, nameHindi: categoryHindi })));
}
