# V5 artifact and reproducibility record

Status: **unverified / awaiting model artifacts**. Do not substitute V4 values in the blanks.

| Field | Value |
| --- | --- |
| Model revision | V5 |
| Model lineage / parent checkpoint | Not supplied |
| Parameter count | Not verified |
| Architecture/config file | Not supplied |
| Tokenizer and vocabulary size | Not supplied |
| Training-token volume | Not supplied |
| Context length | Not verified |
| Checkpoint filename, byte size and SHA-256 | Not supplied |
| Model format and runtime | Not supplied |
| Training code/commit | Not supplied |
| Dataset provenance and licenses | Not documented |
| Hardware and training log | Not supplied |
| Reproducible inference command | Not supplied |
| Held-out evaluation scores | Not measured here |

## Verification sequence
1. Hash and inspect actual V5 checkpoint/config/tokenizer.
2. Verify tensor names/shapes and calculate parameter totals.
3. Load V5 with a version-specific adapter and run a fixed test prompt.
4. Store generated token IDs and text, timing and environment details.
5. Evaluate with the [crypto-domain protocol](../../docs/CRYPTO_EVALUATION.md), recording raw answers.

The V4 browser source is reference only and not evidence of V5 inference.
