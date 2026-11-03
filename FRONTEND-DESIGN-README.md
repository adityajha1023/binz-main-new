# BinZ: frontend and design README

**Update, 25 October 2026:** shared UI component foundations have since been implemented. Read `1. Context/technical-context/shared-ui-system.md` for the latest state; older unchecked standardisation items below are the earlier planning snapshot.


Last reviewed: 25 October 2026

This is the team's frontend/design handover and working checklist for the BinZ SIH 2026 competition project. It consolidates the important requirements, decisions, implemented changes and remaining work discussed in this chat.

**Scope:** frontend, visual design, accessibility, responsive behaviour, frontend API integration and demonstration preparation. Another teammate owns backend implementation. Creating this document does not implement the remaining items.

## 1. Project context and references

- Repository: [Ahsan20059/PROJECT_BINZ](https://github.com/Ahsan20059/PROJECT_BINZ).
- Local folder: [Desktop/BinZ](C:/Users/priya/OneDrive/Desktop/BinZ).
- The repository was cloned with full Git history and 227 tracked files. The later typography and colour changes were explicitly requested; the project is no longer an unchanged clone.
- Frontend: React/Vite, with its main application in `src/`.
- Goal: a convincing, dependable and accessible competition prototype aligned with the applicable DBIM/GIGW requirements. Appearance alone does not establish conformity or competition readiness.
- Official design reference: [DBIM toolkit](https://dbimtoolkit.digifootprint.gov.in/).
- Supplied [Digital Brand Identity Manual 3.0, January 2025](C:/Users/priya/OneDrive/Desktop/405f7c961cef45c6689002aed6f8e08c.pdf): visual identity, typography, colour, icons, content, accessibility, search and performance. Relevant planning references include chapter 4 and Annexure F.
- Supplied [Guidelines for Indian Government Websites and Apps 3.0](C:/Users/priya/OneDrive/Desktop/e3fecb3f602c50bec70eedc682d9a7d0.pdf): quality, accessibility, cybersecurity and lifecycle management. Annexure II provides the conformity matrix.
- The three attached screenshots highlighted the three-click approach, responsiveness, enhanced search, visual consistency, ownership, accurate content, working navigation, useful forms and supporting information.

The toolkit's dynamically loaded chapters/assets have not all been inspected. The exact SIH problem statement and official judging requirements have not been supplied or checked. This README is not a formal conformity certificate or an official SIH scoring checklist.

## 2. Current status: completed versus outstanding

### Implemented in the local website

- [x] Load **Noto Sans**, replacing the previous mixture of Inter and serif typefaces.
- [x] Include **Noto Sans Devanagari** for Hindi/Marathi script support.
- [x] Centralise heading sizes, weights, line height and spacing; remove conflicting page-specific typography overrides.
- [x] Apply the DBIM green colour group through shared CSS variables across page surfaces, controls, accents and charts.
- [x] Replace old hard-coded frontend greens and warm decorative tints with the shared palette.
- [x] Use dark green for filled primary buttons and white for their text.
- [x] Update the impact charts to read the shared font and palette; distinguish chart series with a dashed line and doughnut segment borders.
- [x] Give the footer a **light green background and dark green text**, visibly separating it from the dark About section above it.
- [x] Adjust footer controls, Subscribe button and focus colours for the light background.
- [x] Use an opaque white header background so navigation remains readable over dark sections.
- [x] Add a shared focus-outline baseline and stronger borders for the controls changed during colour work.

These completed items describe the changes actually made. They do not mean every component, accessibility state or business journey has been completed.

### Still outstanding

- [ ] Standardise reusable buttons, cards, inputs, dropdowns and icons across the whole application.
- [ ] Finish the mobile interaction review, including navigation, sticky-header obstruction and touch usability.
- [ ] Complete navigation, search, sitemap and supporting pages.
- [ ] Make the shared footer available on applicable standalone pages.
- [ ] Complete form labels, validation and consistent feedback states.
- [ ] Replace local/demo success flows with frontend calls to the backend teammate's APIs.
- [ ] Complete the accessibility, language, performance and final demonstration checks below.

The earlier [SIH readiness checklist](C:/Users/priya/OneDrive/Desktop/BinZ/SIH-2026-READINESS-CHECKLIST.md) is a broader initial planning snapshot that includes backend work and predates the implemented typography/colour changes. Use this README for current frontend priorities.

## 3. Design decisions to preserve

### Typography

| Role | Desktop | Mobile |
| --- | --- | --- |
| H1 | 36px | 24px |
| H2 | 24px | 20px |
| H3/subtitle | 20px | 16px |
| Base body text | 16px | 14px |

- Heading weight: **600**; heading line height: **1.4**; normal letter spacing.
- Shared H1/H2/H3 bottom-spacing tokens: **24/16/12px** on desktop and **16/12/8px** on mobile, except layout-specific inline/grouped headings.
- Mobile typography currently switches at the existing **820px breakpoint**.
- Fonts loaded: weights 400, 500, 600 and 700. Use them consistently rather than adding arbitrary heavy weights.
- Continue checking left-aligned body copy, readable line lengths, text wrapping and language rendering. Loading a script font does not establish translation quality.

### DBIM green palette

| Token | Colour | Intended role |
| --- | --- | --- |
| `--brand-primary` | `#0F5757` | Dark text, primary actions, dark sections and key icons |
| `--brand-secondary` | `#2D8686` | Supporting accents, chart series and graphical details |
| `--brand-accent` | `#75BDBD` | Decorative highlights and supporting graphics |
| `--brand-soft` | `#A6D9D9` | Highlighted surfaces and panels |
| `--brand-tint` | `#D9F2F2` | Light section backgrounds and the current footer |

Functional colours are also defined: white `#FFFFFF`, linen `#EBEAEA`, text `#150202`, muted text `#606060`, borders `#C6C6C6`, success `#198754`, warning `#FFC107`, error `#DC3545`, information `#0D6EFD`.

- The official green group is more teal than the original forest-green design. That change is intentional.
- Prefer shared variables over new hard-coded colour values in components or charts.
- White on the primary green has measured contrast of **8.33:1**. White on the secondary green is about **4.32:1**, so do not use that pairing for ordinary small button text.
- Light shades are mainly surfaces, not small-text colours. Keep success/error/warning meanings understandable through text/icons as well as colour.
- The footer was first made dark during palette implementation, then changed to **light green at the user's request**. Preserve the latest light-footer decision. Record this project-specific choice if preparing a strict DBIM conformity assessment, because the manual's generic checklist specifies a dark key-colour footer.
- Retain the actual BinZ logo colours/proportions. Do not recolour the logo or imply government ownership merely to match the UI palette.

## 4. First priority: shared design components

**Meaning of standardisation:** equivalent elements should look and behave the same across pages. A primary button and a secondary button can look different, but each type should be consistent wherever it appears.

Create reusable styles/components, replace duplicated variants gradually and verify existing page behaviour after each replacement. Final geometry should be agreed once and then stored in shared tokens.

| Element | What must be standardised | Completion evidence |
| --- | --- | --- |
| Buttons | Heights, padding, radius, type weight, icon placement; primary, secondary, destructive, icon-only and disabled variants | The same action type has matching geometry and states across pages |
| Cards | Corner radius, border, shadow, internal spacing, heading placement and action alignment | Scrap, service and information cards follow shared foundations; purposeful variants are documented |
| Inputs | Visible labels, height, padding, borders, required indicators, help text, errors, disabled/read-only states | Forms remain understandable without relying on placeholders |
| Dropdowns | Match inputs; consistent arrow, spacing, selected/focus/disabled states and keyboard behaviour | Native selects and custom navigation menus are each consistent and usable |
| Icons | One outlined/filled style, consistent stroke, size, colour and text spacing | Use the toolkit where applicable; retain a documented matching fallback when an icon is unavailable |
| Feedback | Loading, empty, success, error and unavailable states | Messages accurately describe what happened and expose a clear next action |

### Component checklist

- [ ] Inventory existing button/card/form/dropdown/icon variants before replacing them.
- [ ] Define shared spacing, radii, shadows, control dimensions and icon-size tokens.
- [ ] Standardise primary and outlined secondary buttons; preserve clear action hierarchy.
- [ ] Include default, hover, focus, pressed/selected, disabled and loading states where relevant.
- [ ] Prevent repeated submissions while a request is pending; show what is happening.
- [ ] Standardise cards without forcing every content type into the same layout.
- [ ] Standardise inputs and selects, including labels, helper text and validation messages.
- [ ] Keep one icon style; review current Lucide icons against toolkit requirements rather than assuming the existing set already satisfies every DBIM clause.
- [ ] Use DBIM's 24/32/48/64px icon sizes where required; retain proportions and provide accessible names for icon-only actions.
- [ ] Check changes on every affected page and in narrow layouts.

## 5. Mobile, tablet and desktop usability

- [ ] Check all pages at 320px, typical phone/tablet sizes and desktop widths, in portrait and landscape.
- [ ] Make the mobile menu collapse/open predictably, close after navigation and avoid covering the content users need.
- [ ] Check the sticky header while scrolling, opening drawers and following anchor links. Its presence must not hide headings, fields or footer content.
- [ ] Keep buttons and controls comfortably usable by touch; allow long labels to wrap safely.
- [ ] Check stacked cards, booking controls, charts, footer columns, language selector and modal layouts.
- [ ] Avoid unnecessary horizontal scrolling, clipped content, overlapping text and hidden actions.
- [ ] Test long names, long translations, large text and empty/new-account content.
- [ ] Verify desktop/tablet/mobile navigation and browser Back/Forward, including after changing language.

Previous checks found no heading clipping or page-width overflow on 13 routes at 1440px and 390px. Those checks do **not** establish that all mobile interaction and accessibility issues are solved.

## 6. Navigation, search and page structure

- [ ] Make booking, e-waste tickets, tracking, recycler matching, prices and help reachable within three clicks from home.
- [ ] Keep navigation labels and destinations predictable and consistent.
- [ ] Fix misleading footer links: Careers, Mobile, Help/FAQ, Press and Affiliates currently need an accurate destination or removal if unavailable.
- [ ] Provide a shared header/footer on all applicable pages. The header is shared; the footer currently appears on the main page only.
- [ ] Build a site-wide search interface with loading, relevant results, no-results and failure states; coordinate indexing/results with the backend teammate.
- [ ] Remember that filtering materials is not the same as searching the whole website.
- [ ] Provide a human-readable sitemap; include documents in search/discovery where applicable.
- [ ] Give each route a meaningful page title, clear heading hierarchy and navigation context.
- [ ] Verify direct links, refresh, Back/Forward, anchor positions and unknown-route behaviour.

### Current routes to include in reviews

| Page | Route |
| --- | --- |
| Home and main sections | `/`, `#home`, `#scrap`, `#earn`, `#tracker`, `#leaderboard`, `#service`, `#about`, `#contact` |
| Sign in / sign up | `/#signin`, `/#signup` |
| Learn / services | `/#learn`, `/#services` |
| Certificates / donation | `/#certifications`, `/#donate` |
| Scrap catalogue / prices | `/#scrap-catalogue`, `/#prices` |
| E-waste tracking | `/#ewaste-tracker` |
| Material estimator | `/ewaste-estimator` |
| Recycler matching | `/recycler-matching` |
| Recycler registration | `/recycler-verification` |

## 7. Content, ownership and supporting pages

- [ ] Clearly identify BinZ's team/project ownership and SIH prototype context.
- [ ] Confirm the logo, address, phone, email, service area and any operating-hour/support claims with the team.
- [ ] Complete About, Contact, Help/FAQ and feedback information.
- [ ] Add applicable Privacy Policy, Terms and Conditions, copyright and linking information using team-approved content that matches actual behaviour.
- [ ] Describe actual cookie/local-storage/provider use. If optional tracking/personalisation is used, implement meaningful consent choices rather than a decorative banner.
- [ ] Show genuine last-reviewed/updated dates where appropriate; agree a content-review owner.
- [ ] Verify rates, units, grade/location assumptions and effective dates; reconcile catalogue and price-discovery values.
- [ ] Label sample prices, demo statistics and illustrative tracking records clearly.
- [ ] Distinguish requested, booked, assigned and completed states in plain language.
- [ ] Remove unsupported claims, placeholder contact information and promises the team cannot fulfil.
- [ ] Credit third-party data/assets and keep permission/licence evidence.
- [ ] Identify external links and make download titles, file formats, sizes and languages clear.
- [ ] Supply accessible documents or suitable HTML equivalents where applicable.

## 8. Forms and frontend API integration

The frontend should render and validate inputs, call agreed APIs and explain their results. The backend teammate owns persistence, authorisation, verification and business rules. Client-side validation is useful feedback; it does not replace server validation.

### Shared form behaviour

- [ ] Put instructions before forms and use visible, associated labels.
- [ ] Mark required fields and provide appropriate input types/autocomplete.
- [ ] Provide specific field errors and useful correction guidance.
- [ ] Display loading, success, failure, empty and unavailable states consistently.
- [ ] Preserve recoverable input after errors and prevent accidental duplicate requests.
- [ ] Show success only when the API confirms the relevant operation.
- [ ] Handle expired sessions, offline/slow connections and provider failures clearly.

### Screens requiring API coordination

| Screen/flow | Current observation | Your frontend work |
| --- | --- | --- |
| Pickup booking | Booking is saved in browser storage and shows local success | Submit to the agreed booking API; render the server reference and actual status |
| E-waste ticket drawer | Generates a local random ticket ID and demo reward message | Use the ticket API; display the returned ticket reference and truthful confirmation |
| Tracking | Shows a fixed device and timeline | Load the requested ticket and render real statuses/timestamps, with not-found/error states |
| Estimator | Contains a TODO for the estimation API | Submit agreed inputs and render estimates, units, assumptions, uncertainty and failure states |
| Recycler registration | Holds form/certificate details in page state; backend TODO | Upload/submit through the agreed API and display pending/approved/rejected status accurately |
| Recycler matching | API-backed frontend code exists, but needs end-to-end testing | Render matching criteria, results and connection responses; label seeded records honestly |
| Rewards, impact and leaderboard | Demo/local figures are mixed into presentation | Display server-supplied balances/verified events; distinguish estimates and sample totals |
| Certificates | Certificate-style page is not tied to recorded completion | Render only the status and evidence supplied for the relevant device; label sample documents |
| Donation / newsletter / feedback | Some current submissions only display local feedback or do nothing | Connect supported services; clearly mark unavailable/prototype actions |
| Accounts | Sign-in/up and session code exist | Coordinate credentials/session handling, validation, expiry, logout and permission-denied states |

### Backend handoff information to obtain

- [ ] Base URL and local/demo environments, including the agreed `VITE_API_URL` value.
- [ ] Request/response examples for each frontend action, including validation and failure responses.
- [ ] Session/credential conventions and user/role access expectations.
- [ ] Upload field names, accepted file types, limits and progress/status behaviour.
- [ ] Booking/ticket status names and allowed frontend actions for each role.
- [ ] Sources and meaning of rates, impact estimates, balances and certificate verification fields.
- [ ] Synthetic accounts/data and a repeatable reset process for frontend integration testing.

Database design, persistence, reward verification, partner approval, server access control, secure storage, notifications and server deployment remain with the backend owner. Coordinate their results; do not simulate completion silently in the frontend.

## 9. Accessibility

The goal is working access to the complete user journey, not merely adding an accessibility toolbar. Use the applicable full GIGW/WCAG checklist when claiming conformity.

- [ ] Provide semantic landmarks, sensible heading order and a skip-to-content link.
- [ ] Make every action keyboard-operable with visible focus and a logical order.
- [ ] Make dropdowns/drawers predictable; support Escape dismissal where appropriate.
- [ ] For modal drawers, move focus inside, prevent focus escaping behind the modal, restore focus on close and prevent hidden controls receiving focus.
- [ ] Use meaningful alt text for informative images and hide decorative graphics from assistive technology.
- [ ] Give icon-only controls accurate accessible names.
- [ ] Associate labels, helper text and errors with fields; announce relevant status changes.
- [ ] Check contrast: ordinary text at least 4.5:1, qualifying large text 3:1, required UI/graphical indicators 3:1, considering the standard's exceptions.
- [ ] Do not rely on colour alone for success, errors, selected states or chart distinctions.
- [ ] Support 200% text resizing, zoom, reflow and user-adjusted text spacing without lost functionality.
- [ ] Provide readable chart summaries/data alternatives; canvas labels alone are insufficient.
- [ ] Caption relevant video/audio and provide required transcripts/descriptions.
- [ ] Allow users to pause relevant moving/autoupdating content, respect reduced motion and avoid unsafe flashing.
- [ ] Test actual keyboard and screen-reader journeys, including invalid forms and error states.
- [ ] Run automated accessibility checks, then manually verify what those tools cannot establish.

## 10. Language support

- [ ] Confirm required languages with the problem statement/mentor. English, Hindi and Marathi are currently offered by the selector; the final required set remains unconfirmed.
- [ ] Use reviewed translations for critical content, navigation, forms, labels and errors.
- [ ] Cover accessible names, dynamic results and metadata as well as visible headings.
- [ ] Set page/passage language accurately and test Unicode rendering.
- [ ] Keep language versions current together; test switching before/after navigation and submission.
- [ ] Handle translation-provider/network failure and avoid making the demo depend entirely on per-text-node live translation.
- [ ] Coordinate privacy review of any content sent to external translation providers.

Noto Sans Devanagari is loaded and was checked successfully. Complete translation coverage and correctness remain separate tasks.

## 11. Performance and final quality checks

- [ ] Optimise image dimensions, compression, font delivery and video loading.
- [ ] Review DBIM asset guidance where applicable: logos under 100KB, banner/background images under 500KB, thumbnails under 100KB and high-resolution images under 5MB.
- [ ] Defer nonessential resources, reduce unnecessary code and prevent layout shifts.
- [ ] Check page loading and interaction on a mid-range phone and slower connection.
- [ ] Measure LCP, INP and CLS and record agreed targets/results.
- [ ] Check supported desktop/mobile browsers and touch interactions.
- [ ] Verify every link, button, select, filter, drawer, download and form.
- [ ] Remove unfinished controls or explicitly describe their prototype/unavailable state.
- [ ] Verify the production build separately from the development preview, including direct route refresh and asset loading.
- [ ] Add meaningful regression checks for the agreed frontend journeys and failure states when implementing them.
- [ ] Retest affected pages after shared-component changes; preserve typography and palette decisions.

### Verification already performed

- Production builds passed after the typography and palette changes.
- Browser checks covered 13 page routes at 1440px and 390px, with no heading clipping or page-width overflow detected in those checks.
- Noto Sans and Noto Sans Devanagari loaded in the browser.
- Primary-button and former dark-footer colour pairs measured 8.33:1 contrast. The footer is now light; its dark text uses the same primary green against `#D9F2F2`.
- The latest light-footer change was inspected in desktop/mobile previews and its rendered colours were checked.
- No complete accessibility audit, complete mobile usability audit, backend verification or formal conformity assessment has been completed.
- The build reports a large JavaScript chunk warning (over 500KB after minification). Performance work remains outstanding; the warning does not mean the build failed.

## 12. Competition preparation and recommended order

**Start with shared design components, mobile layouts and the main booking-to-tracking journey.**

1. Confirm the problem statement, required languages, assessment scope and deadline.
2. Standardise shared components and use them across the central pages.
3. Resolve mobile navigation/layout issues and complete frontend booking -> ticket -> tracking screens with the backend teammate's APIs.
4. Finish supporting pages, search, sitemap, truthful content and validation states.
5. Complete accessibility, language, performance and production-preview checks.
6. Rehearse a coherent demonstration and prepare backup evidence.

### Demonstration checklist

- [ ] Show a citizen journey using one persistent record: sign in -> request pickup/ticket -> see tracking -> see backend-confirmed completion/reward where supported.
- [ ] Coordinate an operator view if it is part of the assessed scope.
- [ ] Show the user benefit and how it satisfies the exact problem statement.
- [ ] Explain what is implemented, what is estimated and what is sample data.
- [ ] Gather consented user feedback and evidence of usability improvements.
- [ ] Prepare a short pitch, repeatable demo script, screenshots and a recorded fallback.
- [ ] Label recorded/sample fallback material clearly and rehearse network/API failure recovery.
- [ ] Assign demo roles and make sure another teammate can start and explain the frontend.
- [ ] Prioritise reliable required journeys before optional feature expansion.

These are team preparation recommendations. They are not verified official SIH 2026 judging rules and do not guarantee a competition outcome.

## 13. Government-specific applicability

DBIM and GIGW target government digital platforms. BinZ has been described as a team's SIH project; government ownership/authorisation has not been established.

- Keep accurate BinZ/team ownership. Do not add the State Emblem, ministry identity, official endorsement or certification claims without the appropriate basis.
- Do not automatically add minister/PM sections, government personnel directories or ministry-specific navigation to this project.
- Official domains, government social-media mandates, CCPS and integrations such as government SSO, DigiLocker, Aadhaar, MyGov or India Portal require an applicability/access decision.
- Do not claim STQC/CQW or prescribed security clearance based on visual changes or automated checks.
- Record applicable/not applicable decisions with reasons against DBIM Annexure F and GIGW Annexure II if full alignment is assessed.
- The repository contains a Flutter app, but it is outside this website-only frontend checklist unless the team expands the scope.

## 14. Open decisions and tracking

| Needed information | Why it matters |
| --- | --- |
| SIH problem-statement ID/title and authoritative brief | Determines required outcomes and feature priority |
| Final deadline and team/frontend ownership | Enables realistic scheduling and review |
| Required languages | Determines translation and testing scope |
| Exact DBIM/GIGW expectations | Distinguishes design alignment from full formal assessment |
| Supported API contract and demo environment | Makes frontend integration repeatable |
| Approved ownership/contact/policy/partner information | Prevents misleading public content |

Use this simple log for remaining work:

| Task | Owner | Priority | Status | Acceptance evidence |
| --- | --- | --- | --- | --- |
| Shared components | To assign | First | Not implemented as a complete system | Consistent variants and states across pages |
| Mobile navigation and layouts | To assign | First | Review required | Phone/tablet walkthrough, including scroll/menus |
| Booking-to-tracking integration | Frontend + backend teammate | First | Coordination required | One server-confirmed record through the journey |
| Accessibility and supporting pages | To assign | Next | Incomplete | Route/state checks and manual evidence |
| Performance and demo preparation | To assign | Before final demo | Incomplete | Production preview, measurements and rehearsal |

## 15. Local preview and relevant files

Open [the local website](http://127.0.0.1:5173/) while its development server is running. The footer is at [Contact](http://127.0.0.1:5173/#contact). These links work on the computer running the server; they are not a public deployment.

If the server is stopped, run from the project folder:

```powershell
Set-Location 'C:\Users\priya\OneDrive\Desktop\BinZ'
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

If dependencies are missing, install from the lockfile first with `npm.cmd ci`. The package manifest declares Node.js 20.19 or newer. A frontend preview alone does not start/configure the backend or establish that real submissions work.

| File | Purpose |
| --- | --- |
| [src/styles.css](C:/Users/priya/OneDrive/Desktop/BinZ/src/styles.css) | Shared typography, palette, layouts and component styling |
| [index.html](C:/Users/priya/OneDrive/Desktop/BinZ/index.html) | Font loading and base document |
| [src/App.jsx](C:/Users/priya/OneDrive/Desktop/BinZ/src/App.jsx) | Routes, shared shell and frontend state |
| [src/components/Header.jsx](C:/Users/priya/OneDrive/Desktop/BinZ/src/components/Header.jsx) | Navigation/header |
| [src/components/Footer.jsx](C:/Users/priya/OneDrive/Desktop/BinZ/src/components/Footer.jsx) | Footer links, newsletter and language selector |
| [src/components/HeroSection.jsx](C:/Users/priya/OneDrive/Desktop/BinZ/src/components/HeroSection.jsx) | Pickup booking interface |
| [src/components/TicketDrawer.jsx](C:/Users/priya/OneDrive/Desktop/BinZ/src/components/TicketDrawer.jsx) | E-waste ticket form |
| [src/components/TrackerSection.jsx](C:/Users/priya/OneDrive/Desktop/BinZ/src/components/TrackerSection.jsx) | Tracking/impact interface and charts |
| [src/components/SiteTranslation.jsx](C:/Users/priya/OneDrive/Desktop/BinZ/src/components/SiteTranslation.jsx) | Current runtime translation mechanism |
| [src/api.js](C:/Users/priya/OneDrive/Desktop/BinZ/src/api.js) | Frontend API base URL configuration |
| [README.md](C:/Users/priya/OneDrive/Desktop/BinZ/README.md) | Original repository documentation, preserved |

When making the remaining changes, keep scope explicit, preserve existing work, and record what changed, why, and how it was checked. Do not mark a complete frontend/backend flow done just because its screen exists.
