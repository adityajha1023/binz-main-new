import { Button, FormMessage, Input, Select, FormField } from './ui';
import React, { useEffect, useRef, useState } from 'react';
import { useSubmission } from '../hooks/useSubmission';
import { CalendarCheck, MapPin, X } from 'lucide-react';
import { demoImpactStats } from '../data';

const BOOKING_COOLDOWN = 60 * 1000;

function computeImpact(entries) {
  const solid = entries.reduce((sum, entry) => sum + entry.solid, 0);
  const ewaste = entries.reduce((sum, entry) => sum + entry.ewaste, 0);

  return solid * 0.9 + ewaste * 2.6;
}

export default function HeroSection({
  entries,
  pickupStatus,
  setPickupStatus,
  submitBooking,
}) {
  const [phone, setPhone] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const { pending: isBooking, feedback, run, clear } = useSubmission();
  const [phoneError, setPhoneError] = useState('');
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!showCalendar) return;
    const previousFocus = document.activeElement;
    dialogRef.current?.querySelector('input')?.focus();
    return () => previousFocus?.focus();
  }, [showCalendar]);

  const co2 = demoImpactStats.co2Reduced + computeImpact(entries);
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];

  function handleSubmit(event) {
    event.preventDefault();

    const number = phone.replace(/\D/g, '');

    if (!/^[6-9]\d{9}$/.test(number)) {
      setPhoneError('Enter a valid Indian 10-digit mobile number.');
      setPickupStatus({
        msg: 'Enter a valid Indian 10-digit mobile number.',
        error: true,
      });
      return;
    }

    setPhone(number);
    setPhoneError('');
    clear();
    setPickupStatus({ msg: '', error: false });
    setShowCalendar(true);
  }

  function confirmBooking(event) {
    event.preventDefault();

    const booking = { phone: `+91${phone}`, date, slot };
    run({
      pendingMessage: submitBooking ? 'Requesting your pickup…' : 'Saving pickup details…',
      operation: async (signal) => {
        if (submitBooking) return submitBooking(booking, { signal });
        try {
          const key = `pickupBookingRate:${phone}`;
          const remaining = BOOKING_COOLDOWN - (Date.now() - Number(localStorage.getItem(key) || 0));
          if (remaining > 0) throw new Error(`Please wait ${Math.ceil(remaining / 1000)} seconds before saving another pickup.`);
          localStorage.setItem('pickupBooking', JSON.stringify(booking));
          localStorage.setItem(key, String(Date.now()));
        } catch (error) {
          if (error.name === 'QuotaExceededError' || error.name === 'SecurityError') throw new Error('Could not save on this device. Your details are still here; please try again.');
          throw error;
        }
      },
      successTone: submitBooking ? 'success' : 'info',
      successMessage: submitBooking ? 'Pickup request received.' : 'Pickup details saved on this device. Collection is not confirmed yet.',
      onSuccess: (result) => {
        setShowCalendar(false);
        setPickupStatus({ msg: submitBooking ? `Pickup request received.${result?.reference ? ` Reference: ${result.reference}.` : ''}` : 'Pickup details saved on this device. Collection is not confirmed yet.', error: false, tone: submitBooking ? 'success' : 'info' });
      },
    });
  }

  return (
    <section id="home" className="hero section-band">
      <div className="hero-copy">
        <p className="eyebrow">Put your trash back to work</p>

        <h1>
          Clean neighborhoods. Fair{' '}
          <span className="highlight">scrap</span> prices.
        </h1>

        <p className="hero-text">
          BinZ helps homes, hostels and campuses schedule scrap pickups, track
          their carbon impact, raise e-waste tickets and earn Z-Coins.
        </p>

        <form className="booking-card ui-card" id="pickupForm" onSubmit={handleSubmit}>
          <label htmlFor="phoneInput">Book a pickup</label>

          <div className="phone-row">
            <span>+91</span>

            <Input
              id="phoneInput"
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile"
              value={phone}
              aria-invalid={Boolean(phoneError)}
              aria-describedby={phoneError ? 'phoneError' : undefined}
              onInvalid={(event) => setPhoneError(event.currentTarget.validationMessage)}
              onChange={(event) => { setPhone(event.target.value.replace(/\D/g, '')); setPhoneError(''); setPickupStatus({ msg: '', error: false }); }}
              required
            />

            <Button className="button primary" type="submit">
              <CalendarCheck size={18} />
              Book
            </Button>
          </div>
          {phoneError && <small id="phoneError" className="ui-field-error">{phoneError}</small>}

          {pickupStatus.msg && (
            <FormMessage
              id="pickupStatus"
              className="form-status"
              tone={pickupStatus.error ? 'error' : pickupStatus.tone || 'info'}
            >
              {pickupStatus.msg}
            </FormMessage>
          )}
        </form>
      </div>

      {showCalendar && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendarTitle"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
            background: 'rgba(var(--ink-rgb), 0.55)',
          }}
        >
          <div ref={dialogRef} className="ui-card pickup-dialog" onKeyDown={(event) => {
            if (event.key === 'Escape' && !isBooking) setShowCalendar(false);
            if (event.key !== 'Tab') return;
            const controls = [...dialogRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled)')];
            const first = controls[0], last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
          }}>
            <button className="icon-button pickup-dialog-close" type="button" disabled={isBooking} onClick={() => setShowCalendar(false)} aria-label="Close calendar">
              <X aria-hidden="true" />
            </button>

            <h3 id="calendarTitle">Choose pickup slot</h3>

            <form
              onSubmit={confirmBooking}
              aria-busy={isBooking}
              style={{ display: 'grid', gap: '12px' }}
            >
              <FormField label="Pickup date"
                id="pickupDate"
                type="date"
                min={today}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                disabled={isBooking}
              />
              <FormField label="Time slot" as={Select}
                id="pickupSlot"
                value={slot}
                onChange={(event) => setSlot(event.target.value)}
                required
                disabled={isBooking}
              >
                <option value="">Select a time slot</option>
                <option>9:00 AM - 11:00 AM</option>
                <option>11:00 AM - 1:00 PM</option>
                <option>2:00 PM - 4:00 PM</option>
                <option>4:00 PM - 6:00 PM</option>
              </FormField>

              <Button
                className="button primary"
                type="submit"
                loading={isBooking}
                loadingLabel="Saving pickup…"
              >
                {isBooking ? 'Booking...' : 'Confirm pickup'}
              </Button>
              <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
            </form>
          </div>
        </div>
      )}

      <div className="hero-visual" aria-label="Recycling collection preview">
        <img
          src="/assets/binz-hero-recycling.webp"
          alt="Sorted recyclable materials ready for collection"
          width="1200"
          height="675"
          fetchPriority="high"
        />

        <div className="hero-card hero-card-top">
          <MapPin size={20} />
          <span>Greater Noida route live</span>
        </div>

        <div className="hero-card hero-card-bottom">
          <strong>{co2.toFixed(1)} kg</strong>
          <span>CO2 reduced by your entries</span>
        </div>
      </div>
    </section>
  );
}
