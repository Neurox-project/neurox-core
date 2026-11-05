# NEUROX CORE — Architecture (V6)

> **Updated 2026-11-05.** Previously this document described a proposed V6 deployment. The project has now reported a working CPU inference service. Public model artifacts are available on Hugging Face. The complete production API implementation remains outside this GitHub repository; tests in this repository do not independently verify service uptime.

## Model boundaries

NEUROX CORE V6 is a ~896.5M-parameter nanochat GPT with depth 20, width 1280, 10 attention heads, 2048-token context and 32768-token vocabulary, per the published [NEUROX CORE V6 model card](https://huggingface.co/Crawlnet/queen-v6). Its checkpoint and matching tokenizer are published there. V4 browser inference code in this repo is **historical** and must not be mistaken for V6.

Training data and version metrics should be attributed to the model card; some earlier GitHub project-reported numbers have been superseded by source artifacts.

## Runtime data flow

    Browser UI
       |
       | HTTPS request /api/v6/chat
       v
    Nginx reverse proxy (CloudPanel)
       |
       | localhost only, 127.0.0.1:8000
       v
    FastAPI + Uvicorn (one worker)
       |
       | payload validation, prompt/history handling
       v
    nanochat GPT + V6 model.safetensors + tokenizer
       |
       v
    PyTorch CPU inference -> JSON response

    Health: GET /api/v6/health
    Chat:   POST /api/v6/chat

The Python tools in this repo are API clients and measurements, not the server's actual model loader. See [V6 server documentation](docs/V6_SERVER.md).

## Isolation and security

- Serve TLS at Nginx and keep the Python listener local.
- Only expose specific API routes; prevent arbitrary PHP source downloads.
- Apply request body/token caps, per-IP rate limiting, concurrency limits, safe error responses and log retention policy.
- Keep private keys, passwords and environment variables off GitHub.
- Move the service away from root and measure memory headroom before increasing workers.
- Record model revision, runtime dependency versions, latency and hardware for every published benchmark.

## Data and evaluation boundaries

The model card documents crawler pages, factual market/on-chain record pages, and LLM-generated synthetic study notes and Q&A. The training corpus cannot be described as solely raw browser-crawled material. The model may hallucinate crypto facts; quantitative performance reports require a reproducible test set, prompt template, samples and scoring method.

See [evaluation protocol](docs/CRYPTO_EVALUATION.md), [historical browser utilities](docs/INFERENCE.md) and [V6 server](docs/V6_SERVER.md).
