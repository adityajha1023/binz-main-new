import { Button, FormField, Input, Select } from './ui';
import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, CalendarCheck, MapPin, Search, Square, Volume2 } from 'lucide-react';
import { getCurrentPrices, getPriceCategories } from '../services/priceService';
import { routeHref } from '../navigation';

const formatRupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

function ScrapValueCalculator({ prices }) {
  const [material, setMaterial] = useState('Iron');
  const [weight, setWeight] = useState('');
  const selectedRate = prices.find((price) => price.category === material);
  const kilograms = Number(weight);
  const value = selectedRate ? kilograms * selectedRate.currentPrice : NaN;
  const validWeight = weight !== '' && Number.isFinite(kilograms) && kilograms >= 0.01 && Number.isFinite(value);
  const weightError = weight !== '' && !validWeight ? 'Enter a valid weight of at least 0.01 kg.' : '';

  return (
    <aside className="scrap-value-calculator ui-card" aria-labelledby="scrap-value-title">
      <div className="scrap-value-heading"><Calculator aria-hidden="true" /><h2 id="scrap-value-title">Estimate your scrap value</h2></div>
      <p className="scrap-value-intro">Use the indicative rates listed below.</p>
      <div className="scrap-value-fields">
        <FormField id="scrap-estimate-material" label="Material" as={Select} value={material} disabled={!prices.length} onChange={(event) => setMaterial(event.target.value)}>
          {!prices.length && <option value="Iron">Loading materials…</option>}
          {prices.map((price) => <option key={price.category} value={price.category}>{price.category}</option>)}
        </FormField>
        <FormField id="scrap-estimate-weight" label="Weight (kg)" type="number" inputMode="decimal" min="0.01" step="any" placeholder="e.g. 10" value={weight} error={weightError} onChange={(event) => setWeight(event.target.value)} />
      </div>
      <div className="scrap-value-result" aria-live="polite" aria-atomic="true">
        <span>Estimated value</span>
        <output htmlFor="scrap-estimate-material scrap-estimate-weight">{validWeight ? formatRupees.format(value) : '₹—'}</output>
        <small>{selectedRate ? `${selectedRate.category} · ${formatRupees.format(selectedRate.currentPrice)}/${selectedRate.unit}` : 'Rates are loading.'}</small>
      </div>
      <p className="scrap-value-note">Indicative estimate only. Final value depends on material quality and measured weight.</p>
      <Button as="a" href={routeHref('#home?pickup=1')}><CalendarCheck aria-hidden="true" /> Schedule pickup</Button>
    </aside>
  );
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = localStorage.getItem('binz_language') === 'Hindi' ? 'hi-IN' : localStorage.getItem('binz_language') === 'Marathi' ? 'mr-IN' : 'en-IN';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function PriceCard({ price, city }) {
  return (
    <article className="price-card ui-card">
      <div className="price-card-heading"><div><h3>{price.category}</h3><p>Recovered material</p></div><span>Indicative</span></div>
      <div className="price-value">₹{price.currentPrice}<small> / {price.unit}</small></div>
      <p className="previous-price">Effective from {new Date(price.effectiveFrom).toLocaleDateString('en-IN')} · Updated {new Date(price.updatedAt).toLocaleDateString('en-IN')}</p>
      <p className="price-change stable">Backend-authoritative rate · {price.location}</p>
      <Button className="button secondary price-listen-button" type="button" onClick={() => speak(`${price.category} is ₹${price.currentPrice} per kilogram in ${city}.`)}><Volume2 size={17} /> Listen</Button>
    </article>
  );
}

export default function PriceDiscoveryPage() {
  const [prices, setPrices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [city, setCity] = useState(() => localStorage.getItem('priceCity') || 'Greater Noida');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    setLoading(true);
    Promise.all([getPriceCategories({ location: city }), getCurrentPrices({ location: city })])
      .then(([nextCategories, result]) => { setCategories(nextCategories); setPrices(result.prices); setError(''); })
      .catch((nextError) => { setPrices([]); setError(nextError.message); })
      .finally(() => setLoading(false));
  }, [city, reloadKey]);
  useEffect(() => { localStorage.setItem('priceCity', city); }, [city]);
  const visiblePrices = useMemo(() => prices.filter((price) => (!category || price.category === category) && `${price.category} ${price.categoryHindi}`.toLowerCase().includes(search.toLowerCase())), [prices, category, search]);
  function speakBoard() {
    if (speaking) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }
    if (!visiblePrices.length || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`Today’s scrap rates for ${city}. ${visiblePrices.map((price) => `${price.category} is ${price.currentPrice} rupees per kilogram`).join('. ')}`);
    utterance.lang = localStorage.getItem('binz_language') === 'Hindi' ? 'hi-IN' : localStorage.getItem('binz_language') === 'Marathi' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <main className="prices-page">
      <section className="prices-hero section padded">
        <div className="prices-hero-copy">
          <p className="eyebrow">Price discovery</p><h1>Today’s scrap rates</h1>
          <p className="prices-description">Check indicative scrap rates, compare recent movement, and hear the current price read aloud.</p>
          <label className="prices-location"><MapPin size={19} /><span>Location</span><Select value={city} onChange={(event) => setCity(event.target.value)}><option>Greater Noida</option><option>Noida</option><option>Delhi</option><option>Ghaziabad</option></Select></label>
        </div>
        <ScrapValueCalculator prices={prices} />
        <Button className="button primary prices-board-audio" type="button" onClick={speakBoard}>{speaking ? <><Square size={18} /> Stop audio</> : <><Volume2 size={18} /> Listen to all rates</>}</Button>
      </section>
      <section className="price-controls section padded" aria-label="Price filters">
        <label><span><Search size={16} /> Search materials</span><Input type="search" placeholder="Iron, copper, aluminium..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <label><span>Material</span><Select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All valuable materials</option>{categories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</Select></label>
      </section>
      <section className="price-board section padded"><div className="section-heading"><p className="eyebrow">📍 {city}</p><h2>Today’s material rates</h2><p>Backend-authoritative rates per kilogram. Final collection value depends on grade, quantity, and inspection.</p></div>{error && <p className="price-empty">{error} <button type="button" onClick={() => setReloadKey((value) => value + 1)}>Retry</button></p>}{loading && <p className="price-empty">Loading current rates…</p>}<div className="price-grid">{visiblePrices.map((price) => <PriceCard key={price.category} price={price} city={city} />)}</div>{!loading && !error && !visiblePrices.length && <p className="price-empty">No matching material found.</p>}</section>
    </main>
  );
}
