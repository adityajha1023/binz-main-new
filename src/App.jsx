import React, { useCallback, useEffect, useState } from 'react';
import TopStrip from './components/TopStrip';
import Header from './components/Header';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import LearnPage from './components/LearnPage';
import ServicesPage from './components/ServicesPage';
import CertificationsPage from './components/CertificationsPage';
import DonatePage from './components/DonatePage';
import EWasteTrackerPage from './components/EWasteTrackerPage';
import EWasteEstimatorPage from './components/EWasteEstimatorPage';
import RecyclerMatchingPage from './components/RecyclerMatchingPage';
import RecyclerVerificationPage from './components/RecyclerVerificationPage';
import { OperatorPage, RecyclerPage } from './components/OperationsPages';
import ScrapCataloguePage from './components/ScrapCataloguePage';
import PriceDiscoveryPage from './components/PriceDiscoveryPage';
import PricePreview from './components/PricePreview';
import HeroSection from './components/HeroSection';
import TrustRow from './components/TrustRow';
import StatsBand from './components/StatsBand';
import ScrapSection from './components/ScrapSection';
import EWasteEstimatorCta from './components/EWasteEstimatorCta';
import EarnSection from './components/EarnSection';
import TrackerSection from './components/TrackerSection';
import LeaderboardSection from './components/LeaderboardSection';
import ServiceSection from './components/ServiceSection';
import AboutBand from './components/AboutBand';
import Footer from './components/Footer';
import ChatFab from './components/ChatFab';
import ChatDrawer from './components/ChatDrawer';
import AuthDrawer from './components/AuthDrawer';
import TicketDrawer from './components/TicketDrawer';
import Scrim from './components/Scrim';
import { apiUrl } from './api';
import { homeSections, pageFor, readRoute, routeKey } from './navigation';
import PageNavigation from './components/PageNavigation';
import { AboutPage, ContactPage, HelpPage, NotFoundPage, PolicyPage, SearchPage, SitemapPage } from './components/SitePages';

const standalonePages = new Set([
  '#signin',
  '#signup',
  '#learn',
  '#services',
  '#certifications',
  '#donate',
  '#ewaste-tracker',
  '#scrap-catalogue',
  '#prices',
  '/ewaste-estimator',
  '/recycler-matching',
  '/recycler-verification',
  '/operator',
  '/recycler',
  '#about', '#contact', '#help', '#search', '#sitemap', '#privacy', '#terms', '#copyright',
]);

const mainPageSections = homeSections;

function getCurrentPage() {
  return readRoute();
}

