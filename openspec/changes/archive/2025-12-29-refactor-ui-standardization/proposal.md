# UI Standardization Refactor

## What

Refactor all page components and layouts within the `src/app` directory to align with the standardized UI Design System.
Standardization of page headers, content containers, spacing, and typography across the application.

## Why

- To ensure visual consistency and a premium user experience across all routes.
- To eliminate ad-hoc styling and hardcoded values in favor of a unified design system.
- To improve code maintainability by reducing duplicate style definitions.

## How

- Audit all `page.tsx` and `layout.tsx` files in `src/app` to identify non-compliant UI patterns.
- Replace ad-hoc HTML/CSS implementations with shared UI components (e.g., `PageHeader`, `Container`, `Button`) where applicable.
- Standardize layout spacing, padding, and margins using the project's design tokens (Tailwind classes).
- Ensure all pages fully support responsive breakdowns (mobile, tablet, desktop).
- Fix any accessibility violations found during the refactor (e.g., proper heading hierarchy, contrast ratios).

## Where

- Target Directory: `src/app/**/*` (all nested routes and pages).
- Key Files: `page.tsx`, `layout.tsx`, and associated local components for each route.

## Define

- **Standard Layout Structure**: Define the required nesting of Layout -> Container -> PageHeader -> Content.
- **Design Token Usage**: Mandate the use of semantic colors (e.g., `bg-background`, `text-foreground`) over arbitrary values.
- **Component Replacement**: List specific ad-hoc patterns (e.g., raw `<button>`) that must be replaced with library components (e.g., `<Button>`).
