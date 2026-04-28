---
slug: /overview/philosophy
title: Design philosophy
---

<!-- Copyright (c) 2026 JAAB Tech SAS, Uruguay All Rights Reserved -->
<!-- See https://jaab.tech -->

# Design philosophy: The professional audio logic

While **fluxrig** is a technical orchestration engine, its architecture is built on the principles of professional audio engineering. We believe that managing distributed data flows is fundamentally similar to managing high-fidelity signals in both a controlled **Recording Studio** and a massive **Live Event Stage**.

By borrowing this nomenclature, we provide a consistent mental model for complex distributed systems at any scale.

## Why the audio metaphor?

In professional audio, whether capturing a delicate performance or managing a stadium concert, signal integrity is paramount. Engineers need to:
1.  **Isolate** processing logic into modular units.
2.  **Route** signals deterministically through persistent paths.
3.  **Monitor** every point in the chain without interfering with the primary flow.
4.  **Orchestrate** at scale, connecting multiple remote "stages" to a central authority.

FluxRig applies these same requirements to mission-critical infrastructure.

### The Studio vs. The Stage

*   **The Studio Logic**: Focuses on **precision and fidelity**. Like a high-end signal chain, every transformation in FluxRig is deterministic and bit-perfect. It is about the "Hot Path" of data processing.
*   **The Stage Logic**: Focuses on **scale and distribution**. Just as a massive festival has multiple stages (Racks) connected to a central Front of House (FOH) console (The Mixer), FluxRig manages thousands of edge nodes as a single, cohesive event.

## Our nomenclature

| Term | Technical definition | Studio analogy |
| :--- | :--- | :--- |
| **Mixer** | The centralized control plane and entity registry. | The **Front of House (FOH)** or Studio Mixing Console. |
| **Rack** | A localized edge node (agent) that executes logic. | An **Equipment Rack** containing specialized hardware. |
| **Gear** | A modular unit of logic (e.g., protocol codec or transformation). | A **Functional Pedal** or effect unit. |
| **Wire** | A persistent, ordered queue (NATS JetStream). | A **Signal Path** or patch cable. |
| **Snake** | A secure, multiplexed mTLS tunnel between Rack and Mixer. | A **Multi-core Snake** cable used for long-distance routing. |
| **fluxMsg** | The standardized data structure (CBOR) for all system signals. | A **High-Fidelity Signal** normalized for processing. |

## The "Studio" in practice

When you deploy fluxrig, you are effectively building a distributed "recording studio" for your data:

-   **Modular Processing**: Just as you can swap a guitar pedal, you can swap a **Gear** (e.g., switching from ISO8583 to JSON) without changing your infrastructure.
-   **High-Fidelity Observability**: We "tap" the signal at the Gear level, providing OpenTelemetry traces that are bit-perfect representations of the data flow.
-   **Resilient Patching**: Our **Wires** are persistent. If a destination is offline, the signal is "buffered in the wire" until it can be safely delivered, ensuring no data loss.

---

> [!TIP]
> This metaphor is used throughout the documentation to provide clarity, but the underlying technology remains a standard, high-performance Go-based distributed system.
