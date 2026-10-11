# Browser inference building blocks

NEUROX publishes three small, dependency-free JavaScript modules:

- `src/sampling.mjs`: greedy decoding, temperature, Top-K, Top-P, and repetition penalty.
- `src/onnx-adapter.mjs`: a minimal ONNX Runtime Web session wrapper for a **specific** decoder contract.
- `src/generate.mjs`: an autoregressive generation loop with streaming callbacks, stop tokens, and cancellation.

## Tests

Requires Node.js 18 or newer. No npm installation is needed for these unit tests.

```sh
node --test tests/*.test.mjs
```

The ONNX adapter and generation tests use mocked model outputs. They validate tensor construction, output shape handling, and error paths; **they do not demonstrate inference on real model weights**.

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

## Generation orchestration

```js
import { generateTokens } from './src/generate.mjs';

// Requires a compatible real adapter and tokenizer implementation.
const result = await generateTokens({
  adapter,
  tokenizer,
  prompt: 'Explain proof of stake',
  prefixTokens: [], // model-specific role/BOS tokens, if required
  stopTokenIds: [], // model-specific end-of-turn IDs
  maxNewTokens: 48,
  contextLength: 128,
  sampling: { temperature: 0.7, topK: 30, topP: 0.9 },
  onToken: ({ text }) => console.log(text)
});
```

The caller supplies the tokenizer's `encode(text)` and `decode(tokenIds)` methods, prompt framing, and actual model files. Without them this example cannot generate meaningful language.

## Next integration milestone

The historical browser prototype references a model file and separate tokenizer assets, but the model weights and tokenizer implementation have not been located as complete, publishable assets. Before calling the browser demo operational, validate the model's actual input/output names and shapes, tokenizer special tokens, compatible runtime version, and a real text-generation test.

## Browser-local compatibility check

The repository includes [examples/onnx-smoke-test.html](../examples/onnx-smoke-test.html), a developer page that loads a local ONNX file in the browser and performs **one inference step** using numeric token IDs supplied by the developer.

From the repository root, start a static HTTP server (for example, `python3 -m http.server 8000`) and open `/examples/onnx-smoke-test.html`. Select a compatible `.onnx` file and enter token IDs produced by its matching tokenizer. The page downloads ONNX Runtime Web 1.22.0 from jsDelivr, but does not upload the selected model to a server. No tokenizer, model weights, or training data are bundled.

**Important:** This is an unverified integration harness until tested with real compatible NEUROX weights. A successful single-step run does not establish correct text generation, model quality, or domain-specific training.

## Limitations

- No tokenizer, training pipeline, weights, or model architecture are published here.
- No KV cache, position IDs, past-key-values, multiple output selection, or model-specific feeds.
- The adapter reruns inference on the provided full sequence; performance depends on the actual model and browser.
- Runtime version, WASM assets, hosting headers, quantization support, and real browser compatibility remain to be validated.
- No crypto-domain training or model performance claim is established by these utilities.
