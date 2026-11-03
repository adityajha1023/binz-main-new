# BinZ: SIH 2026 readiness checklist

Prepared: 25 October 2026

Purpose: turn the supplied DBIM/GIGW guidance into a practical implementation and demonstration plan for the team's competition project.

This document is a planning checklist. Creating it does not start website implementation. Findings below come from reading the current source code; the running website, deployed backend, database, accessibility and performance have not been tested for this checklist. No item is marked complete merely because code or a screen exists.

## How to use this checklist

- **P0:** resolve before using the project for a convincing end-to-end demonstration or accepting real user data.
- **P1:** complete for the agreed DBIM/GIGW alignment and a polished final presentation.
- **P2:** optional enhancement after the core journey is dependable, unless the problem statement makes it essential.
- Tick an item only after its acceptance condition is demonstrated. Record an owner and evidence in the completion log.
- **Present, unverified** means implementation exists in source but has not passed live testing. **Partial** means some parts exist. **Gap** means the reviewed code shows missing or disconnected behaviour. **Decision needed** means the team must confirm scope or applicability.
- This is a project-specific checklist, not a complete clause-by-clause conformity assessment or a statement of SIH's official judging criteria. Keep a separate applicability decision for each requirement in DBIM Annexure F and GIGW Annexure II before claiming full conformity.

## 1. Current source-code snapshot

| Area | Initial status | Evidence and practical implication |
| --- | --- | --- |
| Frontend foundation | Present, unverified | React/Vite, shared header, catalogue, prices, estimator, recycler matching, tracking and account screens exist. Inspect every route on desktop and mobile. |
| Responsive styling | Present, unverified | `src/styles.css` contains breakpoints at 1120px and 820px; this does not establish that every screen works on mobile. |
| DBIM design tokens | Partial | Colours are centralised, but current green tokens differ from DBIM's prescribed green group. Fonts include Inter, Fraunces and Instrument Serif rather than DBIM's Noto Sans. |
| Shared page structure | Partial | `App.jsx` renders the shared header on standalone pages; the shared footer is currently rendered only on the main page. |
| Pickup booking | Gap | `HeroSection.jsx` saves a booking in `localStorage` and displays success. It does not submit that booking to a backend. |
| E-waste ticket submission | Gap | `TicketDrawer.jsx` generates a random ticket ID locally and changes the demo wallet. Backend `/submit-ticket` exists but this drawer does not call it. |
| E-waste tracking | Gap | `TrackerSection.jsx` displays a fixed device, ID, status and timeline. Backend ticket/tracking routes exist separately. |
| Estimation | Gap | `EWasteEstimatorPage.jsx` explicitly has a TODO for its estimation API and leaves the result empty. |
| Recycler registration | Gap | `RecyclerVerificationPage.jsx` explicitly has a TODO for backend registration; uploaded certificate and form details are held in page state. |
| Recycler matching | Present, unverified | API-backed matching/connection code exists. The backend also contains seeded recycler records with example contact addresses; do not treat these as independently verified partners. |
| Rates and impact figures | Partial/demo | `priceService.js` returns hard-coded indicative prices. `data.js` contains demo impact totals and entries; the interface combines demo totals with local entries. |
| Data-erasure certificate | Gap | `CertificationsPage.jsx` displays a certificate-style document, fixed verification text and today's date without loading a completed, device-specific erasure record. |
| Accounts and sessions | Present, unverified | Backend includes password hashing, signed sessions and protected routes. Cross-origin browser sessions and account isolation still need testing. |
| Rewards and uploads | Needs correction/review | Legacy `/rewardCoins` accepts an email and client-supplied coin amount without session middleware. `/uploadVideo` requires a session but awards coins on receipt of a file, without demonstrated recycling verification. This is a static observation, not a completed security assessment. |
| Secondary submissions | Gap | Donation displays a confirmation without persistence; newsletter submission only prevents default browser behaviour. |
| Language support | Partial | English/Hindi/Marathi selector and external runtime translation exist. Reviewed translations, full label/error coverage and network-independent behaviour are not established. |
| Help and footer links | Partial | About/contact content and FAQ panel exist. Several footer labels lead to unrelated sections; dedicated policy pages and a site-wide search/sitemap were not found in reviewed routes. |
| Automated verification | Not established | Root scripts provide development/build/preview; no automated test script is declared. No tests or build were run as part of this planning task. |

