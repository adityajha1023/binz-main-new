import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  ClipboardCheck,
  ChevronDown,
  Gift,
  Layers,
  Laptop,
  LogIn,
  LogOut,
  MailCheck,
  Menu,
  MessageCircle,
  Leaf,
  Recycle,
  Share2,
  ShoppingBag,
  Sprout,
  TreePine,
  UserRound,
} from 'lucide-react';
import { demoImpactStats } from '../data';
import { Button } from './ui';
import BrandLogo from './BrandLogo';
import { routeHref } from '../navigation';

export default function Header({
  currentPage = '',
  coins,
  onOpenAccount,
  onOpenTicket,
  onOpenChat,
  onSignOut,
  isSignedIn,
  impactEntries = [],
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [impactOpen, setImpactOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const headerRef = useRef(null);
  const toggleRef = useRef(null);
  const profileRef = useRef(null);
  const route = currentPage || '#home';
  const current = (href) => route === href ? (['#home', '#earn', '#about', '#service', '#tracker'].includes(href) ? 'location' : 'page') : undefined;
  const impactCurrent = ['#certifications', '#services', '#learn', '#tracker'].includes(route);
  const serviceCurrent = ['#service', '#help', '#search', '#ewaste-tracker', '/ewaste-estimator', '/recycler-matching', '/recycler-verification', '/operator', '/recycler'].includes(route);

  useEffect(() => {
    setNavOpen(false);
    setImpactOpen(false);
    setServiceOpen(false);
    setProfileOpen(false);
  }, [currentPage]);

  useEffect(() => {
    const layout = window.matchMedia('(max-width: 1120px)');
    function closeMenus() { setNavOpen(false); setImpactOpen(false); setServiceOpen(false); setProfileOpen(false); }
    function outside(event) { if (!headerRef.current?.contains(event.target)) closeMenus(); }
    layout.addEventListener('change', closeMenus);
    document.addEventListener('pointerdown', outside);
    return () => { layout.removeEventListener('change', closeMenus); document.removeEventListener('pointerdown', outside); };
  }, []);

  function handleHeaderKey(event) {
    if (event.key !== 'Escape') return;
    if (profileOpen) { event.preventDefault(); setProfileOpen(false); profileRef.current?.focus(); }
    else if (navOpen) { event.preventDefault(); handleNavLinkClick(); toggleRef.current?.focus(); }
  }

  const impact = useMemo(() => {
    const totals = impactEntries.reduce((current, entry) => ({
      solid: current.solid + Number(entry?.solid || 0),
      ewaste: current.ewaste + Number(entry?.ewaste || 0),
    }), { solid: 0, ewaste: 0 });
    const co2 = demoImpactStats.co2Reduced + totals.solid * 0.9 + totals.ewaste * 2.6;

    return {
      co2: co2.toFixed(1),
      waste: (demoImpactStats.solidWaste + demoImpactStats.ewaste + totals.solid + totals.ewaste).toFixed(1),
      coins: Math.round(co2 * 10),
      trees: (co2 / 1000).toFixed(2),
    };
  }, [impactEntries]);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleNavToggle() {
    setNavOpen((prev) => !prev);
    setImpactOpen(false);
    setServiceOpen(false);
  }

  function handleNavLinkClick() {
    setNavOpen(false);
    setImpactOpen(false);
    setServiceOpen(false);
    setProfileOpen(false);
  }

  function handleMenuAction(action) {
    handleNavLinkClick();
    action?.();
  }

  function closeImpactMenu() {
    setImpactOpen(false);
  }

  function closeServiceMenu() {
    setServiceOpen(false);
  }

  function handleDropdownKey(event, setOpen) {
    const container = event.currentTarget;
    const trigger = container.querySelector('[aria-controls]');
    const items = [...container.querySelectorAll('[role="menuitem"]')];
    if (event.key === 'Escape') {
      if (!container.classList.contains('open')) return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger?.focus();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    if (!items.length) return;
    event.preventDefault();
    setOpen(true);
    const index = items.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
      : event.key === 'ArrowDown' ? (index + 1) % items.length
      : index <= 0 ? items.length - 1 : index - 1;
    requestAnimationFrame(() => items[next]?.focus());
  }

  function handleImpactBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      closeImpactMenu();
    }
  }

  function handleServiceBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      closeServiceMenu();
    }
  }

  function handleImpactToggle(event) {
    event.preventDefault();
    setImpactOpen(!impactOpen);
    setServiceOpen(false);
  }

  function handleServiceToggle(event) {
    event.preventDefault();
    setServiceOpen(!serviceOpen);
    setImpactOpen(false);
  }

  const shareCopy = `I have helped BinZ divert ${impact.waste} kg of waste and save ${impact.co2} kg of carbon (CO₂) with BinZ. That earns ${impact.coins.toLocaleString()} Z‑Coins at 10 Z‑Coins per kg CO₂. 🌱`;

  async function shareImpact(destination) {
    const pageUrl = window.location.origin;
    const message = `${shareCopy} ${pageUrl}`;

    if (destination === 'native') {
      if (navigator.share) {
        try {
          await navigator.share({ title: 'My BinZ impact', text: shareCopy, url: pageUrl });
          setShareFeedback('Impact shared');
        } catch {
          setShareFeedback('');
        }
        return;
      }

      try {
        await navigator.clipboard.writeText(message);
        setShareFeedback('Impact details copied to share anywhere');
      } catch {
        setShareFeedback('Choose X, Instagram, or WhatsApp below');
      }
      return;
    }

    if (destination === 'instagram') {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      try {
        await navigator.clipboard.writeText(message);
        setShareFeedback('Caption copied — paste it into Instagram');
      } catch {
        setShareFeedback('Copy the impact details to share on Instagram');
      }
      return;
    }

    const shareUrl = destination === 'x'
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <header ref={headerRef} className={`site-header${isScrolled ? ' scrolled' : ''}`} onKeyDown={handleHeaderKey} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) handleNavLinkClick();
    }}>
      <BrandLogo onClick={handleNavLinkClick} />
      <button
        ref={toggleRef}
        className="menu-toggle"
        type="button"
        aria-expanded={navOpen}
        aria-controls="primary-nav"
        aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
        onClick={handleNavToggle}
      >
        <Menu size={22} />
      </button>
      <nav
        id="primary-nav"
        className={`primary-nav${navOpen ? ' open' : ''}`}
        aria-label="Primary navigation"
      >
        <a className="primary-link" href={routeHref('#home')} aria-current={current('#home')} onClick={handleNavLinkClick}>Home</a>
        <a className="primary-link" href={routeHref('#scrap-catalogue')} aria-current={current('#scrap-catalogue') || (route === '#scrap' ? 'location' : undefined)} onClick={handleNavLinkClick}>Scrap</a>
        <a className="primary-link" href={routeHref('#prices')} aria-current={current('#prices')} onClick={handleNavLinkClick}>Today’s rates</a>
        <a className="primary-link" href={routeHref('#earn')} aria-current={current('#earn')} onClick={handleNavLinkClick}>Earn Coins</a>
        <a className="primary-link donate-link" href={routeHref('#donate')} aria-current={current('#donate')} onClick={handleNavLinkClick}>
          <Gift size={14} aria-hidden="true" /> Donate
        </a>
        <div
          className={`nav-menu impact-menu${impactOpen ? ' open' : ''}${impactCurrent ? ' is-current' : ''}`}
          onKeyDown={(event) => handleDropdownKey(event, setImpactOpen)}
          onBlur={handleImpactBlur}
        >
          <button
            className="primary-link impact-link"
            type="button"
            aria-haspopup="menu"
            aria-expanded={impactOpen}
            aria-controls="impact-dropdown"
            onClick={handleImpactToggle}
          >
            Impact <ChevronDown size={15} aria-hidden="true" />
          </button>
          <div className="impact-dropdown" id="impact-dropdown" role="menu" inert={!impactOpen}>
            <a href={routeHref('#certifications')} aria-current={current('#certifications')} role="menuitem" onClick={handleNavLinkClick}>
              <span className="impact-icon"><Award size={15} /></span>
              <span className="impact-item-title">Certifications</span>
            </a>
            <a href={routeHref('#services')} aria-current={current('#services')} role="menuitem" onClick={handleNavLinkClick}>
              <span className="impact-icon"><Layers size={15} /></span>
              <span className="impact-item-title">Other services</span>
            </a>
            <a href={routeHref('#learn')} aria-current={current('#learn')} role="menuitem" onClick={handleNavLinkClick}>
              <span className="impact-icon"><Sprout size={15} /></span> 
              <span className="impact-item-title">Know more</span>
            </a>
          </div>
        </div>
        <div
          className={`nav-menu service-menu${serviceOpen ? ' open' : ''}${serviceCurrent ? ' is-current' : ''}`}
          onKeyDown={(event) => handleDropdownKey(event, setServiceOpen)}
          onBlur={handleServiceBlur}
        >
          <button
            className="primary-link impact-link"
            type="button"
            aria-haspopup="menu"
            aria-expanded={serviceOpen}
            aria-controls="service-dropdown"
            onClick={handleServiceToggle}
          >
            Service <ChevronDown size={15} aria-hidden="true" />
          </button>
          <div className="impact-dropdown service-dropdown" id="service-dropdown" role="menu" inert={!serviceOpen}>
            <a href={routeHref('#prices')} aria-current={current('#prices')} role="menuitem" onClick={handleNavLinkClick}>
              <span className="impact-icon"><ShoppingBag size={15} /></span>
              <span className="impact-item-title">Live material rates</span>
            </a>
            <a href={routeHref('#scrap-catalogue')} aria-current={current('#scrap-catalogue')} role="menuitem" onClick={handleNavLinkClick}>
              <span className="impact-icon"><ShoppingBag size={15} /></span>
              <span className="impact-item-title">Scrap catalogue</span>
            </a>
            <button type="button" role="menuitem" onClick={() => handleMenuAction(onOpenTicket)}>
              <span className="impact-icon"><MailCheck size={15} /></span>
              <span className="impact-item-title">E-waste ticket</span>
            </button>
            <a href={routeHref('#ewaste-tracker')} aria-current={current('#ewaste-tracker')} role="menuitem" onClick={handleNavLinkClick}>
              <span className="impact-icon"><Laptop size={15} /></span>
              <span className="impact-item-title">Track e-waste</span>
            </a>
            <a href="/operator" aria-current={currentPage === '/operator' ? 'page' : undefined} role="menuitem" onClick={handleNavLinkClick}>
              <span className="impact-icon"><ClipboardCheck size={15} /></span>
              <span className="impact-item-title">Operator console</span>
            </a>
            <a href="/recycler" aria-current={currentPage === '/recycler' ? 'page' : undefined} role="menuitem" onClick={handleNavLinkClick}>
              <span className="impact-icon"><Recycle size={15} /></span>
              <span className="impact-item-title">Recycler workspace</span>
            </a>
          </div>
        </div>
        <Button className="mobile-account-action" variant="secondary" onClick={() => handleMenuAction(isSignedIn ? onSignOut : onOpenAccount)}>
          {isSignedIn ? <LogOut aria-hidden="true" /> : <LogIn aria-hidden="true" />}
          {isSignedIn ? 'Sign out' : 'Sign in'}
        </Button>
      </nav>
      <div className="wallet">
        <span id="coinBalance">{coins}</span>
        <span>Z-Coins</span>
      </div>
      <div className="account-actions">
        {isSignedIn && (
          <div className={`profile-impact${profileOpen ? ' is-open' : ''}`} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setProfileOpen(false); }}>
            <button
              ref={profileRef}
              className="profile-placeholder"
              type="button"
              aria-label="Profile and environmental impact"
              aria-expanded={profileOpen}
              aria-controls="profile-impact-card"
              onClick={() => { setProfileOpen(!profileOpen); setImpactOpen(false); setServiceOpen(false); }}
              title="View your environmental impact"
            >
              <UserRound size={25} strokeWidth={2.2} aria-hidden="true" />
            </button>
            <aside id="profile-impact-card" className="profile-impact-card" aria-label="Your environmental impact" inert={!profileOpen}>
              <div className="impact-card-hero">
                <div className="impact-tree-art" aria-hidden="true">
                  <Leaf size={42} />
                  <Recycle size={17} />
                </div>
                <div>
                  <p>Your total impact</p>
                  <strong>{impact.co2} kg CO₂</strong>
                  <span>carbon saved</span>
                </div>
              </div>
              <div className="impact-card-stats">
                <span><Recycle size={16} aria-hidden="true" /><strong>{impact.waste} kg</strong> waste diverted</span>
                <span><TreePine size={16} aria-hidden="true" /><strong>{impact.trees} trees</strong> equivalent (1 per tonne CO₂)</span>
              </div>
              <div className="impact-share-row" aria-label="Share your impact">
                <button type="button" onClick={() => shareImpact('native')} aria-label="Share your impact">
                  <Share2 size={16} aria-hidden="true" /> Share
                </button>
                <button type="button" onClick={() => shareImpact('x')} aria-label="Share on X">𝕏</button>
                <button type="button" onClick={() => shareImpact('instagram')} aria-label="Share on Instagram" className="instagram-share">◎</button>
                <button type="button" onClick={() => shareImpact('whatsapp')} aria-label="Share on WhatsApp"><MessageCircle size={16} aria-hidden="true" /></button>
              </div>
              {shareFeedback && <span className="impact-share-feedback" role="status">{shareFeedback}</span>}
            </aside>
          </div>
        )}
        <button
          className="icon-button"
          id="accountButton"
          type="button"
          aria-label={isSignedIn ? 'Sign out' : 'Sign in'}
          onClick={isSignedIn ? onSignOut : onOpenAccount}
        >
          {isSignedIn ? <LogOut size={18} /> : <LogIn size={18} />}
          <span>{isSignedIn ? 'Sign out' : 'Sign in'}</span>
        </button>
      </div>
    </header>
  );
}
