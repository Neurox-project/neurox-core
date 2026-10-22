<div align="center">

# NEUROX CORE
### CRYPTO-NATIVE LANGUAGE MODEL · V6

**Building a domain-focused language model for crypto, blockchain, DeFi and Web3.**

**V6 · 897M parameters · 1.2B training tokens (project-reported)**

[Architecture](ARCHITECTURE.md) · [Roadmap](ROADMAP.md) · [Changelog](CHANGELOG.md) · [Evaluation protocol](docs/CRYPTO_EVALUATION.md) · [Historical V4 source](reference/v4/)

</div>

---

## NEUROX V6

NEUROX is an evolving language-model project focusing on blockchain technology, cryptocurrency, digital assets, decentralized finance and Web3. The current development generation is **V6**, superseding the V4 browser prototype documented in this repository.

| Item | V6 status |
| --- | --- |
| Model generation | V6 |
| Parameter count | 897 million (project-reported) |
| Training volume | 1.2 billion tokens (project-reported) |
| Domain | Cryptocurrency, blockchain, DeFi, Web3 |
| Development | Iterative training and evaluation |
| Intended deployment | Server-side inference exposed through an API |
| Public V6 weights and reproducible benchmark | Not yet published here |
| Hosted V6 API | Planned; not claimed operational |

Parameter and training-token figures are supplied by the project team. Architecture details, tokenizer configuration, checkpoints, measured accuracy, hardware and throughput will be documented when verifiable artifacts are published. **Training token count is not a performance benchmark.**

## Interfaces and architecture

```text
              NEUROX WEB / CORE
                       |
                HTTPS API (planned)
                       |
              V6 INFERENCE SERVICE
                       |
              NEUROX V6 · 897M
                       |
            Training / evaluation
```

The intended V6 deployment uses a separate inference service rather than executing the 897M-parameter model inside each visitor's browser. The historical smaller browser-based ONNX demonstration is a separate prototype, not a V6 runtime.

See [ARCHITECTURE.md](ARCHITECTURE.md) for boundaries, security considerations and planned verification.

## Current publication status

- **V6:** current project generation; 897M parameters and 1.2B training tokens reported by the team. Public checkpoints, evaluation outputs and deployment artifacts are pending.
- **V4:** historical ONNX/browser-inference reference source remains available at [reference/v4/](reference/v4/). It is not the current production model.
- **Evaluation:** crypto-domain [protocol](docs/CRYPTO_EVALUATION.md) is published; public V6 scores are not yet established.
- **API:** server-side inference and a web-to-API integration are development priorities, not verified live services.

## Project links

- [NEUROX CORE website](https://boficoin.com/queen.html)
- [Browser inference experiment](https://boficoin.com/core-model/core-model.html) — separate earlier prototype; not V6
- [Development roadmap](ROADMAP.md)
- [Technical documentation](docs/)

## Next milestones

1. Publish an accurate V6 architecture/configuration and checkpoint provenance.
2. Implement and validate the dedicated V6 inference service and API.
3. Connect the web interface to that API, with health checks and error handling.
4. Publish reproducible V6 quality/latency tests and crypto-domain evaluation results.
5. Document deployment, model versioning and operational constraints.

---

<div align="center">

**NEUROX CORE · V6**

<sub>Project-reported specifications are distinct from independently reproduced results.</sub>

</div>
