import { Button, FormMessage, Select, Textarea, FormField } from './ui';
import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { scrapItems } from '../data';
import { useSubmission } from '../hooks/useSubmission';

export default function TicketDrawer({
  isOpen, onClose, ticketTypePreset,
  tickets, setTickets, updateCoins, coins, setEntries, entries,
  submitTicket,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ticketType, setTicketType] = useState('');
  const [description, setDescription] = useState('');
  const { pending, feedback, run, clear } = useSubmission();
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (ticketTypePreset) setTicketType(ticketTypePreset);
  }, [ticketTypePreset]);

  function handleSubmit(e) {
    e.preventDefault();
    if (completed) return;
    run({
      pendingMessage: submitTicket ? 'Sending your ticket…' : 'Preparing demo ticket…',
      operation: async (signal) => {
        if (submitTicket) return submitTicket({ name: name.trim(), email: email.trim(), ticketType, description: description.trim() }, { signal });
        const id = `EW-${Math.floor(100000 + Math.random() * 900000)}`;
        try { localStorage.setItem('tickets', String(tickets + 1)); }
        catch { throw new Error('Could not save the demo ticket count. Your details are still here; please try again.'); }
        return { id };
      },
      successTone: submitTicket ? 'success' : 'info',
      successMessage: (result) => submitTicket ? `Ticket received.${result?.reference ? ` Reference: ${result.reference}.` : ''}` : `Demo ticket ${result.id} prepared. It has not been sent for collection. Demo wallet: +3 Z-Coins.`,
      onSuccess: (result) => {
        setCompleted(true);
        if (!submitTicket) { setTickets(tickets + 1); updateCoins(coins + 3, { persist: false }); }
        else if (typeof result?.coins === 'number') updateCoins(result.coins, { persist: false });
      },
    });
  }

  return (
    <aside
      className={`drawer${isOpen ? ' open' : ''}`}
      id="ticketPanel"
      aria-hidden={!isOpen}
      aria-label="E-waste ticket panel"
      role="dialog"
      aria-modal={isOpen || undefined}
      inert={!isOpen}
    >
      <div className="drawer-head">
        <div>
          <p className="eyebrow">E-waste care</p>
          <h2>Raise a ticket</h2>
        </div>
        <button className="icon-button" type="button" aria-label="Close ticket" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <form id="ticketForm" className="stacked-form" onSubmit={handleSubmit} aria-busy={pending} onChange={() => { if (!pending) { setCompleted(false); clear(); } }}>
        <fieldset className="ui-pending-fields" disabled={pending}>
        <FormField label="Name" autoComplete="name"
          id="ticketName"
          type="text"
          placeholder="Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField label="Email" autoComplete="email"
          id="ticketEmail"
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField label="E-waste type" as={Select}
          id="ticketType"
          required
          value={ticketType}
          onChange={(e) => setTicketType(e.target.value)}
        >
          <option value="">Select e-waste type</option>
          {scrapItems.filter((item) => item.category === 'ewaste').map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
          <option>Appliance</option>
          <option>Other</option>
        </FormField>
        <FormField label="Description" as={Textarea}
          id="ticketDescription"
          rows={4}
          placeholder="Short description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button className="button primary full" type="submit" disabled={completed} loading={pending} loadingLabel="Preparing ticket…">
          <Send size={18} /> Submit ticket
        </Button>
        </fieldset>
        <FormMessage id="ticketStatus" tone={feedback.tone}>{feedback.message}</FormMessage>
      </form>
    </aside>
  );
}
