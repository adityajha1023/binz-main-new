import { Button, Select, FormField, FormMessage } from './ui';
import { useSubmission } from '../hooks/useSubmission';
import React, { useState } from 'react';
import BrandLogo from './BrandLogo';
import { Globe, ChevronDown } from 'lucide-react';
import { routeHref } from '../navigation';

export default function Footer({ subscribe, currentPage, onOpenChat }) {
  const { pending, feedback, run, clear, setFeedback } = useSubmission();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('binz_language') || 'English';
  });

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    try {
      localStorage.setItem('binz_language', newLang);
      setLanguage(newLang);
      window.dispatchEvent(new CustomEvent('binz-language-change', { detail: newLang }));
    } catch { setFeedback({ tone: 'error', message: 'Could not save your language preference. Please try again.' }); }
  };

  function handleSubscribe(event) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email');
    run({
      pendingMessage: 'Checking subscription…',
      operation: async (signal) => subscribe?.({ email }, { signal }),
      successTone: subscribe ? 'success' : 'info',
      successMessage: subscribe ? 'Subscription request received.' : 'Community subscriptions are not available yet. Your email has not been sent or saved.',
    });
  }

  return (
    <footer id="site-footer" className="site-footer">
      <div className="footer-brand">
        <BrandLogo variant="footer" />
        <p>Address: Greater Noida</p>
        <p className="footer-contact-details"><a href="tel:+919696202329">+91 9696202329</a><br /><a href="mailto:cloudynx.tech@gmail.com">cloudynx.tech@gmail.com</a></p>
      </div>
      <div>
        <h3>Company</h3>
        <a href={routeHref('#about')} aria-current={currentPage === '#about' ? 'page' : undefined}>About</a>
        <a href={routeHref('#learn')} aria-current={currentPage === '#learn' ? 'page' : undefined}>Know more</a>
        <a href={routeHref('#services')} aria-current={currentPage === '#services' ? 'page' : undefined}>Services</a>
      </div>
      <div>
        <h3>Contact</h3>
        <button className="footer-text-action" type="button" onClick={onOpenChat}>Help/FAQ</button>
        <a href={routeHref('#contact')} aria-current={currentPage === '#contact' ? 'page' : undefined}>Contact and feedback</a>
        <a href={routeHref('#help')} aria-current={currentPage === '#help' ? 'page' : undefined}>Help centre</a>
        <a href="/recycler-matching" aria-current={currentPage === '/recycler-matching' ? 'page' : undefined}>Find a recycler</a>
        <a href={routeHref('#ewaste-tracker')} aria-current={currentPage === '#ewaste-tracker' ? 'page' : undefined}>Track e-waste</a>
      </div>
      <div className="footer-updates-col">
        <form className="newsletter" onSubmit={handleSubscribe} aria-busy={pending}>
          <h3>Community updates</h3>
          <div>
            <FormField label="Email address" name="email" id="newsletterEmail" type="email" placeholder="you@example.com" autoComplete="email" required disabled={pending} onChange={clear} />
            <Button type="submit" className="button primary" loading={pending} loadingLabel="Subscribing…">Subscribe</Button>
          </div>
          <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
        </form>
        <div className="footer-lang-picker">
          <label htmlFor="footer-lang-select" className="footer-lang-label">
            <Globe size={14} className="footer-lang-icon" />
            <span>Language</span>
          </label>
          <div className="footer-lang-select-box">
            <Select
              id="footer-lang-select"
              value={language}
              onChange={handleLanguageChange}
              className="footer-lang-dropdown"
              aria-label="Change language"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Marathi">Marathi (मराठी)</option>
            </Select>
            <ChevronDown size={14} className="footer-lang-arrow" />
          </div>
        </div>
      </div>
      <nav className="footer-site-links" aria-label="Site information">
        {[['#search', 'Search'], ['#sitemap', 'Sitemap'], ['#privacy', 'Privacy information'], ['#terms', 'Use and service information'], ['#copyright', 'Copyright and credits']].map(([route, label]) => <a key={route} href={routeHref(route)} aria-current={currentPage === route ? 'page' : undefined}>{label}</a>)}
      </nav>
    </footer>
  );
}
