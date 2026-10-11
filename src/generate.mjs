import { sampleToken } from './sampling.mjs';

/**
 * Generate tokens using a compatible inference adapter and tokenizer.
 * This orchestration layer is model-agnostic; it does not include weights.
 */
export async function generateTokens({
  adapter, tokenizer, prompt, prefixTokens = [], suffixTokens = [], stopTokenIds = [],
  maxNewTokens = 48, contextLength = 128, sampling = {},
  signal, onToken
}) {
  if (!adapter || typeof adapter.inferLastLogits !== 'function') throw new TypeError('Inference adapter required');
  if (!tokenizer || typeof tokenizer.encode !== 'function' || typeof tokenizer.decode !== 'function') throw new TypeError('Tokenizer required');
  if (typeof prompt !== 'string') throw new TypeError('Prompt must be a string');
  if (!Number.isSafeInteger(maxNewTokens) || maxNewTokens < 1 || maxNewTokens > 2048) throw new RangeError('Invalid maxNewTokens');
  if (!Number.isSafeInteger(contextLength) || contextLength < 1) throw new RangeError('Invalid contextLength');
  const encoded = await tokenizer.encode(prompt);
  if (!Array.isArray(encoded) || !encoded.every(id => Number.isSafeInteger(id) && id >= 0)) throw new TypeError('Tokenizer must return an array of token IDs');
  if (!Array.isArray(prefixTokens) || !prefixTokens.every(id => Number.isSafeInteger(id) && id >= 0)) throw new TypeError('Invalid prefix tokens');
  if (!Array.isArray(suffixTokens) || !suffixTokens.every(id => Number.isSafeInteger(id) && id >= 0)) throw new TypeError('Invalid suffix tokens');
  const context = [...prefixTokens, ...encoded, ...suffixTokens];
  if (context.length === 0) throw new Error('Cannot generate from empty token context');
  const generated = [];
  const stops = new Set(stopTokenIds);
  let reason = 'max_tokens';
  for (let step = 0; step < maxNewTokens; step++) {
    if (signal?.aborted) { reason = 'aborted'; break; }
    const logits = await adapter.inferLastLogits(context.slice(-contextLength));
    if (signal?.aborted) { reason = 'aborted'; break; }
    const id = sampleToken(logits, {
      ...sampling,
      recentTokens: generated,
      exemptTokenIds: [...(sampling.exemptTokenIds ?? []), ...stops]
    });
    if (stops.has(id)) { reason = 'stop_token'; break; }
    generated.push(id);
    context.push(id);
    if (onToken) await onToken({ tokenId: id, text: await tokenizer.decode(generated), generated: [...generated] });
  }
  return { tokenIds: generated, text: await tokenizer.decode(generated), reason };
}
