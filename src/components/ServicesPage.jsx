import { Button, FormMessage } from './ui';
import React, { useState } from 'react';
import { ArrowLeft, HandCoins, Headphones, Laptop, RefreshCw, ShoppingBag, Smartphone, Tablet, Wrench } from 'lucide-react';

const listings = [
  {
    icon: Laptop,
    type: 'Refurbished laptop',
    name: 'Dell Latitude 5420',
    price: 'Rs. 35,000',
    specs: 'Intel Core i5 11th Gen, 16GB RAM, 512GB SSD, 14-inch FHD display, Windows 11 Pro.',
  },
  {
    icon: Smartphone,
    type: 'Refurbished phone',
    name: 'Samsung Galaxy S21',
    price: 'Rs. 7,000',
    specs: '6.2-inch AMOLED display, 8GB RAM, 128GB storage, 5G, 4,000mAh battery, unlocked.',
  },
  {
    icon: Tablet,
    type: 'Refurbished tablet',
    name: 'Apple iPad 9th Gen',
    price: 'Rs. 18,500',
    specs: '10.2-inch Retina display, A13 Bionic chip, 64GB storage, Wi-Fi, 10-hour battery life.',
  },
  {
    icon: Headphones,
    type: 'Refurbished audio',
    name: 'Sony WH-1000XM4',
    price: 'Rs. 12,000',
    specs: 'Wireless over-ear headphones, active noise cancellation, 30-hour battery, USB-C charging.',
  },
];

export default function ServicesPage() {
  const [status, setStatus] = useState('');

  function handleBuy(name) {
    setStatus(`${name} selected from the sample catalogue. Online purchasing is not available; contact BinZ to ask about availability.`);
  }

  return (
    <main className="services-page">
      <a className="auth-back-link" href="#home">
        <ArrowLeft size={16} /> Back to BinZ
      </a>
      <section className="services-hero" aria-labelledby="services-title">
        <div>
          <p className="eyebrow">More ways to make an impact</p>
          <h1 id="services-title">Give your tech a second life.</h1>
          <p>
            We refurbish usable electronics, then connect them with new owners. You earn a fair commission while useful technology stays in circulation.
          </p>
          <FormMessage>Sample listings and prices for the project demonstration. Stock, purchase and commission arrangements are not confirmed by this page.</FormMessage>
        </div>
        <div className="services-hero-art" aria-hidden="true">
          <RefreshCw size={72} strokeWidth={1.3} />
          <span>Repair. Restore. Rehome.</span>
        </div>
      </section>

      <section className="service-steps" aria-label="Refurbishing service steps">
        <article className="service-step">
          <Wrench size={24} />
          <h2>We refurbish</h2>
          <p>Our team checks, repairs, cleans, and tests your device before it is listed.</p>
        </article>
        <article className="service-step">
          <ShoppingBag size={24} />
          <h2>We sell online</h2>
          <p>Quality refurbished devices reach buyers looking for reliable, better-value tech.</p>
        </article>
        <article className="service-step">
          <HandCoins size={24} />
          <h2>You earn commission</h2>
          <p>Once your device sells, you receive your share with clear updates along the way.</p>
        </article>
      </section>

      <section className="marketplace" aria-labelledby="marketplace-title">
        <div className="section-heading align-left">
          <p className="eyebrow">Available now</p>
          <h2 id="marketplace-title">Shop refurbished tech</h2>
          <p>Every listed item is inspected and ready for a useful second chapter.</p>
        </div>
        <div className="listing-grid">
          {listings.map(({ icon: Icon, type, name, price, specs }) => (
            <article className="listing-card ui-card ui-card--interactive" key={name}>
              <div className="listing-visual"><Icon size={58} strokeWidth={1.4} /></div>
              <p className="eyebrow">{type}</p>
              <h3>{name}</h3>
              <div className="listing-price">{price}</div>
              <p className="listing-specs">{specs}</p>
              <Button className="button secondary" type="button" onClick={() => handleBuy(name)}>
                <ShoppingBag size={18} /> Buy now
              </Button>
            </article>
          ))}
        </div>
        {status && <FormMessage className="form-status marketplace-status">{status}</FormMessage>}
      </section>
    </main>
  );
}
