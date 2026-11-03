import { Button, FormMessage, FormField, Select } from './ui';
import React, { useState } from 'react';
import {
  BadgeCheck,
  MapPin,
  Truck,
  Search,
  SlidersHorizontal,
  ArrowRight,
  LocateFixed,
} from 'lucide-react';
import { requestJson } from '../services/requestJson';
import { useSubmission } from '../hooks/useSubmission';

const materialOptions = [
  'CRT',
  'LCD',
  'PCB',
  'Cables',
  'Batteries',
  'Motors',
  'Plastic',
  'Mobile phones',
  'Laptops',
  'Printers',
  'Chargers / adapters',
  'Mixed electronics',
  'Others',
];

function RecyclerResultPreview({ result, onViewDetails }) {
  return (
    <article className="recycler-result-preview" aria-label="Recycler match preview">
      <div className="recycler-result-head">
        <div>
          <h4>{result.recyclerName || 'Recycler Name'}</h4>
            <span className="authorized-badge">
              <BadgeCheck size={14} aria-hidden="true" />
              {result.authorized ? 'Authorized' : 'Verification pending'}
          </span>
        </div>
      </div>
      <dl className="recycler-result-details">
        <div>
          <dt>Distance:</dt>
          <dd>{result.distance || '--'}</dd>
        </div>
        <div>
          <dt>Rate:</dt>
          <dd>{result.rate || '--'}</dd>
        </div>
        <div>
          <dt>Pickup:</dt>
          <dd>{result.pickupAvailability || '--'}</dd>
        </div>
        </dl>
        <div className="recycler-result-actions">
          <Button className="button secondary compact-button" type="button" onClick={() => onViewDetails(result)}>
            View Details
          </Button>
          <Button className="button primary compact-button" type="button" disabled aria-describedby="recycler-contact-note">
            Contact coming soon
          </Button>
      </div>
    </article>
  );
}

