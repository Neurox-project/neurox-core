"""Queen V6 reference FastAPI adapter using the real released chat.py.

This starts a new subprocess per request, reloading weights each time.
Not a replacement for the deployed persistent production API.
"""
import asyncio
import os
from pathlib import Path
import sys

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator

MODEL_DIR = Path(os.environ.get("NEUROX_MODEL_DIR", "/opt/neurox/models/v6"))
NANOCHAT_DIR = Path(os.environ.get("NEUROX_NANOCHAT_DIR", "/opt/neurox/nanochat"))
TIMEOUT = int(os.environ.get("NEUROX_INFERENCE_TIMEOUT", "150"))
app = FastAPI(title="NEUROX V6 CLI reference", docs_url=None, redoc_url=None, openapi_url=None)
_lock = asyncio.Lock()

class Message(BaseModel):
    role: str
    content: str = Field(min_length=1, max_length=2000)

    @field_validator("role")
    @classmethod
    def allowed_role(cls, role):
        if role not in ("user", "assistant"):
            raise ValueError("invalid role")
        return role

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    max_tokens: int = Field(default=64, ge=1, le=128)
    history: list[Message] = Field(default_factory=list, max_length=8)

def model_ready():
    return all((MODEL_DIR / name).is_file() for name in ("chat.py", "config.json", "model.safetensors")) and (NANOCHAT_DIR / "nanochat").is_dir()

def prompt_text(request):
    if not request.message.strip():
        raise ValueError("empty message")
    if not request.history:
        return request.message.strip()
    transcript = "\n".join(("User" if msg.role == "user" else "Assistant") + ": " + msg.content.strip() for msg in request.history)
    prompt = transcript + "\nUser: " + request.message.strip() + "\nAssistant:"
    if len(prompt) > 5000:
        raise ValueError("transcript too long")
    return prompt

async def generate(prompt, max_tokens):
    env = os.environ.copy()
    env["PYTHONPATH"] = os.pathsep.join([str(NANOCHAT_DIR), str(MODEL_DIR), env.get("PYTHONPATH", "")])
    env.setdefault("OMP_NUM_THREADS", "4")
    env.setdefault("MKL_NUM_THREADS", "4")
    proc = await asyncio.create_subprocess_exec(
        sys.executable, str(MODEL_DIR / "chat.py"), prompt, "--max-tokens", str(max_tokens),
        cwd=str(MODEL_DIR), env=env,
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
    )
    try:
        stdout, _stderr = await asyncio.wait_for(proc.communicate(), timeout=TIMEOUT)
    except (asyncio.TimeoutError, asyncio.CancelledError):
        proc.kill()
        await proc.communicate()
        raise
    if proc.returncode != 0:
        raise RuntimeError("model subprocess failed")
    if len(stdout) > 1_000_000:
        raise RuntimeError("model output too large")
    return stdout.decode("utf-8", errors="replace").strip()

@app.get("/health")
async def health():
    ready = model_ready()
    return {"status": "ok" if ready else "not_ready", "model": "NEUROX V6", "device": "cpu", "backend": "real-chat-py-subprocess", "artifacts_present": ready}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        prompt = prompt_text(request)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    if not model_ready():
        raise HTTPException(503, "model files missing")
    if _lock.locked():
        raise HTTPException(429, "model busy")
    async with _lock:
        try:
            result = await generate(prompt, request.max_tokens)
        except asyncio.TimeoutError as exc:
            raise HTTPException(504, "model timed out") from exc
        except Exception as exc:
            raise HTTPException(500, "model failed") from exc
    return {"model": "NEUROX V6", "response": result}
