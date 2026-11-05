# NEUROX V6 — Model, runtime and API

## Published model

The current public model artifact is [Crawlnet/queen-v6](https://huggingface.co/Crawlnet/queen-v6) on Hugging Face. This repository documents and integrates that project but does not duplicate the 1.79 GB checkpoint.

| Field | V6 model card |
| --- | --- |
| Total parameters | 896.5M (rounded 897M) |
| Non-embedding parameters | 435.2M |
| Architecture | nanochat GPT |
| Depth / width / heads | 20 / 1280 / 10 |
| Context window | 2048 tokens |
| Vocabulary | 32768 BPE tokens |
| nanochat revision | 92d63d4e8bb4 |
| Model checkpoint | model.safetensors on Hugging Face |

The model repository also publishes config.json, tokenizer.json, tokenizer.tiktoken, chat.py, training summaries and dataset metadata. These are source-published specifications, not measurements independently reproduced here.

**Training-volume correction:** Older GitHub documentation says 1.2B tokens (a project-reported earlier figure). The currently published V6 model card instead reports approximately 3.309B trained token positions in the prepared repeated stream and 774.5M unique token positions. These measures differ; refer to the model card for corpus and training definitions. The model card describes crawled pages, factual record pages, external-LLM-generated study notes and synthetic Q&A, not exclusively raw crawler text.

## Deployed inference architecture (project implementation, 2026-11-05)

    NEUROX web UI
       |
       HTTPS
       |
    CloudPanel Nginx: /api/v6/
       |
    127.0.0.1:8000
       |
    FastAPI + Uvicorn (single worker)
       |
    nanochat GPT + NEUROX CORE V6 tokenizer and safetensors
       |
    CPU PyTorch inference

On the project's Ubuntu VPS the Python virtualenv is at /opt/neurox/venv, checkpoint directory at /opt/neurox/models/v6, nanochat checkout at /opt/neurox/nanochat, and process managed by systemd unit neurox-v6.service. These paths describe the deployment, **not repository files**. The production api.py is not published in this repository and the Python utilities below are clients, not substitutes for model inference.

## HTTP API

Health endpoint:

    curl -sS https://www.neuroxcore.com/api/v6/health
    python3 python/neurox_client.py health

The project's observed health response is a JSON object identifying NEUROX V6 and CPU execution.

Generate text:

    curl -sS -X POST https://www.neuroxcore.com/api/v6/chat -H 'Content-Type: application/json' -d '{"message":"What is staking?","max_tokens":32}'
    python3 python/neurox_client.py chat 'What is a smart contract?' --max-tokens 32

The deployed service accepts message, max_tokens (project cap: 128), and optional history as role/content pairs. A response is JSON, not guaranteed to use any particular client SDK schema. The API is not OpenAI-compatible by implication.

## Python diagnostics and tests

Run a local-only sequential latency probe on the VPS:

    python3 python/benchmark_api.py --base-url http://127.0.0.1:8000/ --samples 5 --max-tokens 32 --output v6-api-latency.json

This records wall-clock end-to-end latency, not tokens/second. Record warm-up, CPU contention, prompt and output length before comparing runs. The benchmark's byte counts reflect JSON transport size, not generated tokens.

Offline unit tests without model weights:

    python3 -m unittest discover -s tests_python -v

The tests mock HTTP requests and do not certify actual model inference or quality.

## Standalone model verification

For actual checkpoint inference use the model's released chat.py with the matching tokenizer and configuration, clone [karpathy/nanochat](https://github.com/karpathy/nanochat) and pin commit 92d63d4e8bb4. The model card has exact commands. Do not recreate tensor naming or prompting from guesswork.

## Security and limitations

- Never commit cloud credentials, wallet keys, production environment files or private paths containing secrets.
- Keep Uvicorn bound to 127.0.0.1 behind HTTPS Nginx, with request size and rate limits.
- For production scaling, move the process off root, cap concurrency and monitor RAM and CPU usage.
- The model is small and domain-focused; hallucinations are expected, especially for prices, dates, URLs and financial facts.
- Independent benchmark reproduction, API source publication and deployment hardening remain useful follow-up work.

Related: [Architecture](../ARCHITECTURE.md), [browser inference utilities](INFERENCE.md), [V6 artifacts](../reference/v6/ARTIFACTS.md).
