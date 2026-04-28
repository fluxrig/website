---
slug: /reference
title: Technical reference
---

# Technical reference

# Technical reference

Welcome to the **fluxrig** Technical Reference. The documentation is organized into logical domains that follow the data lifecycle from ingestion to orchestration and final verification.

> [!TIP]
> **Architectural Inspiration**: For context on the "Studio & Stage" design philosophy that inspires the system architecture, see the **[Design Philosophy](../overview/philosophy.md)** page.

---

## Data foundations
*The core primitives*

This section covers the foundations of the system: the **[Data model (fluxMsg)](./data_model.md)** primitive, the **[Snake protocol](./protocols.md)** (wire format), and the technical stack that grounds the engine.

## Orchestration & Specs
*Configurations & protocol definitions*

The technical blueprints of the system. Here you will find the **[ISO8583 SDL](./specs/iso8583_sdl.md)** protocol mappings, the **[Orchestration scenarios](./scenario.md)** (execution logic), and the **[Registry](./registry.md)** that manages the entity state.

## Module catalog
*The Gear library*

A comprehensive catalog of every **[Gear](./gears/index.md)** module in the fluxrig ecosystem, grouped by their role: **I/O Modules** for connectivity, **Codec Modules** for translation, and **Logic Modules** for advanced orchestration.

## Control & Observability
*Management & monitoring*

The administrative interface of the fluxrig fleet. Contains the **[Mixer API](./api.mdx)** reference, the **[CLI](./cli.md)** reference, and the **[Telemetry](./telemetry_analytics.md)** reference for real-time observability.

## Verification & SDK
*Extension & QA*

Tools for extending the platform and ensuring data integrity. Includes high-performance tools for building custom extensions via the **[Go SDK](./sdk.md)** and verifying system behavior with the **[Robot Framework](./robot_framework.md)**.
