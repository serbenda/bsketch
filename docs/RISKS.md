# Risk register

> The bar for release is not "everything is coded" but "no High risks open".
> States: `OPEN` → `MITIGATED` (fixed and covered by tests) → `CLOSED` (validated in the real world).

| ID | Risk | Impact | Probability | State | Mitigation | Phase |
|---|---|---|---|---|---|---|
| R-001 | Unsigned desktop executables are blocked or flagged on company computers | Medium | High | OPEN | The portable HTML file is offered for those computers; signing only if the owner decides to pay for it | — |
| R-002 | Untested on Firefox, Safari and real phones: something may break there | Medium | Medium | OPEN | Owner tests on real devices; a later phase can add Firefox and WebKit to the e2e in CI | — |
| R-003 | The Linux AppImage bundles its own WebKitGTK, which doesn't update with the system | Medium | Medium | OPEN | Rebuild on every release; Dependabot keeps the Tauri crates current | — |
| R-004 | Snowlog's copy of the engine drifts from sketch | Low | Medium | OPEN | `scripts/update-sketch.mjs` in Snowlog copies a given commit; update it when Snowlog adopts the new file names | P01 |
| R-005 | The browser storage is the only copy of an unsaved drawing | Low | Low | MITIGATED | "Save" downloads a `.sketch` file; the e2e checks the old storage key is migrated, not lost | P01 |

## How to use it
- Any phase that touches data, authentication, dependencies or deployment reviews this table.
- A `MITIGATED` risk needs a test or check that proves it, linked in *Mitigation*.
- Security risks are cross-checked with the `security-audit` skill (see [SECURITY_GUIDE.md](SECURITY_GUIDE.md)).
