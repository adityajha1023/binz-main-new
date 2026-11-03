import { Button } from './ui';
import React from 'react';
import { Laptop, LogIn, MailCheck, MessageCircle } from 'lucide-react';

export default function ServiceSection({ onOpenTicket, onOpenAccount, onOpenChat }) {
  return (
    <section id="service" className="section padded service-grid">
      <div className="section-heading align-left">
        <p className="eyebrow">Service hub</p>
        <h2>One place for pickup, tickets and account state</h2>
      </div>
      <article className="service-card ui-card ui-card--interactive">
        <MailCheck size={34} />
        <h3>E-waste ticket</h3>
        <p>Raise a responsible disposal request with a generated ticket ID.</p>
        <Button className="button secondary" type="button" onClick={onOpenTicket}>
          Open ticket
        </Button>
      </article>
      <article className="service-card ui-card ui-card--interactive">
        <LogIn size={34} />
        <h3>Sign in</h3>
        <p>Sign in to access your account and review your wallet state.</p>
        <Button className="button secondary" type="button" onClick={onOpenAccount}>
          Open account
        </Button>
      </article>
      <article className="service-card ui-card ui-card--interactive">
        <MessageCircle size={34} />
        <h3>FAQ</h3>
        <p>Quick answers for booking, contact, e-waste and project details.</p>
        <Button className="button secondary" type="button" id="openChatFromCard" onClick={onOpenChat}>
          Open FAQs
        </Button>
      </article>
      <article className="service-card ui-card ui-card--interactive">
        <Laptop size={34} />
        <h3>Track your E-waste</h3>
        <p>Check pickup progress, facility status and recycling report details.</p>
        <Button as="a"
          className="button secondary"
          href="#ewaste-tracker"
        >
          Open tracker
        </Button>
      </article>
    </section>
  );
}
