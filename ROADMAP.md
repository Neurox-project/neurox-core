# NEUROX CORE — Development Roadmap

**Current generation: V6.** This roadmap separates historical published work, V6 project-reported progress, and outstanding verification/deployment work. Planned milestones are not promises of dates or already deployed features.

## Phase 01 — Foundation (published)

- [x] Public NEUROX repository and project documentation
- [x] Conceptual inference architecture and contribution guidelines
- [x] Historical browser ONNX/V4 prototype source
- [x] Initial crypto-domain evaluation protocol

## Phase 02 — V6 model development (project-reported; independent verification pending)

- [x] Report V6 model generation and 897M parameter size
- [x] Report 1.2B training-token volume
- [ ] Publish V6 configuration, tokenizer specification and architecture details
- [ ] Publish checkpoint provenance, data-license notes and reproducible model loading
- [ ] Publish actual V6 training/evaluation logs and hardware details

A checked reporting item records that project specifications have been stated; it does **not** certify model weights or training measurements.

## Phase 03 — Inference API (planned)

- [ ] Select runtime and infrastructure for 897M-parameter inference
- [ ] Deploy private test endpoint with authentication, health checks and resource limits
- [ ] Implement request/response contract and streaming generation as supported
- [ ] Integrate the NEUROX web interface with the dedicated inference API
- [ ] Measure memory consumption, generation latency, concurrency and failure recovery
- [ ] Publish safe deployment/configuration examples without credentials

## Phase 04 — Evaluation and release (planned)

- [ ] Run held-out blockchain, DeFi and Web3 question sets
- [ ] Report raw V6 outputs, accuracy criteria and model limitations
- [ ] Compare V6 with historical baselines using identical evaluation conditions
- [ ] Publish release artifacts and versioned documentation when reproducible
- [ ] Track technical issues and verified milestones publicly

## Architecture and history

See [ARCHITECTURE.md](ARCHITECTURE.md) for the intended V6 API design. The archived [V4 reference](reference/v4/) documents a prior browser experiment and should not be presented as the current V6 engine.

## Reporting policy

**Published** means an artifact is visible in this repository. **Project-reported** refers to unverified project specifications. **Planned** means neither public deployment nor operational readiness is implied.
