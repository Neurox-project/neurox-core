# NEUROX model generations — evidence-based comparison

This document separates **published files**, **project-reported specifications**, and **features not yet demonstrated**.

| Evidence / capability | V4 | V5 | V6 |
| --- | --- | --- | --- |
| Role | Historical browser prototype | Intermediate generation | Current development generation |
| Inspectable model implementation | Browser ONNX adapter and tokenizer files | Not supplied | Not supplied |
| Model weights committed | No | No | No |
| Configuration / checkpoint hashes | Partial V4 tokenizer + ONNX structure notes | Pending | Pending |
| Parameter count | Not established from public checkpoint here | Not supplied | 897M, project-reported |
| Training tokens | Not verified | Not supplied | 1.2B, project-reported |
| Inference route | ONNX Runtime Web (source preserved) | Unknown | Dedicated server API planned |
| Reproducible benchmark results | Not yet published | Not published | Not published |

See [V4 model notes](V4_MODEL.md), [V5 reference](../reference/v5/), [V6 reference](../reference/v6/) and the [evaluation protocol](CRYPTO_EVALUATION.md).

**Rule:** Never establish a version merely by editing HTML headings, button labels or directory names. A distinct version requires matching checkpoint/config/tokenizer evidence and a working inference path.
