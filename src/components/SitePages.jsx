import React, { useEffect, useState } from 'react';
import { ArrowRight, Mail, Phone, Search } from 'lucide-react';
import { Button, FormField, FormMessage, Select, Textarea } from './ui';
import { pageIndex, routeHref } from '../navigation';
import { requestJson } from '../services/requestJson';

const contactEmail = 'cloudynx.tech@gmail.com';
const reviewNote = 'Project information — team review pending. This is not a final approved policy.';

function Page({ title, intro, children }) {
  return <main className="site-info-page"><div className="site-info-intro"><p className="eyebrow">BinZ information</p><h1>{title}</h1><p>{intro}</p></div>{children}</main>;
}

export function SitemapPage() {
  const groups = [...new Set(pageIndex.map((page) => page.group))];
  return <Page title="Sitemap" intro="Find every main page and section in one place.">
    <Button as="a" variant="secondary" href={routeHref('#search')}><Search aria-hidden="true" /> Search BinZ</Button>
    <div className="site-directory-grid">{groups.map((group) => <section className="ui-card" key={group}><h2>{group}</h2><ul className="site-directory-list">{pageIndex.filter((page) => page.group === group).map((page) => <li key={page.route}><a href={routeHref(page.route)}>{page.title}<ArrowRight size={16} aria-hidden="true" /></a><p>{page.description}</p></li>)}</ul></section>)}</div>
  </Page>;
}

