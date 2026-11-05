#!/usr/bin/env python3
"""NEUROX V6 HTTP client (Python 3.10+, standard library only).

This talks to a RUNNING inference service; it does not load model weights.
Set --base-url to the public /api/v6 path or a local http://127.0.0.1:8000.
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Any


class APIError(RuntimeError):
    """Non-successful response or invalid JSON from the API."""


def request_json(base_url: str, endpoint: str, payload: dict | None = None,
                 timeout: float = 120.0) -> dict[str, Any]:
    if not 0 < timeout <= 600:
        raise ValueError("timeout must be between 0 and 600 seconds")
    parsed = urllib.parse.urlsplit(base_url.rstrip("/") + "/" + endpoint.lstrip("/"))
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("base URL must be HTTP(S)")
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise ValueError("base URL cannot contain credentials, query or fragment")

    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(
        urllib.parse.urlunsplit(parsed),
        data=data,
        method="POST" if data is not None else "GET",
        headers={"Accept": "application/json", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read(1024 * 1024 + 1)
            if len(raw) > 1024 * 1024:
                raise APIError("response exceeded 1 MiB limit")
    except urllib.error.HTTPError as exc:
        # Never log request payloads or server traceback bodies.
        raise APIError("HTTP {} from {}".format(exc.code, endpoint)) from exc
    except urllib.error.URLError as exc:
        raise APIError("Connection failed: {}".format(exc.reason)) from exc
    try:
        obj = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise APIError("server returned invalid JSON") from exc
    if not isinstance(obj, dict):
        raise APIError("expected a JSON object")
    return obj


def health(base_url: str, timeout: float = 10.0) -> dict[str, Any]:
    return request_json(base_url, "health", timeout=timeout)


def chat(base_url: str, message: str, max_tokens: int = 64,
         history: list[dict[str, str]] | None = None,
         timeout: float = 120.0) -> dict[str, Any]:
    if not isinstance(message, str) or not message.strip():
        raise ValueError("message cannot be empty")
    if not 1 <= max_tokens <= 128:
        raise ValueError("max_tokens must be 1..128 for the deployed V6 interface")
    payload: dict[str, Any] = {"message": message, "max_tokens": max_tokens}
    if history:
        if len(history) > 20:
            raise ValueError("history exceeds 20 messages")
        for item in history:
            if (not isinstance(item, dict) or item.get("role") not in ("user", "assistant")
                or not isinstance(item.get("content"), str)):
                raise ValueError("history items require role and content strings")
        payload["history"] = history
    return request_json(base_url, "chat", payload, timeout=timeout)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="https://www.neuroxcore.com/api/v6/",
                        help="API prefix, public or localhost")
    parser.add_argument("--timeout", type=float, default=120.0)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("health", help="GET /health")
    p_chat = sub.add_parser("chat", help="POST /chat")
    p_chat.add_argument("message")
    p_chat.add_argument("--max-tokens", type=int, default=64)
    p_chat.add_argument("--history-json", help="path to JSON list of prior role/content objects")
    args = parser.parse_args(argv)
    try:
        if args.command == "health":
            result = health(args.base_url, timeout=min(args.timeout, 10))
        else:
            history = None
            if args.history_json:
                with open(args.history_json, encoding="utf-8") as handle:
                    history = json.load(handle)
                if not isinstance(history, list):
                    raise ValueError("history file must contain a JSON list")
            result = chat(args.base_url, args.message, args.max_tokens, history, args.timeout)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (APIError, ValueError, OSError) as exc:
        print("NEUROX client: {}".format(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
