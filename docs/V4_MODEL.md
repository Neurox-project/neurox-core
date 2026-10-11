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

The model weighs over GitHub's 100 MB normal-file limit, so do **not** commit it to this repository. Keep the model and tokenizer assets locally. The browser page accepts them via file inputs.

- `queen-v4-int8.onnx`
- `tokenizer.json`
- `tokenizer.tiktoken`

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

This framing follows the historical browser prototype, but the V4 training prompt format has not been independently verified. The V4 integration page uses these special IDs by default.

## Verification still needed

1. Run the model in an actual browser with ONNX Runtime Web 1.22.0.
2. Verify tokenizer encoding against the original tokenizer implementation.
3. Generate a real answer and compare its token IDs to a known-good reference.
4. Measure memory, initial load time, and tokens/second.
5. Establish whether the V4 training corpus and checkpoints actually support crypto-domain capabilities.

No model weights or private data are published here.