function queryFromHash() { return new URLSearchParams(window.location.hash.split('?')[1] || '').get('q') || ''; }
export function SearchPage({ currentPage }) {
  const [query, setQuery] = useState(queryFromHash);
  const [submitted, setSubmitted] = useState(queryFromHash);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { const value = queryFromHash(); setQuery(value); setSubmitted(value); }, [currentPage]);
  useEffect(() => {
    const trimmed = submitted.trim();
    if (!trimmed) { setResults([]); setTotal(0); setError(''); return undefined; }
    let active = true;
    setLoading(true);
    requestJson(`/search?q=${encodeURIComponent(trimmed)}&limit=20`)
      .then((result) => { if (!active) return; setResults(Array.isArray(result.results) ? result.results : []); setTotal(Number(result.total) || 0); setError(''); })
      .catch((nextError) => { if (!active) return; setResults([]); setTotal(0); setError(nextError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [submitted]);
  function search(event) {
    event.preventDefault();
    const value = query.trim(); setSubmitted(value);
    const next = `#search${value ? `?q=${encodeURIComponent(value)}` : ''}`;
    if (window.location.hash !== next) window.location.hash = next;
  }
  return <Page title="Search BinZ" intro="Search the page directory and accepted-material catalogue. This search runs on your device and does not search private accounts or live tickets.">
    <form className="site-search-form" role="search" aria-label="Search BinZ content" onSubmit={search}>
      <FormField label="Search pages, materials and recyclers" id="siteSearchQuery" type="search" maxLength={150} autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try pickup, loha kabad or plastic waste" />
      <Button type="submit"><Search aria-hidden="true" /> Search</Button>
    </form>
    <p role="status" aria-live="polite">{loading ? 'Searching BinZ…' : submitted.trim() ? `${total} result${total === 1 ? '' : 's'} for “${submitted}”.` : 'Enter a topic, material, Hindi phrase or recycler to start searching.'}</p>
    {error && <FormMessage tone="error">{error}</FormMessage>}
    {submitted.trim() && !loading && !error && !results.length && <FormMessage>No matching public content. Try “loha kabad”, “plastic waste”, “ई-कचरा”, or <a href={routeHref('#sitemap')}>browse the sitemap</a>.</FormMessage>}
    <ul className="site-search-results">{results.map((result) => <li className="ui-card" key={`${result.type}-${result.id}`}><span className="eyebrow">{result.type}</span><h2><a href={result.href}>{result.title}</a></h2><p>{result.excerpt}</p></li>)}</ul>
  </Page>;
}

export function AboutPage() {
  return <Page title="About BinZ" intro="A student team project for SIH 2026, exploring simpler scrap collection and responsible e-waste handling.">
    <section className="ui-card site-prose"><h2>What we are building</h2><p>BinZ brings material information, pickup preparation, recycler discovery and estimated environmental impact into one website. The current project focuses on Greater Noida.</p><h2>What works as a prototype</h2><p>Several actions prepare details locally or show sample data. Pickup collection, ticket fulfilment, estimated recovery values, recycler approval and rewards must be confirmed by the connected service before they can be treated as real outcomes.</p><h2>Project ownership</h2><p>BinZ is a student team project for SIH 2026. The website does not represent government ownership or approval.</p><Button as="a" href={routeHref('#help')}>Choose your next step <ArrowRight aria-hidden="true" /></Button></section>
  </Page>;
}

const faqs = [
  ['How do I request a pickup?', 'Start with Book a pickup on the home page and choose your date and time slot. The current local save is not a confirmed collection; contact BinZ before relying on a pickup.', '#home', 'Prepare a pickup'],
  ['How do I raise an e-waste ticket?', 'Open the Service menu and select E-waste ticket, or use Sell on an electronic item. The current drawer explicitly identifies demo tickets that have not been sent.', '#scrap-catalogue', 'Choose an item'],
  ['Are rates and recovery values guaranteed?', 'Listed scrap prices are indicative. Material condition, weight, location and service confirmation may change the final value. The estimator currently prepares inputs when no estimation service is connected.', '#prices', 'Review rates'],
  ['Can I track a real ticket here?', 'The current tracking page shows a sample journey. Live ticket status and reports need the agreed backend integration.', '#ewaste-tracker', 'View the sample journey'],
  ['Are all rewards verified?', 'The cleanup flow labels browser demo rewards. A displayed estimate or demo balance does not establish a verified payout.', '#earn', 'View cleanup rewards'],
  ['How can I find or register a recycler?', 'Search by material and area. Registration currently prepares a review preview; uploading a certificate does not mean a partner is approved.', '/recycler-matching', 'Find a recycler'],
];
export function HelpPage() {
  return <Page title="Help and FAQ" intro="Choose a task or find out what the current prototype can do.">
    <div className="site-task-links"><Button as="a" href={routeHref('#home')}>Book a pickup</Button><Button as="a" variant="secondary" href={routeHref('#scrap-catalogue')}>Raise an e-waste ticket</Button><Button as="a" variant="secondary" href={routeHref('#ewaste-tracker')}>Track e-waste</Button></div>
    <div className="site-faq-list">{faqs.map(([question,answer,route,label]) => <details className="ui-card" key={question}><summary>{question}</summary><p>{answer}</p><a href={routeHref(route)}>{label} →</a></details>)}</div>
    <p>Need more help? <a href={routeHref('#contact')}>Contact BinZ or prepare feedback</a>.</p>
  </Page>;
}

export function ContactPage() {
  const [draft, setDraft] = useState(null);
  function prepare(event) { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); setDraft(values); }
  const mailLink = draft ? `mailto:${contactEmail}?subject=${encodeURIComponent(`BinZ ${draft.topic}`)}&body=${encodeURIComponent(`Name: ${draft.name}\nReply email: ${draft.email}\n\n${draft.message}`)}` : '';
  return <Page title="Contact and feedback" intro="Find support details or prepare a message. No message is sent until you choose to send it in your email app.">
    <div className="site-contact-grid"><section className="ui-card site-prose"><h2>Contact details</h2><p>Project area: Greater Noida</p><p><a href="tel:+919696202329"><Phone size={18} aria-hidden="true" /> +91 9696202329</a></p><p><a href={`mailto:${contactEmail}`}><Mail size={18} aria-hidden="true" /> {contactEmail}</a></p><p className="ui-unavailable-note">Public support contacts confirmed by the project team. Support hours and response times have not been published.</p><a href={routeHref('#help')}>Read Help and FAQ</a></section>
      <form className="ui-card site-feedback-form" onSubmit={prepare} onChange={() => setDraft(null)}><h2>Prepare feedback</h2><FormField label="Your name" name="name" autoComplete="name" maxLength={100} required /><FormField label="Reply email" name="email" type="email" autoComplete="email" required maxLength={254} /><FormField label="Topic" name="topic" as={Select} defaultValue="Website feedback"><option>Website feedback</option><option>Pickup question</option><option>Accessibility issue</option><option>Data or privacy question</option></FormField><FormField label="Your message" name="message" as={Textarea} required maxLength={1500} hint="Do not include passwords, payment details or sensitive documents." /><Button type="submit">Prepare email</Button>{draft && <><FormMessage tone="info">Your email draft is ready. It has not been sent or stored by this form. Review it in your email app before sending.</FormMessage><Button as="a" variant="secondary" href={mailLink}>Open email draft</Button></>}</form></div>
  </Page>;
}

export function PolicyPage({ kind }) {
  const titles = { privacy: 'Privacy information', terms: 'Use and service information', copyright: 'Copyright and credits' };
  return <Page title={titles[kind]} intro={reviewNote}>
    <FormMessage>Prepared from the current frontend on 26 October 2026. The team must confirm the public owner, service arrangements, provider handling, retention and asset permissions before treating this as an approved policy.</FormMessage>
    <article className="ui-card site-prose">
      {kind === 'privacy' && <><h2>Data used by the current website</h2><p>Account forms send entered details to the configured account service. The browser can keep profile details, language preference, local pickup details, ticket counts and impact entries in local storage. Cleanup videos and estimator images remain local in the current demo unless a service adapter is connected.</p><h2>Other services and storage</h2><p>Authentication can use a session cookie. Fonts are requested from Google Fonts. Interface translations use reviewed local resources and do not send page text or form data to a translation provider. Contact buttons open your phone or email app; an email draft is not sent automatically.</p><h2>Your practical choices</h2><p>Avoid entering sensitive information in the prototype. You can clear this site’s browser storage in your browser settings; that removes local settings and entries but does not delete data already held by a server or email provider. Ask the team about server-held records through Contact.</p><h2>Still to confirm</h2><p>The public data owner, retention/deletion process, provider arrangements and handling of real uploads have not been supplied. No specific deletion timeframe or legal compliance is claimed here.</p></>}
      {kind === 'terms' && <><h2>Prototype status</h2><p>BinZ is a student project. Local previews and sample screens are identified in the relevant flows. Saving details in your browser is not a confirmed pickup, purchase, registration or donation.</p><h2>Rates, rewards and estimates</h2><p>Prices and environmental figures can be indicative or estimated. Demo Z-Coins do not represent a verified payout. A real service must confirm material acceptance, collection, final price and any reward.</p><h2>Responsible use</h2><p>Use accurate information and only upload files you are authorised to share. Do not upload passwords, payment information or confidential records. Recycler registration previews do not constitute certification or approval.</p><h2>Still to confirm</h2><p>The team must approve final service eligibility, payment/refund arrangements, cancellations, responsibility and dispute contacts. These details are not invented by this prototype page.</p></>}
      {kind === 'copyright' && <><h2>BinZ identity</h2><p>The website uses the existing BinZ artwork supplied with the project. Its public rights holder and permission record still need team confirmation; use of the artwork here is not a new claim of ownership.</p><h2>Third-party assets</h2><p>The project uses Noto Sans fonts, Lucide icons and Chart.js, alongside repository images and a demonstration video. Library attribution should follow the licences supplied with those dependencies. Image/video sources and permissions need a complete team-maintained asset register.</p><h2>Corrections and credits</h2><p>If you identify missing attribution or a permission issue, contact the project team with the page and asset details. No government endorsement or ownership is implied by following design guidance.</p></>}
      <p><a href={routeHref('#contact')}>Ask the team about this information</a></p>
    </article>
  </Page>;
}

export function NotFoundPage() {
  return <Page title="Page not found" intro="This address does not match a BinZ page. The page may have moved, or the link may be incorrect."><div className="site-task-links"><Button as="a" href={routeHref('#home')}>Go to home</Button><Button as="a" variant="secondary" href={routeHref('#search')}>Search BinZ</Button><Button as="a" variant="secondary" href={routeHref('#sitemap')}>Browse sitemap</Button></div></Page>;
}
