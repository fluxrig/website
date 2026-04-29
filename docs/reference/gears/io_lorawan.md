---
slug: /reference/gears/io_lorawan
title: LoRaWAN I/O gear [Roadmap]
---

<!-- Copyright (c) 2026 JAAB Tech SAS, Uruguay All Rights Reserved -->
<!-- See https://jaab.tech -->

# LoRaWAN I/O gear [Roadmap]

> [!WARNING]
> **[Roadmap]**: This gear is currently in the **Architectural Proposal** phase and not yet available in the core release.

The `io_lorawan` Gear will embed a native LoRaWAN Network Server (LNS) capability directly into the fluxrig Rack.

## Planned capabilities

- **Regional support**: US915, EU868, AU915, and AS923.
- **Device classes**: Class A and Class C support.
- **Activation**: Over-the-Air Activation (OTAA) and Activation by Personalization (ABP).
- **Integration**: Direct mapping of LoRaWAN payloads to `fluxMsg` without external MQTT brokers.
