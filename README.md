<div align="center">

# NEUROX

### CRYPTO-NATIVE LANGUAGE MODEL

**An evolving AI language model focused on cryptocurrency, blockchain, DeFi, and Web3.**

[![Status](https://img.shields.io/badge/status-early%20development-202020?style=flat-square)](ROADMAP.md)
[![Architecture](https://img.shields.io/badge/architecture-documented-353535?style=flat-square)](ARCHITECTURE.md)
[![Roadmap](https://img.shields.io/badge/roadmap-public-353535?style=flat-square)](ROADMAP.md)

**[Architecture](ARCHITECTURE.md) · [Inference modules](docs/INFERENCE.md) · [Browser generation](examples/browser-generation.html) · [ONNX check](examples/onnx-smoke-test.html) · [Roadmap](ROADMAP.md) · [Development status](#development-status)**

</div>

---

## About NEUROX

NEUROX is a crypto-focused language model project. Its development direction centers on cryptocurrency, blockchain, DeFi, and Web3 knowledge, with browser-based inference and transparent technical documentation. Domain-specific training and its results will be documented as they are verified.

Our approach is to **develop the model, evaluate its capabilities, and publish verifiable results**. This repository serves as the technical home for project documentation and future reviewed releases.

## Project areas

| Area | Focus | Documentation |
| --- | --- | --- |
| **Language model** | Model development, inference, and evaluation | [Architecture](ARCHITECTURE.md) |
| **Web application** | Browser-based model interaction | [Architecture](ARCHITECTURE.md) |
| **Engineering** | Testing, reproducibility, and release milestones | [Roadmap](ROADMAP.md) |

## System concept

```text
                       NEUROX
                          |
                    Web Interface
                          |
                 Inference Adapter
                          |
              +-----------+-----------+
              |                       |
        Browser Runtime*         Remote API*
                          |
                 Data Adapters*
```

*Conceptual architecture only. Components and integrations shown here are not claims of deployed functionality.*

**Engineering priorities:** modularity · security · transparency · reproducibility.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the design outline and verification criteria.

## Development status

**Early development — documentation and initial tested inference utilities.**

| Milestone | Status |
| --- | --- |
| Public repository | Complete |
| Project overview | Complete |
| Conceptual architecture documentation | Complete |
| Public roadmap | Complete |
| Sampling, BPE tokenizer, ONNX adapter, and generation loop source | Published; unit-tested with a mocked ONNX runtime |
| Browser ONNX compatibility and text-generation harnesses | Source published; real-model validation pending |
| Real-model text generation and benchmarks | Not yet verified |

The [inference modules](docs/INFERENCE.md) include source, unit tests, and a GitHub Actions test workflow. The ONNX adapter has **not** been validated against real model weights. We distinguish **published documentation** from **verified implementation**. This README makes no unverified claims about model size, training methods, performance, or autonomy.

Follow the [public roadmap](ROADMAP.md) for development priorities.

## Next steps

1. Document the current prototype's verified capabilities and limitations.
2. Prepare reproducible setup and demonstration instructions.
3. Validate a complete ONNX model and tokenizer in a real browser; publish measured results.
4. Establish contribution and issue-reporting guidelines.

---

<div align="center">

**NEUROX · Crypto-Native Language Model**

<sub>Technical documentation and project progress are published as they are verified.</sub>

</div>