export default function RecyclerMatchingSection() {
  const [material, setMaterial] = useState('');
  const [location, setLocation] = useState('');
  const [pickupRequired, setPickupRequired] = useState('Yes');
  const [matches, setMatches] = useState([]);
  const { pending: isSearching, feedback, run, setFeedback, clear } = useSubmission();

  async function handleRecyclerSearch(event) {
    event.preventDefault();
    if (isSearching) return;
    if (!material || !location.trim()) {
      setMatches([]);
      setFeedback({ tone: 'error', message: 'Choose a material and enter a location to find recyclers.' });
      return;
    }

    setMatches([]);
    run({
      pendingMessage: 'Finding verified recyclers…',
      operation: async (signal) => {
      const query = new URLSearchParams({
        material,
        location: location.trim(),
        pickupRequired: String(pickupRequired === 'Yes'),
      });
      const result = await requestJson(`/recyclers/match?${query}`, { signal });
      if (!Array.isArray(result.matches)) throw new Error('Recycler results could not be read. Please try your search again.');
      return result.matches;
      },
      onSuccess: setMatches,
      successTone: (nextMatches) => nextMatches.length ? 'success' : 'info',
      successMessage: (nextMatches) => nextMatches.length
        ? `${nextMatches.length} matching recycler${nextMatches.length === 1 ? '' : 's'} found.`
        : 'No verified recyclers match those details yet. Try a nearby city or change pickup preference.',
    });
  }

  function handleViewDetails(recycler) {
    const materials = recycler.acceptedMaterials?.join(', ') || 'No material details available';
    setFeedback({ tone: 'info', message: `${recycler.recyclerName}: ${recycler.address || 'Address on request'}. Accepts: ${materials}.` });
  }

  return (
    <section className="recycler-match-page-content" aria-labelledby="recycler-match-title">
      <div className="recycler-match-panel">
        <div className="recycler-match-copy">
          <p className="eyebrow">Smart recycler matching</p>
          <h1 id="recycler-match-title">Find recyclers who fit the job.</h1>
          <p>
            Pick a material, add your area, and compare matches built around
            verified handling, pickup support, and fair recycler rates.
          </p>
          <div className="mini-points">
            <span><BadgeCheck size={19} aria-hidden="true" /> Authorized recyclers</span>
            <span><MapPin size={19} aria-hidden="true" /> Nearby matches</span>
            <span><Truck size={19} aria-hidden="true" /> Pickup availability</span>
          </div>

          {/* TODO: Replace this static map preview with Google Maps after backend location data is connected. */}
          <div className="recycler-map-card" aria-label="Recycler matching map preview">
            <svg className="static-map-illustration" viewBox="0 0 720 330" aria-hidden="true">
              <rect className="map-land" width="720" height="330" />
              <path className="map-park" d="M0 0H138L168 48L130 96L150 150L96 204L104 292L0 330Z" />
              <path className="map-park" d="M562 0H720V168L668 152L632 198L566 182L548 116L586 62Z" />
              <path className="map-park light" d="M250 0H408L388 70L432 118L396 176L306 158L292 90Z" />
              <path className="map-water" d="M0 232C54 208 86 232 134 212C182 190 194 130 244 124C288 120 312 160 354 152C396 144 420 98 468 106C516 114 530 166 590 166C646 166 676 126 720 138V330H0Z" />
              <g className="minor-roads">
                <path d="M78 0L224 330" />
                <path d="M168 0L338 330" />
                <path d="M330 0L270 330" />
                <path d="M472 0L512 330" />
                <path d="M638 0L590 330" />
                <path d="M0 66H720" />
                <path d="M0 132H720" />
                <path d="M0 198H720" />
                <path d="M0 264H720" />
                <path d="M106 42L604 288" />
                <path d="M612 22L156 306" />
              </g>
              <g className="major-roads">
                <path d="M54 306C132 250 210 232 284 184C372 126 438 60 560 28" />
                <path d="M36 86C148 132 226 132 320 114C438 92 536 116 686 180" />
                <path d="M692 0C610 82 568 152 536 330" />
              </g>
              <path className="match-route" d="M170 260C244 210 292 196 360 174C426 152 484 114 578 102" />
            </svg>

            <div className="map-place-label city-label">
              <strong>Greater Noida</strong>
              <span>ग्रेटर नोएडा</span>
            </div>
            <div className="map-place-label park-label">Knowledge Park II</div>
            <div className="map-place-label sector-label">Sector XU 2</div>
            <div className="map-place-label road-label">Yamuna Expy</div>

            <div className="map-node source">
              <span className="map-pin-icon"><Search size={18} aria-hidden="true" /></span>
              <span>Material</span>
            </div>
            <div className="map-node center">
              <LocateFixed size={24} aria-hidden="true" />
              <strong>Match</strong>
            </div>
            <div className="map-node recycler-one">
              <span className="map-pin-icon"><BadgeCheck size={18} aria-hidden="true" /></span>
              <span>Verified recycler</span>
            </div>
            <div className="map-node recycler-two">
              <span className="map-pin-icon"><Truck size={18} aria-hidden="true" /></span>
              <span>Pickup ready</span>
            </div>
          </div>
        </div>

        <form className="recycler-match-card ui-card" onSubmit={handleRecyclerSearch} aria-busy={isSearching}>
          <div className="recycler-card-heading">
            <span aria-hidden="true"><SlidersHorizontal size={22} /></span>
            <h3>Find Recycler</h3>
          </div>

          <FormField label="Material" as={Select} required disabled={isSearching} value={material} onChange={(event) => { setMaterial(event.target.value); setMatches([]); clear(); }}>
              <option value="">Select material</option>
              {materialOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
          </FormField>

            <FormField label="Location" required disabled={isSearching}
              type="text"
              placeholder="Enter your city or area"
              value={location}
              onChange={(event) => { setLocation(event.target.value); setMatches([]); clear(); }}
            />

          <div className="pickup-choice" role="group" aria-label="Pickup required">
            <span>Pickup required</span>
            <div>
              {['Yes', 'No'].map((option) => (
                <button
                  key={option}
                  className={pickupRequired === option ? 'active' : ''}
                  type="button"
                  aria-pressed={pickupRequired === option}
                  disabled={isSearching}
                  onClick={() => { setPickupRequired(option); setMatches([]); clear(); }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <Button className="button primary full" type="submit" loading={isSearching} loadingLabel="Finding recyclers…">
            <Search size={18} aria-hidden="true" /> Find Matching Recyclers
          </Button>

          <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>

          {matches.length > 0 && (
            <div className="match-preview-block">
            <p id="recycler-contact-note" className="ui-unavailable-note">Contact requests are not available yet. You can review each recycler’s details.</p>
            <div className="match-preview-title">
              <span>Matching recyclers</span>
              <ArrowRight size={16} aria-hidden="true" />
            </div>
            {matches.map((result) => (
              <RecyclerResultPreview
                key={result.id}
                result={result}
                onViewDetails={handleViewDetails}
              />
            ))}
            </div>
          )}
        </form>
      </div>

      <div className="recycler-support-band">
        <div className="recycler-match-showcase" aria-label="Recycler matching flow preview">
          <article>
            <div className="showcase-card-top">
              <span className="showcase-icon"><Search size={22} aria-hidden="true" /></span>
              <span className="showcase-step">01</span>
            </div>
            <strong>Input details</strong>
            <p>Choose the material type and enter the pickup area so matches start from the right context.</p>
            <div className="showcase-tags">
              <span>Material</span>
              <span>Area</span>
            </div>
          </article>
          <article>
            <div className="showcase-card-top">
              <span className="showcase-icon"><SlidersHorizontal size={22} aria-hidden="true" /></span>
              <span className="showcase-step">02</span>
            </div>
            <strong>Smart match</strong>
            <p>Prepare recycler matches by material fit, pickup preference, availability, and rate fields.</p>
            <div className="showcase-tags">
              <span>Fit</span>
              <span>Availability</span>
            </div>
          </article>
          <article>
            <div className="showcase-card-top">
              <span className="showcase-icon"><Truck size={22} aria-hidden="true" /></span>
              <span className="showcase-step">03</span>
            </div>
            <strong>View match</strong>
            <p>Preview a recycler card with distance, rate, pickup status, and quick connect actions.</p>
            <div className="showcase-tags">
              <span>Distance</span>
              <span>Connect</span>
            </div>
          </article>
        </div>

        <div className="material-chip-row" aria-label="Supported material categories">
          {materialOptions.map((option) => (
            <span key={option}>{option}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
