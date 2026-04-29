---
title: Side-Chain Inference Pattern
slug: /architecture/ai-sidechain
---

# Side-Chain Inference Pattern

The **Side-Chain Inference** pattern is the architectural standard for integrating Artificial Intelligence (ML/LLM) into the **fluxrig** data plane. It ensures that probabilistic models can provide high-value insights (scoring, categorization, anomaly detection) without compromising the **Determinism** or **Performance** of the primary execution path.

## The Theory: Dry vs. Wet Signals

*   **The Dry Signal (Deterministic)**: The core transaction logic (e.g., "Is this ISO8583 message valid?") which must be 100% reproducible and low-latency.
*   **The Wet Signal (Probabilistic)**: The AI-augmented insight (e.g., "What is the probability this is a fraudulent transaction?") which is non-blocking and descriptive.

## Implementation Blueprint

Integrating an AI model (e.g., via the **Sovereign AI Bridge**) follows a three-stage lifecycle: **Tap**, **Infer**, and **Feed**.

### 1. The Signal Tap (Aux Send)
A dedicated Gear (often the **[Bento Gear](../reference/gears/bento.md)**) acts as an "Aux Send". It receives a clone of the `fluxMsg` from the main logic flow.

```yaml
wires:
  - from: ingress.out
    to:   ai-bridge.in      # The Signal Tap
  - from: ingress.out
    to:   business-logic.in # The Hot Path
```

### 2. Isolated Inference (Sovereign Bridge)
The Bridge Gear transmits the signal to a local inference engine (e.g., Ollama, TensorRT, or a specialized Sovereign AI node). 

*   **Out-of-Process**: Inference happens outside the Rack's core execution loop to prevent CPU/Memory starvation.
*   **Non-Blocking**: The primary business logic continues to execute while the AI model is "thinking."

### 3. Metadata Feedback Loop
Once the AI model completes its analysis, the Bridge Gear emits a **Feedback Signal**. Since the original message has already moved forward, the AI result is typically attached to the **Signal Metadata** of the *next* related signal or stored in a shared state (e.g., **[Coat Check](../reference/gears/coatcheck.md)**).

```go
// Example Metadata Feedback Structure
msg.Metadata["flux.ai.fraud_score"] = "0.92"
msg.Metadata["flux.ai.rationale"] = "unusual_temporal_cluster"
```

## Security Sovereignty
In the Side-Chain pattern, the raw sensitive payload (e.g., a credit card number) is often **masked** before being sent to the AI Bridge. The AI engine only receives the "Contextual Vectors" required for analysis, ensuring that PII never leaves the deterministic vault.

---

## Technical reference
*   **Data Model**: See **[fluxMsg Fields](data.md)**.
*   **State Management**: See **[Coat Check Gear](../reference/gears/coatcheck.md)**.
