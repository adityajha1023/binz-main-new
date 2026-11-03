import { Button, FormMessage, Select, Textarea, FormField } from './ui';
import React, { useState } from 'react';
import { ArrowLeft, Check, Gift, HeartHandshake, MapPin, Recycle, Send } from 'lucide-react';
import { useSubmission } from '../hooks/useSubmission';

const donationTypes = ['Electronics', 'Furniture', 'Books', 'Clothing', 'Other'];

export default function DonatePage({ submitDonation }) {
  const { pending, feedback, run, clear } = useSubmission();
  const [prepared, setPrepared] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (prepared) return;
    const details = Object.fromEntries(new FormData(event.currentTarget));
    run({
      pendingMessage: submitDonation ? 'Sending donation request…' : 'Checking donation details…',
      operation: async (signal) => submitDonation?.(details, { signal }),
      successTone: submitDonation ? 'success' : 'info',
      successMessage: (result) => submitDonation ? `Donation request received.${result?.reference ? ` Reference: ${result.reference}. Keep it for follow-up.` : ' Collection will be confirmed separately.'}` : 'Your donation details are ready on this page. Online requests are not available yet; please contact BinZ to arrange collection.',
      onSuccess: () => setPrepared(true),
    });
  }

  return (
    <main className="donate-page">
      <a className="auth-back-link" href="#home"><ArrowLeft size={16} /> Back to BinZ</a>
      <section className="donate-hero" aria-labelledby="donate-title">
        <div className="donate-intro">
          <p className="eyebrow">Give more. Waste less.</p>
          <h1 id="donate-title">Pass it on with purpose.</h1>
          <p className="donate-lede">Donate the second-hand things you no longer need. We help useful products find a new home, fund local causes, or reach responsible recyclers.</p>
          <div className="donate-highlights" aria-label="Donation benefits">
            <span><HeartHandshake size={18} /> Help a neighbour</span>
            <span><Recycle size={18} /> Keep items in use</span>
          </div>
        </div>
        <div className="donate-hero-art" aria-hidden="true">
          <div className="donate-art-icon"><Gift size={58} strokeWidth={1.4} /></div>
          <span>One item can start a chain of good.</span>
          <div className="donate-art-line"><span /><span /><span /></div>
        </div>
      </section>
      <section className="donate-layout" aria-label="Donation request">
        <div className="donate-guide">
          <p className="eyebrow">How it works</p>
          <h2>Make room for something meaningful.</h2>
          <div className="donate-step"><span>01</span><div><h3>Tell us about it</h3><p>Share a few details so we can choose the best next home.</p></div></div>
          <div className="donate-step"><span>02</span><div><h3>We arrange pickup</h3><p>Our team confirms a convenient time and collects it from you.</p></div></div>
          <div className="donate-step"><span>03</span><div><h3>See the difference</h3><p>We keep you updated on where your contribution goes.</p></div></div>
        </div>
        <form className="donate-form ui-card" onSubmit={handleSubmit} aria-busy={pending} onChange={() => { if (!pending) { setPrepared(false); clear(); } }}>
          <fieldset className="ui-pending-fields" disabled={pending}>
          <div className="donate-form-heading"><div className="donate-form-icon"><MapPin size={20} /></div><div><p className="eyebrow">Start a donation</p><h2>What would you like to give?</h2></div></div>
          <FormField label="Item type" name="itemType" as={Select} id="donationType" required defaultValue=""><option value="" disabled>Select a category</option>{donationTypes.map((type) => <option key={type}>{type}</option>)}</FormField>
          <FormField label="Tell us about the item" name="description" as={Textarea} id="donationDescription" rows="3" placeholder="For example: gently used study table, good condition" required />
          <div className="donate-form-row"><div><FormField label="Your name" name="name" autoComplete="name" id="donorName" type="text" placeholder="Your name" required /></div><div><FormField label="Phone number" name="phone" autoComplete="tel" id="donorPhone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} hint="10 digits, starting with 6, 7, 8 or 9." placeholder="10-digit number" required /></div></div>
          <FormField label="Pickup address" name="address" autoComplete="street-address" id="donorAddress" type="text" placeholder="Area, city and pincode" required />
          <Button className="button primary full" type="submit" loading={pending} loadingLabel="Checking request…" disabled={prepared}><Send size={18} /> Request donation pickup</Button>
          </fieldset>
          <FormMessage tone={feedback.tone} className="form-status donate-status">{feedback.message}</FormMessage>
          {prepared && !submitDonation && <Button as="a" variant="secondary" href="tel:+919696202329">Call BinZ to arrange collection</Button>}
        </form>
      </section>
      <p className="donate-note"><Check size={16} /> We accept usable goods and responsibly recycle items that have reached the end of their life.</p>
    </main>
  );
}
