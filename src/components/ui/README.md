# Shared frontend controls

Import Button, Input, Select, Textarea, FormField and FormMessage from this directory. The stylesheet is imported once after the legacy page stylesheet in src/main.jsx.

- Use Button for primary and secondary actions; pass type="submit" for form submission. Buttons default to type="button". Use as="a" for navigation links. Existing primary/secondary classes are recognised for migration, but explicit variant props are preferred for new code.
- Pass loading and loadingLabel for an actual pending operation; guard the submit handler too. Disabled/loading controls expose their state and block repeat clicks. Do not simulate backend confirmation through a styling component.
- Use FormField with label/id/required and optional hint/error. It defaults to Input; pass as={Select} or as={Textarea} where needed. Native validation remains active and linked error messages are rendered.
- Input/Select/Textarea can be used directly when a compound field already provides a real visible label. They retain native browser behaviour and pass through form, ref and accessibility props.
- FormMessage supports info/error/success with icon/text/live semantics. Use success only for an operation actually confirmed at the appropriate layer.
- Add ui-card to equivalent card surfaces, with ui-card--interactive or ui-card--brand for purposeful variations. Page CSS owns placement; shared CSS owns border/radius/padding/shadow.
- Extend shared tokens/variants rather than adding per-page dimensions. Preserve the existing Noto Sans type scale, DBIM palette and light footer.
- Use `useSubmission` from `src/hooks/useSubmission.js` for async form operations and `requestJson` for existing JSON API contracts. Keep inputs during failures; resolve success only after acceptance. `FormMessage` now also supports `tone="loading"`. Read `1. Context/technical-context/frontend-feedback-states.md` for adapter props, local/demo behavior, upload limits and verification.

Current geometry: actions/fields minimum 48px; controls 12px radius; cards 20px radius with 24px desktop/20px mobile padding. Action icons 24px, category icons 32px, smaller navigation chevrons. Reduced-motion styling is provided. This is a foundation, not a full accessibility or official conformity certification.