function App() {
  const [coins, setCoins] = useState(0);
  const [firstName, setFirstName] = useState(() => localStorage.getItem('firstName') || 'Guest');
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('impactEntries') || '[]'));
  const [tickets, setTickets] = useState(() => Number(localStorage.getItem('tickets') || 0));
  const [openDrawer, setOpenDrawer] = useState(null); // 'chatDrawer' | 'authPanel' | 'ticketPanel' | null
  const [pickupStatus, setPickupStatus] = useState({ msg: '', error: false });
  const [ticketTypePreset, setTicketTypePreset] = useState('');
  const [currentLocation, setCurrentPage] = useState(getCurrentPage);
  const currentPage = routeKey(currentLocation);

  useEffect(() => {
    if (!openDrawer) return;
    const panel = document.getElementById(openDrawer);
    if (!panel) return;
    const previousFocus = document.activeElement;
    const controls = () => [...panel.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter((element) => element.getClientRects().length);
    controls()[0]?.focus();
    function handleKey(event) {
      if (event.key === 'Escape') { setOpenDrawer(null); return; }
      if (event.key !== 'Tab') return;
      const elements = controls();
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previousFocus?.focus(); };
  }, [openDrawer]);

  const refreshCoins = useCallback(async () => {
    const email = localStorage.getItem('email');
    if (!email) {
      setCoins(0);
      return;
    }

    try {
      const response = await fetch(
        apiUrl(`/getCoins/${encodeURIComponent(email)}`),
      );
      if (!response.ok) throw new Error('Unable to load coin balance');

      const result = await response.json();
      if (typeof result.coins === 'number') setCoins(Math.max(0, result.coins));
    } catch {
      setPickupStatus((current) => ({
        msg: current.authName ? `Signed in as ${current.authName}. Your wallet balance could not be refreshed; please try again later.` : 'Unable to refresh your Z-Coins right now.',
        error: !current.authName,
        tone: current.authName ? 'info' : 'error',
        authName: current.authName,
      }));
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem('coins');

    function handleCoinsUpdated(event) {
      const next = Math.max(0, Number(event.detail?.coins));
      if (!Number.isFinite(next)) return;
      setCoins(next);
    }

    window.addEventListener('coinsUpdated', handleCoinsUpdated);
    return () => {
      window.removeEventListener('coinsUpdated', handleCoinsUpdated);
    };
  }, []);

  useEffect(() => {
    Promise.resolve()
      .then(() => fetch(apiUrl('/session'), { credentials: 'include' }))
      .then((response) => {
        if (!response.ok) throw new Error('No active session');
        return response.json();
      })
      .then((account) => {
        setFirstName(account.firstName || 'Guest');
        localStorage.setItem('firstName', account.firstName || '');
        localStorage.setItem('lastName', account.lastName || '');
        localStorage.setItem('email', account.email || '');
        localStorage.setItem('state', account.state || '');
        updateCoins(account.coins, { persist: false });
      })
      .catch(() => {
        ['firstName', 'lastName', 'email', 'state'].forEach((key) => localStorage.removeItem(key));
        setFirstName('Guest');
        updateCoins(0, { persist: false });
      });
  }, []);

  useEffect(() => {
    function handleRouteChange() {
      setCurrentPage(getCurrentPage());
      refreshCoins();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') refreshCoins();
    }

    refreshCoins();
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('focus', refreshCoins);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('focus', refreshCoins);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshCoins]);

  useEffect(() => {
    setOpenDrawer(null);
    const frame = requestAnimationFrame(() => {
      const metadata = pageFor(currentPage);
      document.title = `${metadata?.title || (currentPage === '#scrap' ? 'Featured scrap' : 'Page not found')} | BinZ`;
      const main = document.querySelector('main');
      if (main) { main.id = 'main-content'; main.tabIndex = -1; }
      if (standalonePages.has(currentPage) || !mainPageSections.has(currentPage) || currentPage === '#home') {
        if (currentPage === '#home' && new URLSearchParams(currentLocation.split('?')[1]).get('pickup') === '1') {
          const form = document.getElementById('pickupForm');
          document.getElementById('phoneInput')?.focus({ preventScroll: true });
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
          window.scrollTo({ top: Math.max(0, (form?.getBoundingClientRect().top || 0) + window.scrollY - headerHeight - 24), left: 0, behavior: 'auto' });
          return;
        }
        if (currentPage !== '#search') main?.focus({ preventScroll: true });
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        return;
      }

      if (!mainPageSections.has(currentPage)) return;

      const target = document.getElementById(currentPage.slice(1));
      if (!target) return;

      const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 18;
      window.scrollTo({ top: Math.max(0, top), left: 0, behavior: 'auto' });
    });
    return () => cancelAnimationFrame(frame);
  }, [currentPage, currentLocation]);

  function updateCoins(value, { persist = true } = {}) {
    const next = Math.max(0, Number(value));
    if (!Number.isFinite(next)) return;

    window.dispatchEvent(new CustomEvent('coinsUpdated', { detail: { coins: next } }));

    const email = localStorage.getItem('email');
    const delta = next - coins;
    if (!persist || !email || delta === 0) return;

    Promise.resolve()
      .then(() => fetch(apiUrl('/rewardCoins'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, coins: delta }),
      }))
      .then((response) => {
        if (!response.ok) throw new Error('Unable to save coin balance');
        return response.json();
      })
      .then((result) => {
        if (typeof result.coins === 'number') {
          window.dispatchEvent(new CustomEvent('coinsUpdated', {
            detail: { coins: result.coins },
          }));
        }
      })
      .catch(() => {
        setPickupStatus({
          msg: 'Coins updated on screen, but could not be saved to your account.',
          error: true,
        });
      });
  }

  function handleAuthenticated(account) {
    const accountName = account.firstName || 'Guest';
    setFirstName(accountName);
    localStorage.setItem('firstName', accountName);
    localStorage.setItem('lastName', account.lastName || '');
    localStorage.setItem('email', account.email || '');
    localStorage.setItem('state', account.state || '');
    updateCoins(account.coins, { persist: false });
    refreshCoins();
    setPickupStatus({ msg: `Signed in as ${accountName}. You can now manage your pickups and rewards.`, error: false, tone: 'success', authName: accountName });
    window.location.hash = '#home';
  }

  function handleSignOut() {
    Promise.resolve()
      .then(() => fetch(apiUrl('/logout'), {
        method: 'POST',
        credentials: 'include',
      }))
      .catch(() => {});
    ['firstName', 'lastName', 'email', 'state'].forEach((key) => localStorage.removeItem(key));
    setFirstName('Guest');
    updateCoins(0, { persist: false });
  }

  function handleOpenDrawer(id) {
    setOpenDrawer(id);
  }

  function handleCloseDrawers() {
    setOpenDrawer(null);
  }

  function handleSellEwaste(itemName) {
    setTicketTypePreset(itemName);
    setOpenDrawer('ticketPanel');
  }

  function handleSellNormal(itemName) {
    window.location.hash = '#home';
    document.getElementById('phoneInput')?.focus();
    setPickupStatus({ msg: `${itemName} selected. Add your phone number to book pickup.`, error: false });
  }

  function handleOpenSignIn() {
    window.location.hash = '#signin';
  }

  function renderDrawers() {
    return (
      <>
        <ChatFab onOpen={() => handleOpenDrawer('chatDrawer')} />

        <ChatDrawer
          isOpen={openDrawer === 'chatDrawer'}
          onClose={handleCloseDrawers}
        />
        <AuthDrawer
          isOpen={openDrawer === 'authPanel'}
          onClose={handleCloseDrawers}
          coins={coins}
          updateCoins={updateCoins}
          setFirstName={setFirstName}
        />
        <TicketDrawer
          isOpen={openDrawer === 'ticketPanel'}
          onClose={handleCloseDrawers}
          ticketTypePreset={ticketTypePreset}
          tickets={tickets}
          setTickets={setTickets}
          updateCoins={updateCoins}
          coins={coins}
          setEntries={setEntries}
          entries={entries}
        />
        <Scrim visible={openDrawer !== null} onClick={handleCloseDrawers} />
      </>
    );
  }

  function renderPage(page) {
    return (
      <>
        <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to main content</a>
        <TopStrip />
        <Header
          currentPage={currentPage}
          coins={coins}
          onOpenAccount={handleOpenSignIn}
          onOpenTicket={() => handleOpenDrawer('ticketPanel')}
          onOpenChat={() => handleOpenDrawer('chatDrawer')}
          onSignOut={handleSignOut}
          isSignedIn={firstName !== 'Guest' && Boolean(localStorage.getItem('email'))}
          impactEntries={entries}
        />
        <PageNavigation currentPage={currentPage} />
        {page}
        <Footer currentPage={currentPage} onOpenChat={() => handleOpenDrawer('chatDrawer')} />
        {renderDrawers()}
      </>
    );
  }

  if (currentPage === '#sitemap') return renderPage(<SitemapPage />);
  if (currentPage === '#search') return renderPage(<SearchPage currentPage={currentLocation} />);
  if (currentPage === '#about') return renderPage(<AboutPage />);
  if (currentPage === '#contact') return renderPage(<ContactPage />);
  if (currentPage === '#help') return renderPage(<HelpPage />);
  if (['#privacy', '#terms', '#copyright'].includes(currentPage)) return renderPage(<PolicyPage kind={currentPage.slice(1)} />);

  if (currentPage === '#signin') {
    return renderPage(<SignInPage onAuthenticated={handleAuthenticated} />);
  }

  if (currentPage === '#signup') {
    return renderPage(<SignUpPage onAuthenticated={handleAuthenticated} />);
  }

  if (currentPage === '#learn') {
    return renderPage(<LearnPage />);
  }

  if (currentPage === '#services') {
    return renderPage(<ServicesPage />);
  }

  if (currentPage === '#certifications') {
    return renderPage(<CertificationsPage />);
  }

  if (currentPage === '#donate') {
    return renderPage(<DonatePage />);
  }

  if (currentPage === '#ewaste-tracker') {
    return renderPage(<EWasteTrackerPage />);
  }

  if (currentPage === '#scrap-catalogue') {
    return renderPage(
      <ScrapCataloguePage
        onSellEwaste={handleSellEwaste}
        onSellNormal={handleSellNormal}
      />,
    );
  }

  if (currentPage === '#prices') {
    return renderPage(<PriceDiscoveryPage />);
  }

  if (currentPage === '/ewaste-estimator') {
    return renderPage(<EWasteEstimatorPage />);
  }

  if (currentPage === '/recycler-matching') {
    return renderPage(<RecyclerMatchingPage />);
  }

  if (currentPage === '/recycler-verification') {
    return renderPage(<RecyclerVerificationPage />);
  }

  if (currentPage === '/operator') {
    return renderPage(<OperatorPage />);
  }

  if (currentPage === '/recycler') {
    return renderPage(<RecyclerPage />);
  }

  if (!mainPageSections.has(currentPage)) return renderPage(<NotFoundPage />);

  return renderPage(
      <main>
        <HeroSection
          entries={entries}
          pickupStatus={pickupStatus}
          setPickupStatus={setPickupStatus}
        />
        <TrustRow />
        <StatsBand entries={entries} tickets={tickets} />
        <PricePreview />
        <ScrapSection
          onSellEwaste={handleSellEwaste}
          onSellNormal={handleSellNormal}
        />
        <EWasteEstimatorCta />
        <EarnSection coins={coins} updateCoins={updateCoins} />
        <TrackerSection
          entries={entries}
          setEntries={setEntries}
          tickets={tickets}
          updateCoins={updateCoins}
          coins={coins}
        />
        <LeaderboardSection coins={coins} firstName={firstName} />
        <ServiceSection
          onOpenTicket={() => handleOpenDrawer('ticketPanel')}
          onOpenAccount={() => handleOpenDrawer('authPanel')}
          onOpenChat={() => handleOpenDrawer('chatDrawer')}
        />
        <AboutBand />
      </main>
  );
}

export default App;
