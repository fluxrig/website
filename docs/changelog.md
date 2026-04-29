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
| [Unreleased](#unreleased) | | Active | Feature expansion ({{VERS}}-dev) |
| [v0.4.5](#v045) | 2026-04-29 | Delivered | Documentation Hardening & Zero-Config |
| [v0.4.4](#v044) | 2026-04-23 | Delivered | Logic Extensibility & Secure Enrollment |
| [v0.4.3](#v043) | 2026-02-19 | Delivered | Operational Resilience & NATS V2 |
| [v0.4.2](#v042) | 2026-02-15 | Delivered | Spec Management & E2E Automation |
| [v0.4.1](#v041) | 2026-02-09 | Delivered | Stateless Context & I/O Decoupling |
| [v0.4.0](#v040) | 2026-02-01 | Delivered | ISO8583 Native Gear & Telemetry QoS |
| [v0.3.0](#v030) | 2026-01-21 | Delivered | Bento Integration & Load Testing |

<a name="unreleased"></a>
### [Unreleased] ({{VERS}}-dev)

<a name="v045"></a>
### [v0.4.5] - 2026-04-29
#### Added
- **Zero-Config Cluster Authority**: Implemented automatic generation of persistent cluster keys upon first run, eliminating manual PKI bootstrapping for development environments.
- **Global Gear Deployment**: Introduced automatic "all-rack" gear targeting for scenarios without explicit deployment tags.
- **Open Documentation Model**: Officially transitioned documentation sources to a public repository ([fluxrig/website](https://github.com/fluxrig/website)), enabling community contributions and improved transparency.

#### Improved
- **Documentation Accessibility (Feedback-Driven)**: Strictly isolated the "Studio & Stage" professional audio metaphor to a dedicated philosophy page. This ensures that the primary technical documentation remains accessible and clear to users unfamiliar with audio engineering nomenclature.
- **Enhanced Usage Examples**: Expanded the `examples/` directory with production-ready scenario templates and better-documented CLI workflows based on user feedback.
- **Observability Precision**: Refined OTel tracing attributes to correctly reflect both infrastructure (`messaging.trace_id`) and business (`flux.id`) identities.

#### Fixed
- **Port Conflict Management**: Resolved an issue where dynamic port selection (port -1) would fail during pre-flight availability checks.
- **DuckDB Path Safety**: Hardened database initialization logic to prevent accidental directory-as-file IO errors.

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

[Unreleased]: https://github.com/jaab-tech/fluxrig/compare/v0.4.5...HEAD
[v0.4.5]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.4.5
[v0.4.4]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.4.4
[v0.4.3]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.4.3
[v0.4.2]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.4.2
[v0.4.1]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.4.1
[v0.4.0]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.4.0
[v0.3.0]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.3.0
[v0.2.0]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.2.0
[v0.1.0]: https://github.com/jaab-tech/fluxrig/releases/tag/v0.1.0