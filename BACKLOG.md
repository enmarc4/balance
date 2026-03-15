# Backlog

## Current Baseline (Implemented)

- Sprint 1 (auth + onboarding + accounts) is implemented.
- Scope expanded to ensure transactions are structurally ready with `name` + `category`.
- Scope refined with a unified mobile-first UI system and step-by-step onboarding flow.
- Accounts module now supports both archive and unarchive actions.
- Movements started from Home with a bottom-sheet quick entry (`income`/`expense`) without navigation.
- Phase 1 / Scope 1 completed: quick entry now has richer category UX, optional notes and field-level validation/error states.

## Planning Format (Definition of Output)

Each scope item includes:

- `Tasks`: implementation steps.
- `Expected output`: concrete deliverables (screens, modules, tests, policies).
- `Validation`: checks needed before closing.
- `Status`: `Completed`, `In progress`, `Planned`.

## 3-Phase Roadmap

### Phase 1: Movements Core (Now -> Short Term)

Goal: close the daily expense/income loop end to end from the current Home-first flow.

Scope:

1. Expand quick-entry bottom sheet
   - Status: `Completed` (2026-03-15)
   - Tasks:
     - Replace category dropdown with richer picker (search + selectable chips).
     - Add optional `notes` field with character counter.
     - Add strong field-level validation and inline errors.
     - Guard submit flow against stale account/category selections.
   - Expected output:
     - Updated bottom-sheet UX in `components/app/quick-transaction-sheet.tsx`.
     - Transaction input validator in `lib/validators/transactions.ts`.
     - i18n coverage for `ca`, `es`, `en` in `i18n/messages.ts`.
     - Unit tests for quick transaction validation edge-cases.
   - Validation:
     - Manual: create movement with category, without category, and with notes.
     - Manual: invalid amount/date/name shows inline error.
     - Automated: `npm run typecheck`, `npm run lint`, validator unit tests.

2. Category management
   - Status: `Planned`
   - Tasks:
     - Build category CRUD screen and actions (`create`, `edit`, `delete`).
     - Separate category lists by kind (`income` / `expense`).
     - Implement safe delete flow with reassignment for referenced transactions.
     - Prevent deletion of protected/system categories if applicable.
   - Expected output:
     - New route `/{locale}/app/categories`.
     - Reusable category form component and list rows with edit/delete actions.
     - Safe delete + reassignment transaction flow (UI + DB-safe behavior).
     - Locale copy for category management (`ca`, `es`, `en`).
   - Validation:
     - Manual: delete category with N transactions and reassign them.
     - Automated: integration test for delete/reassign ownership constraints.
     - Automated: e2e test for category create/edit/delete flow.

3. Transactions module
   - Status: `Planned`
   - Tasks:
     - Add transactions listing screen with filters:
       - account
       - category
       - date range
       - type (`income` / `expense`)
     - Implement edit transaction flow with balance integrity update.
     - Implement delete transaction flow with reverse balance update.
     - Add empty states and loading/error states aligned with mobile-first UI.
   - Expected output:
     - New route `/{locale}/app/transactions`.
     - Filter bar + paginated/virtualized list of transactions.
     - Transaction edit/delete UI and data update logic preserving account balance.
     - Unit/integration tests for balance integrity on edit/delete.
   - Validation:
     - Manual: edit amount/type/account and confirm account balance recalculation.
     - Manual: delete movement and confirm balance rollback.
     - Automated: tests for filter combinations and data ownership.

4. Quality
   - Status: `Planned`
   - Tasks:
     - Expand e2e coverage for full movement lifecycle:
       - create
       - edit
       - delete
     - Cover mobile viewport and locale routes.
     - Add test fixtures/seed approach for deterministic financial data.
   - Expected output:
     - New Playwright specs for movement lifecycle.
     - Stable seeded test data strategy for movement tests.
     - CI-ready test commands documented in `README.md`.
   - Validation:
     - Automated: movement e2e specs green in CI-like run.
     - Automated: no flaky tests over repeated local runs.

