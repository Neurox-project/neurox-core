# NEUROX CORE V6 — Python FastAPI reference inference service

This project includes a **real NEUROX CORE V6 CLI-backed reference server**. It invokes the released NEUROX CORE V6 `chat.py` with matching model weights, configuration and tokenizer. There are no canned model answers.

**This is NOT the optimized production NEUROX API.** Our VPS service already uses a persistent model instance that loads weights on startup. This reference implementation starts a separate Python process and reloads the checkpoint for **every request**. It is slow and memory-intensive; **do not replace the working VPS service** with it. It has not been end-to-end tested here against real checkpoint files.

## Setup

Use Linux/Python 3.10+, a CPU-compatible PyTorch environment and model dependencies (tiktoken, safetensors, numpy, rustbpe). Download the full published NEUROX CORE V6 model directory, including chat.py, model.safetensors, config.json and matching tokenizer, into /opt/neurox/models/v6. Clone karpathy/nanochat pinned to commit 92d63d4e8bb4 into /opt/neurox/nanochat. The production VPS already has this environment.

Install HTTP framework dependencies:

    python3 -m pip install -r server/requirements.txt

Launch a *separate local test service*, never the existing production port 8000:

    export NEUROX_MODEL_DIR=/opt/neurox/models/v6
    export NEUROX_NANOCHAT_DIR=/opt/neurox/nanochat
    /opt/neurox/venv/bin/uvicorn server.app:app --app-dir /path/to/neurox-core --host 127.0.0.1 --port 8100 --workers 1

## Endpoints

Local GET health request (file presence check only):

    curl -sS http://127.0.0.1:8100/health

Local POST generation:

    curl -sS -X POST http://127.0.0.1:8100/chat -H 'Content-Type: application/json' -d '{"message":"What is Solana?","max_tokens":16}'

The response key is "response" and contains the *raw CLI stdout*, which may include diagnostic/prompt text. This reference chat history uses a plain-text transcript, not a verified native model chat template.

## Safety and performance

- max_tokens: 1 to 128; message: 1 to 2,000 characters; history: up to 8 items.
- Model process timeout: 150 seconds by default, configurable with NEUROX_INFERENCE_TIMEOUT.
- Only one active generation per service process; a concurrent request receives 429.
- Missing model artifacts return 503 and inference failures return sanitized errors.
- No per-IP rate limiting, user authentication or production monitoring is bundled. **Do not bind to 0.0.0.0** or expose this development endpoint to the public Internet.
- Subprocess startup reloads the ~897M model on every request; true production efficiency requires persistent model loading and the model's actual tokenizer/chat implementation.

Offline unit tests, without downloading weights:

    python3 -m unittest discover -s tests_python -v

See [V6_SERVER.md](V6_SERVER.md) for the deployed architecture and published model details.
