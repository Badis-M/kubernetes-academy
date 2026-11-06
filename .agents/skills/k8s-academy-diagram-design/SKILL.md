---
name: k8s-academy-diagram-design
description: Identify and design useful Kubernetes Academy teaching diagrams. Use to assess diagram gaps, refine existing visual explanations or implement an approved diagram.
---

# Design teaching diagrams

- Read the surrounding lesson in both languages and inventory the existing visuals in src/components/diagrams and the lesson's diagram blocks. Identify the question the learner should be able to answer after seeing the visual.
- For each candidate, specify the chapter ID or URL, heading and insertion point, teaching gap, actors, arrow meanings or state transitions, scope and assumptions. Distinguish traffic, API requests, ownership, selection and reconciliation where relevant. Verify version-dependent behavior against the chapter baseline and primary sources.
- Prefer a static diagram for a fixed structure or flow. Add interactivity when a control or step-through reveals a meaningful change or lets the learner test a prediction. Document simplified behavior and important boundaries in the caption or nearby text.
- Plan FR and EN labels, a text explanation, a mobile layout and keyboard access for any controls. Avoid relying on color alone. Reuse a suitable existing visual before introducing a new one.
- During a review, return prioritized proposals and a concise wireframe or description where useful. If implementation is requested, use the typed DiagramName and Block integration in src/content/types.ts and the renderer in src/components/diagrams/Diagram.tsx. Check the result in both languages and viewport sizes, and verify interactive states when present.
