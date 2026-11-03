/** One index for navigation, search, breadcrumbs and the human-readable sitemap. */
export const pageIndex = [
  { route: '#home', title: 'Home', group: 'Start here', description: 'Book a scrap pickup and explore BinZ.', keywords: 'booking collection phone schedule', section: true },
  { route: '#scrap-catalogue', title: 'Scrap catalogue', group: 'Recycle', description: 'Find accepted electronics, metals and appliances.', keywords: 'sell laptop phone battery iron materials' },
  { route: '#prices', title: 'Today’s scrap rates', group: 'Recycle', description: 'Compare indicative material prices and units.', keywords: 'price value kilogram metal aluminium' },
  { route: '/ewaste-estimator', title: 'Material value estimator', group: 'Recycle', description: 'Prepare an image, category and weight for an estimate.', keywords: 'image photo recovery estimate weight' },
  { route: '#earn', title: 'Cleanup proof and rewards', group: 'Recycle', description: 'Try the cleanup video and demo Z-Coin flow.', keywords: 'upload video coins points reward', section: true },
  { route: '#tracker', title: 'Impact tracker', group: 'Recycle', description: 'Record local waste entries and view estimated impact.', keywords: 'carbon co2 charts environment', section: true },
  { route: '#ewaste-tracker', title: 'E-waste tracking', group: 'Recycle', description: 'Explore the sample pickup and recycling journey.', keywords: 'ticket status tracking facility disposal report' },
  { route: '#donate', title: 'Donate items', group: 'Recycle', description: 'Prepare donation details and contact BinZ about collection.', keywords: 'books clothing furniture gift pickup' },
  { route: '/recycler-matching', title: 'Find a recycler', group: 'Recycler partners', description: 'Search available recycler matches by material and area.', keywords: 'location city pickup partner matching' },
  { route: '/recycler-verification', title: 'Recycler registration', group: 'Recycler partners', description: 'Prepare a company and certificate review preview.', keywords: 'cpcb certificate register company assured verification' },
  { route: '/operator', title: 'Operator console', group: 'Operations', description: 'Review recycler applications and coordinate pickup assignments.', keywords: 'operator applications approve assign dispatch queue' },
  { route: '/recycler', title: 'Recycler workspace', group: 'Operations', description: 'Accept pickups, update progress and upload completion evidence.', keywords: 'recycler assignment progress pickup evidence upload' },
  { route: '#services', title: 'Refurbishing and reuse', group: 'Learn', description: 'Explore the sample refurbished-device catalogue.', keywords: 'services repair buy laptop reuse second hand' },
  { route: '#learn', title: 'Know more', group: 'Learn', description: 'Learn about refurbishing, rebuilding and reusing electronics.', keywords: 'education learn circular recycling' },
  { route: '#certifications', title: 'Recycling certificates', group: 'Learn', description: 'View the project’s certificate information and sample screens.', keywords: 'certificate report evidence' },
  { route: '#leaderboard', title: 'Z-Coin leaderboard', group: 'Learn', description: 'View the rewards leaderboard and sample entries.', keywords: 'rank points coins scores', section: true },
  { route: '#service', title: 'Service hub', group: 'Support', description: 'Open an e-waste ticket, account panel or FAQ.', keywords: 'ticket help account request', section: true },
  { route: '#about', title: 'About BinZ', group: 'Support', description: 'Understand the student project, purpose and current limitations.', keywords: 'team ownership sih project' },
  { route: '#contact', title: 'Contact and feedback', group: 'Support', description: 'Find contact details or prepare feedback for your email app.', keywords: 'support phone email address message complaint' },
  { route: '#help', title: 'Help and FAQ', group: 'Support', description: 'Get answers and choose the right next step.', keywords: 'questions booking ticket demo assistance' },
  { route: '#signin', title: 'Sign in', group: 'Account', description: 'Access your BinZ account.', keywords: 'login password' },
  { route: '#signup', title: 'Create account', group: 'Account', description: 'Register for a BinZ account.', keywords: 'signup register' },
  { route: '#privacy', title: 'Privacy information', group: 'Site information', description: 'Read the current prototype data-handling summary and review status.', keywords: 'cookies storage data privacy policy' },
  { route: '#terms', title: 'Use and service information', group: 'Site information', description: 'Understand prototype limits and pending service terms.', keywords: 'terms conditions prices rewards' },
  { route: '#copyright', title: 'Copyright and credits', group: 'Site information', description: 'See the asset attribution and ownership review status.', keywords: 'licence images logo credits permissions' },
  { route: '#sitemap', title: 'Sitemap', group: 'Site information', description: 'Browse every main page and section.', keywords: 'navigation all pages directory' },
  { route: '#search', title: 'Search BinZ', group: 'Site information', description: 'Search the page directory and scrap catalogue.', keywords: 'find search' },
];

export const routeKey = (value) => (value || '#home').split('?')[0];
export const routeHref = (route) => route.startsWith('#') ? `/${route}` : route;
export const pageFor = (route) => pageIndex.find((page) => page.route === routeKey(route));
export const homeSections = new Set(pageIndex.filter((page) => page.section).map((page) => page.route));
// #scrap remains a valid legacy home-section anchor.
homeSections.add('#scrap');

export function readRoute() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const pathPage = pageIndex.find((page) => page.route === path);
  if (path !== '/' && !pathPage) return path;
  return window.location.hash || pathPage?.route || '#home';
}
