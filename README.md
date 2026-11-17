# Time Off

A mobile-first app for requesting and approving time off. Employees submit leave requests and track their status; supervisors review their team's requests and approve or reject them.

Built with **Ionic 9**, **Angular 22** (standalone components and signals) and **Capacitor 8**. There is no backend: a mock API service stores data in `localStorage`.

---

## Getting started

### Install and run

```bash
git clone https://github.com/hrchvlc/time-off-app.git
cd time-off-app
npm install
npm start
```

Open http://localhost:4200

## Scripts

| Command                     | Description                                     |
| --------------------------- | ----------------------------------------------- |
| `npm start`                 | Start the dev server at http://localhost:4200   |
| `npm run build`             | Production build to `dist/timeoff-app`          |
| `npm test`                  | Run unit tests with Vitest in watch mode        |
| `npx ng test --watch=false` | Run the tests once                              |
| `npm run lint`              | Lint with ESLint                                |
| `npm run format`            | Format all files with Prettier                  |
| `npm run format:check`      | Check formatting without changing files         |
| `npm run storybook`         | Start Storybook at http://localhost:6006        |
| `npm run build-storybook`   | Build a static Storybook to `storybook-static/` |

### Running on Android (optional)

The project includes a Capacitor Android platform. With Android Studio installed:

```bash
npm run build
npx cap sync android
npx cap open android
```

---

## Testing

Unit and component tests use **Vitest** through Angular's `@angular/build:unit-test` builder with jsdom.

| Area                                                       | File                                  |
| ---------------------------------------------------------- | ------------------------------------- |
| App shell / account switching                              | `app.spec.ts`                         |
| Role guard (wrong role or signed out is redirected)        | `role.guard.spec.ts`                  |
| Employee overview ("Request time off" button, days left)   | `employee-overview.page.spec.ts`      |
| New request modal (form, validation, note, submit)         | `new-request.modal.spec.ts`           |
| Supervisor approve/reject with decider and optional note   | `supervisor-overview.page.spec.ts`    |
| Request card (decider, supervisor note, decision buttons)  | `request-card.component.spec.ts`      |
| Allowance summary (days left, used, pending, progress bar) | `allowance-summary.component.spec.ts` |
| Mock API service (load, save, decision, corrupted storage) | `local-storage.service.spec.ts`       |
| Date range validator (end before start)                    | `date-range.validator.spec.ts`        |
| Working days validator (weekend-only requests)             | `working-days.validator.spec.ts`      |
| Max duration validator                                     | `max-duration.validator.spec.ts`      |
| Allowance validator (not enough days left)                 | `allowance.validator.spec.ts`         |
| Allowance utility (used, pending and left days)            | `allowance.util.spec.ts`              |
| Date utilities                                             | `date.util.spec.ts`                   |

```bash
npx ng test --watch=false
```

---

## Storybook

`RequestCard`, `AllowanceSummary` and `EmptyState` have stories. The request card stories cover each status and the employee and supervisor variants.

```bash
npm run storybook
```

---

## Use of AI

In line with the assignment guidelines, this section describes where AI was used. I used **Claude Code** as a coding assistant throughout the project.

My workflow was to always start with my own approach first. I then used AI to review it or suggest alternatives, and adopted its suggestions only when they were more sound than my original solution.

### AI-assisted work

I built the following parts together with AI. I defined what was needed, reviewed the suggested code and adapted it to the project:

- **Tests:** Vitest configuration and the unit and component tests listed in [Testing](#testing).
- **Storybook:** Storybook configuration and the stories for `RequestCard`, `AllowanceSummary` and `EmptyState`.
- **Mock API service:** the `localStorage`-based service that replaces a backend, including handling of missing or corrupted data.
- **Design and CSS:** AI helped shape the visual design and CSS files. Some styling is based on its suggestions, which I then adjusted to fit the app.

### AI as a technical reference

- **Code review and refactoring:** I used AI to review my code and point out improvements in structure and best practices. I decided which suggestions to adopt and implemented the refactoring myself.

### Independent work

I designed and implemented the application architecture, features, pages, components myself.
