---
name: k8s-academy-curriculum-review
description: Review Kubernetes Academy lessons, quizzes, examples and labs for bilingual teaching quality and Kubernetes accuracy. Use for a chapter, a level or a full curriculum review.
---

# Review the curriculum

- Read the repository's AGENTS.md. Derive chapter IDs and level order from src/content/curriculum.ts. For a full review, also include the optional preparation in src/content/before-you-begin.ts, the guided lab and the source-file descriptions.
- Read both languages and every applicable block, including quiz feedback, hints and hidden solutions. Check whether prerequisites are taught in time, terminology is consistent, outcomes are observable and each quiz answer follows from the lesson. Compare FR and EN for meaning and caveats. Preserve technical names and literal code.
- Trace runnable instructions from setup through diagnosis and cleanup. Compare references and raw imports against the actual files under lab/. Check context, namespace, ownership, privileges, dependencies, expected results and failure paths. Distinguish commands, file contents, snippets and expected output.
- Use docs/content-sources.md to find versioned primary sources. Verify disputed or version-sensitive claims against the versions taught, using the baseline in lab/README.md and any chapter-specific pins. Treat docs/content-review.md and docs/content-implementation.md as historical evidence.
- Use the relevant offline checks declared in package.json or the lab's own instructions when useful. Report separately what was read, parsed, rendered, unit-tested and run in a cluster. A review request does not authorize cluster operations.
- Record coverage per requested chapter or page, including gaps. For each finding give the chapter ID and section, affected language, observed text or command, impact, evidence and proposed correction. Apply changes only when the task calls for them.
