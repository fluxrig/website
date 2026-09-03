---
slug: /use_cases
title: fluxrig in action
---

# fluxrig in action

The **fluxrig** engine is designed for high-fidelity signal orchestration across diverse, mission-critical environments. By treating all data like a professional audio signal, the rig provides a standardized way to bridge legacy hardware with modern cloud ecosystems.

The following domains demonstrate the rig's versatility in handling complex, real-time signal processing at scale.

## Payments
*High-Concurrency Financial Signals*
Orchestrate complex payment flows between POS terminals and banking cores. The rig handles **ISO8583** translation, correlation-context parking at the edge, and switching/reply-correlation via the **Conductor**, with durable audit metadata (not clear-text cardholder data) persisted for reconciliation.

- **[Read the Payments Case Study](./payments.md)**
- **[Mobile network signals in payments](./mobile_network_signals.md)** — asking a mobile operator what a payment message cannot know, through the GSMA Open Gateway APIs

## Industrial
*Hard-Real-Time OT/IT Bridging*
Bridge the gap between factory floor PLCs and digital twins. Using **Modbus**, **RS-485**, and **MQTT** gears, the rig transforms raw industrial noise into actionable telemetry.

- **[Read the Industrial Case Study](./industrial.md)**

## Internet of Things (IoT)
*Distributed Edge Intelligence*
Manage high-volume distributed fleets of sensors across **LoRaWAN**, **Zigbee**, and **LTE** networks. The rig provides edge-based filtering and correlation to reduce backhaul noise.

- **[Read the IoT Case Study](./iot.md)**
