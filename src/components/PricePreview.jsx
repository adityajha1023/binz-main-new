import { Button } from './ui';
import React, { useEffect, useState } from 'react';
import { ArrowUp, Square, Volume2 } from 'lucide-react';
import { getCurrentPrices } from '../services/priceService';

export default function PricePreview() {
  const [prices, setPrices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => { getCurrentPrices().then(({ prices: next }) => setPrices(next.slice(0, 3))); }, []);
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
  return <section className="price-preview section padded"><div><p className="eyebrow">Indicative BinZ rates</p><h2>Today’s scrap rates</h2><p>Track the latest valuable-material rates for Greater Noida.</p></div><div className="price-preview-list">{prices.map((price) => <div key={price.category}><span>{price.category}</span><strong>₹{price.currentPrice}/kg</strong><span><ArrowUp size={13} /> ₹{Math.abs(price.change)}</span></div>)}</div><div className="price-preview-actions"><Button as="a" className="button primary" href="#prices">View all rates</Button><Button className="button secondary" type="button" onClick={toggleSpeech}>{speaking ? <><Square size={18} /> Stop audio</> : <><Volume2 size={18} /> Listen</>}</Button></div></section>;
}
