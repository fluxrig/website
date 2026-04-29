---
slug: /overview/roadmap
title: Product roadmap
---

<!-- Copyright (c) 2026 JAAB Tech SAS, Uruguay All Rights Reserved -->
<!-- See https://jaab.tech -->

# Product roadmap

This roadmap outlines the strategic direction for **fluxrig**. It defines the journey from an orchestration foundation to a high-fidelity, AI-orchestrated patchbay for mission-critical infrastructure.

## Phase 0: proof of concept

| Version | Status | Goal | Description |
| :--- | :--- | :--- | :--- |
| POC | Delivered | Architecture Validation | Validated gRPC vs NATS JetStream, Wasm loading, and protocol parsing. |

## Phase 1: architecture & foundation

| Version | Status | Goal | Description |
| :--- | :--- | :--- | :--- |
| v0.1.x | Delivered | Core Data Physics | Defined the fluxMsg model, Sonyflake identity, and Snake Protocol. |

## Phase 2: core runtime

| Version | Status | Goal | Description |
| :--- | :--- | :--- | :--- |
| v0.2.x | Delivered | Autonomous Execution | Single-binary Rack engine, self-healing connectivity, and DuckDB storage. |

## Phase 3: open & flexible logic

| Version | Status | Goal | Description |
| :--- | :--- | :--- | :--- |
| v0.3.x | Delivered | Universal I/O | Integration with the Bento ecosystem for 100+ connectors. |
| v0.4.x | Active | Public Release | Initial open-source launch and logic extensibility (Native Gears). |
| v0.5.x | Planned | High-Assurance | Distributed state (NATS KV) and HSM/KMS security integration. |

## Phase 4: scale & hardening

| Version | Status | Goal | Description |
| :--- | :--- | :--- | :--- |
| v1.0.x | Planned | Hardened Integrity | Forensic analytics (DuckLake) and production-ready resilience. |

## Phase 5: enterprise control

| Version | Status | Goal | Description |
| :--- | :--- | :--- | :--- |
| v2.0.x | Planned | Global Management | fluxrig Studio (Visual Builder) and Remote Fleet Management (OTA). |
| v2.1.x | Planned | Durable Workflows | Integration with Temporal for long-running business processes. |

## Phase 6: autonomous engineering

| Version | Status | Goal | Description |
| :--- | :--- | :--- | :--- |
| Future | Planned | AI Orchestration | AI-driven configuration and deterministic anomaly detection. |