---
slug: /changelog
title: Changelog
---

# Changelog

[![Keep a Changelog](https://img.shields.io/badge/changelog-Keep%20a%20Changelog%201.0.0-orange.svg)](https://keepachangelog.com/en/1.0.0/)
[![Semantic Versioning](https://img.shields.io/badge/semver-2.0.0-blue.svg)](https://semver.org/)

All notable changes to the **fluxrig** project are documented here. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) principles, with entries organized by **Phase** to align technical progress with strategic goals.

## Phase 3: open & flexible logic

| Version | Date | Status | Summary |
| :--- | :--- | :--- | :--- |
| [Unreleased](#unreleased) | | Active | Hardening & CI/CD Orchestration ({{VERS}}-dev) |
| [v0.4.4](#v044) | 2026-04-23 | Delivered | Logic Extensibility & Secure Enrollment |
| [v0.4.3](#v043) | 2026-02-19 | Delivered | Operational Resilience & NATS V2 |
| [v0.4.2](#v042) | 2026-02-15 | Delivered | Spec Management & E2E Automation |
| [v0.4.1](#v041) | 2026-02-09 | Delivered | Stateless Context & I/O Decoupling |
| [v0.4.0](#v040) | 2026-02-01 | Delivered | ISO8583 Native Gear & Telemetry QoS |
| [v0.3.0](#v030) | 2026-01-21 | Delivered | Bento Integration & Load Testing |

<a name="unreleased"></a>
### [Unreleased] ({{VERS}}-dev)
#### Added
- **Showroom Hygiene**: Implemented automated branch/tag cleanup for public releases.
- **Deployment History**: Transitioned to clean-commit deployment strategy for `fluxrig.org`.
- **Documentation Overhaul**: Transitioned to utility-first messaging, isolating the 'Studio & Stage' metaphor to a dedicated philosophy page to improve technical accessibility.

<a name="v044"></a>
### [v0.4.4]
#### Added
- **Orchestration logic**: Implemented **Event-Based Data-Plane Synchronization** via mandatory probe handshakes.
- **Integrity guardrails**: Enforced bit-perfect UTF-8 validation and transparent hex-encoding for binary metadata.

#### Changed
- **Deterministic serialization**: Migrated internal wire-formats from **Msgpack** to **Deterministic CBOR (RFC 8949)** for bit-perfect integrity and institutional data-plane trust.

#### Security
- **Enrollment security**: Hardened edge adoption protocols with **nonce-based session isolation**.

<a name="v043"></a>
### [v0.4.3]
#### Added
- **Operational resilience**: Implemented automated blind-retry logic and high-fidelity I/O buffering.
- **Contextual observability**: Enhanced distributed tracing with deep context-awareness.

#### Changed
- **NATS V2 stabilization**: Migrated to the JetStream V2 SDK with high-performance ephemeral consumers.
- **License compliance**: Standardized all source files with authoritative SPDX headers.

<a name="v042"></a>
### [v0.4.2]
#### Added
- **Spec & scenario manager**: Introduced a **CAS-backed** registry for managing protocol specifications.
- **E2E automation**: Launched a comprehensive test runner for validating spec lifecycles.

#### Changed
- **Gear standardization**: Unified networking gears under the `simple_tcp` naming convention.

#### Removed
- **Architectural hardening**: Decommissioned redundant bus KV implementations.

<a name="v041"></a>
### [v0.4.1]
#### Added
- **Stateless context (Coat Check)**: Implemented the architectural pattern for managing detached state.

#### Changed
- **I/O decoupling**: Refactored the networking layer to cleanly separate TCP management from logic.

<a name="v040"></a>
### [v0.4.0]
#### Added
- **ISO8583 native gear**: Initial release of the high-performance payment switch Gear baseline.
- **Telemetry governor**: Introduced **QoS** traffic shaping for telemetry ingress.

<a name="v030"></a>
### [v0.3.0]
#### Added
- **Bento integration**: Native support for the Bento ecosystem (100+ connectors).
- **Load testing suite**: Integrated high-performance capabilities for stress testing pipelines.

## Phase 2: core runtime

| Version | Date | Status | Summary |
| :--- | :--- | :--- | :--- |
| [v0.2.0](#v020) | 2025-12-28 | Delivered | Observability Stack & TLS Foundations |

<a name="v020"></a>
### [v0.2.0]
#### Added
- **Observability stack**: Full OpenTelemetry integration (metrics, traces) with DuckDB backend.
- **TLS support**: Enabled mutual TLS for internal bus and HTTPS for management API.

#### Changed
- **Configuration v2**: Unified TOML-based configuration schema.

## Phase 1: architecture & foundation

| Version | Date | Status | Summary |
| :--- | :--- | :--- | :--- |
| [v0.1.0](#v010) | 2025-12-12 | Delivered | Initial engine architecture and Snake Protocol |

<a name="v010"></a>
### [v0.1.0]
#### Added
- **Foundation**: Initial release of the core engine architecture.
- **Snake protocol**: Secure tunneling implementation for **Rack-to-Mixer** connectivity.
- **fluxMsg**: Canonical self-describing representation for internal communication.

[Unreleased]: https://github.com/jaab-tech/fluxrig/compare/v0.4.4...HEAD
[v0.4.4]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.4.4
[v0.4.3]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.4.3
[v0.4.2]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.4.2
[v0.4.1]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.4.1
[v0.4.0]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.4.0
[v0.3.0]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.3.0
[v0.2.0]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.2.0
[v0.1.0]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.1.0