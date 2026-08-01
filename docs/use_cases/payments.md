---
slug: /use_cases/payments
title: Payment use cases
---

# Payment use cases

**fluxrig** is a high-performance transaction runtime designed for extreme architectural flexibility in modern financial environments. It functions as a **Payment Orchestration Runtime**, providing a unified data flow for normalizing, routing, and processing ISO 8583, ISO 20022, and other financial protocols.

Unlike rigid fixed-logic switches, **fluxrig** is a modular foundation. By composing specialized technical **Gears**, adopters can build anything from a passive transaction monitor to a high-throughput enterprise payment gateway.

---

## Operational patterns

Institutional payment infrastructure is categorized across a spectrum of operational patterns. **fluxrig** unifies these patterns into a single, cohesive architecture.

### Passive monitoring & observability
For environments where touching the transaction cycle is restricted, the **Rack** operates as a non-intrusive observer.

*   **Shadow Mirroring**: Duplicating production traffic to a parallel Rack for logic verification without impacting real-time money movement.
*   **Differential Integrity**: The system flags bugs by comparing existing switch responses against new logic results before a production cutover.

### Protocol orchestration gateway
As a high-performance orchestration gateway, **fluxrig** connects diverse systems, from cloud-native platforms to established financial networks.

*   **ISO 8583 Normalization**: The **[Codec Gear (ISO 8583)](../reference/gears/codec_iso8583.md)** performs deterministic translation of dense binary bitmaps into structured JSON/CBOR required by modern APIs.
*   **Sovereign Context Parking**: The **[Coat Check gear](../reference/gears/coatcheck.md)** parks correlation context (and, optionally, specific non-PAN fields) at the infrastructure boundary and restores it on the reply, keeping internal context off external legs. This is *parking*, not tokenization, surrogate substitution (replacing a PAN with a vault-backed token) is a separate, roadmap gear. Note a switch must still send the PAN to the scheme to authorize.

### Active orchestration and switching
In this high-performance pattern, **fluxrig** acts as the deterministic engine of the payment flow, routing transactions between originators (ATMs/POS) and processors.

*   **Switching and reply correlation**: The **[Conductor gear](../reference/gears/conductor.md)** routes each request across upstream connections and matches the reply over a "valet" ticket store (local by default). It generalizes the Coat Check for the switching path.
*   **Stand-in Processing (STIP)**: Composing a deterministic **[Logic Gear (STIP)](../reference/gears/wasm_logic.md)** allows the Rack to authorize transactions locally when the upstream host is unreachable, sustaining availability during host outages.
*   **Request/Response Matching**: The **[Correlator Gear](../reference/gears/correlator.md)** `[Roadmap]` (differential analysis) is a distinct capability from the Conductor's reply matching; use it for reconciliation against the immutable CBOR archives.

---

## Example: ISO 8583 acquisition gateway

This common scenario illustrates a modern transition: receiving standard Webhook/REST calls from a terminal and orchestrating them into a financial network.

<LikeC4 project="payments-gateway" view="flow" height={480} />

**Reading the diagram**: the interactive view traces one transaction as a numbered walkthrough: the request travels out (steps 1-5) and the authorization returns (steps 6-9). Click any gear to focus it, or pan/zoom for detail. Steps 5 and 6 are the two external connections, each a **single bidirectional socket**; every internal step is one **unidirectional wire**. Request and response wires are equals: the step order, not the arrow direction, is what distinguishes the legs. Each socket terminates at the gear that owns it, which bridges it onto those one-way wires.

### Step-by-step processing
1.  **REST Ingress**: The POS terminal sends a JSON payload. The **[Bento Gear](../reference/gears/bento.md)** acts as the high-performance HTTP server, mapping the request into an internal `fluxMsg`.
2.  **Business Logic**: The **Logic Gear** validates the transaction (e.g., checking minimum amount) and attaches routing metadata.
3.  **Protocol Encoding**: A **[Codec Gear](../reference/gears/codec_iso8583.md)** instance (`direction: encode`) packs the semantic message into the precise ISO 8583 binary bitmap expected by the external processor. The codec translates; it does not own a network connection.
4.  **Financial Egress**: The **[I/O Gear](../reference/gears/io_iso8583.md)** (client mode) owns the persistent, length-framed TCP connection to the Acquirer. It consumes the bitmap on its `in` port and writes it to the socket.
5.  **Authorization Response**: The Acquirer answers over the **same TCP connection**: the socket is bidirectional, and the I/O Gear bridges it back into the one-way world by emitting the response on its `out` port.
6.  **Response Decoding**: A second Codec instance (`direction: decode`) unpacks the response bitmap into structured fields.
7.  **REST Egress**: The Bento Gear correlates the response to the still-open HTTP request and answers the POS terminal.

> [!NOTE]
> **Paths are wired, not mirrored.** The response path deliberately skips the validation Logic Gear: each direction contains exactly the gears wired into it, and the acquirer's answer needs no request-side validation. When response-side processing is required (response-code mapping, journaling the authorization result, reversal bookkeeping), it is added by wiring a dedicated gear into the response pair, never implied by the request path.

> **Scaling this pattern**: A production switch needs more than one uplink: multiple acquirer or scheme connections, load balancing, failover, and reply correlation across all of them. That is the role of the **Conductor Gear**: see the [payment switch tutorial](../tutorials/payment_switch_conductor.md) for the full multi-region design.

---

## Institutional permissive freedom

**fluxrig** is a platform for institutional builders provided under the **Apache 2.0** license.

In an industry dominated by proprietary "Black Box" switches and restrictive licenses, **fluxrig** offers true commercial agility. Our model ensures you can build proprietary, mission-critical logic without the risk of legal contamination or forced disclosure of your commercial intellectual property.

> [!TIP]
> **Verification Strategy**: Before production cutover, we recommend validating all ISO 8583 logic using the **[ISO 8583 Robot Suite](../tutorials/iso8583_robot_suite.md)**, a flagship verification suite for high-volume financial switching.