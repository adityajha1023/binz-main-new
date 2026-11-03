# Translation Implementation Checklist

## Localization Audit

- [x] Audit existing translation architecture.
- [x] Identify required languages: English, Hindi and Marathi.
- [x] Identify untranslated static and dynamic content.
- [x] Audit navigation, forms, search and accessibility labels.
- [x] Audit external runtime translation.

## Translation Architecture

- [x] Centralize reviewed common translations in `src/localization.js`.
- [x] Organize language resources by language.
- [x] Implement language persistence through the existing footer selector.
- [x] Implement English fallback for missing keys.
- [x] Ensure shared components update after language changes.
- [x] Remove external runtime translation requests.

## Navigation & Forms

- [x] Translate existing header navigation.
- [x] Translate footer navigation and language controls.
- [x] Translate search controls and common form actions.
- [ ] Translate every page-specific form label and validation message (many remain English and need an approved content pass).
- [x] Preserve existing navigation hierarchy and removed dropdown items.

## Results & Dynamic Content

- [x] Translate common verification and approval statuses.
- [x] Translate common reward, upload and search states.
- [x] Preserve backend status values and IDs.
- [ ] Translate every backend-generated message (API contracts currently return English free-text messages).
- [ ] Add language-aware backend content fields for dynamic catalogue/recycler descriptions.
- [x] Define English fallback for unavailable translations.

## Accessibility

- [x] Translate mapped aria-label, aria-description, title and placeholder attributes.
- [x] Preserve semantic controls and live-region behavior.
- [x] Set `document.documentElement.lang` on language changes.
- [ ] Perform a screen-reader audit for every page.

## Translation Quality

- [x] Review English and Hindi common navigation/status terminology.
- [x] Review Marathi common navigation/status terminology.
- [x] Preserve brand names, IDs and user-entered content.
- [x] Keep missing translations in English instead of showing raw keys.
- [ ] Complete human review of all page-specific copy.

## External Translation Privacy & Reliability

- [x] Identify the former Google Translate runtime integration.
- [x] Remove page-text transmission to the external provider.
- [x] Remove unnecessary translation latency and rate-limit dependency.
- [x] Document local-resource fallback behavior.

## Final Verification

- [x] Run production build.
- [x] Run backend syntax validation.
- [ ] Test English/Hindi/Marathi switching in a browser.
- [ ] Test all major forms and validation messages in each language.
- [ ] Test dynamic backend statuses in each language.
- [ ] Test accessible names with a screen reader.
- [ ] Test mobile layouts in each language.

## Coverage note

The previous implementation translated every visible text node through Google's public runtime
translation endpoint. That was not reliable and could transmit private page content. The new
implementation uses local reviewed resources and safe English fallback. Full page-specific
translation remains pending for copy that has not yet been reviewed by the product team.
