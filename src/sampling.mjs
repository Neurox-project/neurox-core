/** Standalone decoding utilities for a model's output logits. No model weights included. */
export function sampleToken(logits, options = {}) {
  const { temperature = 0.7, topK = 30, topP = 0.9,
    repetitionPenalty = 1, recentTokens = [], exemptTokenIds = [], random = Math.random } = options;
  if (!logits || !Number.isInteger(logits.length) || logits.length === 0) throw new TypeError('Expected nonempty logits');
  if (!Number.isFinite(temperature) || temperature < 0) throw new RangeError('temperature must be >= 0');
  if (!Number.isFinite(topK) || topK < 1) throw new RangeError('topK must be >= 1');
  if (!Number.isFinite(topP) || topP <= 0 || topP > 1) throw new RangeError('topP must be in (0,1]');
  if (!Number.isFinite(repetitionPenalty) || repetitionPenalty < 1) throw new RangeError('repetitionPenalty must be >= 1');
  if (!Array.isArray(recentTokens) || !Array.isArray(exemptTokenIds) || typeof random !== 'function') throw new TypeError('Invalid options');
  const scores = Float64Array.from(logits);
  for (const score of scores) if (!Number.isFinite(score)) throw new TypeError('Logits must be finite');
  const exempt = new Set(exemptTokenIds);
  if (repetitionPenalty > 1) for (const id of new Set(recentTokens.slice(-96))) {
    if (Number.isInteger(id) && id >= 0 && id < scores.length && !exempt.has(id)) {
      scores[id] = scores[id] < 0 ? scores[id] * repetitionPenalty : scores[id] / repetitionPenalty;
    }
  }
  const order = Array.from(scores.keys()).sort((a, b) => scores[b] - scores[a] || a - b);
  if (temperature === 0) return order[0];
  const k = Math.min(Math.floor(topK), order.length);
  const weights = order.slice(0, k).map(id => Math.exp((scores[id] - scores[order[0]]) / temperature));
  const total = weights.reduce((a, b) => a + b, 0);
  let n = k, cumulative = 0;
  for (let i = 0; i < k; i++) {
    cumulative += weights[i] / total;
    if (cumulative >= topP) { n = i + 1; break; }
  }
  const mass = weights.slice(0, n).reduce((a, b) => a + b, 0);
  const u = random();
  if (!Number.isFinite(u) || u < 0 || u >= 1) throw new RangeError('random() must return [0,1)');
  let target = u * mass;
  for (let i = 0; i < n; i++) {
    target -= weights[i];
    if (target <= 0) return order[i];
  }
  return order[n - 1];
}
