# Cleanup Video Implementation Checklist

## Cleanup Video Upload

- [x] Inspect existing upload implementation.
- [x] Inspect backend upload endpoint and schema.
- [x] Connect video selection to backend upload.
- [x] Implement file format validation.
- [x] Implement file-size validation.
- [x] Implement video preview.
- [x] Implement upload progress.
- [x] Handle upload errors.
- [x] Prevent duplicate submissions while an upload is active.
- [x] Verify successful video upload response handling.

## Backend Verification

- [x] Integrate authenticated verification API.
- [x] Display server-generated verification ID.
- [x] Display actual pending status.
- [x] Display actual approved status.
- [x] Display actual rejected status.
- [x] Display backend rejection reason.
- [x] Implement verification status refresh.
- [x] Implement verification history.
- [x] Verify status persistence after page refresh through database-backed endpoints.

## Reward Integration

- [x] Fetch backend-confirmed rewards.
- [x] Display confirmed reward after approval.
- [x] Integrate confirmed balance with the existing reward dashboard.
- [x] Prevent duplicate reward credits with server-side idempotent review state.
- [x] Ensure pending submissions receive no rewards.
- [x] Ensure rejected submissions receive no rewards.
- [x] Verify reward balance consistency from authenticated backend responses.

## UI/UX & Quality Assurance

- [x] Preserve existing website design.
- [x] Implement responsive upload interface.
- [x] Implement initial, selected, uploading, success, pending, approved, rejected, error, and empty-history states.
- [x] Remove mock verification functionality.
- [x] Remove locally generated cleanup rewards.
- [ ] Fix console errors in a browser end-to-end session.
- [x] Run production build.
- [ ] Perform live end-to-end verification with MongoDB and an authenticated account.

## Backend dependency notes

- The backend now stores submissions and exposes review endpoints, but it does not contain an automated
  video detector. A trusted operator must review a pending verification through
  `PATCH /cleanup-verifications/:verificationId/review` with `{ "status": "approved" }` or
  `{ "status": "rejected", "rejectionReason": "..." }`.
- Approved reward values are server-owned and read from `CLEANUP_VIDEO_REWARD`; if unset, approval
  confirms a zero reward rather than inventing a client-side value.
- The review endpoint requires the authenticated account to be marked as the existing server admin.
