import React from 'react';

export default function AboutBand() {
  return (
    <section id="about" className="about-band">
      <div>
        <p className="eyebrow">About BinZ</p>
        <h2>Built for local communities first</h2>
        <p>
          BinZ simplifies scrap collection for residential areas, college campuses and local communities.
          The model removes middlemen, supports local collectors, brings fair pricing into view and adds
          reward-based incentives for responsible recycling.
        </p>
        <p>
          The long-term vision includes AI-driven waste sorting and recycling tracking, so every pickup
          can become cleaner, more accountable and easier to scale.
        </p>
        <a className="about-project-link" href="/#about">About the BinZ student project →</a>
      </div>
      <img src="/assets/binz-community-recycling.png" alt="Volunteer collecting waste outdoors" />
    </section>
  );
}