## 2. Competition scope and requirement traceability

- [ ] **S01 / P0 / Decision needed:** record the exact SIH problem-statement ID, title, sponsoring organisation and supplied acceptance criteria. Save the authoritative brief and any mentor instructions.
- [ ] **S02 / P0:** map every required outcome to a BinZ user journey, implementation location and demonstration. Distinguish required outcomes from team-added features.
- [ ] **S03 / P0:** agree the primary users and roles: citizen, recycler/operator and administrator. Document who can create, view and update each type of record.
- [ ] **S04 / P0:** agree the minimum complete demo: account -> pickup/ticket -> partner assignment -> status updates -> completion evidence -> verified reward/impact.
- [ ] **S05 / P1 / Decision needed:** confirm whether assessment requires exact DBIM design specifications, broader alignment, bilingual content, formal certification or any combination. Do not assume a competition prototype needs every government-only integration.
- [ ] **S06 / P1:** create a clause-level applicability matrix using DBIM Annexure F and GIGW Annexure II. For each clause record applicable/not applicable, reason, owner, evidence and verification status. Get mentor clarification for disputed items.

## 3. P0: make the central journey real

- [ ] **F01 / P0:** connect pickup booking to a persistent backend record. Success must include a server-issued reference; refresh and a second authorised session must show the same booking.
- [ ] **F02 / P0:** connect the e-waste drawer to authenticated ticket creation. Failed requests must not create local success messages, ticket counters or rewards.
- [ ] **F03 / P0:** load tracking by actual ticket ID and authorised access. Show real event timestamps and a clear response for missing or inaccessible tickets.
- [ ] **F04 / P0:** provide a usable operator/admin workflow for assignment and valid status transitions. Record actor, time and evidence; citizens must not be able to mark their own waste recycled.
- [ ] **F05 / P0:** persist recycler applications and certificates, with pending/approved/rejected states. An uploaded document alone must not automatically make a partner verified.
- [ ] **F06 / P0:** make matching use explicit service area, accepted material and pickup availability. Display why each match qualifies; distinguish seeded demo records from real partners.
- [ ] **F07 / P0:** implement estimation or explicitly mark it as unavailable/prototype. State whether estimates use rules or a model; show units, assumptions, uncertainty and a manual correction path.
- [ ] **F08 / P0:** award Z-Coins only for server-verified eligible events, with an immutable event reference and duplicate prevention. Editing the browser or resubmitting the same proof must not mint extra coins.
- [ ] **F09 / P0:** connect dashboard, balances and leaderboard to the same verified records. Never present seeded totals as a user's own or the project's measured impact.
- [ ] **F10 / P0:** define and document the impact calculation, units, source factors and assumptions. Separate estimated avoided emissions from independently measured results.
- [ ] **F11 / P0:** issue completion/erasure certificates only from a recorded completed process. Include unique reference, device linkage, issuer, date, evidence and verification status; visibly label sample certificates.
- [ ] **F12 / P0:** ensure every visible submit action either saves a real request or clearly explains prototype status. Include donation, newsletter and feedback; remove unsupported promises of callbacks or confirmed pickups.
- [ ] **F13 / P0:** configure frontend API URL, backend, database and required external providers. Verify health, sessions and the complete core journey in the intended demo environment.
- [ ] **F14 / P0:** handle failures truthfully: database unavailable, expired login, duplicate click, failed upload and notification failure. Preserve recoverable input and never show an unearned success state.

## 4. P1: DBIM visual identity

Source: DBIM chapters 2-6 and Annexure F.1. Exact implementation depends on the agreed applicability matrix.

