# NEUROX V4 — crypto-domain evaluation protocol

**Purpose:** Measure actual domain competence before changing the model or training V5. No results are claimed in this document.

## Reproducibility

Record the model SHA-256, tokenizer revision, browser, hardware, context length, sampling parameters, token count, elapsed time and raw output. Test with temperature **0** for repeatable greedy outputs first. Repeat separately at the deployed default sampling settings.

## Evaluation prompts

| ID | Domain | Prompt | Expected concepts |
| --- | --- | --- | --- |
| BTC-01 | Bitcoin | Explain how Bitcoin proof-of-work prevents double-spending. | Chain selection, confirmations, accumulated work, probabilistic finality |
| BTC-02 | Bitcoin | What is the difference between a Bitcoin block subsidy and transaction fees? | Issuance, miner incentives, fee market |
| ETH-01 | Ethereum | Explain the difference between gas limit and gas price in an Ethereum transaction. | Resource cap versus unit cost |
| ETH-02 | Ethereum | What is a smart-contract reentrancy vulnerability? | External calls, state changes, reentrant execution |
| SOL-01 | Solana | What is Proof of History, and does it replace consensus? | Cryptographic clock, ordering, consensus distinction |
| SOL-02 | Solana | Why can two Solana transactions conflict over writable accounts? | Account locking, parallel execution |
| DEFI-01 | DeFi | Explain impermanent loss in an AMM liquidity pool. | Relative price changes, LP vs holding |
| DEFI-02 | DeFi | What are the liquidation risks of overcollateralized lending? | Collateral ratio, oracle prices, liquidation threshold |
| WEB3-01 | Security | What is the difference between a seed phrase and a public wallet address? | Secret recovery credential vs public identifier |
| WEB3-02 | Security | How should a user verify an unfamiliar smart-contract approval? | Spender, allowance, contract provenance, revoke |
| REASON-01 | Reasoning | If a token falls 50%, what percentage gain is required to return to its original price? | 100% gain, correct calculation |
| UNC-01 | Uncertainty | What is the current live price of SOL? | Admit no live feed rather than invent a price |

## Scoring

Rate each response from **0 to 3**:
- **0:** no answer, incoherent or substantially incorrect
- **1:** partially relevant, major errors or unsupported certainty
- **2:** mostly correct, with omissions or minor inaccuracies
- **3:** correct, clear, relevant, and appropriately calibrated

Record the raw output before assigning a score. Two independent reviewers are preferable. Do not mix model capability, user-interface behavior and retrieval-augmented answers in the same score.

## Release gate for training V5

1. Establish a V4 baseline with recorded settings and raw answers.
2. Identify whether failure is due to tokenization, chat formatting, short context, decoding, or missing learned knowledge.
3. Curate licensed, provenance-tracked cryptocurrency technical data.
4. Define held-out evaluation questions to prevent test contamination.
5. Fine-tune and compare V5 against V4 under identical settings.

**Important:** This is a test plan, not evidence that the model has been trained on crypto data.
