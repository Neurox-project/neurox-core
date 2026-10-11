# NEUROX V4 — ONNX asset validation

Verified against the provided V4 files (11 October 2026):

| Asset | Observation |
| --- | --- |
| ONNX | 196,459,955 bytes (~187.4 MiB), ONNX IR version 8 |
| Graph input | `input_ids`, int64, shape `[1, sequence]` |
| Graph output | `logits`, float32, shape `[1, sequence, 16384]` |
| Tokenizer | 16,375 ranked byte tokens (IDs 0–16374), 9 special IDs (16375–16383) |
| Vocabulary | 16,384 |
| ONNX graph | 2,592 nodes and 287 initializers; includes quantized MatMulInteger operators |

The published ONNX adapter's input and output contract matches the model's declared graph interface. The supplied model has no declared attention_mask input. This is **static structural validation**, not an executed ONNX Runtime inference.

## Local model files

The model weighs over GitHub's 100 MB normal-file limit, so do **not** commit it to regular Git. The matching tokenizer config and rank file are now published in [the V4 source directory](../reference/v4/). The preserved V4 browser page expects its model in a local relative directory.

- `reference/v4/model-v4/neurox-v4-int8.onnx` — copy the provided V4 weights under this deployment-neutral filename
- `reference/v4/model-v4/tokenizer.json`
- `reference/v4/model-v4/tokenizer.tiktoken`

## V4 prompt framing

The tokenizer declares:

- `<|bos|>` = 16375
- `<|user_start|>` = 16376
- `<|user_end|>` = 16377
- `<|assistant_start|>` = 16378
- `<|assistant_end|>` = 16379

A plausible chat prompt layout is:

```text
<|bos|><|user_start|>USER_TEXT<|user_end|><|assistant_start|>
```

This framing is directly implemented in the user-supplied working V4 browser source. It has not been cross-checked against the original training pipeline.

## Operational status and verification still needed

The project owner reports that V4 is already running successfully in the browser. The provided deployed JavaScript source shows ONNX Runtime Web 1.22.0 loading and real token-by-token inference. This is stronger evidence of a working integration than static ONNX inspection, but independent runtime measurements and model quality results are not yet available.

1. Independently reproduce a known-good V4 response and capture raw output token IDs.
2. Compare tokenizer behavior and outputs against the preserved working implementation.
3. Measure memory, load time, and tokens/second on specified hardware.
4. Score the [crypto-domain evaluation suite](CRYPTO_EVALUATION.md).
5. Establish whether the V4 training corpus and checkpoints actually support crypto-domain capabilities.

No model weights or private data are published here.
