# Changelog

This file records meaningful, reviewed repository changes. Releases should reference an exact commit SHA, migration status, deployment URL, known limitations, and rollback target.

## Unreleased

### Added

- Deterministic telephony simulation mode using the normalized telephony contract and call-state machinery.
- Provider capability/readiness reporting and live-telephony activation guidance.

### Changed

- Public telephony positioning now distinguishes simulation from Telnyx activation.

### Security

- Simulation cannot execute Telnyx calls and is not accepted through provider webhook routes.

## Release policy

Version releases use SemVer intent: breaking changes are major, compatible capability additions are minor, and compatible fixes are patch releases. A release is not created solely because a preview is READY.
