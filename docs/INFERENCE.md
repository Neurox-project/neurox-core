# Browser inference building blocks

NEUROX publishes two small, dependency-free JavaScript modules:

- `src/sampling.mjs`: greedy decoding, temperature, Top-K, Top-P, and repetition penalty.
- `src/onnx-adapter.mjs`: a minimal ONNX Runtime Web session wrapper for a **specific** decoder contract.

## Tests

Requires Node.js 18 or newer. No npm installation is needed for these unit tests.

```sh
node --test tests/*.test.mjs
```

The ONNX adapter tests use a mocked runtime. They validate tensor construction, output shape handling, and error paths; **they do not demonstrate inference on real model weights**.

## Sampling

```js
import { sampleToken } from './src/sampling.mjs';

const tokenId = sampleToken([0.2, 1.4, 0.6], {
  temperature: 0.7,
  topK: 3,
  topP: 0.9,
  repetitionPenalty: 1.1,
  recentTokens: [0]
});
```

Set `temperature: 0` for deterministic greedy decoding. Sampling uses an optional `random` callback to support deterministic tests.

## ONNX Runtime Web

The adapter expects an externally provided ONNX Runtime Web object and a model URL. It assumes:
- An `input_ids` input tensor of shape `[1, sequence_length]` and type int64.
- An optional `attention_mask` int64 input of the same shape.
- A `logits` output tensor shaped `[1, sequence_length, vocabulary_size]` or `[1, vocabulary_size]`.
- No other required model inputs.

```js
import * as ort from 'onnxruntime-web'; // install and configure separately
import { createOnnxAdapter } from './src/onnx-adapter.mjs';
import { sampleToken } from './src/sampling.mjs';

const adapter = await createOnnxAdapter({
  ort,
  modelUrl: '/models/model.onnx'
});

try {
  const logits = await adapter.inferLastLogits([101, 202]); // example IDs only
  const nextId = sampleToken(logits, { temperature: 0 });
  console.log(nextId);
} finally {
  await adapter.dispose();
}
```

This snippet requires a **compatible actual model**, runtime dependencies, and token IDs produced by that model's tokenizer. The example IDs and URL are placeholders, not an operational NEUROX demo.

## Limitations

- No tokenizer, training pipeline, weights, or model architecture are published here.
- No KV cache, position IDs, past-key-values, multiple output selection, or model-specific feeds.
- The adapter reruns inference on the provided full sequence; performance depends on the actual model and browser.
- Runtime version, WASM assets, hosting headers, quantization support, and real browser compatibility remain to be validated.
- No crypto-domain training or model performance claim is established by these utilities.