- [ ] **D01 / P1:** select one primary colour group. If using DBIM green, its variants are `#0F5757`, `#2D8686`, `#75BDBD`, `#A6D9D9`, `#D9F2F2`; map them to shared tokens rather than scattered values.
- [ ] **D02 / P1:** use the prescribed functional palette for text, backgrounds and feedback states. Verify actual contrast; palette selection alone does not guarantee accessible combinations.
- [ ] **D03 / P1:** use Noto Sans and DBIM type scales/weights where required. Use readable line spacing and left-aligned body copy; avoid long all-capital passages.
- [ ] **D04 / P1:** standardise buttons, links, cards, forms, spacing, borders and layout widths. Include visible hover, focus, active, disabled, loading, error and success states.
- [ ] **D05 / P1:** use one icon style. Prefer toolkit icons where applicable; use a matching fallback where unavailable. Apply prescribed sizes of 24, 32, 48 and 64px where required, without distortion.
- [ ] **D06 / P1:** retain the BinZ logo's proportions, clear space and useful alternative text. Ensure appropriate light/dark versions and consistent favicon/brand use.
- [ ] **D07 / P1:** provide a consistent header, navigation and footer on every applicable page, including standalone routes. Apply the selected group's key/darkest shade to the footer where required.
- [ ] **D08 / P1:** optimise assets against DBIM limits: logos under 100KB; banner/background images under 500KB; thumbnails under 100KB; high-resolution images under 5MB. Check format, permissions and readability.
- [ ] **D09 / P1:** keep imagery relevant to actual services and explain illustrations/sample images. Do not imply an unverified facility, partnership, certification or endorsement.

## 5. P1: information architecture, search and content quality

Source: DBIM chapters 7 and 9, Annexures A/B; GIGW quality and lifecycle guidance.

- [ ] **Q01 / P1:** organise navigation around user tasks. Demonstrate reaching booking, ticket tracking, recycler matching, prices and help within three clicks from home.
- [ ] **Q02 / P1:** implement working site-wide search with relevant results and useful empty/error states. Material filtering is helpful but does not replace site-wide search.
- [ ] **Q03 / P1:** include relevant pages and downloadable content in search; index document text and image metadata where applicable. Show clear result labels and destinations.
- [ ] **Q04 / P1:** provide a human-readable sitemap, clear page titles, meaningful headings, route metadata and navigation context. Test direct links, refresh, Back/Forward and unknown URLs.
- [ ] **Q05 / P1:** identify the team/project owner and SIH prototype context accurately. Confirm contact details, service area, operating hours and escalation/feedback ownership.
- [ ] **Q06 / P1:** provide complete About, Contact, Help/FAQ and feedback routes. Replace unrelated footer destinations with accurate links; provide response expectations the team can fulfil.
- [ ] **Q07 / P1:** publish applicable privacy, terms, copyright and linking information based on actual behaviour. Include cookies/storage, providers, retention and deletion/contact routes.
- [ ] **Q08 / P1:** obtain appropriate consent for optional analytics, personalisation and third-party tracking if used. Offer meaningful choices; do not add a decorative banner without controlling those technologies.
- [ ] **Q09 / P1:** display accurate last-reviewed/updated dates where appropriate. Define who reviews rates, partners, contact details and explanatory content, and how stale content is archived.
- [ ] **Q10 / P1:** establish one source for scrap rates with material/grade, unit, location, source and effective date. Reconcile catalogue and discovery prices; clearly identify indicative values.
- [ ] **Q11 / P1:** review grammar, terminology, currency/date formats and instructions. Distinguish booked/requested/assigned/completed states and avoid misleading certainty.
- [ ] **Q12 / P1:** credit third-party data and assets and record permission/licence evidence. Clearly identify external destinations and validate links periodically.
- [ ] **Q13 / P1:** make downloads accessible and label title, format, size and language. Provide an accessible HTML equivalent where appropriate.
- [ ] **Q14 / P1:** provide instructions before forms, visible field labels, required indicators, appropriate autocomplete and input types, clear correction messages and accessible status feedback.

## 6. P1: accessibility and responsive behaviour

Source: DBIM chapter 8 and GIGW accessibility guidance/checklist (WCAG 2.1). These are representative acceptance checks; use the complete applicable checklist for conformity.