Exit criteria:

- A user can track and manage a full month of movements without leaving the app shell.
- No orphan category/account references in transactions.
- Movement unit/integration/e2e tests are green.

### Phase 2: Automation + Insights (Short -> Mid Term)

Goal: reduce manual input and make financial trends understandable in one glance.

Scope:

1. Recurrences
   - Status: `Planned`
   - Tasks:
     - Build recurring transaction CRUD UI.
     - Define recurrence run executor strategy.
     - Add `recurrence_runs` audit model and idempotent run keys.
   - Expected output:
     - Recurrence management screen and forms.
     - Background execution implementation with run history records.
     - Idempotency guarantees for duplicate/scheduled runs.
   - Validation:
     - Automated: recurrence run integration tests.
     - Manual: no duplicate movement creation in repeated job runs.

2. Dashboard intelligence
   - Status: `Planned`
   - Tasks:
     - Add account-level trend cards/charts.
     - Add category spend/income breakdown views.
     - Add monthly comparison and net evolution modules.
   - Expected output:
     - Enhanced dashboard with actionable trend sections.
     - Charts/tables with locale-aware formatting.
     - Query layer optimized for monthly aggregates.
   - Validation:
     - Manual: cross-check key totals against raw transactions.
     - Automated: unit tests for aggregation utilities.

3. Product quality
   - Status: `Planned`
   - Tasks:
     - Capture visual regression baselines on key authenticated screens.
     - Add token/theme regression checks across app sections.
   - Expected output:
     - Visual snapshot test suite for critical routes.
     - Guardrails for style/token consistency.
   - Validation:
     - Automated: snapshot diffs reviewed and stable.

4. Security hardening
   - Status: `Planned`
   - Tasks:
     - Add RLS policy tests for cross-user access attempts.
     - Add DB-level ownership/consistency checks for category/account/transaction links.
   - Expected output:
     - Automated security-focused DB test suite.
     - Clear pass/fail evidence for ownership boundaries.
   - Validation:
     - Automated: all security tests green before release.

Exit criteria:

- Recurrences execute reliably and are auditable.
- Dashboard explains where money goes and how it changes month to month.
- Security tests pass for cross-user access and ownership boundaries.

### Phase 3: Planning + Ecosystem (Mid -> Long Term)

Goal: evolve from tracking to planning and interoperability.

Scope:

1. Budgets
   - Status: `Planned`
   - Tasks:
     - Implement monthly budgets by category.
     - Add budget progress and overrun alerting.
   - Expected output:
     - Budget configuration UI and monthly tracking panel.
     - Alert states when planned budget is exceeded.
   - Validation:
     - Manual: budget progress updates after transaction changes.
     - Automated: calculation tests for budget utilization.

2. Savings goals
   - Status: `Planned`
   - Tasks:
     - Implement savings goal definition and contribution tracking.
     - Add projection logic for completion forecasting.
   - Expected output:
     - Goals screen with progress and ETA projection.
     - Contribution history linked to movement data.
   - Validation:
     - Automated: forecasting logic tests.

3. Data interoperability
   - Status: `Planned`
   - Tasks:
     - Implement CSV import with validation and row-level error reporting.
     - Implement CSV export for accounts/transactions.
   - Expected output:
     - Import wizard with preview, validation report, and summary.
     - Export actions with deterministic column schema.
   - Validation:
     - Manual: import malformed and valid CSVs.
     - Automated: parser/mapper tests and sample fixtures.

4. Collaboration and integrations
   - Status: `Planned`
   - Tasks:
     - Implement shared accounts with roles/permissions.
     - Run banking integration discovery spike (read-only first).
   - Expected output:
     - Shared account model + invite/member management flow.
     - Integration spike report with constraints, risks, and go/no-go recommendation.
   - Validation:
     - Automated: permission matrix tests for shared accounts.
     - Manual: collaboration flow with multiple users.

Exit criteria:

- Users can plan (budgets/goals), migrate data (CSV) and collaborate safely.
- Integration strategy is documented with a validated spike outcome.
