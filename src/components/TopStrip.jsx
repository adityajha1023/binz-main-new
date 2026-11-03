import React from 'react';
import { Trophy, Coins, Phone } from 'lucide-react';

export default function TopStrip() {
  return (
    <div className="top-strip">
      <p>Hyper-local scrap pickups across Greater Noida | Earn Z-Coins on every responsible action</p>
      <div className="strip-links" aria-label="Quick links">
        <a href="/#leaderboard" aria-label="Leaderboard"><Trophy size={15} /></a>
        <a href="/#earn" aria-label="Earn coins"><Coins size={15} /></a>
        <a href="/#contact" aria-label="Contact"><Phone size={15} /></a>
      </div>
    </div>
  );
}
