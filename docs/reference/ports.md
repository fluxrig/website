---
slug: /reference/signals/ports
title: Ports and nomenclature
---

<!-- Copyright (c) 2026 JAAB Tech SAS, Uruguay All Rights Reserved -->
<!-- See https://jaab.tech -->

# Ports and nomenclature

This document serves as the authoritative reference for network port assignments and naming conventions within the **fluxrig** project.

## 1. Network Port Registry

To prevent conflicts and ensure consistent test automation, the following port namespaces are reserved:

By default, fluxrig components communicate using the following standard ports:

- **4222**: NATS (Client port)
- **8222**: NATS (Monitoring port)

| Component | Default (Production) | Test (Robot/E2E) | Description |
| :--- | :--- | :--- | :--- |
| **Mixer API** | `8090` | `18080` | Control Plane REST/HTTP API |
| **Snake (NATS)** | `4222` | `14222` | Embedded Message Bus (gossip/client) |
| **ISO8583 Gear** | `8583` | `8586` | Standard ISO8583 listener |
| **Bento Gear** | `8000` | `18000` | HTTP/JSON Bridge Gear |

> [!IMPORTANT]
> **Robot Framework Overrides**: Always use the `${MIXER_PORT}` and `${NATS_PORT}` variables in Robot suites. The `FluxRigLibrary` automatically tracks these overrides to ensure telemetry and metrics collection connect to the correct instances.

---

## 2. Nomenclature Standards

### Project Branding
*   **Formal Name**: `fluxrig` (Always lowercase in text, headings, and filenames).
*   **Avoid**: `Flux`, `fluxrig` (PascalCase), `fluxrig` (unless in ENV vars).

### Technical Identifiers
We use the abbreviated `flux.` prefix for internal system primitives to maintain brevity in high-volume streams:

*   **NATS Subjects**: `flux.msg.>`, `flux.telemetry.>`, `flux.ctrl.>`
*   **Log Attributes**: `flux.type`, `flux.name`, `flux.id`
*   **File Extensions**: `.flux` (e.g., `state.flux` for Rack Passports)
*   **Data Structures**: `fluxMsg`, `FluxID` (PascalCase in Go code, camelCase in serialized JSON/CBOR).

---

## 3. Environment Variable Standards

All configuration overrides must use the `FLUXRIG_` prefix:

*   `FLUXRIG_API_PORT`
*   `FLUXRIG_SNAKE_PORT`
*   `FLUXRIG_LOG_LEVEL`
