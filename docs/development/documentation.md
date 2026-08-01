---
slug: /development/documentation
title: Documentation & diagrams
---

<!-- Copyright (c) 2026 JAAB Tech SAS, Uruguay All Rights Reserved -->
<!-- See https://jaab.tech -->

# Documentation & diagrams

Parts of this documentation are **generated from the source of truth** so they cannot drift from the code: gear reference sections come from each gear's manifest, and structural diagrams can be generated from real scenario YAML. This page explains how those pipelines work and how to regenerate them.

## Gear reference from the manifest

Each gear declares a [manifest](../reference/gears/index.md) (identity, ports, configuration JSON Schema). The reference page for every gear carries a generated **Reference** section, rendered from that manifest, between markers:

```markdown
<!-- AUTOGEN:manifest:conductor START ... -->
...generated identity / ports / configuration tables...
<!-- AUTOGEN:manifest:conductor END -->
```

- Preview one gear's section: `fluxrig gears doc conductor` (or `--all`).
- Inspect the raw manifest: `fluxrig gears manifest conductor` (JSON) / `fluxrig gears list`.
- Refresh every page in place: `make gear-docs` (needs `GEAR_DOCS_DIR` set in `.env.local`; it runs `fluxrig gears doc --write <dir>`, keyed by the gear type in the marker, and is idempotent).

To add the section to a new gear page, drop an empty marker pair (`<!-- AUTOGEN:manifest:<type> START -->` / `... END -->`) where you want it and run `make gear-docs`. Free-text fields are MDX-escaped automatically (Docusaurus renders `.md` as MDX).

## Interactive diagrams: LikeC4 vs mermaid

The site renders two diagram engines. Choose by **what the diagram is**:

| Diagram is… | Use | Why |
| :--- | :--- | :--- |
| System **structure** (racks, gears, wires, external systems) | **LikeC4** | Interactive (pan/zoom/drill-in); can be generated from real scenarios so it never drifts |
| A **sequence** of messages over time | **mermaid** `sequenceDiagram` | LikeC4 models structure, not time |
| A linear **process/workflow** (stages A→B→C) or a **data schema** | **mermaid** | Not an architecture; LikeC4 adds no value |

### Projects: one model per project

Each LikeC4 model is its **own project** — a subdirectory of `website/likec4/` with its own `specification` and views. Keeping them separate is what prevents one model's elements from bleeding into another's views (a scenario's `index` view includes everything *in its project*). Each project is generated to its own module under `src/generated/likec4/<project>.mjs`.

Today: `website/likec4/concepts/` (hand-authored conceptual diagrams) and `website/likec4/payment-switch/` (generated from a scenario).

### Embedding a view

A view is embedded in any `.md`/`.mdx` doc with a global component (no import needed); pass the **project** and the **view id**:

```mdx
<LikeC4 project="concepts" view="pipeline" height={240} />
```

The component is client-only. `height` is a fixed viewport (the diagram fits inside, pan/zoom for detail); size it to the diagram — small for wide/short views, larger for dense ones. A new project must also be registered in `src/components/LikeC4/index.tsx` (a one-line entry in `PROJECTS`).

### Conceptual models (hand-authored)

For diagrams that are not a specific deployment (e.g. the generic rack pipeline), author a LikeC4 model in `website/likec4/concepts/`. It is a self-contained project: it declares its own `specification` and views.

### Scenario-generated models (from real YAML)

A topology diagram of an actual deployment is generated from its scenario into its own project directory, so the diagram and the wiring can never disagree:

```bash
# from the fluxrig source repo, into a new project dir under website/likec4/
fluxrig scenario viz examples/scenarios/payment_switch_two_regions.yaml \
  -o ../fluxrig-ops/website/likec4/payment-switch
```

This emits a self-contained `.likec4` (specification + model + views). Its view ids are stable and descriptive: `index` (the whole scenario), `of_rack_<name>` (one rack expanded), `gear_<name>` (a gear's neighbourhood). Add the project to `PROJECTS` in the component and the `likec4:gen` script, then embed with `<LikeC4 project="payment-switch" view="index" />`.

### Regenerating and previewing

- `make likec4-gen` — regenerate the React views (`src/generated/likec4-views.mjs`) from every `.likec4` in `website/likec4/`.
- `make docs-preview` — regenerate the views **and** serve the site locally (interactive). Use this, not a bare `npm run start`, so the in-progress version and fresh diagrams are included.

The generated `src/generated/likec4-views.mjs` is committed, so a public release build needs no LikeC4 tooling; `make gear-docs` / `make likec4-gen` refresh the committed artifacts when the manifest, a model, or a scenario changes.

> **Version pin.** The docs use `likec4@1.50.0`: it supports React 18 (the current Docusaurus stack), whereas newer LikeC4 requires React 19. Bump it only together with a Docusaurus/React upgrade.
