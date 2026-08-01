---
slug: /overview/foundation
title: Foundation components
---

<!-- Copyright (c) 2026 JAAB Tech SAS, Uruguay All Rights Reserved -->
<!-- See https://jaab.tech -->

# Foundation components

# Foundation components

**fluxrig** is a high-performance connectivity platform designed to harmonize complex data flows across heterogeneous environments. Whether bridging air-gapped industrial sensors, routing high-capacity payment transactions, or managing distributed IoT fleets, the platform provides a unified, configuration-driven foundation for mission-critical operations.

## Core pillars

1.  **Deterministic Data Plane**: **fluxrig** ensures high-integrity data processing for all workloads (from Modbus registers to ISO8583 financial messages). All data is serialized using **Deterministic CBOR (RFC 8949)**, providing a comprehensive audit trail and high-performance processing.
2.  **Distributed Autonomy**: The local processing node (Rack) operates with full independence. It continues to process data, perform transformations, and maintain compliance even during network backhaul or connectivity failures.
3.  **Unified Control Plane (UCP)**: Manage thousands of heterogeneous distributed nodes as a single, cohesive entity. The Mixer provides a centralized registry, policy enforcement, and real-time telemetry aggregation.
4.  **Remote Fleet Management**: **[Planned]** Future releases will introduce native Over-the-Air (OTA) update capabilities for Racks and Gears, allowing for secure, remote lifecycle management of distributed infrastructure.

## Design philosophy

While the platform is technically a distributed system, its architecture is inspired by the principles of modularity and high-integrity data flow.

> **[Read more about the professional audio logic →](./philosophy.md)**

## Strategic alignment

*   **Industrial (UNS)**: Implements the **Unified Namespace (UNS)** and **Industrial DataOps** principles to transform fragmented OT silos into a contextualized, event-driven hierarchy.
*   **Payments (PCI-DSS)**: Employs the **Stateless Context (Coat Check)** pattern to park correlation context at the edge, keeping the primary processing path lean while the reply is matched back deterministically.
*   **DevOps & SRE**: Delivers **Zero-Agent Observability** (OpenTelemetry) and **Configuration-as-Code** deployments, reducing operational overhead and firewall complexity.

---

## The nervous system (NATS)

The backbone of **fluxrig** is a resilient, distributed messaging mesh that provides the connective tissue for the entire platform.

*   **Goal**: Connect distributed racks securely with **guaranteed delivery**.
*   **The tool**: **[NATS JetStream](https://nats.io)**.
*   **Why**:
    *   **Resilient mesh**: Unlike traditional load balancers, NATS creates a pervasive mesh that handles connectivity gaps automatically.
    *   **Distributed Autonomy**: We leverage "Leaf Nodes" at the infrastructure boundary. A **Rack** operates with **Sovereign Continuity**, continuing to process data and perform local transformations even during network backhaul or connectivity failures.
    *   **Financial-grade reliability**: We use JetStream to ensure **at-least-once** delivery and **strict ordering**, critical for financial events and command protocols.
    *   **Deterministic Data Encoding**: Low-bandwidth serialization via **[CBOR (RFC 8949)](https://cbor.io)** ensures data integrity and responsiveness over satellite or cellular links.

### Stateless context (The Coat Check)

To maintain performance and compliance (like PCI-DSS), we avoid bloating messages with heavy state. Instead, we use a "Coat Check" pattern where correlation context is parked in a ticket store (in-process by default, or a shared store when any instance must redeem the reply) and re-attached, unchanged, when the reply returns.

> [!TIP]
> This pattern keeps the primary processing path lean. It **parks and restores** context; it does not tokenize (surrogate substitution is a separate, roadmap gear), and it is not at-rest encryption (use in-memory storage, run hardened, for regulated data). See the **[Message Flow](../architecture/message_flow.md)** for technical details.

## The dual-pipeline strategy

We distinguish sharply between **Business Data** (Transactions) and **Operational Data** (Metrics/Logs). This requires two distinct pipeline patterns.

### Pipeline A: Business Data pipeline (Gears & Wasm)
*   **Goal**: Process high-performance documents (ISO8583, IoT sensors) and perform flexible data transformations.
*   **The strategy**: An extensible architecture designed for both performance and custom plugins.
    *   **Native gears**: Optimized Go logic for latency-sensitive protocols like **ISO8583** and financial switching.
    *   **WebAssembly (Wasm)**: Sandboxed, polyglot plugins (Rust, C++, TypeScript), allowing for safe third-party extensions.
    *   **Bento integration**: A rich ecosystem of standard cloud connectors (File, Stdout, HTTP) and powerful mapping (**bloblang**).
    *   **Side-Chain Inference**: **[Roadmap]** Asynchronous AI logic for non-deterministic tasks like fraud scoring or synthetic test generation.

### Pipeline B: Operational Data pipeline (OpenTelemetry)
*   **Goal**: Monitor the health of the system and trace transactions.
*   **The tool**: **[OpenTelemetry](https://opentelemetry.io)**.
*   **Strategy**: **Non-Intrusive Telemetry Tapping**.
    *   **Embedded library**: We use the **OTel Go SDK** directly inside the Rack binary; no sidecars or external agents required.
    *   **Telemetry tapping**: Telemetry is collected directly from the processing path and diverted for monitoring without impacting the integrity of the primary data flow.
    *   **Secure transport**: Metrics and traces are serialized and pushed over a secure management tunnel to the central Mixer.
    *   **Aggregation**: The Mixer collects these streams and forwards them to the storage layer for deep analytics.

## Deep storage (Data sovereignty)

*   **The philosophy**: "Your data is yours".
*   **The solution**: Data is persisted in open standards, ensuring an **Immutable Audit Trail**.
    *   **Standard tier**: Zero-dependency local storage using **Parquet** and **DuckDB**.
    *   **Enterprise tier**: **[Roadmap]** Distributed high-availability storage with support for external backends (e.g., ClickHouse or S3-backed data lakes).

*   **The benefit**: Query your audit logs with any modern tool (Spark, pandas, Athena) without vendor lock-in.

---

## Summary: The stack

| Component | Role | Execution Model |
| :--- | :--- | :--- |
| **fluxrig Rack** | The Engine | Main Process |
| **NATS** | Messaging | Embedded Mesh Node |
| **CBOR** | Data Format | Deterministic Binary Encoding |
| **OpenTelemetry** | Observability | Compiled into Binary (Go SDK) |
| **Bento** | Cloud Connectors | Compiled into Binary (Go Module) |
| **ClickHouse** / **DuckDB** | Deep Storage | External DB / Embedded DB |
| **ARC** | Unified Reporting | External Enterprise Layer [Roadmap] |
| **Temporal** | Durable Workflow | External Service [Roadmap] |
| **Wasm** | Sandboxed Logic | Polyglot Plugins |