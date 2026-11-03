import React from 'react';
import { Leaf, BadgeIndianRupee, ShieldCheck, UsersRound } from 'lucide-react';

export default function TrustRow() {
  return (
    <section className="trust-row" aria-label="BinZ promises">
      <article>
        <Leaf size={32} />
        <div><strong>Transparent rates</strong><span>Clear scrap value before pickup</span></div>
      </article>
      <article>
        <BadgeIndianRupee size={32} />
        <div><strong>Reward wallet</strong><span>Z-Coins for recycling actions</span></div>
      </article>
      <article>
        <ShieldCheck size={32} />
        <div><strong>Verified disposal</strong><span>Separate flows for e-waste care</span></div>
      </article>
      <article>
        <UsersRound size={32} />
        <div><strong>Collector-first</strong><span>Local partners, better work</span></div>
      </article>
    </section>
  );
}
