# Model maturity: Queen V6 is a crypto-focused research model

## What Queen V6 is

Queen V6 is an early-stage language model developed for crypto and blockchain-oriented text. The published release contains a nanochat GPT checkpoint (~896.5M parameters), tokenizer and model metadata at [Crawlnet/queen-v6](https://huggingface.co/Crawlnet/queen-v6). The project's research focus includes blockchains, DeFi, smart contracts, on-chain/market information and related documentation.

The data mix described by the model publisher includes crawled materials as well as processed records and synthetic educational/Q&A materials. **Domain-oriented training does not mean every statement is accurate.**

## What users should expect today

- The model can generate fluent text while misunderstanding or ignoring a request.
- Casual greetings and general chat are not reliable benchmarks of crypto-domain knowledge, but failing such requests is still a limitation.
- Some responses may wander off-topic, invent details, repeat text or terminate at a token limit.
- Answers must not be relied on for trading, investing, financial decisions or security-sensitive technical procedures.

For example, a user asking *“Hi, how are you?”* may receive a blockchain-related paragraph instead of a normal greeting. A working HTTP status and coherent grammar do not establish instruction following.

## Training versus serving: an important distinction

**Serving:** The NEUROX website sends prompts to a hosted V6 checkpoint loaded in memory. Generation is inference over fixed learned weights.

**Training:** Improving these weights requires a separate process: curating data, training/fine-tuning, validating results and publishing/deploying a new model revision.

This means the model is **in active development as a project**, but the currently served checkpoint is **not automatically learning from visitors in real time**. The site should not claim that chat conversations continuously update its weights unless that capability is implemented and independently verified.

## Technical improvement priorities

1. Check native prompt / chat-template formatting against the released model's own chat.py.
2. Establish deterministic crypto-domain evaluations and separate general instruction-following tests.
3. Improve supervised instruction data and dialogue-format consistency, then evaluate against the prior checkpoint.
4. Publish model version numbers and checkpoint provenance for reproducible comparisons.
5. Distinguish model training quality from hosting/API uptime and latency.

## Honest public wording

> **NEUROX V6 / RESEARCH RELEASE** — A young, crypto-focused language model. The checkpoint is available for experimental inference while development and evaluation continue. It may misunderstand prompts, go off-topic or generate inaccurate information. Current conversations do not train the model in real time.

Related: [README](../README.md), [V6 server architecture](V6_SERVER.md), [Crypto evaluation protocol](CRYPTO_EVALUATION.md).
