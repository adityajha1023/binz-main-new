import { Button } from './ui';
import React, { useMemo, useState } from 'react';
import {
  AirVent, Anchor, BatteryCharging, Cable, Camera, CircuitBoard,
  Computer, Fan, Gamepad2, HardHat, Headphones, Keyboard, Laptop, Microwave,
  Monitor, PackageOpen, Printer, Refrigerator, Router,
  ShoppingBag, Smartphone, Speaker, Tablet, Tv, Watch, WashingMachine,
  Sun,
} from 'lucide-react';
import { scrapItems } from '../data';

const iconMap = {
  AirVent, Anchor, BatteryCharging, Cable, Camera, CircuitBoard,
  Computer, Fan, Gamepad2, HardHat, Headphones, Keyboard, Laptop, Microwave,
  Monitor, PackageOpen, Printer, Refrigerator, Router,
  Smartphone, Speaker, Tablet, Tv, Watch, WashingMachine,
  Sun,
};

const filters = [
  { value: 'all', label: 'All items' },
  { value: 'ewaste', label: 'E-waste' },
  { value: 'normal', label: 'Metals' },
  { value: 'appliance', label: 'Appliances' },
];

function ScrapIcon({ icon }) {
  const Icon = iconMap[icon];
  return Icon ? <Icon size={38} strokeWidth={1.65} /> : null;
}

function categoryLabel(category) {
  if (category === 'ewaste') return 'E-waste';
  if (category === 'appliance') return 'Appliance quote';
  return 'Live rate';
}

export default function ScrapCataloguePage({ onSellEwaste, onSellNormal }) {
  const [filter, setFilter] = useState('all');
  const visibleItems = useMemo(
    () => (filter === 'all' ? scrapItems : scrapItems.filter((item) => item.category === filter)),
    [filter],
  );

  function handleSell(item) {
    if (item.category === 'ewaste') onSellEwaste(item.name);
    else onSellNormal(item.name);
  }

  return (
    <main className="scrap-catalogue-page">
      <a className="auth-back-link" href="#home">Back to BinZ</a>
      <section className="scrap-catalogue-hero" aria-labelledby="scrap-catalogue-title">
        <div>
          <p className="eyebrow">Scrap catalogue</p>
          <h1 id="scrap-catalogue-title">Every scrap item has a better next step.</h1>
          <p>Browse what we collect, check live indicative rates, and sell in a few taps. E-waste is handled through our safe recovery ticket flow.</p>
        </div>
        <div className="scrap-catalogue-count" aria-label={`${scrapItems.length} material types collected`}>
          <strong>{scrapItems.length}</strong>
          <span>material types collected</span>
        </div>
      </section>

      <section className="scrap-catalogue-content" aria-labelledby="catalogue-list-title">
        <div className="catalogue-heading-row">
          <div>
            <p className="eyebrow">Choose a category</p>
            <h2 id="catalogue-list-title">What would you like to sell?</h2>
          </div>
          <p>{visibleItems.length} items shown</p>
        </div>
        <div className="catalogue-filter-row" role="tablist" aria-label="Scrap categories">
          {filters.map(({ value, label }) => (
            <button
              key={value}
              className={`catalogue-filter${filter === value ? ' active' : ''}`}
              type="button"
              role="tab"
              aria-selected={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="catalogue-grid">
          {visibleItems.map((item) => (
            <article className="catalogue-card ui-card ui-card--interactive" key={item.name}>
              <div className="catalogue-card-top">
                <div className="catalogue-visual"><ScrapIcon icon={item.icon} /></div>
                <span>{categoryLabel(item.category)}</span>
              </div>
              <h3>{item.name}</h3>
              <div className="catalogue-rate">{item.rate}</div>
              <p>{item.note}</p>
              <Button className="button secondary" type="button" onClick={() => handleSell(item)}>
                <ShoppingBag size={18} /> Sell
              </Button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
