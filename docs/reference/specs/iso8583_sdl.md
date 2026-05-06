---
slug: /reference/specs/iso8583
title: ISO8583 SDL
---

# ISO8583 SDL

The ISO8583 SDL is a YAML-based format used to strictly define the dialect of ISO8583 protocols (e.g., Visa Base I, Mastercard IPM, Fiserv, Postilion).

Unlike traditional "Packager" XMLs (which only define physical layout), the SDL defines:

1.  **Physical layout**: Binary/ASCII encoding, length prefixes.
2.  **Semantic aliases**: Human-readable names (`card.pan` vs `field 2`).
3.  **Validation rules**: Context-aware mandatory checks.
4.  **Simulation macros**: Instructions for generating mock data.

## Schema structure

```yaml
meta:
  name: "visa-base-i"
  protocol: "iso8583" # Explicit protocol type
  version: "1.0"

fields:
  # Field Definition Map (1-128)
  1: { label: "Bitmap", type: "binary", length: 8, enc: "binary" }
  2: { label: "PAN", type: "llvar_n", length: 19, alias: "card.pan", enc: "bcd" }

# --- PLANNED ROADMAP FEATURES ---
# The following blocks are architecturally defined but NOT yet active in the current release

# validations:
#   - rule: "mandatory"
#     fields: [2, 3, 4]
#     if: "mti == '0100'"

# simulation:
#   "0100":
#     2: "$PAN(VISA, 16)"
```

> [!WARNING]
> **Transport Headers & Offsets:** Ensure your SDL definition exactly matches the byte offset delivered by the I/O Gear. If the `io_iso8583` gear strips transport-level headers (like Visa V.I.P.), the SDL must begin defining at the MTI, NOT the proprietary header.

## Field definitions

Fields are defined by ID (0-128). ID 0 is reserved for MTI. ID 1 (Bitmap) is implicit.

### Types

| Type | Description |
| :--- | :--- |
| `numeric` | Fixed length string of digits (e.g., N4, N12). |
| `alpha` | Fixed length alphanumeric (e.g., AN12). |
| `binary` | Fixed length raw bytes. |
| `llvar` | Variable length string (0-99). |
| `lllvar` | Variable length string (0-999). |
| `llvar_n` | Variable length numeric (0-99). |
| `date_exp` | Expiration Date (YYMM) - handled as specific type for validation. |

### Attributes

| Attribute | Description |
| :--- | :--- |
| `length` | Max length (for variable) or exact length (for fixed). |
| `label` | Human readable label for logs. |
| `alias` | **Critical**. Dot-notation alias for business logic access. |
| `pad` | Padding char (default ' ' or '0'). |
| `storage` | Parquet Strategy: `none` (default), `decoded`, or `masked`. |
| `log_mask` | **Security**: If `true`, masks values in Logs/Console (e.g., PANs, CVV). Default: `false`. |
| `enc` | Value Encoding Override (`ascii`, `ebcdic`, `bcd`, `binary`). Default: `spec.encoding` |
| `len_enc` | Length Prefix Encoding (`ascii`, `bcd`, `binary`). Default: `spec.encoding` |

### Example

```yaml
fields:
  2:
    label: "Primary Account Number"
    type: "llvar_n"
    length: 19
    alias: "card.pan"
    storage: "masked" # Store as hashed/masked in analytics


  4:
    label: "Amount, Transaction"
    type: "numeric"
    length: 12
    pad: "0"
    alias: "amount.transaction"
```

## Subfields (private fields)

For complex fields (like `DE 48` or `DE 127`), you can define nested subfields.

```yaml
  48:
    label: "Private Data"
    type: "lllvar"
    subfields:
      # Tag-Length-Value (TLV) or fixed position definitions
      "01":
         type: "numeric"
         length: 4
         alias: "merchant.category_code"
```

## Roadmap: validation & simulation logic

> [!WARNING]
> **Planned Features**: The `validations` and `simulation` blocks are currently in the **Technical Design** phase. The `codec_iso8583` gear in the current release focuses exclusively on High-Fidelity Parsing and Alias Mapping. Logic-driven validation and macro-based simulation are targeted for the future milestone.

### Planned Simulation Macros:

*   `$PAN(SCHEME, LEN)`: Generates valid Luhn PAN.
*   `$RAND(MIN, MAX)`: Random integer.
*   `$UUID`: Unique ID.
*   `$NOW(FORMAT)`: Current timestamp.
*   `$ECHO(FIELD)`: Copies value from Request (for Response generation).

---

## PCI-DSS compliance integration

The SDL is the primary tool for **PCI Scope Reduction**. By defining security attributes directly in the spec, you ensure that sensitive data is isolated and protected across the entire data plane.

### Recommended configuration for sensitive fields

| Field | Description | Recommended Label | `log_mask` | `storage` |
| :--- | :--- | :--- | :--- | :--- |
| **2** | Primary Account Number | `PAN` | `true` | `masked` |
| **35** | Track 2 Data | `Track 2` | `true` | `none` |
| **45** | Track 1 Data | `Track 1` | `true` | `none` |
| **52** | Personal ID Number (PIN) | `PIN Block` | `true` | `none` |
| **55** | ICC / Chip Data | `EMV Data` | `false` | `decoded` |

> [!IMPORTANT]
> Setting `log_mask: true` ensures that the field value is replaced with asterisks in all **Rack** and **Mixer** operational logs. Choosing `storage: masked` ensures that the value is hashed (SHA-256) before being persisted to the analytics data lake.