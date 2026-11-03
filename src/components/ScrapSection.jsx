import { Button } from './ui';
import React, { useEffect, useState } from 'react';
import {
  Laptop, Smartphone, Tablet, BatteryCharging, Anchor,
  ShoppingBag,
} from 'lucide-react';
import { scrapItems } from '../data';
import { getCurrentPrices } from '../services/priceService';

const iconMap = {
  Laptop, Smartphone, Tablet, BatteryCharging, Anchor,
};

function ScrapIcon({ icon }) {
  const LucideIcon = iconMap[icon];
  return LucideIcon ? <LucideIcon size={42} strokeWidth={1.7} /> : null;
}

function categoryLabel(category) {
  if (category === 'ewaste') return 'E-waste';
  if (category === 'appliance') return 'Quote';
  return 'Live rate';
}

export default function ScrapSection({ onSellEwaste, onSellNormal }) {
  const featuredItems = scrapItems.filter((item) => item.featured);
  const [prices, setPrices] = useState([]);
  useEffect(() => { getCurrentPrices({ location: localStorage.getItem('priceCity') || 'Greater Noida' }).then(({ prices: next }) => setPrices(next)).catch(() => setPrices([])); }, []);

  function handleSell(item) {
    if (item.category === 'ewaste') onSellEwaste(item.name);
    else onSellNormal(item.name);
  }

  return (
    <section id="scrap" className="section padded">
      <div className="section-heading">
        <p className="eyebrow">Sell smarter</p>
        <h2>A few popular scrap picks</h2>
        <p>Explore our complete catalogue for every material we collect, from e-waste to metals and appliances.</p>
      </div>
      <div className="scrap-grid" id="scrapGrid">
        {featuredItems.map((item) => (
          <article key={item.name} className="scrap-card ui-card ui-card--interactive">
            <div className="scrap-card-top">
              <div className="scrap-visual">
                <ScrapIcon icon={item.icon} />
              </div>
              <span>{categoryLabel(item.category)}</span>
            </div>
            <h3>{item.name}</h3>
            <div className="rate"><span>{item.category === 'normal' ? (prices.find((price) => price.category.toLowerCase() === item.name.toLowerCase())?.currentPrice ? `₹${prices.find((price) => price.category.toLowerCase() === item.name.toLowerCase()).currentPrice}/kg` : 'Rate unavailable') : item.rate}</span></div>
            <p>{item.note}</p>
            <Button
              className="button secondary"
              type="button"
              onClick={() => handleSell(item)}
            >
              <ShoppingBag size={18} />
              Sell
            </Button>
          </article>
        ))}
      </div>
      <div className="scrap-catalogue-cta">
        <Button as="a" className="button primary" href="#scrap-catalogue">View all scrap items</Button>
      </div>
    </section>
  );
}
