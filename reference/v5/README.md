# NEUROX V5 — independent version record

**Status: artifacts pending.** V5 must be documented as a separate model generation, not as a renamed copy of the V4 browser/ONNX prototype.

## Evidence in this repository
The repository currently supplies the V4 browser inference implementation, tokenizer and model notes in [../v4/](../v4/). At the time this V5 record was created, no V5 checkpoint, tokenizer/configuration, training log, adapter or reproducible V5 inference result had been made available for examination here.

## Required to verify V5
- Training and architecture configuration: number of layers, width, heads, vocabulary, context limit and parameter count.
- Model lineage: trained from scratch, continued V4 pretraining, or fine-tuning; parent checkpoint identifier and dataset changes.
- Matching tokenizer details and checksums.
- Checkpoint filename, size and SHA-256 checksum (do not commit large/private weights to ordinary Git).
- Inference implementation with explicitly configured V5 file paths, rather than relabeling a V4 model.
- Raw test outputs, execution commands, environment and crypto-domain evaluation scores.

Use [ARTIFACTS.md](ARTIFACTS.md) to document concrete V5 files when available. **No V5 performance or training completion is claimed here.**
