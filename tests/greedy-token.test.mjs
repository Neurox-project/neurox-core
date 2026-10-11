import test from 'node:test';
import assert from 'node:assert/strict';
import { greedyToken } from '../src/greedy-token.mjs';

test('returns index of largest logit', () => {
  assert.equal(greedyToken([0.1, 3.5, 2]), 1);
});

test('ties resolve to first index', () => {
  assert.equal(greedyToken([2, 2, 1]), 0);
});

test('rejects empty or nonfinite input', () => {
  assert.throws(() => greedyToken([]), TypeError);
  assert.throws(() => greedyToken([1, NaN]), TypeError);
});
