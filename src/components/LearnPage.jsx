import { Button } from './ui';
import React from 'react';
import { ArrowLeft, BadgeCheck, FilePenLine, MapPinned, RefreshCw, ShieldCheck, Wrench } from 'lucide-react';

const principles = [
  {
    icon: Wrench,
    title: 'Refurbish',
    text: 'Repair and refresh useful electronics so they can perform well for longer instead of becoming waste.',
    action: 'Restore value',
  },
  {
    icon: RefreshCw,
    title: 'Rebuild',
    text: 'Replace worn parts, improve what can be improved, and rebuild devices for a reliable second chapter.',
    action: 'Make it better',
  },
  {
    icon: RefreshCw,
    title: 'Reuse',
    text: 'Pass on working devices, repurpose components, and keep valuable materials in circulation.',
    action: 'Keep it moving',
  },
];

export default function LearnPage() {
  return (
    <main className="learn-page">
      <a className="auth-back-link" href="#home">
        <ArrowLeft size={16} /> Back to BinZ
      </a>
      <section className="learn-hero" aria-labelledby="learn-title">
        <p className="eyebrow">A smaller footprint starts here</p>
        <h1 id="learn-title">Refurbish. Rebuild. Reuse.</h1>
        <p>
          Three practical habits can keep valuable electronics in use, reduce waste, and help build a cleaner future.
        </p>
      </section>
      <section className="principles-grid" aria-label="The three circular technology principles">
        {principles.map(({ icon: Icon, title, text, action }) => (
          <article className="principle-card ui-card ui-card--interactive" key={title}>
            <span className="principle-icon"><Icon size={28} /></span>
            <p className="eyebrow">01 / 0{principles.findIndex((item) => item.title === title) + 1}</p>
            <h2>{title}</h2>
            <p>{text}</p>
            <strong>{action}</strong>
          </article>
        ))}
      </section>
      <section className="learn-next-step">
        <div>
          <p className="eyebrow">Make it a habit</p>
          <h2>Small choices add up.</h2>
        </div>
        <Button as="a" className="button primary" href="#scrap">Find a better next step</Button>
      </section>
      <section className="verify-recycler-cta" aria-labelledby="verify-recycler-title">
        <div className="verify-recycler-copy">
          <p className="eyebrow">Recycler transparency</p>
          <h2 id="verify-recycler-title">Register as a Recycler</h2>
          <p>
            Recyclers can submit CPCB, facility, contact, and operations details to register with BinZ as assured
            partners.
          </p>
          <div className="verify-recycler-points" aria-label="Verification details covered">
            <span><ShieldCheck size={16} aria-hidden="true" /> Registration</span>
            <span><MapPinned size={16} aria-hidden="true" /> Facility</span>
            <span><BadgeCheck size={16} aria-hidden="true" /> BinZ connection</span>
          </div>
        </div>
        <Button as="a" className="button primary" href="/recycler-verification">
          <FilePenLine size={18} aria-hidden="true" /> Register Recycler
        </Button>
      </section>
    </main>
  );
}
