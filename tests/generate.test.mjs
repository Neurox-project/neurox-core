import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTokens } from '../src/generate.mjs';

const tokenizer = {
  encode(text) { return text ? [1] : []; },
  decode(ids) { return ids.join(','); }
};

test('generates autoregressively with growing context', async () => {
  const calls = [];
  const adapter = { async inferLastLogits(ids) {
    calls.push([...ids]);
    return calls.length === 1 ? [0, 9, 1] : [0, 1, 9];
  }};
  const result = await generateTokens({
    adapter, tokenizer, prompt: 'hello', maxNewTokens: 2,
    sampling: { temperature: 0 }
  });
  assert.deepEqual(result.tokenIds, [1, 2]);
  assert.deepEqual(calls, [[1], [1, 1]]);
  assert.equal(result.reason, 'max_tokens');
});

test('stops on stop token without adding it to output', async () => {
  const adapter = { async inferLastLogits() { return [0, 1, 9]; } };
  const result = await generateTokens({
    adapter, tokenizer, prompt: 'hello', stopTokenIds: [2],
    sampling: { temperature: 0 }
  });
  assert.deepEqual(result.tokenIds, []);
  assert.equal(result.reason, 'stop_token');
});

test('abort prevents inference', async () => {
  let calls = 0;
  const adapter = { async inferLastLogits() { calls++; return [1, 2]; } };
  const controller = new AbortController();
  controller.abort();
  const result = await generateTokens({
    adapter, tokenizer, prompt: 'hello', signal: controller.signal
  });
  assert.equal(calls, 0);
  assert.equal(result.reason, 'aborted');
});

test('rejects empty token context', async () => {
  const adapter = { async inferLastLogits() { return [1]; } };
  await assert.rejects(
    () => generateTokens({ adapter, tokenizer, prompt: '' }),
    /empty token context/
  );
});

test('streams generated tokens via callback', async () => {
  const events = [];
  const adapter = { async inferLastLogits() { return [0, 8]; } };
  const result = await generateTokens({
    adapter, tokenizer, prompt: 'hello', maxNewTokens: 1,
    sampling: { temperature: 0 },
    onToken: event => events.push(event)
  });
  assert.deepEqual(events[0].generated, [1]);
  assert.equal(result.text, '1');
});

test('inserts chat suffix tokens before autoregressive decoding', async () => {
  const calls = [];
  const adapter = { async inferLastLogits(ids) { calls.push([...ids]); return [0, 5]; } };
  await generateTokens({
    adapter, tokenizer, prompt: 'hello',
    prefixTokens: [10, 11], suffixTokens: [12, 13],
    maxNewTokens: 1, sampling: { temperature: 0 }
  });
  assert.deepEqual(calls[0], [10, 11, 1, 12, 13]);
});
