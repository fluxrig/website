---
slug: /reference/core/configuration
title: Platform configuration
---

# Platform configuration

This section details the configuration files used by the **fluxrig** platform.

## Configuration precedence & environment variables

To support modern containerized deployments (Docker/Kubernetes), **fluxrig** merges configuration from multiple sources, evaluated in the following order of precedence (highest to lowest):

1.  **CLI Flags** (`--level debug`)
2.  **Environment Variables** (`FLUXRIG_LEVEL=debug`)
3.  **Config File** (`fluxrig.toml`)
4.  **Static Defaults**

The environment variable mapping replaces dots (`.`) with underscores (`_`) and uppercases the key. For example, `rack.bus.url` becomes `FLUXRIG_RACK_BUS_URL`.

## Secret management
**fluxrig** does not store secrets in plaintext TOML. For sensitive values (e.g., database passwords, API keys):

1. Use Environment Variables at runtime (`FLUXRIG_STORE_DATABASE_PASSWORD`).
2. Use the **[State Envelope (Passport)](security_reference.md#identity-envelopes-stateflux)**, which encrypts secrets at rest once injected.

---

## Rack configuration (`fluxrig`)

The static binary `fluxrig` loads its configuration from `fluxrig.toml` by default.

### File: `fluxrig.toml`

Configuration is namespaced to separate global/shared settings from component-specific ones.

#### `[Logging]` (Rack)
Shared logging content.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `level` | `string` | `"info"` | Verbosity: `debug`, `info`, `warn`, `error`. |
| `filename` | `string` | `"logs/fluxrig.log"` | Path to log file. |
| `max_size_mb` | `int` | `100` | Max size in MB before rotation. |
| `max_backups` | `int` | `7` | Max number of old log files to keep. |
| `compress` | `bool` | `true` | Compress rotated log files (gzip). |

**Throttling settings**

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `throttling.enabled` | `bool` | `true` | Toggle log throttling protection. |
| `throttling.rate` | `float`| `500.0` | Max lines per second per gear. |
| `throttling.burst` | `int` | `50` | Temporary log burst capacity. |

#### `[Rack]`
Rack-specific runtime settings.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | `"rack-default"` | **Unique Name** (Static Mode). If set, this Rack claims this specific identity. |
| `name_prefix` | `string` | `"node-"` | **Ephemeral Prefix** (Zero Config). Used if `name` is empty. |
| `state_file` | `string` | `"state.flux"` | **Signed State Bundle** (CBOR). Persists Identity, Config, and Secrets. |
| `max_hops` | `int` | `64` | **Max Routing Hops**. Prevents infinite loops in complex topologies. |
| `max_payload_size`| `int` | `2097152` | **Max Payload Size (Bytes)**. Rejects messages exceeding this limit (Default: 2MB). |
| `ip` | `string` | `""` | **Manual IP Override**. If empty, the Rack autodetects its local primary IP. |
| `enrollment_timeout` | `string` | `"2s"` | Timeout for enrollment handshake. |

#### `[Store]`
Data storage settings.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `dir` | `string` | `"./data"` | Root directory for data storage. |

#### `[Rack.bus]`
NATS Bus settings.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `url` | `string` | `"nats://localhost:4222"` | NATS Server URL. |
| `domain` | `string` | `"flux"` | **JetStream Domain** (Sovereignty). Must match Mixer cluster name for stream visibility. |
| `stream_name` | `string` | `"flux-msg"` | NATS Stream (JetStream) name to publish to. |
| `connect_timeout` | `string` | `"10s"` | Initial connection timeout for both **Data** and **Telemetry** buses. |
| `reconnect_wait` | `string` | `"1s"` | Wait time between reconnect attempts for all isolated bus connections. |
| `convergence_delay` | `string` | `"100ms"` | Safety delay to allow ephemeral NATS consumers to converge before starting gears. |

#### Example

```toml
[logging]
level = "debug"
dir = "./logs"

[rack]
name = "rack-nyc-01"

[store]
dir = "/var/lib/fluxrig/data"

[rack.bus]
url = "nats://nats.fluxrig.internal:4222"
```

**Note on Log Files**:

*   Rack writes to `<log_dir>/fluxrig-rack.log`.
*   CLI writes to `<log_dir>/fluxrig-cli.log` (if enabled).

---

## Mixer configuration (`fluxrig-mixer`)

The dynamic binary `fluxrig-mixer` loads its configuration from `fluxrig-mixer.toml`.

### File: `fluxrig-mixer.toml`
Configuration is namespaced into granular sections.

#### `[Logging]` (Mixer)
Shared logging content.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `level` | `string` | `"info"` | Verbosity: `debug`, `info`, `warn`, `error`. |
| `filename` | `string` | `"logs/mixer.log"` | Path to log file. |
| `max_backups` | `int` | `7` | Max number of old log files to keep. |

#### `[Mixer]`
General Mixer identity and bootstrapping settings.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `max_hops` | `int` | `64` | **Global Max Hops**. Default limit applied to all Racks if not overridden. |
| `max_payload_size`| `int` | `2097152` | **Global Max Payload (Bytes)**. Default limit applied to all Racks (Default: 2MB). |
| `mixer_name` | `string` | `"mixer-01"` | Human-readable identifier. |
| `startup_scenario` | `string` | `""` | Scenario reference to load on startup. Accepts a file path (`./scenario.yaml`), a stored URN (`payment-flow:v1.0.0`), or empty to resume the last active scenario. |

#### Registry-First Identity Model

> [!NOTE]
> **Important Change (v0.5.0+)**: The static `machine_id` configuration field has been completely removed from both Rack and Mixer configurations. **fluxrig** now enforces a **Registry-First Enrollment Model**. 
> 
> *   **Racks**: Dynamically receive a 128-bit `uuid.UUID` Identity during the Enrollment Handshake, which is cryptographically signed and stored in the local `state.flux` passport.
> *   **Mixers**: Automatically generate a persistent cluster identity (UUID v7) on their first boot, which is maintained in the internal Unified Registry (`registry`).

#### `[Enrollment]` (Mixer)
Control how new Racks are admitted to the rig.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `auto_adopt` | `bool` | `false` | If `true`, any new Rack connecting will be immediately set to `active`. Use cautiously in production. |
| `push_delay` | `string` | `"1s"` | Delay before pushing the initial scenario to a newly adopted Rack. |

#### `[Ingest]` (Mixer)
Control telemetry ingestion buffering and flushing.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `flush_interval` | `string` | `"5s"` | Interval for flushing telemetry to persistent storage. |
| `buffer_size` | `int` | `1024` | Internal channel buffer size for telemetry ingestion. |

#### `[API]`
Mixer REST API settings.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `port` | `int` | `8090` | **Server Port** for the HTTP/gRPC API listener. |

#### `[Store]` (Mixer)
Data storage settings (Analytics/Registry).

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `database_file` | `string` | `"fluxrig.duckdb"` | DB filename (relative to store dir). |
| `cluster_key_file` | `string` | `"cluster.key"` | Key filename (relative to store dir). |

#### `[Snake]`
Embedded NATS Server (JetStream) settings.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `port` | `int` | `4222` | **Server Port** to listen on for NATS connections. |
| `url` | `string` | `"nats://localhost:4222"` | URL to advertise to Racks. |
| `cluster_name` | `string` | `"flux"` | JetStream Domain Name (for Leaf Nodes). |
| `stream_name` | `string` | `"flux-msg"` | Name of the primary JetStream stream. |
| `stream_subjects` | `[]string` | `["flux.msg.>", "flux.gear.>", "fluxrig.>"]` | Wildcard subjects to capture. |
| `business_stream_max_age` | `string` | `"720h"` | Data retention time for business logic streams. |
| `telemetry_stream_max_age` | `string` | `"24h"` | Data retention time for telemetry streams. |
| `durable` | `bool` | `false` | Enable disk-durable JetStream persistence. |

#### Example (Mixer)

```toml
[logging]
level = "debug"

[mixer]
mixer_name = "mixer-prod-01"
startup_scenario = "scenario_prod.yaml"

[api]
port = 8090

[store]
dir = "./data"
database_file = "fluxrig.duckdb"
cluster_key_file = "cluster.key"

[snake]
port = 4222
url = "nats://localhost:4222"
cluster_name = "flux"
store_dir = "data/js"
```

---

### [Roadmap] Observability tiers

The platform is designed to support multiple observability tiers for various scales. In **{{VERS}}**, only the **Embedded Tier** is fully implemented.

| Tier | Backend(s) | Use Case | Status |
|------|------------|----------|--------|
| `embedded` | DuckDB + Parquet | Zero deps, development, edge | **Stable** |
| `standard` | Arc + OpenSearch | Team deployments | **[Roadmap]** |
| `enterprise` | ClickHouse + SigNoz | Petabyte scale | **[Roadmap]** |

---

### `[Observability]`
Global observability settings.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enabled` | `bool` | `true` | Enable/disable observability collection. |
| `tier` | `string` | `"embedded"` | Backend tier: `embedded` (standard), `otlp` (collector). |
| `sampling_rate` | `float` | `1.0` | Trace sampling rate (0.0 - 1.0). |

---

### Embedded tier configuration

#### `[Observability.embedded]`
Settings for the Embedded tier (DuckDB + Parquet).

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data_dir` | `string` | `"./data/telemetry"` | Directory for telemetry storage. |
| `flush_interval` | `string` | `"5s"` | Interval to flush data to disk. |

#### `[Observability.embedded.storage]`
Storage format and organization.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `format` | `string` | `"parquet"` | Storage format: `parquet`, `json`. |
| `partition_by` | `string` | `"hour"` | Time partitioning: `hour`, `day`. |
| `compression` | `string` | `"zstd"` | Compression: `zstd`, `snappy`, `none`. |

#### `[Observability.embedded.rotation]`
Rotation and retention policies.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `policy` | `string` | `"time"` | Rotation policy: `time`, `size`, `both`. |
| `max_age_days` | `int` | `30` | Delete data older than N days. |
| `max_size_gb` | `int` | `10` | Max total storage size in GB. |
| `check_interval` | `string` | `"1h"` | How often to check rotation rules. |

#### `[Store]` (embedded)

- `dir`: Root directory for data storage (e.g., `./data`).
- `wal_max_size_mb`: Max size for Write-Ahead Log.
- `database_file`: Filename for DuckDB file.

The `fluxID` (or `fluxID` in JSON) is the unique identifier...

#### Embedded storage schema

Data is organized into **telemetry** (system signals) and **messages** (business data):

```
./data/
├── telemetry/               # OTel signals (system observability)
│   ├── traces/
│   │   └── 2025/12/21/14/traces_001.parquet
│   ├── logs/
│   │   └── 2025/12/21/14/logs_001.parquet
│   └── metrics/
│       └── 2025/12/21/14/metrics_001.parquet
└── messages/                # Business data (fluxMsg)
    ├── generic/             # Default schema (raw_msg only)
    │   └── 2025/12/21/14/fluxmsg_001.parquet
    └── fluxSpec/            # Spec-driven schemas
        └── visa-v1/         # Spec-specific subfolder
            └── 2025/12/21/14/visa_001.parquet
```

**Parquet Schema (Traces)**:

| Column | Type | Description |
|--------|------|-------------|
| `ts` | `TIMESTAMP` | Event timestamp |
| `trace_id` | `VARCHAR` | W3C TraceContext ID |
| `span_id` | `VARCHAR` | Span ID |
| `parent_span_id` | `VARCHAR` | Parent Span ID |
| `flux_id` | `UINT64` | Sonyflake business ID |
| `entity_id` | `UINT64` | Unified EntityID (`[Type:8][MachineID:16][Seq:40]`) |
| `entity_name` | `TEXT` | Human-readable Hostname (e.g., `rack-sfo-01`) |
| `span_name` | `VARCHAR` | Operation name |
| `duration_ms` | `FLOAT` | Duration in milliseconds |
| `status` | `ENUM` | `ok`, `error` |
| `attributes` | `JSON` | Additional attributes |

**Parquet Schema (Logs)**:

| Column | Type | Description |
|--------|------|-------------|
| `ts` | `TIMESTAMP` | Log timestamp |
| `entity_id` | `UINT64` | Unified EntityID |
| `entity_name` | `TEXT` | Human-readable Hostname |
| `flux_id` | `UINT64` | Business flow ID |
| `level` | `ENUM` | `debug`, `info`, `warn`, `error` |
| `message` | `VARCHAR` | Log message |
| `attributes` | `JSON` | Structured fields |

**Parquet Schema (Metrics)**:

| Column | Type | Description |
|--------|------|-------------|
| `ts` | `TIMESTAMP` | Metric timestamp |
| `name` | `VARCHAR` | Metric name (e.g., `gear_latency_ms`) |
| `entity_id` | `UINT64` | Unified EntityID |
| `entity_name` | `TEXT` | Human-readable Hostname |
| `type` | `ENUM` | `counter`, `gauge`, `histogram` |
| `value` | `DOUBLE` | Metric value |
| `labels` | `JSON` | Dimension labels |

**Parquet Schema (fluxMsg / Data)**:

| Column | Type | Description |
|--------|------|-------------|
| `ts` | `TIMESTAMP` | Message timestamp |
| `trace_id` | `VARCHAR` | Associated trace |
| `flux_id` | `UINT64` | Primary business ID |
| `machine_id` | `INTEGER` | Node ID |
| `machine_name` | `TEXT` | Hostname |
| `src_gear_id` | `VARCHAR` | Source Gear |
| `dst_gear_id` | `VARCHAR` | Destination Gear |
| `msg_type` | `VARCHAR` | Message type identifier |
| `direction` | `ENUM` | `inbound`, `outbound`, `internal` |
| `status` | `ENUM` | `ok`, `error` |
| `raw_msg` | `BLOB` | Full CBOR payload |
| `promoted` | `JSON` | Promoted fields (spec-driven) |

#### Embedded example

```toml
[observability]
enabled = true
tier = "embedded"
sampling_rate = 1.0

[observability.embedded]
# Data_dir is managed by [store] config
flush_interval = "5s"

[observability.embedded.storage]
format = "parquet"
partition_by = "hour"
compression = "zstd"

[observability.embedded.rotation]
policy = "both"
max_age_days = 30
max_size_gb = 10
check_interval = "1h"
```

---

### OTLP tier configuration (vendor-neutral)

---

### OTLP tier configuration (vendor-neutral)

For integration with any OpenTelemetry-compatible backend (Datadog, Jaeger, Grafana Tempo, etc.).

#### `[Observability.otlp]`
OpenTelemetry Protocol exporter settings.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `endpoint` | `string` | `""` | OTLP gRPC endpoint (e.g., `127.0.0.1:4317`). |
| `endpoint_http` | `string` | `""` | OTLP HTTP endpoint (alternative to gRPC). |
| `headers` | `map` | `{}` | Custom headers (e.g., API keys). |
| `insecure` | `bool` | `false` | Skip TLS verification. |
| `timeout` | `string` | `"30s"` | Request timeout. |

#### OTLP example

```toml
[observability]
enabled = true
tier = "otlp"

[observability.otlp]
endpoint = "otel-collector:4317"
insecure = false
headers = { "api-key" = "${OTEL_API_KEY}" }

# Optional: also store raw fluxMsg locally
[observability.otlp.messages]
enabled = true
data_dir = "./data/messages"
```

---

## CLI query commands

The `fluxrig` CLI provides commands for querying telemetry data.

### `fluxrig logs`
Query log entries.

```bash
# Filter by severity
fluxrig logs --min-level error --since 1h

# Filter by entity
fluxrig logs --entity rack-nyc-01 --limit 100
```

| Flag | Type | Description |
|------|------|-------------|
| `--min-level` | `string` | Minimum log level: `debug`, `info`, `warn`, `error`. |
| `--since` | `duration` | Time window (e.g., `1h`, `24h`) or ISO timestamp. |
| `--until` | `string` | End time (ISO timestamp). |
| `--entity` | `string` | Filter by Entity Name. |
| `--limit` | `int` | Max results (default: 50). |
| `--api-url` | `string` | Mixer API URL (default: `http://localhost:8090`). |

### `fluxrig metrics`
Query metrics data.

```bash
# Filter by metric name
fluxrig metrics --name heartbeats_sent

# Filter by entity
fluxrig metrics --entity mixer-01
```

| Flag | Type | Description |
|------|------|-------------|
| `--name` | `string` | Filter by metric name. |
| `--entity` | `string` | Filter by Entity Name. |
| `--since` | `duration` | Start time. |
| `--until` | `string` | End time. |
| `--limit` | `int` | Max results (default: 50). |
| `--api-url` | `string` | Mixer API URL (default: `http://localhost:8090`). |


---

## REST API endpoints

The Mixer exposes telemetry query endpoints via REST API.

### Logs API

```
GET /api/v1/telemetry/logs
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `level` | `string` | Filter by level. |
| `since` | `RFC3339` | Start time. |
| `until` | `RFC3339` | End time. |
| `rack_id` | `string` | Filter by Rack. |
| `gear_id` | `string` | Filter by Gear. |
| `q` | `string` | Text search. |
| `limit` | `int` | Max results. |
| `offset` | `int` | Pagination offset. |

**Example**:
```bash
curl "http://mixer:8090/api/v1/telemetry/logs?level=error&since=2025-12-21T00:00:00Z&limit=50"
```

### Traces API

```
GET /api/v1/telemetry/traces
GET /api/v1/telemetry/traces/{trace_id}
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `flux_id` | `uint64` | Filter by fluxID. |
| `since` | `RFC3339` | Start time. |
| `min_duration_ms` | `int` | Minimum duration filter. |
| `status` | `string` | `ok` or `error`. |

### Metrics API

```
GET /api/v1/telemetry/metrics
GET /api/v1/telemetry/metrics/{metric_name}
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `since` | `RFC3339` | Start time. |
| `until` | `RFC3339` | End time. |
| `group_by` | `string` | Aggregation key. |
| `interval` | `string` | Time bucket: `1m`, `5m`, `1h`. |