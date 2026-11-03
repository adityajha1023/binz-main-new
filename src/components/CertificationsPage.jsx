import React from 'react';
import { Button } from './ui';
import { ArrowLeft, FileCheck, LockKeyhole, ShieldCheck } from 'lucide-react';

export default function CertificationsPage() {
  const recipient = 'Sample recipient';

  return (
    <main className="certifications-page">
      <a className="auth-back-link" href="#home">
        <ArrowLeft size={16} /> Back to BinZ
      </a>
      <section className="certificate-intro" aria-labelledby="certifications-title">
        <p className="eyebrow">Responsible electronics recycling</p>
        <h1 id="certifications-title">Your data deserves a clean goodbye.</h1>
        <p>A completed recycling service should provide device-specific evidence. The document below illustrates a possible certificate layout.</p>
      </section>

      <section className="certificate" aria-labelledby="certificate-title">
        <div className="certificate-mark"><ShieldCheck size={34} /></div>
        <p className="certificate-kicker">Sample document — not valid as proof</p>
        <h2 id="certificate-title">Certificate of secure data erasure</h2>
        <p className="certificate-copy">Example recipient field</p>
        <p className="certificate-recipient">{recipient}</p>
        <p className="certificate-copy">A real certificate must identify the device, completed process and issuing recycler. No such evidence is linked to this sample.</p>
        <div className="certificate-details">
          <span><strong>Status</strong><b>Sample — unverified</b></span>
          <span><strong>Verification</strong><b>Not issued</b></span>
          <span><strong>Issued</strong><b>Not applicable</b></span>
        </div>
      </section>

      <section className="data-safety" aria-labelledby="data-safety-title">
        <div className="data-safety-heading">
          <p className="eyebrow">How it works</p>
          <h2 id="data-safety-title">Evidence before assurance.</h2>
          <p>The team must confirm the recycler’s data-handling process and receive completion evidence before publishing a verified certificate.</p>
        </div>
        <div className="data-steps">
          <article><span>01</span><LockKeyhole size={22} /><h3>Identify the device</h3><p>Associate the correct device and request with the recycler.</p></article>
          <article><span>02</span><FileCheck size={22} /><h3>Confirm the process</h3><p>Obtain the method, result and date from the responsible service.</p></article>
          <article><span>03</span><ShieldCheck size={22} /><h3>Provide evidence</h3><p>Make the actual completion record available when it has been verified.</p></article>
        </div>
      </section>
      <div className="site-task-links"><Button as="a" variant="secondary" href="/#ewaste-tracker">View sample tracking</Button><Button as="a" href="/#contact">Ask about certificate evidence</Button></div>
    </main>
  );
}
