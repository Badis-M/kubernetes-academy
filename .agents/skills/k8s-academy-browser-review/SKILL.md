---
name: k8s-academy-browser-review
description: Review the rendered Kubernetes Academy site in French and English. Use for browser navigation, accessibility, responsive layout, learner interactions or local SSR verification.
---

# Review the rendered site

- Read AGENTS.md and inventory src/routes and src/content/curriculum.ts for the requested scope. For a full review include all published chapter URLs, both legacy redirects and a missing route or chapter. Check redirect status and destination separately from the destination page.
- Use a loopback server. For production-style verification, run bun run build and bun run test:e2e using playwright.config.ts and e2e/production.spec.ts. Confirm which server and build are under test. Keep analytics requests stubbed when exercising the site with a custom browser script. Record development-mode checks as such.
- Check FR and EN in clean browser contexts and verify language changes across navigation and reload. On desktop and a narrow viewport, inspect the header, curriculum anchors, chapter navigation, reading order, long code and tables, and diagram overflow. Check keyboard focus and relevant controls with the keyboard.
- Exercise a representative case for each shared interaction, including copy, quiz feedback, hint/solution reveal and saved progress. Check exact clipboard contents only when observable. Report shared interaction coverage separately from route-by-route rendering. Keep test progress in disposable browser contexts.
- When in scope, compare SSR HTML with hydrated content and inspect console errors, failed requests, metadata and local response headers. Local Worker evidence does not establish production hosting behavior.
- Record URL, language, viewport, steps, expected and observed behavior, and available evidence. Separate routes merely fetched from pages visually inspected and interactions actually exercised. Apply changes only when the task calls for them.
