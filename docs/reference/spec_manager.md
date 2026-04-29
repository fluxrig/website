---
slug: /reference/core/spec-manager
title: Spec & scenario manager
---

<!-- Copyright (c) 2026 JAAB Tech SAS, Uruguay All Rights Reserved -->
<!-- See https://jaab.tech -->

# Spec & scenario manager

The **Spec & Scenario Manager** provides a local, Git-friendly registry for Specs and Scenarios. It uses a Content-Addressable Store (CAS) to ensure every version is immutable, auditable, and reproducible.

## Architecture

```
data/store/
├── index.json         # name → tag → hash mapping
├── blobs/             # SHA-256 content blobs (sharded)
│   ├── a1/
│   │   └── a1b2c3...
│   └── d4/
│       └── d4e5f6...
```

- **CAS store**: Each artifact (spec or scenario YAML) is hashed with SHA-256 and stored as an immutable blob.
- **Index**: A JSON file mapping logical `name → tag → hash`, supporting both Specs and Scenarios.

## URN scheme

Artifacts are referenced using the short `name:tag` format:

| Format | Example | Resolution |
| :--- | :--- | :--- |
| `name:tag` | `visa:v1.0.0` | Look up hash in index under name + tag. |
| `name:latest` | `visa:latest` | Resolve to the highest SemVer tag for that name. |
| `sha256:hash` | `sha256:a1b2c3...` | Direct CAS blob lookup. |

> [!NOTE]
> **Resolution Timing**: URNs are resolved **on boot or reload**. If a gear is configured with `visa:latest`, it grabs the newest version available at the moment it starts. Importing a newer version into the store later does *not* automatically hot-swap the active gear; a scenario restart is required.

> [!NOTE]
> Tags must follow [Semantic Versioning](https://semver.org) (e.g., `v1.0.0`, `v2.1.3`).

## CLI commands

### Import

Snapshot a local file into the CAS:

```bash
# Import a spec
fluxrig spec import card_schema.yaml --name visa --tag v1.0.0

# Import a scenario
fluxrig scenario import payment_flow.yaml --name payment-flow --tag v1.0.0
```

If `--tag` is omitted, the manager auto-increments the minor version from the latest existing tag.

### List

```bash
fluxrig spec list
fluxrig scenario list
```

## Mixer integration

The Mixer uses the manager at startup to resolve `name:tag` scenario references (see [Scenario Reference](scenario.md#startup-resolution)). The resolution flow:

1. Parse the reference string.
2. If it contains `/` → treat as file path, read from disk.
3. If empty → resume last active scenario from the store.
4. Otherwise → open `data/store/`, call `manager.Load(urn)` to resolve `name:tag` from the CAS.

## Relationship to specs

Scenarios can reference Specs in their YAML:

```yaml
name: Payment Processing
spec: visa:v1.0.0
```

The `spec:` field uses the same `name:tag` URN scheme. At runtime, the Mixer resolves the spec reference through the same CAS store.