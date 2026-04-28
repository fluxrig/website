---
slug: /reference/core/protocols
title: Wire protocol (snake)
---

<!-- Copyright (c) 2026 JAAB Tech SAS, Uruguay All Rights Reserved -->
<!-- See https://jaab.tech -->

The `fluxrig` wire protocol...
# Wire protocol (snake)

This document serves as the canonical reference for the internal communication protocols, NATS subject topology, and message specifications used within the **fluxrig** ecosystem.

---

## Snake protocol (the tunnel)

The **Snake Protocol** is the secure transport layer connecting distributed Racks to the central Mixer.

*   **Transport**: NATS TCP + TLS.
*   **Security**: Mutual TLS (mTLS).
*   **Encoding**: Binary (CBOR).

---

## NATS subject topology

**fluxrig** utilizes a hierarchical subject space (JetStream) to segregate traffic types.

| Scope | Pattern | NATS Strategy | Role |
| :--- | :--- | :--- | :--- |
| **Control** | `flux.gear.>` | `WorkQueue` | Command & Control (RPC). Targeted commands from Mixer to Rack. |
| **Events** | `flux.telemetry.>` | `Stream` | System events (Audit logs, Status changes, Telemetry). |
| **Data** | `flux.msg.>` | `Stream` | High-volume `fluxMsg` traffic (The Hot Path). |

### Detailed subject structure

#### Control plane
*   `flux.gear.rpc.{rack_id}`: Targeted RPC calls to a specific Rack.
*   `flux.gear.broadcast`: Global commands to all Racks.

#### Data plane (hot path)
*   `flux.msg.{rack_id}.{gear_id}.in`: Input queue for a specific Gear.
*   `flux.msg.{rack_id}.{gear_id}.out`: Output stream from a specific Gear.

### Quality of service (QoS) & prioritization
To ensure the resilience of the platform during high-load scenarios, **fluxrig** implements strict QoS separation:

*   **Business Traffic (`flux.msg.>`):** Given highest priority. NATS memory limits and JetStream buffers are provisioned to guarantee < 500ms delivery latency for transactional (`fluxMsg`) data.
*   **Telemetry Traffic (`flux.telemetry.>`):** Locally queued (embedded tier) and rate-limited. If uplink bandwidth is constrained, telemetry ingestion is throttled (Token Bucket) to prevent bufferbloat from stalling primary business operations.

---

## Internal bus (NATS)
The central nervous system of **fluxrig** is NATS JetStream. All internal components communicate by emitting and consuming messages from specifically patterned subjects.

See **[Data Model (fluxMsg)](data_model.md)** for a deep dive into the message structure and field dictionary.