- [ ] **A01 / P1:** test all routes and core actions at 320px, common phone/tablet sizes and desktop widths, in both orientations. Avoid lost content and unnecessary horizontal scrolling.
- [ ] **A02 / P1:** support text resizing to 200%, browser zoom and reflow without clipped labels, hidden controls or overlapping content. Check user-adjusted text spacing.
- [ ] **A03 / P1:** verify contrast: normal text at least 4.5:1, qualifying large text at least 3:1, and required UI/graphical indicators at least 3:1, with the standard's exceptions considered.
- [ ] **A04 / P1:** use semantic headings, landmarks, lists and table markup. Provide a skip-to-content link and a single understandable reading order.
- [ ] **A05 / P1:** operate every action using a keyboard with visible focus and logical focus order. Menus must support keyboard opening, dismissal and navigation.
- [ ] **A06 / P1:** handle drawers/dialogs correctly: move focus into them, keep it in modal content, close with Escape, restore focus to the opener, and prevent hidden controls from receiving focus.
- [ ] **A07 / P1:** provide meaningful alt text for informative images; mark decorative graphics appropriately. Give every interactive control an accessible name.
- [ ] **A08 / P1:** associate form errors and instructions with their fields. Announce loading/results/errors appropriately; do not communicate state using colour alone.
- [ ] **A09 / P1:** provide chart summaries and accessible data tables for impact visualisations. Canvas labels alone do not convey the underlying values.
- [ ] **A10 / P1:** caption relevant video/audio, provide transcripts or descriptions where required, and allow users to pause moving/autoupdating content. Respect reduced-motion preferences and avoid unsafe flashing.
- [ ] **A11 / P1:** test with a screen reader and keyboard on the full core journey, including validation, empty states and status changes. Record actual outcomes, not just an automated score.
- [ ] **A12 / P1:** run automated accessibility checks on every route/state and manually resolve remaining applicable WCAG 2.1 A/AA requirements. An accessibility toolbar alone does not establish conformity.

## 7. P1: language support

- [ ] **L01 / P1 / Decision needed:** confirm required languages with the problem statement/mentor. Plan English and Hindi unless another agreed requirement applies; prioritise languages users actually need.
- [ ] **L02 / P1:** use reviewed translation resources for navigation, forms, errors and critical instructions. Avoid depending entirely on external per-text-node translation during a live demo.
- [ ] **L03 / P1:** translate accessible names, validation, metadata and dynamic results as well as visible headings. Set page/passage language accurately and check Unicode font rendering.
- [ ] **L04 / P1:** keep equivalent language versions current. Test switching language before and after navigation, submission, refresh and provider/network failure.
- [ ] **L05 / P1:** assess whether external translation receives personal or sensitive text; limit what is sent and describe relevant provider use accurately in the privacy information.

## 8. P0/P1: security, privacy and dependable operations

Source: GIGW cybersecurity/lifecycle guidance plus project-specific observations. These checks are implementation work to schedule, not completed penetration testing or legal advice.

- [ ] **R01 / P0:** enforce authenticated ownership on coin, phone, booking and ticket operations. Derive the acting account from the session rather than a client-provided email; test with two users.
- [ ] **R02 / P0:** remove or redesign client-controlled reward mutations. Keep reward events server-authoritative, validated and safe against replay, negative amounts and duplicate evidence.
- [ ] **R03 / P0:** enforce role-based recycler/admin access on the server. Use least privilege and log significant status, partner and certificate changes.
- [ ] **R04 / P0:** protect uploads with server-side type/content and size limits, safe names/storage, appropriate scanning/review and access control. File receipt alone must not count as verified cleanup.
- [ ] **R05 / P0:** validate all server inputs and enforce rate limits on login, registration, SMS, submissions, uploads and other abuse-prone routes. Browser cooldowns are insufficient.
- [ ] **R06 / P0:** verify password hashing, session expiry/logout, secure production cookies, cross-origin credentials, allowed origins and protection against forged state-changing requests.
- [ ] **R07 / P0:** keep secrets outside tracked files; review repository history before public release and rotate exposed credentials if any are found. Exclude environment files, personal uploads and sensitive logs from version control.
- [ ] **R08 / P0:** configure HTTPS and accurate frontend/backend URLs. Production must not rely on localhost, permissive development settings or a database unavailable to the demo environment.
- [ ] **R09 / P1:** collect only necessary personal data, define retention/deletion procedures and minimise public tracking/leaderboard information. Use synthetic data for public demonstrations.
- [ ] **R10 / P1:** review dependency advisories and security configuration, then retest affected flows. Schedule an appropriate security assessment before accepting real public users.
- [ ] **R11 / P1:** establish database backup and restore, health monitoring, useful error logs without secrets, and recovery from backend/provider failure. Demonstrate restoration on test data.
- [ ] **R12 / P1:** document who approves content, reviews accuracy, archives records and handles incidents. Set a realistic review schedule and support handover.

