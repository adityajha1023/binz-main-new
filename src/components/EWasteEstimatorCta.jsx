import { Button } from './ui';
import React from 'react';
import { Calculator, ArrowRight } from 'lucide-react';

export default function EWasteEstimatorCta() {
  function handleNavigate(event) {
    event.preventDefault();
    window.history.pushState(null, '', '/ewaste-estimator');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  return (
    <section className="ewaste-estimator-cta" aria-labelledby="ewaste-estimator-cta-title">
      <div className="estimator-cta-icon" aria-hidden="true">
        <Calculator size={34} />
      </div>
      <div>
        <p className="eyebrow">Material value estimate</p>
        <h2 id="ewaste-estimator-cta-title">Got Scrap Materials?</h2>
        <p>Upload details for CRT, LCD, PCB, cables, batteries, motors, plastic or other materials to estimate potential value.</p>
      </div>
      <Button as="a" className="button primary" href="/ewaste-estimator" onClick={handleNavigate}>
        Estimate Material Value <ArrowRight size={18} aria-hidden="true" />
      </Button>
    </section>
  );
}
