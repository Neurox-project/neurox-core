# NEUROX V4 — deployed browser prototype source

This directory preserves the **source implementation supplied from the functioning V4 browser deployment**, with legacy internal names normalized to NEUROX. It is **not a new model**, and is independent of any temporary staging domain.

## Layout

- `core-model.html` — V4 chat interface
- `assets/core-test.js` — ONNX Runtime Web model loading, chat framing, streaming generation and sampling
- `assets/neurox-tokenizer.js` — browser byte-level BPE implementation
- `model-v4/tokenizer.json` and `model-v4/tokenizer.tiktoken` — matching tokenizer assets
- `model-v4/neurox-v4-int8.onnx` — **required locally, not committed** (196,459,955 bytes)

## Run locally

1. Copy the V4 ONNX weights to `model-v4/neurox-v4-int8.onnx`. The original supplied model file may need to be renamed when copied.
2. From the repository root, run `python -m http.server 8000`.
3. Open `http://localhost:8000/reference/v4/core-model.html` and click **LOAD V4 MODEL**.
4. Try a short prompt. Inference uses the browser's WASM CPU.

The original deployment uses its own site shell and routes; navigation links in the preserved HTML may require adjustment when served standalone. The CDN connection is needed to download ONNX Runtime Web.

## Provenance and limits

The user reports that this V4 deployment generates responses successfully. The uploaded JS source confirms a genuine ONNX Runtime inference path and per-token generation. Independent benchmark runs, response quality scores and the V4 training dataset have **not** yet been verified here. The ONNX graph and tokenizer structure were inspected separately in [V4 model notes](../../docs/V4_MODEL.md).

**Do not publish or commit the ONNX weights to regular Git.** Keep the production domain configurable at deployment time. Do not assume a staging URL is the permanent NEUROX domain.
