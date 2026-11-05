<div align="center">

# NEUROX CORE
### Crypto-native language model · NEUROX CORE V6

**896.5M-parameter nanochat GPT · real published weights · server-side CPU inference**

[Technical architecture](ARCHITECTURE.md) · [V6 deployment & API](docs/V6_SERVER.md) · [Python client](python/neurox_client.py) · [V6 on Hugging Face](https://huggingface.co/Crawlnet/queen-v6) · [Website](https://www.neuroxcore.com/)

</div>

---

## NEUROX CORE V6

NEUROX CORE is a crypto-focused language model project built around crawler-collected materials and additional processed public records and synthetic study/Q&A data. The released [NEUROX CORE V6 model](https://huggingface.co/Crawlnet/queen-v6) includes safetensors, tokenizer, configuration, a Python CLI and model-card evaluation. This GitHub repository holds supporting utilities, interface prototypes and documentation. **It does not host the 1.79 GB model checkpoint or the production model loader.**

| Property | V6 published specification |
| --- | --- |
| Model | NEUROX CORE V6 |
| Parameters | ~896.5M total / ~435.2M non-embedding |
| Transformer | nanochat GPT, 20 layers, width 1280, 10 attention heads |
| Context | 2048 tokens |
| Vocabulary | 32768 |
| Pretraining volume | See model card: ~3.309B trained positions; ~774.5M unique positions |
| Weights and tokenizer | [Hugging Face](https://huggingface.co/Crawlnet/queen-v6/tree/main) |
| Deployed inference | Project-run FastAPI + Uvicorn / CPU / Nginx proxy |

**Earlier docs mentioned a 1.2B-token project figure and described V6 deployment as merely planned.** These statements are superseded by the published model card and the project's November 2026 deployment. Metrics sourced from the model card have not been independently replicated by this repository.

## Research-stage model: why V6 can miss simple questions

**NEUROX CORE V6 is an early-stage, crypto-focused research language model — not a general-purpose assistant with ChatGPT-level instruction following.** NEUROX concentrates on blockchain concepts, DeFi, tokens, smart contracts, network protocols and related web material. The released checkpoint is part of an iterative training and evaluation effort; its domain focus is not a guarantee of correct answers.

V6 can produce fluent text that is irrelevant to the prompt, especially in casual conversation or requests outside its specialization. For example, a greeting may trigger an unrelated crypto discussion. This is a known model-quality limitation, not proof that the API or website is broken. Responses can also hallucinate, repeat themselves or stop at the generation limit.

**The hosted API serves a particular saved V6 checkpoint.** Using the chat does not mean the model learns from each message or changes its weights in real time. Improvements require deliberate data preparation, training/fine-tuning, evaluation and deployment of a newer checkpoint. The project is developing this technology, but a continuous autonomous training system is not claimed here.

**What to try:** ask concrete questions about blockchain, transaction execution, liquidity pools or smart contracts; treat every answer as experimental and verify claims using primary sources. This model is not suitable for financial decisions.

See [Model maturity and limitations](docs/MODEL_MATURITY.md) for the distinction between crypto pretraining, instruction tuning, serving and future releases.

## Running and checking the live API

The NEUROX website connects to a self-hosted V6 inference service. It is separate from the older browser-based ONNX experiments.

    curl -sS https://www.neuroxcore.com/api/v6/health
    python3 python/neurox_client.py health
    python3 python/neurox_client.py chat "What is staking?" --max-tokens 32

The Python client uses only the standard library and can also talk to a local service:

    python3 python/neurox_client.py --base-url http://127.0.0.1:8000/ chat "What is Solana?"

Measure sequential response latency from the inference host:

    python3 python/benchmark_api.py --base-url http://127.0.0.1:8000/ --samples 5 --max-tokens 32

Run offline Python and JavaScript tests:

    python3 -m unittest discover -s tests_python -v
    node --test tests/*.test.mjs

See [V6 deployment/API documentation](docs/V6_SERVER.md) for the architecture, requests, setup boundaries, testing and security limitations. The Python client **calls the deployed API**; model generation itself still uses the published NEUROX CORE V6 checkpoint and nanochat.

## Repository map

| Path | Purpose |
| --- | --- |
| python/neurox_client.py | Standard-library HTTP client for V6 health/chat/history |
| python/benchmark_api.py | Repeatable sequential API latency measurement |
| tests_python/ | Mocked offline Python unit tests |
| scripts/inspect_model_artifacts.py | Offline checkpoint inventory, hashes and safetensors metadata |
| docs/V6_SERVER.md | Model provenance, CPU deployment, API and operational limits |
| docs/INFERENCE.md | Historical browser/ONNX utilities (not V6) |
| src/, tests/ | JavaScript tokenization, sampling and ONNX harness code |
| reference/v4/, reference/v5/, reference/v6/ | Version records and historical assets |

## Responsible interpretation

The published model card describes synthetic study material and Q&A in the training mix and warns that the model can invent financial facts, dates, prices or links. Project claims should be backed by reproducible checkpoints and evaluations. No financial advice is provided by the model.

[Architecture](ARCHITECTURE.md) · [Roadmap](ROADMAP.md) · [Crypto evaluation](docs/CRYPTO_EVALUATION.md) · [Changelog](CHANGELOG.md)
