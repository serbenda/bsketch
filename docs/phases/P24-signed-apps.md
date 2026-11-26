# P24 — Signed desktop apps

- **Stage:** S8
- **Status:** ⬜ waiting for the owner (accounts and secrets, or a decision to ship unsigned)
- **Issue:** —
- **Dates:** 2026-11-26 → —
- **Owner approvals:** 2026-11-20 the road to 2.0

## Goal
The macOS and Windows apps open without "unidentified developer" or SmartScreen warnings, and they are allowed on
managed company computers (R-001).

## Scope
**In:**
- **macOS:** the `.app` signed with a Developer ID Application certificate, then notarized and stapled, so Gatekeeper
  opens it with no warning. The universal build and the zip stay as they are.
- **Windows:** the `.exe` signed, either with Azure Trusted Signing (recommended: no hardware token, cheaper, and
  trusted by SmartScreen) or with an OV/EV code-signing certificate.
- `desktop.yml` signs only when the secrets are there. Without them it builds unsigned as it does today, so forks and
  PRs keep working.
- The signed provenance (`*.intoto.jsonl`) is made after signing, so it attests the files people download.

**Out:**
- Linux (an AppImage has no platform signature; the provenance already covers it).
- App stores (Mac App Store, Microsoft Store).

## What the owner does first
| Platform | Account | Cost (approx.) | Secrets for the repository (Settings → Secrets → Actions, environment `release`) |
|---|---|---|---|
| macOS | Apple Developer Program, then a **Developer ID Application** certificate exported as `.p12` | 99 USD a year | `APPLE_CERTIFICATE` (the `.p12` in base64), `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY` (`Developer ID Application: Name (TEAMID)`), and for notarization an App Store Connect API key: `APPLE_API_ISSUER`, `APPLE_API_KEY` (key ID), `APPLE_API_KEY_P8` (the `.p8` contents) |
| Windows (recommended) | Azure Trusted Signing: an Azure subscription, a Trusted Signing account and a certificate profile (identity validation of the person or company) | about 10 USD a month | `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` (an app registration with the "Trusted Signing Certificate Profile Signer" role), `AZURE_TS_ENDPOINT`, `AZURE_TS_ACCOUNT`, `AZURE_TS_PROFILE` |
| Windows (alternative) | An OV or EV code-signing certificate from a CA, in a cloud HSM that signs from CI | 200–500 USD a year | depends on the provider |

The secrets go in a GitHub environment called `release`, which only `main` can use, so a PR can never read them.

## Plan (agent, once the secrets exist)
1. `desktop.yml` (a guardrail file: the owner commits it):
   - **macOS:** pass the Apple secrets as the environment variables Tauri reads (`APPLE_CERTIFICATE`, …,
     `APPLE_API_KEY_PATH` written from `APPLE_API_KEY_P8` into a temporary file). `tauri build` then signs, notarizes
     and staples the `.app`.
   - **Windows:** after `tauri build --no-bundle`, sign `bsketch.exe` with `azure/trusted-signing-action` (pinned by
     SHA), with a timestamp.
   - Steps run only `if: secrets are set`. The job uses the `release` environment only on `main` and tags.
   - `attest-build-provenance` runs after signing.
2. A check in the workflow: `codesign --verify --deep --strict` and `spctl -a -t exec` on macOS;
   `Get-AuthenticodeSignature` must be `Valid` on Windows.
3. Docs: README (how to check the signature), SECURITY_GUIDE, R-001 → MITIGATED, the release script's notes.

## Or: ship unsigned
If the cost isn't worth it, the owner records that in an ADR ("2.0 ships unsigned desktop apps; the portable file and
the web version are the answer for managed computers; provenance shows where each file came from"). The README then
explains how to open an unsigned app (right-click → Open on macOS; "More info → Run anyway" on Windows). R-001 stays
OPEN and is accepted.

## Acceptance criteria
- [ ] macOS: the downloaded zip's app opens with no Gatekeeper warning on a Mac that has never seen it.
- [ ] Windows: the `.exe` shows the publisher's name and no "unknown publisher" warning.
- [ ] Builds from forks and PRs still work, unsigned.
- [ ] The provenance verifies the signed files (`gh attestation verify`).

## Security impact
- Secrets are stored in a protected environment that only `main` can use. Signing keys never reach a PR build.
- The signature tells users (and their companies) the files really come from the owner. The provenance still shows
  which commit and workflow built them.
