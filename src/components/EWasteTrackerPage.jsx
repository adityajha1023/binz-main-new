import React from 'react';
import { EWasteTracker } from './TrackerSection';
import { Button, FormMessage } from './ui';

export default function EWasteTrackerPage() {
  return (
    <main className="ewaste-tracker-page">
      <div className="tracking-page-intro">
        <h1>E-waste tracking</h1>
        <FormMessage>This page shows a sample recycling journey. Live ticket tracking is not connected yet.</FormMessage>
        <div className="site-task-links"><Button as="a" variant="secondary" href="/#scrap-catalogue">Prepare an e-waste ticket</Button><Button as="a" variant="secondary" href="/#contact">Ask about a pickup</Button></div>
      </div>
      <EWasteTracker />
    </main>
  );
}
