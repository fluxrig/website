# Building Polyglot Gears with WebAssembly (Zig)

fluxrig supports writing custom Gears in any language that compiles to WebAssembly (Wasm) and adheres to our minimal ABI. This tutorial will walk you through building a Wasm Gear using [Zig](https://ziglang.org/).

Zig is an excellent choice for Wasm gears because it generates extremely small binaries, has no hidden runtime, and natively supports WebAssembly targets out of the box.

## The fluxrig Wasm ABI

To interact with the fluxrig host (Mixer/Rack), your Wasm module must export the following functions:
- `alloc(len: i32) -> i32`: Allocates memory in the Wasm guest and returns a pointer.
- `free(ptr: i32, len: i32)`: Frees memory.
- `process(ptr: i32, len: i32) -> i64`: The main entrypoint. The input pointer contains the CBOR-encoded `fluxMsg`. The function returns a packed 64-bit integer (high 32 bits = return pointer, low 32 bits = return length).

You can also import host functions to interact with the Rack:
- `env.log(level: i32, ptr: i32, len: i32)`: Emits a log message to the Rack's structured logger.

## 1. Writing the Zig Gear

Create a file named `polyglot.zig`:

```zig
const std = @import("std");

// Expose the allocator to the host
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
const allocator = gpa.allocator();

// Host functions we expect
extern "env" fn log(level: i32, ptr: [*]const u8, len: i32) void;

fn hostLog(level: i32, msg: []const u8) void {
    log(level, msg.ptr, @as(i32, @intCast(msg.len)));
}

// Exported ABI functions for Host to call
export fn alloc(len: u32) [*]u8 {
    const slice = allocator.alloc(u8, len) catch return @as([*]u8, @ptrFromInt(0));
    return slice.ptr;
}

export fn free(ptr: [*]u8, len: u32) void {
    const slice = ptr[0..len];
    allocator.free(slice);
}

// process is the entrypoint
export fn process(ptr: [*]u8, len: u32) u64 {
    hostLog(2, "Zig Wasm Gear: Processing message!");

    // In a real gear, we would decode the CBOR payload here.
    // For this example, we'll act as a pass-through filter.
    const input = ptr[0..len];
    
    // Allocate buffer for response
    const output = allocator.alloc(u8, len) catch {
        hostLog(4, "Zig Wasm Gear: Out of memory!");
        return 0; // Returning 0 drops the message
    };
    
    @memcpy(output, input);
    
    // The host will read the memory and then call free()
    const ret_ptr: u64 = @intFromPtr(output.ptr);
    const ret_len: u64 = len;
    
    return (ret_ptr << 32) | ret_len;
}
```

## 2. Compiling to WebAssembly

Compile the code to a standalone WebAssembly module using the `wasm32-freestanding` target:

```bash
zig build-lib polyglot.zig -target wasm32-freestanding -dynamic -O ReleaseSmall
```

This will produce a `polyglot.wasm` file. Thanks to Zig's `ReleaseSmall` optimization, this file should be incredibly small (often < 10KB), making it perfect for rapid distribution over the edge network.

## 3. Securing and Importing the Gear

fluxrig operates on a Zero-Trust supply chain model. Before a Wasm module can be imported, it must be cryptographically signed by a trusted vendor key (`fluxrig.signature`), and then countersigned by the Mixer (`fluxrig.cluster.signature`).

### Step A: Generate a Trust Root
If you haven't already, generate an Ed25519 keypair and place the public key in the Mixer's trusted directory (`data/wasm/keys`):

```bash
# Generate the keypair
fluxrig keys gen-cluster -o ./my_vendor.key

# Copy the public key to the Mixer's trust store
mkdir -p ./data/wasm/keys
cp ./my_vendor.key.pub ./data/wasm/keys/
```

### Step B: Sign the Wasm Payload
Sign your newly compiled Wasm module with your private key. This embeds the cryptographic signature directly into the Wasm binary as a custom section:

```bash
fluxrig wasm sign ./polyglot.wasm ./my_vendor.key
```

### Step C: Import to the Catalog
Now, securely import the signed payload to the Mixer. The Mixer will cryptographically verify your vendor signature against the public keys in its trust store before distributing it over the NATS Snake.

```bash
fluxrig wasm import ./polyglot.wasm
```

This command will upload the file securely and return its unique SHA-256 hash.

Now, you can reference this hash in a Scenario YAML file:

```yaml
name: "Wasm Zig Demo"
version: "v1.0.0"
gears:
  - name: my-zig-filter
    type: wasm
    config:
      # Use the hash returned by the import command
      source: "snake://wasm_catalog/<hash>.wasm"
      entrypoint: "process"
      memory_limit_pages: 16 # Sandbox limited to 1MB
```

Upload the scenario using the fluxrig CLI:

```bash
fluxrig scenario import ./scenario.yaml --activate
```

The Rack will instantly download the `.wasm` binary from the secure catalog, instantiate a sandboxed `wazero` virtual machine, and begin routing messages through your custom Zig logic!
