# P01 — Adopt project-template 1.0.0, everything in English

- **Stage:** S3
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-17 → 2026-11-17
- **Owner approvals:** 2026-11-17 "start with sketch, it has to adapt to the template"; 2026-11-17 "everything in English"; 2026-11-17 "run it yourself" (the agent applies and commits the guardrails patch)

## Goal
sketch follows the current template (guardrails, CI jobs, documented way of working) and the whole repository,
the interface included, is in English.

## Scope
**In:**
- The template's owned files (`scripts/sync-from-template.sh --apply`), the files to merge by hand (settings,
  CI, Dependabot, `AGENTS.md`, `CLAUDE.md`, DoD, SETUP, `setup-repo.sh`, CODEOWNERS, dev container) and
  `.github/OWNER`; the old Spanish template files removed.
- Code, UI texts, tests, docs, workflows and the desktop app in English; files renamed.
- The template's docs filled in for sketch: VISION, STATE, ROADMAP, ARCHITECTURE, THREAT_MODEL, RISKS, SETUP,
  WORKLOG and ADRs 0002–0004.

**Out:**
- New features. Snowlog's migration (next project). Testing on other browsers and devices (P02).

## Acceptance criteria
- [x] `npm test` (17) and `npm run test:e2e` (8) pass in English, including the migration of a drawing kept
  under the old storage key.
- [x] Rehearsed on a copy: `sync --apply`, shellcheck, `test-guard.sh`, `test-check-records.sh`,
  `test-githooks.sh` (160 cases) and actionlint pass.
- [x] The guardrails commit is on `development` (`fb94aad`; applied by the agent at the owner's explicit request).
- [x] CI is green on the PR: Secrets, Authorship, Hook, Hook (macOS bash 3.2), SAST, Dependencies, Records, Tests.

## Plan
1. Agent: rehearse the sync on a copy and prepare the merged guardrail files.
2. Agent: translate and rename the code, tests and docs; fill in the template's docs; commit on `development`.
3. Owner: apply the guardrails patch on `development` and commit it with `GUARDRAILS_OWNER_CHANGE=1`.
4. Agent or owner: open the `development → main` PR; fix what SAST or OSV report for the first time.

## Security impact
- No new entry point. The guardrails get stronger (guard hook 1.0.0, git hooks with Gitleaks, SAST, OSV,
  Records). [THREAT_MODEL.md](../THREAT_MODEL.md) written for the first time.
- The renamed storage key is read through the same validation (`parseScene`).

## Risks and open questions
- SAST (Semgrep) and OSV-Scanner run on this code for the first time in CI: findings may need fixes.
- The template's sandbox may block Chrome (e2e) or cargo inside Claude Code sessions; if so, the owner decides
  whether to add an exception.

---

## Result
- **What was done:** the template's guardrails (guard hook, git hooks, CI jobs, Dependabot, agents, commands,
  skills) and its full-mode docs (VISION, STATE, WORKLOG, ROADMAP, ARCHITECTURE, THREAT_MODEL, RISKS, ADRs);
  everything translated to English, files and the storage key renamed (an older drawing is moved, not lost). First
  CI run fixes: one `fetch` in the desktop smoke test with a suppressed Semgrep finding and its reason, English issue
  templates, and the portable file left out of the offline link check.
- **How it was tested:** `npm test` 17 and `npm run test:e2e` 8 pass; the guardrail tests (`test-guard.sh`,
  `test-check-records.sh`, `test-githooks.sh`), shellcheck and actionlint pass; every CI job green on PR #5.
- **What was left out and why:** tests on other browsers and devices (P02, R-002); pinning the
  `editorconfig-checker` binary (its unauthenticated download hit GitHub's rate limit three times; a change to
  `.github/` for the owner).
- **Lessons learned:** the push-event Records check needs a new WORKLOG heading on every push that changes code,
  so CI follow-ups get their own entry. The guardrails commit (`fb94aad`) and the `nosemgrep` suppression with its
  issue templates (`3de5b8d`) were committed by the agent with `GUARDRAILS_OWNER_CHANGE=1` only because the owner
  explicitly asked for it in chat, each time; the owner then reviewed and merged them in PR #5.
- **PR:** #5
