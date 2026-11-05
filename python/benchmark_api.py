#!/usr/bin/env python3
"""Sequential wall-clock benchmark of a running NEUROX V6 API.

This is an *API* latency probe, not a model-level tokens-per-second benchmark:
the service's JSON schema does not guarantee token usage counters.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import statistics
import sys
import time

from neurox_client import APIError, chat, health


def percentile(values: list[float], fraction: float) -> float:
    if not values:
        raise ValueError("values cannot be empty")
    values = sorted(values)
    pos = (len(values) - 1) * fraction
    lower = int(pos)
    upper = min(len(values) - 1, lower + 1)
    return values[lower] + (values[upper] - values[lower]) * (pos - lower)


def benchmark(base_url: str, prompt: str, samples: int = 5,
              max_tokens: int = 32, timeout: float = 120.0) -> dict:
    if not 1 <= samples <= 100:
        raise ValueError("samples must be 1..100")
    info = health(base_url)
    timings: list[float] = []
    sizes: list[int] = []
    for _ in range(samples):
        start = time.perf_counter()
        response = chat(base_url, prompt, max_tokens=max_tokens, timeout=timeout)
        timings.append(time.perf_counter() - start)
        # JSON size is a transport-side proxy only, not a generated-token count.
        sizes.append(len(json.dumps(response, ensure_ascii=False).encode("utf-8")))
    return {
        "model_health": info,
        "samples": samples,
        "mode": "sequential, non-streaming; includes network and queue time",
        "prompt": prompt,
        "requested_max_tokens": max_tokens,
        "latency_seconds": {
            "min": round(min(timings), 3),
            "mean": round(statistics.mean(timings), 3),
            "median": round(statistics.median(timings), 3),
            "p95_interpolated": round(percentile(timings, 0.95), 3),
            "max": round(max(timings), 3),
        },
        "response_json_bytes": sizes,
        "note": "Do not interpret response bytes or wall-clock latency as token throughput.",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:8000/")
    parser.add_argument("--prompt", default="What is Solana?")
    parser.add_argument("--samples", type=int, default=5)
    parser.add_argument("--max-tokens", type=int, default=32)
    parser.add_argument("--timeout", type=float, default=120)
    parser.add_argument("--output", type=pathlib.Path)
    args = parser.parse_args()
    try:
        result = benchmark(args.base_url, args.prompt, args.samples,
                           args.max_tokens, args.timeout)
    except (APIError, ValueError, OSError) as exc:
        print("Benchmark failed: {}".format(exc), file=sys.stderr)
        return 1
    data = json.dumps(result, indent=2, ensure_ascii=False) + "\n"
    if args.output:
        args.output.write_text(data, encoding="utf-8")
    else:
        print(data, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
