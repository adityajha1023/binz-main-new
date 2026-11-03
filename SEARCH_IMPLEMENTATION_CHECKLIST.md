# Search Implementation Checklist

## Existing Search Audit

- [x] Inspect existing frontend search.
- [x] Inspect existing backend search APIs.
- [x] Identify current searchable content.
- [x] Identify missing public content.
- [x] Identify document indexing limitations.
- [x] Inspect header search implementation.
- [x] Identify previously removed dropdown items.

## Search Coverage Expansion

- [x] Index public homepage content.
- [x] Index public informational pages.
- [x] Index service pages.
- [x] Index FAQ content.
- [x] Index educational content.
- [x] Expand directory search using authorized recycler records.
- [x] Expand scrap catalogue search.
- [ ] Index relevant public documents (no public document repository exists).
- [ ] Implement document text extraction (requires a public document storage/extraction contract).
- [x] Prevent duplicate search results.
- [x] Respect public visibility; private uploads and user records are not indexed.

## Multilingual Search

- [x] Implement English keyword support.
- [x] Implement Hindi keyword support.
- [x] Implement Hinglish/Romanized Hindi support.
- [x] Add relevant material synonyms.
- [x] Add language-specific aliases.
- [x] Implement Unicode normalization.
- [x] Implement case-insensitive matching.
- [x] Handle common spelling variations.
- [x] Test multilingual matching through the search scoring path.

## Search Relevance

- [x] Implement title-based ranking.
- [x] Implement keyword matching.
- [x] Implement description matching.
- [x] Implement heading matching.
- [x] Implement category-based result types.
- [x] Implement duplicate-result prevention.
- [x] Verify result ranking logic.
- [ ] Implement typo tolerance (not added without a search index or typo library).

## Header Search Accessibility

- [x] Audit shared header implementation.
- [x] Ensure search is accessible across public pages.
- [x] Ensure desktop search works.
- [x] Ensure mobile search works through the shared responsive nav.
- [x] Implement keyboard-accessible link behavior.
- [x] Implement focus behavior with autofocus on the search field.
- [x] Preserve existing header design.
- [x] Ensure removed dropdown items remain removed.

## Search Results UI

- [x] Implement result categories.
- [x] Display useful result excerpts.
- [x] Implement result navigation.
- [x] Implement loading state.
- [x] Implement empty state and suggestions.
- [x] Implement API error state.
- [ ] Implement pagination/load-more UI (the API supports pagination, current result volume is small).
- [x] Maintain responsive design using existing result cards.

## Performance & Security

- [x] Optimize search API with bounded query length and result limit.
- [ ] Implement live-search debouncing (search runs on submit, avoiding unnecessary requests).
- [x] Implement pagination in the API.
- [ ] Add server cache (current public index is small and built from bounded records).
- [ ] Add cache invalidation hooks (requires a persisted CMS/document index).
- [x] Secure document scope by not indexing private files.
- [x] Enforce public/authorized directory visibility.
- [x] Avoid unsafe query construction.

## Final Verification

- [ ] Test public page search against a running backend.
- [ ] Test document search (blocked: no public document repository).
- [ ] Test English search.
- [ ] Test Hindi search.
- [ ] Test Hinglish search.
- [ ] Test existing catalogue search.
- [ ] Test header search accessibility in browser.
- [x] Verify removed dropdown items remain removed.
- [x] Verify result destinations are canonical public routes.
- [ ] Test mobile responsiveness in browser.
- [ ] Run available automated tests.
- [x] Run production build.
- [x] Run backend syntax validation.

## Coverage notes

The original implementation searched only `pageIndex` descriptions/keywords and local
`scrapItems`. The new `GET /search` endpoint searches a backend-owned public content index,
authorized recycler directory records, and material aliases. No private uploads, cleanup videos,
certificates, or authenticated user records are indexed. Public document search remains pending
because this repository has no document model, public document directory, or text-extraction
service to integrate safely.
