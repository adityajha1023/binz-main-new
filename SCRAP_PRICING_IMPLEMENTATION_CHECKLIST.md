# Scrap Pricing Implementation Checklist

## Pricing Audit

- [x] Audit scrap catalogue pricing.
- [x] Audit price discovery pricing.
- [x] Audit calculator pricing.
- [x] Audit pickup booking estimates.
- [x] Audit dashboard and preview pricing.
- [x] Identify all hardcoded prices.
- [x] Identify duplicate pricing sources.

## Centralized Pricing Architecture

- [x] Establish one authoritative backend pricing source.
- [x] Define a consistent pricing schema.
- [x] Implement centralized pricing API.
- [x] Implement material-based price retrieval.
- [x] Implement location-aware price retrieval with default fallback policy.
- [x] Implement effective-date handling.
- [x] Preserve historical pricing records.
- [x] Implement consistent error handling.

## Frontend Integration

- [x] Connect Scrap Catalogue.
- [x] Connect Price Discovery.
- [x] Connect Scrap Calculator.
- [ ] Connect pickup booking estimates (no existing booking price estimate is currently implemented).
- [x] Connect dashboard price previews.
- [x] Remove hardcoded frontend metal prices.
- [x] Remove duplicate frontend price calculations.
- [ ] Implement client cache invalidation after admin updates (current reads are request-based with no independent price cache).
- [x] Ensure consistent currency formatting in the calculator.

## Location & Historical Pricing

- [x] Implement location-based rate selection.
- [x] Display applicable location assumptions.
- [x] Display effective dates.
- [x] Handle expired rates.
- [x] Handle future rates through effective-dated records.
- [ ] Preserve historical transaction prices (no price-bearing booking transaction model exists yet).

## Admin Pricing Management

- [x] Inspect existing admin capabilities.
- [x] Implement authorized price management endpoint.
- [x] Implement price history endpoint.
- [x] Implement audit fields (`updatedBy`, timestamps, source).
- [x] Implement effective-dated updates and overlap prevention.
- [x] Verify authorization through the existing admin middleware.
- [ ] Add an operator UI for price management.

## Testing & Quality Assurance

- [ ] Verify catalogue and price discovery consistency against a running backend.
- [ ] Verify calculator accuracy against a running backend.
- [ ] Verify location-based pricing with configured regional records.
- [ ] Verify effective-date transitions in MongoDB.
- [ ] Verify historical transaction price preservation after a transaction model exists.
- [x] Verify API failure handling in affected price screens.
- [ ] Verify cache invalidation after an admin update.
- [ ] Run available automated tests.
- [x] Run production build.
- [x] Run backend syntax validation.

## Pricing decision and remaining dependencies

The original discrepancy was between the catalogue's hardcoded Iron value of ₹26/kg and the
existing `src/services/priceService.js` current value of ₹28/kg. No backend price source or
business approval existed. The seeded backend uses the existing current-price dataset as the
initial authoritative source (Iron ₹28/kg), records the prior dataset values as historical
records, and labels the seed source as pending business confirmation. This is not a nationwide
claim: requests use the requested location and fall back explicitly to the backend `default`
location.

Pickup booking has no existing price-estimate data contract, and completed bookings do not have a
price-bearing transaction model. Those features need a product/API decision before they can safely
be connected without inventing behavior.
