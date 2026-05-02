---
slug: /reference/core/security
title: Security reference
---

<!-- Copyright (c) 2026 JAAB Tech SAS, Uruguay All Rights Reserved -->
<!-- See https://jaab.tech -->

# Security reference

Technical specifications for the **fluxrig** security model, identity envelopes, and transport protocols.

## Identity envelopes (`state.flux`)

The Rack uses a signed CBOR envelope (the "Passport") to maintain its identity across reboots and offline partitions.

### Data structure

```go
// StateEnvelope (The Passport)
type StateEnvelope struct {
    Payload   []byte // CBOR(RackState)
    Signature []byte // Ed25519 Signature
}

// RackState (The Content)
type RackState struct {
    ClusterID      string // e.g. "flux-prod"
    MachineID      uint64 // 64-bit physical ID
    Name           string // Human-readable name
    Status         string // active, pending
    Secret         string // Bearer token
    ClusterPublic  []byte // Mixer's public verification key
}
```

---

## Transport: Snake protocol

The Snake tunnel provides the secure mTLS backbone for Rack-to-Mixer communication.

### Default configuration

| Parameter | Default Value | Description |
| :--- | :--- | :--- |
| **Protocol** | NATS WebSocket (WSS) | Persistent outbound tunnel |
| **Port** | 4222 / 443 | Configurable tunnel entry point |
| **Authentication**| mTLS (X.509) | Client & Server certificate exchange |
| **Encryption** | TLS 1.3 / AES-256 | High-entropy session encryption |

---

## Cipher suites

| Purpose | Algorithm | Implementation |
| :--- | :--- | :--- |
| **Signatures** | Ed25519 | Component identity & state |
| **Encryption** | AES-256-GCM | Data-at-rest (NATS KV and Parquet Logs) |
| **Hashing** | BLAKE3 / SHA-256| Integrity checks |
| **IDs** | Sonyflake | Time-sortable unique IDs |

### Data-at-rest encryption
For persistence, **fluxrig** relies on external or embedded storage engines:

*   **NATS KV State**: The state registry and Coat Check keys are stored in NATS JetStream. Enterprise deployments utilize NATS native encryption-at-rest (using AES-256-GCM) with a symmetric encryption key managed by the deployment's orchestrator to secure the underlying JetStream store block files.
*   **WAL Logs**: The Parquet WAL files on the Rack can be encrypted prior to disk flush (Planned Feature).

---

## Key management CLI

| Command | Purpose | Access |
| :--- | :--- | :--- |
| `fluxrig keys gen-cluster` | Generate root cluster keys | Mixer Admin |
| `fluxrig keys gen-client` | Generate mTLS client certs | Mixer Admin |
| `fluxrig admin enroll` | Initiate Rack enrollment | Physical Access |

---

## API authentication & management

The Mixer REST API is secured via two mechanisms:

1. **mTLS (Internal)**: Administrative CLI commands (`fluxrig admin`) executed on the local network use mTLS to authenticate against the Mixer.
2. **Bearer Tokens (External)**: For integrations with CI/CD or Enterprise Web Dashboards, the Mixer requires a signed JWT Bearer token configured at bootstrapping.

### Certificate rotation
> [!WARNING]
> **Planned Feature**: Zero-downtime certificate rotation is currently on the roadmap.

Currently, when `fluxrig keys gen-cluster` generates new trust roots, the Mixer and Racks must be restarted to transition to the new Root CA. Future releases will allow the Mixer to advertise the impending rotation, allowing Racks to automatically transition without breaking ongoing data plane traffic.
