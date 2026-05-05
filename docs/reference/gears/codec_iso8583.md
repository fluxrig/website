---
slug: /reference/gears/codec-iso8583
title: ISO8583 codec gear
---

# ISO8583 codec gear

The high-fidelity signal leveler for financial protocol normalization.

<!-- Copyright (c) 2026 JAAB Tech SAS, Uruguay All Rights Reserved -->
<!-- See https://jaab.tech -->


The `codec_iso8583` gear functions as the **Signal Leveler** (Normalization Engine) of the payment mixer. It is a **Native Gear** (Go) responsible for transforming raw, "noisy" protocol dialects (ISO8583 binary/BCD) into a clean, structured **[FluxMsg](../data_model.md#fluxmsg-structure-payload)** (CBOR) format.

By leveraging the **[Moov ISO8583](https://github.com/moov-io/iso8583)** engine, this gear ensures that technical variances between card schemes are leveled into a uniform semantic layer for the internal **[Master Bus Architecture](../../architecture/overview.md#transaction-flow-strategy-two-speed)**.

| Attribute | Details |
| :--- | :--- |
| **Type** | `codec_iso8583` |
| **Analogy** | **Signal Leveler** (Normalization) |
| **Status** | Stable (v0.4.4) |
| **Source Code** | [pkg/gears/native/iso8583/codec](https://github.com/jaab-tech/fluxrig/tree/main/pkg/gears/native/iso8583/codec) |
| **Pairs With** | **[Signal Pre-amp](io_iso8583.md)** (Capture) |
| **Port IN** | Raw Payload (Decode) / Structured fluxMsg (Encode) |
| **Port IN Cardinality** | Single |
| **Port OUT** | Parsed fluxMsg (Decode) / Packed Payload (Encode) |
| **Port OUT Cardinality** | Single |
| **Always Emitted Metadata**| `codec.protocol`, `codec.spec_hash`, `iso8583.mti`, `[alias]` |
| **Conditionally Emitted Metadata** | `iso8583.mti_resp` |
| **Mandatory Consumed Metadata** | `[alias]` or `iso8583.field.N` |
| **Signals Sent** | `conn.close` (Kill Switch) |

---

## Architectural signal path

The Codec Gear operates at the heart of the "Channel Strip," performing protocol translation between raw financial signals and the internal bus models.

```mermaid
graph LR
    subgraph "The Channel Strip (Rack)"
        direction LR
        PreAmp["io_iso8583 (Pre-amp)"]
        subgraph codec_iso8583 ["codec_iso8583 (Signal Leveler)"]
            direction TB
            Decode["Decode: Raw to CBOR"]
            Encode["Encode: CBOR to Raw"]
        end
        Bus["The Master Bus (NATS)"]
    end

    %% Signal Flow
    PreAmp == "Protocol Noise (Bytes)" ==> Decode
    Decode == "Clean Signal (fluxMsg)" ==> Bus
    Bus == "Processed Signal" ==> Encode
    Encode == "Response Noise" ==> PreAmp

    classDef gear fill:#f9f9f9,stroke:#333,stroke-width:2px;
    class codec_iso8583 gear;
```

---

## Technical description

Unlike the **[IO TCP Gear](io_tcp.md)**, which handles transport framing, the **Signal Leveler** focuses purely on **Semantic Protocol** logic: field parsing, data type validation, and scheme-specific Dialect adhesion.

### Core engine: Moov ISO8583
The Gear utilizes a **[YAML SDL](../specs/iso8583_sdl.md)** to define dialect rules, powered by **Moov ISO8583**:

*   **Industry Standard Parsing**: Support for BCD, EBCDIC, ASCII, and raw Binary payloads.
*   **Deep Bitmaps**: Automatic handling of Primary and Secondary bitmaps (Support for up to 128 fields). **Tertiary Bitmaps** (Field 129-192) are currently a roadmap item (future).
*   **EMV & Composites**: High-fidelity normalization for **BER-TLV** (Field 55) and complex subfields (Field 48, 62, 127).

---

## Configuration reference

The strategy follows the **[Stack is the Spec](../tech_stack.md)** principle. We do not reinvent the protocol parser; we embed the standard **Moov** library.

| Field | Type | Required | Description | Default |
| :--- | :--- | :--- | :--- | :--- |
| **`spec_path`** | `string` | **Yes** | Absolute path to local YAML or valid **Registry URN** (e.g., `visa:v1`, `mastercard:test`). | - |
| **`direction`** | `string` | No | Internal logic flow: `"auto"` (default), `"decode"`, or `"encode"`. | `"auto"` |
| **`on_error`** | `string` | No | Action on parse failure: `"drop"` (default), `"reject"` (*Planned*), or `"kill"` (*Planned*). | `"drop"` |

## Specification resolution (CAS)

The `spec_path` field supports two resolution strategies to allow for both local development and institutional-grade deployments:

1.  **Local Path**: If the value begins with `/` or `./`, the Gear reads the spec directly from the Rack's filesystem.
2.  **Registry URN**: If the value follows the `name:tag` pattern (e.g., `payment-v1:stable`), the Mixer's **Registry** is consulted. The Mixer retrieves the corresponding YAML blob from the **Content-Addressable Storage (CAS)** and pushes it to the Rack.

> [!NOTE]
> All specifications are tracked via **SHA256 hashes** (First 12 chars). When a spec is loaded, the Codec gear exports the `codec.spec_hash` metadata, ensuring absolute traceability between a transaction and the exact version of the logic used to parse it.

---

## Operational guardrails

**Stateless Mastery**
The `codec_iso8583` is a stateless processor. Metadata mappings (aliases) enable the **[Asymmetric Bus (Coat Check)](coatcheck.md)** pattern, allowing the system to scale without sticky sessions.

**Network Management (MTI 0800)**
While the gear parses 0800 messages, it is the role of the downstream **[Logic Gears](wasm_logic.md)** (within a Scenario) to generate the appropriate responses.

---

## Resilience & error handling

*   **Parsing Failures**: If raw bytes cannot be unpacked (invalid bitmap/length), a `codecerror` is raised.
*   **Validation Failures**: If fields defined in YAML are missing or invalid, a `validationerror` is raised.
*   **Field Constraints**: Support is currently optimized for ISO8583:1987/1993 dialects using Primary and Secondary bitmaps.
*   **The Kill Switch**: If `on_error: "kill"` is set, the Gear signals the **[Pre-amp](io_iso8583.md)** via the Control Plane (`flux.ctrl.{io_gear_id}`) to terminate the connection.

### Resource monitoring (OTel)

The `codec_iso8583` gear exports high-fidelity metrics for dashboarding and alerting:

*   `fluxrig_codec_messages_total` (Counter): Total messages processed.
*   `fluxrig_codec_duration_seconds` (Histogram): Processing latency distribution.
*   `fluxrig_codec_fields_count` (Histogram): Average field density per message.
*   `fluxrig_codec_errors_total` (Counter): Cumulative count of packing/unpacking failures.

> [!TIP]
> **See the [Signal Leveler Implementation Guide](../specs/iso8583_sdl.md)** for a deep dive into YAML Dialect definitions.
