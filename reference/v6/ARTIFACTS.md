# V6 artifact and reproducibility record

| Field | Value / evidence |
| --- | --- |
| Model revision | V6 (project-reported) |
| Parameter count | 897M (project-reported; not independently counted) |
| Training volume | 1.2B tokens (project-reported; logs not provided) |
| Model lineage | Not documented |
| Architecture/config, layer/head dimensions | Not supplied |
| Context length | Not verified |
| Tokenizer and matching checksum | Not supplied |
| Checkpoint filename, byte size and SHA-256 | Not supplied |
| Training code and commit SHA | Not supplied |
| Data provenance / license | Not documented |
| Runtime / model loader | Not implemented or verified here |
| Server API | Planned; no verified live endpoint |
| Hardware, RAM / VRAM and throughput | Not measured |
| Crypto-domain evaluation outputs | Not supplied |

## Validation checklist
- [ ] Inspect real checkpoint, architecture config and tokenizer
- [ ] Calculate and report exact parameter total
- [ ] Record training logs and dataset provenance
- [ ] Run reproducible V6 local inference on declared hardware
- [ ] Implement health and model-info endpoints
- [ ] Implement API generation endpoint with limits and errors
- [ ] Measure latency, memory, throughput and concurrency
- [ ] Record raw crypto evaluation outputs under fixed settings

**Note:** V4 ONNX model information and tokenizer IDs are not assumed compatible with V6.
