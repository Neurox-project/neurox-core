# Verify real V5 and V6 model files

The GitHub repository currently contains V4 browser source, but **does not have inspectable V5/V6 checkpoints**. Do not duplicate or rename V4 assets as V5/V6.

## Run locally (Windows / Python 3.12)

Place each generation's *real* model assets in separate local directories outside Git:

```text
D:\\NEUROX\\V5\\
D:\\NEUROX\\V6\\
```

Download the script [inspect_model_artifacts.py](../scripts/inspect_model_artifacts.py) and run in PowerShell:

```powershell
py -3.12 scripts/inspect_model_artifacts.py "D:\\NEUROX\\V5" --version v5 --output V5-inventory.json
py -3.12 scripts/inspect_model_artifacts.py "D:\\NEUROX\\V6" --version v6 --output V6-inventory.json
```

The inventory contains relative paths, file sizes and SHA-256 checksums. For `.safetensors` it also reads **headers only** to report tensor counts, tensor dtypes and total tensor parameter elements across shards. It does not load, deserialize or execute PyTorch/pickle files. The script uses Python's standard library, not CUDA, PyTorch or Transformers.

For preliminary analysis, add `--no-hash`; **this removes integrity checks**.

## How to interpret results

- `safetensors_total_parameter_elements` is a count of stored tensor elements, **not always an exact unique trainable-parameter count** (duplicate/adaptor tensors and tied weights may change interpretation).
- A `.pt`/`.pth`/`.bin` checkpoint gets a file hash and byte size but no tensor inspection; deserializing unknown pickle-based artifacts can execute untrusted code.
- ONNX and GGUF files receive hash and size but not parameter totals in this initial standard-library inspector.
- A tokenizer or a config alone does **not** prove that matching weights exist or have been trained.
- Claimed training tokens and quality benchmarks require training logs and recorded tests, not just a checkpoint filename.

## Next verification and publication steps

1. Inspect V5 inventory and V6 inventory separately.
2. Compare each configuration and tokenizer to V4 to determine true lineage and compatibility.
3. Confirm source and license of checkpoints and any confidential data.
4. Test real V5 and V6 inference with appropriate runtimes; record raw responses, speed and memory.
5. Publish a sanitized manifest **only after reviewing filenames and paths for sensitive information**. Never upload weights, access tokens, private training samples or secret paths by default.

Reference: [V5 artifacts](../reference/v5/ARTIFACTS.md) · [V6 artifacts](../reference/v6/ARTIFACTS.md) · [comparison](VERSION_COMPARISON.md).
