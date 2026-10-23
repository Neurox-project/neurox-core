# NEUROX V6 — 897M development generation

**Project-reported:** approximately **897 million parameters** and **1.2 billion training tokens**. These numbers are reported by the project owner, not independently calculated from a V6 checkpoint in this repository.

V6 is intended to run through a **server inference API**, separately from the historical V4 ONNX/browser implementation.

## Current verified publication boundary
- V6 is described in the top-level [README](../../README.md), [architecture](../../ARCHITECTURE.md) and [roadmap](../../ROADMAP.md).
- The repository does **not** currently publish inspectable V6 weights, actual model configuration, matching tokenizer, runtime/server implementation, training log or benchmark output.
- Accordingly, the V4 browser adapter must **not** be copied into V6 and relabeled as working V6 inference.

## Required V6 deliverables
1. Checkpoint manifest with file names, sizes, SHA-256 hashes and source/revision.
2. Architecture and tokenizer configuration; independently count model parameters.
3. Training summary with corpus provenance, observed tokens/steps, checkpoint lineage and limitations.
4. Version-specific server loader and POST generation endpoint, tested against the actual V6 weights.
5. API health/model info, timeouts, request limits and streaming or non-streaming generation contract.
6. Real latency/RAM/VRAM benchmarks and held-out crypto-domain evaluation outputs.

See [ARTIFACTS.md](ARTIFACTS.md). All unspecified properties remain **unknown**, not inherited from V4.
