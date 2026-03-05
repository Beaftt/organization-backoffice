---
description: Analyse the current git changes and generate a complete Pull Request description for the backoffice with summary, changed files, how to test, and a checklist.
name: create-pr
agent: agent
tools:
  - changes
---

Analyse the current git changes and generate a complete Pull Request description.

## Pull Request template

### Title
Format: `feat(module): short imperative description` or `fix(module): ...` based on the changes.

### Description
- What is the purpose of this PR?
- What pages or components are affected?
- Are there any breaking changes to existing UI?

### What was changed
List changes grouped by type:
- New pages or routes added.
- New or updated UI components.
- API functions added or modified.
- Design system changes.
- Tests added.

### How to test
Step-by-step manual testing instructions.
- Include: desktop (1280px+), tablet (768px), mobile (375px).
- Include: light mode and dark mode.

### Checklist
```
- [ ] Tests passing (`yarn test:ci`)
- [ ] Build passing (`yarn build`)
- [ ] Lint passing (`yarn lint`)
- [ ] Responsive — tested at 375px, 768px, 1280px+
- [ ] Dark mode — tested and visually correct
- [ ] No hardcoded colors — design tokens used
- [ ] Accessibility — roles and labels present
- [ ] No `console.log` left in code
- [ ] No relative `../../` imports — `@/` alias used
```

### Related issues
List related GitHub issues if any.

## Rules
- Title must follow Conventional Commits format.
- Never commit directly to `main` or `develop`.
- Branch must target `develop` (unless hotfix targeting `main`).
