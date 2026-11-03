import React from 'react';
import { demoImpactStats } from '../data';

export default function StatsBand({ entries, tickets }) {
  const solid = demoImpactStats.solidWaste + entries.reduce((sum, e) => sum + e.solid, 0);
  const ewaste = demoImpactStats.ewaste + entries.reduce((sum, e) => sum + e.ewaste, 0);
  const totalWaste = (solid + ewaste).toFixed(1);
  const bottleEquivalent = Math.round(solid * 22).toLocaleString('en-IN');

  return (
    <section className="stats-band">
      <article className="stat-card ui-card">
        <span id="wasteStat">{totalWaste} kg</span>
        <p>Waste recycled</p>
      </article>
      <article className="stat-card ui-card">
        <span id="bottleStat">{bottleEquivalent}</span>
        <p>Plastic bottle equivalent</p>
      </article>
      <article className="stat-card ui-card">
        <span id="ticketStat">{demoImpactStats.tickets + tickets}</span>
        <p>E-waste tickets raised</p>
      </article>
    </section>
  );
}