## 9. P1: performance and release verification

- [ ] **T01 / P1:** build from a clean install and verify the production build separately from the development server. Confirm direct URL refresh and all assets/routes on the actual host.
- [ ] **T02 / P1:** measure load speed and interaction responsiveness on a mid-range phone and throttled connection. Record LCP, INP and CLS; agree targets and preserve before/after evidence.
- [ ] **T03 / P1:** optimise image/video delivery, defer nonessential assets, reduce unused code and avoid layout shifts. Test external fonts and translation failing to load.
- [ ] **T04 / P1:** test supported browsers and mobile touch controls, including long text, long names, large uploads and empty/new accounts.
- [ ] **T05 / P1:** add meaningful regression checks for booking -> tracking -> completion, authentication/ownership, reward duplication and failed submissions. Keep test data separate from real records.
- [ ] **T06 / P1:** complete a manual route/action inventory: every link, dropdown, filter, submit, download, modal and sign-out works or is clearly identified as unavailable.
- [ ] **T07 / P1:** preserve the demo version with setup instructions, dependency lockfiles, environment-variable names, reset/seed instructions and rollback steps. Verify on a second machine before the event.

## 10. P1/P2: evidence for a strong competition presentation

These are team preparation recommendations, not verified official SIH 2026 scoring rules. Reconcile them with the actual competition brief.

- [ ] **C01 / P0:** explain the specific user problem and show how the core journey satisfies the supplied problem statement. Lead with the implemented benefit.
- [ ] **C02 / P1:** demonstrate one coherent journey through citizen and operator views using the same persistent record. Finish with traceable completion evidence and a justified reward/impact entry.
- [ ] **C03 / P1:** collect consented feedback from representative citizens/recyclers and record task success, completion time and changes made. Distinguish interviews from an operational pilot.
- [ ] **C04 / P1:** substantiate differentiation with a comparison against existing approaches, using current sources when prepared. Explain why the differences matter to users.
- [ ] **C05 / P1:** prepare architecture and data-flow diagrams, API notes, data model, threat/risk summary and the DBIM/GIGW evidence matrix. Keep implementation claims demonstrable.
- [ ] **C06 / P1:** explain rollout and operating costs: collection logistics, partner onboarding, reward funding, hosting/provider costs, service area and support responsibilities. Label projections as estimates.
- [ ] **C07 / P1:** if AI is essential, show its actual implementation, evaluation data and held-out results, error cases and human fallback. Do not describe a rule-based or unfinished estimator as a validated AI system.
- [ ] **C08 / P1:** prepare a short pitch, a repeatable demo script, a recorded backup, screenshots and a dependency/network fallback. Clearly label fallback/sample data; do not present a recording as a live transaction.
- [ ] **C09 / P1:** assign speaking/demo roles, rehearse questions and recovery scenarios, and ensure at least two teammates can start, reset and explain the system.
- [ ] **C10 / P2:** consider extra features only after core acceptance checks pass: richer analytics, optional notifications, broader language coverage or more advanced matching. Reprioritise if any is explicitly required by the problem statement.

## 11. Government-specific requirements: decide applicability

