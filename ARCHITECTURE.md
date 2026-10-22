# NEUROX CORE — V6 Architecture

> **Status:** Proposed server-side V6 deployment architecture. Model size and training volume are project-reported; deployed inference/API capability has not been independently verified.

## Model generations

| Generation | Role |
| --- | --- |
| V6 · 897M parameters · 1.2B training tokens | Current project generation, project-reported specifications |
| V4 browser ONNX prototype | Historical reference in [reference/v4/](reference/v4/); not V6 |

The training-token figure describes reported training volume, not context length or proven response quality. Public configuration, weights, training logs and benchmarks are pending.

## Intended V6 deployment

```text
Browser / NEUROX CORE UI
          |
      HTTPS / TLS
          |
    API gateway / proxy
      | auth / rate limits / CORS
          |
   Inference application
      | prompt formatting / validation
      | timeout / streaming / generation limits
          |
   NEUROX V6 checkpoint
          |
  CPU or GPU execution backend
```

This drawing describes an intended system; it does not mean the V6 API is currently running.

## Service boundaries

**Web interface.** Sends requests to an application-controlled HTTPS API. Must not embed server keys or machine credentials in client-side JavaScript.

**Inference API.** Responsible for input validation, authentication or abuse controls, request quotas, logging policies, safe error messages, timeouts and cancellation. Expose model identity and health independently of text generation.

**Model runtime.** Loads a versioned V6 checkpoint and its matching tokenizer/configuration, manages memory and generation limits, and reports measured resource needs. The project should benchmark a CPU baseline before claiming GPU is mandatory or unnecessary.

**Data adapters.** Future external-market or blockchain feeds must document provenance, freshness, licensing and security boundaries. They are not assumed deployed.

## Publication and verification checklist

1. Publish V6 checkpoint manifest, tensor/parameter totals, tokenizer and config.
2. State license and provenance constraints for model assets and training data.
3. Record reproducible runtime versions, sample invocation and hardware.
4. Publish actual memory, throughput and latency benchmarks.
5. Run held-out crypto-domain evaluations with raw responses and scoring rules.
6. Document API contract, authentication, failure modes and operational safeguards.

## Historical browser implementation

The older V4 browser inference source is preserved for traceability. The [browser test page](https://boficoin.com/core-model/core-model.html) refers to an earlier, smaller ONNX experiment and must not be interpreted as V6 serving.

See [ROADMAP.md](ROADMAP.md) for implementation priorities.
