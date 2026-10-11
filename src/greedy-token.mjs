/** Select a token from logits. Standalone utility; does not load a model. */
export function greedyToken(logits) {
  if (!logits || !Number.isInteger(logits.length) || logits.length === 0) {
    throw new TypeError('Expected a nonempty logits array');
  }
  let best = 0;
  for (let i = 0; i < logits.length; i++) {
    if (!Number.isFinite(logits[i])) throw new TypeError('Logits must be finite');
    if (logits[i] > logits[best]) best = i;
  }
  return best;
}
