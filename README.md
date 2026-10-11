<div align="center">

# NEUROX

### CRYPTO-NATIVE LANGUAGE MODEL

**An evolving AI language model focused on cryptocurrency, blockchain, DeFi, and Web3.**

[![Status](https://img.shields.io/badge/status-early%20development-202020?style=flat-square)](ROADMAP.md)
[![Architecture](https://img.shields.io/badge/architecture-documented-353535?style=flat-square)](ARCHITECTURE.md)
[![Roadmap](https://img.shields.io/badge/roadmap-public-353535?style=flat-square)](ROADMAP.md)

**[V4 working prototype source](reference/v4/) · [Crypto evaluation](docs/CRYPTO_EVALUATION.md) · [Architecture](ARCHITECTURE.md) · [Inference modules](docs/INFERENCE.md) · [V4 model validation](docs/V4_MODEL.md) · [Roadmap](ROADMAP.md)**

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

**V4 browser inference prototype available; crypto-specialized model development remains in progress.**

| Milestone | Status |
| --- | --- |
| Public repository | Complete |
| Project overview | Complete |
| Conceptual architecture documentation | Complete |
| Public roadmap | Complete |
| Sampling, BPE tokenizer, ONNX adapter, and generation loop source | Published; unit-tested with a mocked ONNX runtime |
| V4 browser ONNX inference source | Published from a user-reported working deployment; independent benchmark pending |
| Browser ONNX compatibility and text-generation harnesses | Published as separate engineering examples |
| V4 model graph and tokenizer asset validation | Completed (static inspection) |
| Real-model text generation | Reported operational in the existing browser deployment; independent benchmark pending |
| Crypto-domain evaluation | Test protocol published; scoring pending |

The [deployed V4 prototype source](reference/v4/) includes a complete ONNX Runtime Web inference path, chat formatting, a tokenizer and sequential generation. The project owner reports that the deployed V4 model works. That report is distinct from an independently reproduced benchmark, which remains pending. The separate [inference modules](docs/INFERENCE.md) and tests are engineering utilities, not a replacement for the V4 deployment. Training corpus and crypto-domain performance have not been independently verified. The staging host is not the permanent project domain.

Follow the [public roadmap](ROADMAP.md) for development priorities.

## Next steps

1. Preserve the operational V4 source and reproduce its inference with the provided model assets.
2. Benchmark V4 and publish raw crypto-domain evaluation outputs.
3. Prepare a provenance-tracked training dataset and an independently held-out evaluation set.
4. Train and compare a candidate V5 before changing the production deployment.

---

<div align="center">

**NEUROX · Crypto-Native Language Model**

<sub>Technical documentation and project progress are published as they are verified.</sub>

</div>
