import { Button } from './ui';
import React, { useEffect, useState } from 'react';
import { Square, Volume2 } from 'lucide-react';
import { getCurrentPrices } from '../services/priceService';

export default function PricePreview() {
  const [prices, setPrices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => { getCurrentPrices({ location: localStorage.getItem('priceCity') || 'Greater Noida' }).then(({ prices: next }) => setPrices(next.slice(0, 3))).catch(() => setPrices([])); }, []);
  function toggleSpeech() {
    if (!window.speechSynthesis) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(prices.map((price) => `${price.category} ${price.currentPrice} rupees per kilogram`).join('. '));
    utterance.lang = localStorage.getItem('binz_language') === 'Hindi' ? 'hi-IN' : localStorage.getItem('binz_language') === 'Marathi' ? 'mr-IN' : 'en-IN';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }
  return <section className="price-preview section padded"><div><p className="eyebrow">Backend-authoritative rates</p><h2>Today’s scrap rates</h2><p>Track the latest valuable-material rates for Greater Noida.</p></div><div className="price-preview-list">{prices.map((price) => <div key={price.category}><span>{price.category}</span><strong>₹{price.currentPrice}/kg</strong><span>Effective {new Date(price.effectiveFrom).toLocaleDateString('en-IN')}</span></div>)}</div><div className="price-preview-actions"><Button as="a" className="button primary" href="#prices">View all rates</Button><Button className="button secondary" type="button" onClick={toggleSpeech}>{speaking ? <><Square size={18} /> Stop audio</> : <><Volume2 size={18} /> Listen</>}</Button></div></section>;
}
