# Balance Design System Skill

## Purpose
Use this skill for any UI/design/frontend change in `finance-mvp`.  
Goal: keep the product visually consistent, mobile-first, and easy to evolve.

## Brand Direction
- Visual tone: clean finance app with neutral grayscale surfaces and green accent.
- Primary accent color is fixed: `#9CE66F`.
- Avoid adding new “primary” colors.

## Token Source of Truth
All tokens live in:
- `app/globals.css`

Mandatory tokens:
- `--color-accent` and `--color-accent-text`
- `--color-action`, `--color-action-hover`, `--color-action-contrast`
- `--color-auth-panel`, `--color-auth-field`
- `--radius-pill`, `--radius-card`, `--radius-shell`
- `--shadow-card`, `--shadow-shell`

Rule:
- Do not hardcode hex colors in product components unless there is no token equivalent and it is justified.
- If a new visual role is needed, add a token first, then use it.

## Component Rules
Always use shared primitives for forms/actions:
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/select.tsx`
- `components/ui/card.tsx`
- `components/ui/badge.tsx`

Button policy:
- Primary actions: `variant="primary"` (green accent).
- Secondary actions: `variant="secondary"`.
- Destructive actions only when truly destructive.
- Do not apply global drop shadows to shared button variants; keep buttons flat by default.
- If a button needs emphasis, use color/weight/size first, not shadow.

Input policy:
- Pill radius from token.
- Surface background from token.
- Focus ring uses action token.

## Layout Rules
- Mobile-first by default.
- Use shared mobile frame structure:
  - `.app-mobile-root`
  - `.app-mobile-frame`
- Keep zero horizontal overflow.
- Do not set a fixed background color in `.app-mobile-frame` globally.
- Set frame background per context:
  - Auth screens can keep a dark hero background.
  - Private app/onboarding should explicitly set shell background class.

## Auth Contrast Rules
- Auth top area must preserve dark-vs-light contrast (dark hero + lighter form panel).
- Form panel should use `--color-auth-panel`.
- Auth fields should use `--color-auth-field` and visible border separation.
- Verify login readability in both `/{locale}/login` and `/{locale}/register`.

## Coherence Checklist (Before Closing)
- Accent green appears consistently in primary actions and highlights.
- Same radius language across screens (pill + card + shell).
- No mismatched button styles between auth/onboarding/app/settings.
- Forms (auth, onboarding, accounts) share the same field style.
- Navigation style consistent with the same token palette.
- No unwanted white/gray wash in auth header background.
- Primary buttons do not have global shadows.

## QA Commands
Run before finalizing:
- `npm run lint`
- `npm run typecheck`
- `npm run test:e2e -- tests/e2e/public-flow.spec.ts`

## Documentation Discipline
After code changes:
- Update `CHANGELOG.md`.
- If priority/scope changes: update `BACKLOG.md`.
