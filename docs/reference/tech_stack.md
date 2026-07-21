---
slug: /reference/operations/tech-stack
title: Technical stack
---

<!-- Copyright (c) 2026 JAAB Tech SAS, Uruguay All Rights Reserved -->
<!-- See https://jaab.tech -->

# Technical stack

**fluxrig** is built on a modern, high-performance stack designed for reliability, extensibility, and long-term maintainability.

> **Stand on the Shoulders of Giants**: **fluxrig** is proudly built upon the open source ecosystem. We orchestrate best-in-class technologies to deliver a unified enterprise platform, giving full credit and gratitude to the communities maintaining these foundational projects.

## Mixer & Rack (OSS)
*   **Language**: [Go (golang) 1.26+](https://go.dev/)
    - **Stability policy**: We adhere to the **level n version policy** (bleeding edge). We track the latest stable Go release.
    - **Rationale**: To support modern integrations (e.g., bento, Wasm) and leverage cutting-edge ergonomics (iterators), we accept the trade-off of being on the latest release.
    - **Deployment targets**: `CGO_ENABLED=0` creates statically linked binaries. Distributed as native Linux executables or `<15MB` scratch Docker containers.

*   **Orchestration**: [Temporal.io](https://temporal.io/) (Go SDK)


    > [!WARNING]

    *   **Wasm sandbox**: **[Roadmap]** Secure, polyglot execution of custom business logic in Rust, Go, or TypeScript.

*   **ISO8583 library**: [Moov-io/iso8583](https://github.com/moov-io/iso8583) (apache 2.0) - core parsing engine (used in both native core and Wasm gears).
*   **API architecture**: [cbor](https://cbor.org/) (data plane) + [Rest](https://restfulapi.net/) (control plane).
    - **Interface definition**: Go structs (serialized via cbor).
    - **Control plane**: Rest API (served by Mixer).
    - **Internal transport**: cbor messages over NATS (snake protocol).

*   **Messaging & streaming**:
    *   **Transport**: [NATS JetStream](https://nats.io/) ([Synadia](https://nats.synadia.com)) - chosen for high-performance, distributed persistence (snake protocol).
        - **Streams**: See **[wire protocols](../reference/protocols.md)** for the detailed subject topology (`fluxrig.control`, `fluxrig.data`).
    *   **Library**: [Watermill](https://watermill.io/) (mit) - Go library for building event-driven applications.
        - **Role**: Standardizes the "publisher/subscriber" interface. Current: **NATS** (durable). Planned: **gochannel** (RAM) for "turbo wire".
        - **Benefits**: Middleware (OTel, pivot tracing), mockability, and router pattern.

*   **CLI framework**: [Cobra](https://github.com/spf13/cobra) (apache 2.0) - standard library for building powerful CLI applications.
    *   **Key commands**: `Run`, `inspect config`, `inspect logs`, `logs`, `data query`

*   **Configuration**: [Koanf](https://github.com/knadh/koanf) (mit) - lightweight, extensible configuration management (toml/yaml/env) replacing viper.
*   **Logging**:
    *   **Library**: [Log/slog](https://pkg.go.dev/log/slog) (Go stdlib) - structured, high-performance logging.
    *   **Rotation**: [Lumberjack](https://github.com/natefinch/lumberjack) (mit).
    *   **Environment overrides**:
        *   `FLUXRIG_TRACE=1` - Override all log levels to `trace` (useful for debugging).
        *   `FLUXRIG_DISABLE_TELEMETRY=1` - Disable telemetry shipping.

*   **Gear runtime**: [Wazero](https://wazero.io/) (apache 2.0)


    > [!WARNING]
    > **[Roadmap]**: Zero dependency WebAssembly runtime for Go. Enables secure, platform-independent gear execution.

## Integration & ecosystem
*   **Universal I/O engine**: [Bento](https://github.com/warpstreamlabs/bento) (mit)
    - **Fork**: We explicitly use the **WarpStream Labs** fork (mit) to ensure permissive licensing, avoiding the Bento/Redpanda (BSL) restrictions.
    - **Role**: Provides 100+ native connectors (Kafka, s3, amqp, etc.) and the [bloblang](https://warpstreamlabs.github.io/bento/docs/guides/bloblang/about) mapping language.
    - **Integration**: Wrapped as a **native Gear** (`pkg/gears/native/bento`).

## Data & analytics
*   **Operational db**:
    *   **Standard tier**: [DuckDB](https://duckdb.org/) (embedded). high-performance OLAP + oltp for local state.
    *   **Enterprise**: [Distributed sql](https://en.wikipedia.org/wiki/Distributed_SQL) (external). supports ha, replication, and concurrency for Mixer state.

*   **Analytics dw**: [DuckDB](https://duckdb.org/) (mit) + [parquet](https://parquet.apache.org/) (apache 2.0) - high-performance OLAP on local storage.
*   **Visualization**:
    *   **Oss**: [Grafana](https://grafana.com/) - industry standard for observability dashboards.
    *   **Enterprise**: **Signoz** (open source apm) - evaluation candidate (full-stack apm & tracing ui).

*   **Secure store**:
    *   **OSS**: AES-256-GCM (software encryption).
    *   **Enterprise**: [HashiCorp Vault](https://developer.hashicorp.com/vault) or [AWS KMS](https://aws.amazon.com/kms/).

## Web management UI (enterprise)
*   **Framework**: [Reflex](https://reflex.dev/) (apache 2.0) - pure Python web framework that compiles to react/next.js.
*   **Ui library**: [Tailwindcss](https://tailwindcss.com/) (mit) + [radix ui](https://www.radix-ui.com/) (mit).
*   **Visual editor**: [React flow](https://reactflow.dev/) (mit) - node-based graph editor for designing scenarios.
*   **Code editor**: [Monaco editor](https://microsoft.github.io/monaco-editor/) (mit) - embedded for editing specs and scripts.

## AI & analytics (local) (future / research)
*   **Inference engine**: [ONNX Runtime](https://onnxruntime.ai/) / [llama.cpp](https://github.com/ggerganov/llama.cpp) - for running AI models locally within the container.
*   **Models**:
    *   [Scikit-Learn](https://scikit-learn.org/) (BSD) (Isolation Forest) for Anomaly Detection.
    *   Quantized LLMs (e.g., Llama-3) (Community License) for the Natural Language Assistant.


## Observability, tracing & ID generation

**fluxrig** uses a simplified observability strategy based on **OpenTelemetry** and the **DuckLake** pattern:

| Tier | Backend(s) | Scale | Phase |
| :--- | :--- | :--- | :--- |
| **Embedded** | DuckDB + Parquet (S3/Local) | < 100M events/day | **[Roadmap]** |
| **Standard** | Arc + OpenSearch | Team deployments | **[Roadmap]** |
| **Enterprise** | ClickHouse + SigNoz | Petabyte scale | **[Roadmap]** |


| Category | Tool/Library | Type | Purpose |
| :--- | :--- | :--- | :--- |
| **Telemetry SDK** | **[OpenTelemetry Go](https://opentelemetry.io/)** (Apache 2.0) | Library | Metrics, Logs, & Distributed Tracing. |
| **Query Engine** | **[DuckDB](https://duckdb.org/)** (MIT) | OLAP | Stateless SQL engine for Metrics & Traces (Embedded). |
| **Query Lang** | **[PRQL](https://prql-lang.org/)** (Apache 2.0) | Language | Time-series optimized query language (compiles to SQL). |
| **Logs** | **[OpenSearch](https://opensearch.org/)** (Apache 2.0) | Search | Evaluation Candidate for Log Search. |
| **Analytics** | **[ClickHouse](https://clickhouse.com/)** (Apache 2.0) | Database | Evaluation Candidate for Petabyte-scale OLAP (Enterprise). |
| **ID Generation** | **[Google/uuid](https://github.com/google/uuid)** (BSD) | Library | Distributed 128-bit UUID v7 (RFC 9562) |
| **OTLP Export** | **[OTLP](https://opentelemetry.io/docs/specs/otlp/)** | Standard | Vendor-neutral export to any OTel-compatible backend. |

> **Ref**: See [Observability Architecture](../architecture/observability.md) for detailed tier documentation.

## Testing, security & compliance

> **Security First**: **fluxrig** development follows strict security standards (PCI-DSS, OWASP, SSF) from the very beginning. All architectural decisions, dependency choices, and coding practices are audited to ensure compliance.

*   **Testing frameworks**:
    *   **[Robot framework](https://robotframework.org/)** (Apache 2.0): Keyword-driven testing for E2E and Acceptance testing.
    *   **[Python](https://www.python.org/)** (PSF): Scripting language for advanced test scenarios and the **fluxrig** SDK.
    *   **[Testcontainers](https://testcontainers.com/)** (MIT): Ephemeral Docker containers for integration testing.

*   **Static analysis (SAST)**:
    *   **[Gosec](https://github.com/securego/gosec)** (Apache 2.0): Go security checker (SQLi, credentials, etc.).
    *   **[Govulncheck](https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck)** (BSD): Go vulnerability database checker.
    *   **[Bandit](https://github.com/pycqa/bandit)** (Apache 2.0): Python security linter.

*   **Container & secret security**:
    *   **[Trivy](https://github.com/aquasecurity/trivy)** (Apache 2.0): Comprehensive container and filesystem vulnerability scanner.
    *   **[Trufflehog](https://github.com/trufflesecurity/trufflehog)** (AGPL - External CLI): Scans git history for high-entropy secrets.

*   **Code coverage**:
    *   **Go cover**: Built-in `Go test -coverprofile` for tracking unit test coverage.
    *   **Standards**:
        *   **Core Libraries (`pkg/*`)**: **> 70%** required.
        *   **Overall project**: **> 60%** required.
    *   **Coverage.py**: Code coverage measurement for Python scripts.

## Utility libraries

**fluxrig** also utilizes these key utility libraries:

*   **[Gin](https://github.com/gin-gonic/gin)**: High-performance http web framework.
*   **[Google/uuid](https://github.com/google/uuid)**: Robust uuid generation.
*   **[Gopkg.in/yaml.v3](https://github.com/go-yaml/yaml)**: Strict yaml marshaling/unmarshaling.

## Documentation & build

The documentation site and PDF generation are powered by:

*   **[Docusaurus](https://docusaurus.io/)**: Modern static site generator (Web version).
*   **[MkDocs](https://www.mkdocs.org/)**: Static site generator (PDF Core version).
*   **[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)**: Theming and UX for the PDF pipeline.
*   **[Mike](https://github.com/jimporter/mike)**: Versioning management for MkDocs (git-based).
*   **Docusaurus OpenAPI**: Modern OpenAPI reference renderer (Scalar/Redocusaurus).
*   **[Mkdocs-with-pdf](https://github.com/orzih/mkdocs-with-pdf)**: PDF generation plugin (using **weasyprint**).
*   **[Mermaid](https://mermaid.js.org/)**: Diagramming and visualization (rendered via `mmdc` CLI).
*   **[Python](https://www.python.org/)**: Pre-processing scripts for validation and layout.