The manuals target government digital platforms. BinZ is currently described as a team's SIH competition project. No government ownership, endorsement, privileged integration or certification has been established.

| Requirement group | Proposed treatment for BinZ | What would change that decision |
| --- | --- | --- |
| State Emblem, ministry logo lockup, minister/PM sections and government ownership statements | Do not add government identity claims. Retain accurate team/project ownership. | Authorised government owner and explicit requirement/permission. |
| Ministry-specific five-section information architecture and personnel directories | Adapt navigation to BinZ user tasks; record ministry-only clauses as not applicable with reasons. | Problem-statement owner explicitly requires this organisational structure. |
| `gov.in`/`nic.in` domains | Use an appropriate project domain without suggesting official ownership. | Eligible government owner arranges an authorised domain. |
| CCPS, India Portal, DigiLocker, Aadhaar, government SSO, MyGov and similar integrations | Treat as conditional; no live integration or access is assumed. Document prototypes honestly. | Required use case, authorised access, appropriate data handling and approved integration plan. |
| Ministry social media presence and CIO/WIM government appointments | Use accurate team contacts and assign equivalent project maintenance responsibilities. | Actual government organisational requirements apply. |
| STQC/CQW and prescribed production security clearances | Do not claim certification. Track alignment/testing evidence separately. | Formal certification is in scope and the authorised owner engages the required bodies/auditors. |
| Mobile-app annexures | Outside this website-only checklist for now; the repository also has a Flutter app. | Team confirms that the mobile app is part of the final assessed deliverable. |

## 12. Suggested execution order

1. Confirm problem-statement scope and the applicability matrix.
2. Complete one persistent, authorised pickup/ticket-to-completion journey, including legitimate rewards and clear demo-data labels.
3. Apply shared DBIM design changes, navigation/search, content/policies and reviewed language support.
4. Verify accessibility, security boundaries, mobile behaviour and the production deployment; fix defects found.
5. Gather user evidence, finish technical documentation and rehearse the final demo and recovery plan.

Work can overlap when it does not depend on unresolved decisions. The team should assign owners and estimates after confirming deadline, team roles and required feature scope.

## 13. Completion log

Copy one row per item; all boxes above intentionally remain unchecked until verification.

| Item ID | Owner | Agreed deadline | Current status | Evidence/test result | Reviewer/date |
| --- | --- | --- | --- | --- | --- |
| S01 | To assign | To agree | Needs problem-statement details | Authoritative brief | To assign |
| F01 | To assign | To agree | Gap in reviewed source | Persistent booking + refresh + operator view | To assign |
| A11 | To assign | To agree | Not tested | Keyboard/screen-reader walkthrough recording | To assign |

## Sources and limitations

- Official toolkit: https://dbimtoolkit.digifootprint.gov.in/ . Its accessible top-level pages were consulted in the preceding review; a complete inspection of its dynamically loaded chapters/assets remains outstanding.
- Supplied **Digital Brand Identity Manual, version 3.0, January 2025**, 176 PDF pages: `C:/Users/priya/OneDrive/Desktop/405f7c961cef45c6689002aed6f8e08c.pdf`. Main references: chapters 2-10; Annexure A (navigation), B (forms), F.1/F.2 (generic and ministry checklists). Printed page numbering differs from PDF page numbering.
- Supplied **Guidelines for Indian Government Websites and Apps 3.0**, 121 PDF pages: `C:/Users/priya/OneDrive/Desktop/e3fecb3f602c50bec70eedc682d9a7d0.pdf`. Main references: quality, accessibility, cybersecurity and lifecycle guidance; Annexure II conformity matrix, PDF pages 100-115.
- Project evidence: current checked-out `src/`, `backend/server.js`, root/backend package manifests, `index.html`, `.gitignore` and deployment configuration. The README includes statements that do not match all current source behaviour, so code evidence took precedence for the snapshot.
- This checklist does not certify legal compliance, security, government status or competition eligibility. Official SIH 2026 assessment criteria and the team's problem statement have not yet been supplied or checked. Implementation, runtime testing, a complete website review and a formal clause-level assessment remain future work.
