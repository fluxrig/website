---
slug: /reference/operations/cli
title: CLI reference
---

# CLI reference

The **Command Line Interface (CLI)** is the primary orchestration tool for the **fluxrig** ecosystem. It provides a unified, static binary interface for managing the entire lifecycle of distributed infrastructure (from key generation and node registration to real-time telemetry exploration).

## fluxrig (static binary)
The unified tool for operators and edge runtimes.

### Core commands

| Command | Description |
|---------|-------------|
| `fluxrig` | Root command, displays help |
| `fluxrig version` | Display version information |
| `fluxrig rack` | Start the Rack edge node |

### Key management

| Command | Description |
|---------|-------------|
| `fluxrig keys gen-cluster` | Generate a new Cluster Authority keypair |
| `fluxrig keys inspect <path>` | Inspect a state.flux Passport file |

**Flags for `gen-cluster`**:

- `-d, --dir` - Output directory (default: `.`)
- `-n, --name` - Filename (default: `cluster.key`)
- `-o, --out` - Full output path (overrides dir/name)

### Administration

| Command | Description |
|---------|-------------|
| `fluxrig admin racks list` | List all registered racks |
| `fluxrig admin racks list --status pending` | [DEPRECATED] Use API for status filtering. |
| `fluxrig admin racks approve <id> --name <name>` | Approve a pending rack and assign identity |
| `fluxrig admin racks suspend <id>` | Suspend a rack (blocks traffic, keeps identity) |
| `fluxrig admin racks activate <id>` | Reactivate a suspended rack |
| `fluxrig admin racks remove <id>` | Remove a rack from registry (destroys identity) |
| `fluxrig admin racks shutdown <id>` | Gracefully shutdown a Rack edge node |
| `fluxrig admin racks set-log-level <id> <level>` | Set log level (debug/info/warn/error) |

**Common Flag**:

- `--api-url` - Mixer API URL (default: `http://localhost:8090`)

### Spec management (registry)

Specs are governed via a Content-Addressable Store (CAS).

| Command | Description |
|---------|-------------|
| **`import <file>`** | Snapshot a local YAML spec into the CAS. |
| **`list`** | List available specs in the local store. |
| **`export <urn> <file>`** | Write a CAS spec back to a local file. |

**Usage**:
```bash
fluxrig spec import visa_spec.yaml --name visa --tag v1.0.0
```

**Flags for `import`**:

- `--name` - Logical name (e.g., `visa`)
- `--tag` - Semantic version (e.g., `v1.0.0`)
- `--store-dir` - CAS store location (default: `~/.fluxrig/store`)

### Scenario management (simulation)

Scenarios define the operational topology used for testing and simulation. They can be imported into the CAS or executed directly as a standalone test runner.

| Command | Description |
|---------|-------------|
| **`import <file>`** | Snapshot a scenario YAML into the CAS. |
| **`list`** | List all stored scenarios. |
| **`export <urn> <file>`** | Export a CAS scenario for local editing. |
| **`diff <file>`** | Compare local scenario file with the active one. |

**Usage**:
```bash
# Import into CAS
fluxrig scenario import main.yaml --name dev --tag v1.0.0

# Hot-Reload via Mixer API
fluxrig scenario import main.yaml --api

# Diff local against active
fluxrig scenario diff main.yaml
```

**Flags for `import`**:
- `--api` - Sync with Mixer API immediately
- `--store-dir` - CAS store location (default: `~/.fluxrig/store`)

### Operations & simulation examples

Use these patterns to orchestrate high-fidelity simulations:

```bash
# pull the latest compliance suite [Roadmap]
fluxrig scenario pull github.com/jaab-tech/compliance-tests

# run a specific certification scenario [Roadmap]
# This acts as a standalone runner, injecting traffic and asserting results.
fluxrig scenario run visa-cert:v2.1.0 --target https://my-rack:8583
```

### Telemetry queries

| Command | Description |
|---------|-------------|
| `fluxrig logs` | Query telemetry logs from Mixer (Remote) |
| `fluxrig metrics` | Query telemetry metrics from Mixer (Remote) |
| `fluxrig tail <node>` | Tail live logs from a specific node in real-time |
| `fluxrig inspect-logs` | Inspect binary WAL files on a Rack (Local) |
| `fluxrig inspect-config` | Validate and inspect local configurations |

**Logs Flags**:

- `--api-url` - Mixer API URL (default: `http://localhost:8090`)
- `--limit` - Max records (default: 50)
- `--since` - Start time (e.g., `1h`)
- `--until` - End time (ISO timestamp)
- `--min-level` - Filter by level (TRACE, DEBUG, INFO, WARN, ERROR)
- `--entity` - Filter by entity name

**Metrics Flags**:

- `--api-url` - Mixer API URL (default: `http://localhost:8090`)
- `--limit` - Max records (default: 50)
- `--since` - Start time
- `--until` - End time
- `--name` - Filter by metric name
- `--entity` - Filter by entity name

### Observability query examples

Use these patterns to bridge the gap between business flows and system traces:

```bash
# Follow a specific business flow across all racks (Planned)
fluxrig trace <flux_id>

# View recent errors for a specific payment Gear
fluxrig logs --entity payment-processor --min-level error --since 5m

# Query a specific metric
fluxrig metrics --name flux.bus.messages_in
```

### Topology queries

| Command | Description |
|---------|-------------|
| `fluxrig topology status` | Show global synchronization status. |
| `fluxrig topology list` | List active deployments (racks and gears). |

---

## fluxrig-mixer (dynamic binary)
The orchestration server (requires CGO for DuckDB).

### `fluxrig-mixer`
Starts the Mixer server.

```bash
fluxrig-mixer --config fluxrig-mixer.toml --scenario scenario_01.yaml
```

**Flags**:

- `-c, --config` - Path to TOML configuration file (default: `fluxrig-mixer.toml` or `FLUXRIG_CONFIG`)
- `-s, --scenario` - Scenario reference to load on startup: file path (`./scenario.yaml`) or stored URN (`payment-flow:v1.0.0`). Empty to resume last active.
- `--auto-adopt` - Automatically approve and adopt any new Rack that connects. **For development use only.**

**Key Configuration Settings** (`[mixer]`):

- `api.port` - REST API port (default: `8090`)
- `mixer.data_dir` - Data directory (default: `./data`)
- `mixer.startup_scenario` - Alternative to `--scenario` flag (file path or `name:tag` URN)