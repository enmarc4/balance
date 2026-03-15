# Backlog

## Current Status

- Sprint 1 (auth + onboarding + accounts) is implemented.
- Scope expanded to ensure transactions are structurally ready with `name` + `category`.
- Scope refined with a unified mobile-first UI system and step-by-step onboarding flow.
- Accounts module now supports both archive and unarchive actions.
- Movements started from Home with a bottom-sheet quick entry (`income`/`expense`) without navigation.

## Next Priorities (Sprint 2)

1. Movements module:
   - Expand quick-entry modal with richer category UX and optional notes
   - Category picker and category CRUD
   - Transaction list with filters by account, category, date and type
2. Recurrences:
   - CRUD UI for recurring transactions
   - Background run strategy and `recurrence_runs` audit table
3. Dashboard intelligence:
   - Account-level trends
   - Category breakdown and monthly comparison
4. Product quality:
   - Visual regression baselines
   - Expanded e2e coverage for authenticated flows
   - Theme/token regression checks for cross-screen visual consistency
5. Security hardening:
   - RLS policy tests against cross-user access attempts
   - Database constraint checks for category/account ownership

## Later (Sprint 3+)

1. Budgets and savings goals
2. CSV import/export
3. Shared accounts / collaboration
4. Banking integrations
