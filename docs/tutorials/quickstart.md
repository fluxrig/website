---
slug: /tutorials/quickstart
title: 5-Minute Quickstart
---

# 5-Minute Quickstart

This guide will walk you through a fully functional local deployment of **fluxrig** in under 5 minutes. You will spin up the control plane, enroll an edge node, and start processing telemetry data without writing any custom code or configuring complex registries.

> [!TIP]
> **Zero Config First-Run**: By default, fluxrig automatically generates necessary cryptographic keys and embedded database files in your working directory. You don't need a pre-existing complex database or secret manager setup to get started!

## Prerequisites

*   **Linux or macOS**
*   **Go 1.25+** (if compiling from source)
*   **Make**

---

## 1. Get the binaries

Currently, building from source is the only available option. Clone the repository and run `make build`:

```bash
git clone https://github.com/jaab-tech/fluxrig.git
cd fluxrig
make build
```

This will produce the two core binaries in the `./bin` directory:
*   `fluxrig-mixer`: The centralized Control Plane (Registry, Telemetry, NATS Bus).
*   `fluxrig`: The unified CLI and Edge Node (The Rack).

---

## 2. Start the Mixer (Control Plane)

The Mixer acts as the brain of your rig. It manages edge node enrollment, maintains the system topology, and ingests telemetry.

For this quickstart, we will use the built-in `getting_started.yaml` scenario and the `--auto-adopt` flag. The `--auto-adopt` flag bypasses the manual approval step for new edge nodes, making local development seamless.

```bash
# In your first terminal window:
./bin/fluxrig-mixer --auto-adopt examples/scenarios/getting_started.yaml
```

**What just happened?**
1. The Mixer initialized an embedded **DuckDB** telemetry store.
2. It started an embedded **NATS JetStream** server on port `4222`.
3. It imported the `getting_started.yaml` scenario and set it to active.

---

## 3. Start a Rack (Edge Node)

The Rack is the edge execution node. It connects to the Mixer, receives its unique Identity (`fluxEntityID`), downloads the active scenario, and starts processing data.

```bash
# In a new terminal window:
./bin/fluxrig rack
```

**What just happened?**
1. The Rack initiated the **Deferred Adoption Lifecycle**.
2. Because the Mixer was running with `--auto-adopt`, the Rack was instantly approved.
3. The Rack downloaded its passport (`state.flux`) and the `getting_started` scenario.
4. It started the local "Gears" (modules) defined in the scenario.

### Under the Hood: The Scenario Configuration

When the Rack connects to the Mixer, it receives the following declarative YAML logic. This scenario tells the Rack to deploy a single **Bento Gear**, which uses the popular open-source stream processor (Bento fork) under the hood to generate and manipulate data dynamically.

```yaml
meta:
  name: Getting Started
  version: v1.0.0

# This scenario demonstrates a basic telemetry generator using the Bento gear.
# It simulates a node generating periodic data and logging it to the console.

gears:
  - name: generator
    type: bento
    config:
      bento:
        input:
          generate:
            mapping: |
              root.flux_id = uuid_v4()
              root.timestamp = now()
              root.status = "UP"
              root.metrics.cpu_pct = random_int(min:10, max:85)
              root.metrics.mem_mb = random_int(min:512, max:4096)
              root.message = "Hello from fluxrig Getting Started!"
            interval: 2s
        output:
          stdout: {}
```

**How it works:**
*   **`type: bento`**: We are defining a declarative data-processing Gear without writing compiled Go code.
*   **`input.generate`**: Instead of listening on a network port, this block artificially generates synthetic JSON payloads every 2 seconds (`interval: 2s`).
*   **`mapping`**: This uses Bloblang (Bento's mapping language) to inject mock metrics like a simulated CPU percentage (`cpu_pct`) and memory usage (`mem_mb`), alongside a `uuid_v4` and timestamp.
*   **`output.stdout`**: This prints the generated JSON payload directly to your Rack's terminal. 

You should now see periodic logs in the Rack terminal reflecting this mapped data:
```text
[INFO] BENTO: {"flux_id":"...","metrics":{"cpu_pct":42,"mem_mb":1024},"message":"Hello from fluxrig Getting Started!"}
```

---

## 4. Observe the flow

The `getting_started` scenario automatically generates synthetic telemetry data (CPU/Memory metrics) on the Rack and streams it securely to the Mixer.

You can query this data directly using the `fluxrig` CLI!

Open a third terminal and query the real-time metrics:

```bash
# View the latest heartbeats sent by the Rack
./bin/fluxrig metrics --name fluxrig.rack.heartbeats_sent

# View all metrics for your node (replace with your auto-generated node name if different)
./bin/fluxrig metrics --entity node-xxxxx
```

> [!NOTE]
> The Mixer exposes a REST API on port `8090` by default. The CLI is querying `http://localhost:8090/api/v1/telemetry/metrics` behind the scenes.

---

## 5. Next steps

Congratulations! You have successfully established a secure, bidirectional edge-to-cloud topology.

*   **Explore Scenarios**: Learn how to write your own data flows in the [Scenario Configuration](../reference/configuration.md) guide.
*   **Production Deployment**: Read about the [Security & PKI](../architecture/security.md) model to securely manage your cryptographic keys and disable `--auto-adopt`.
*   **ISO8583 Routing**: See the [Payments Tutorial](./iso8583_robot_suite.md) to route financial transactions.
