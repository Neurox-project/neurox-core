import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleToken } from '../src/sampling.mjs';

test('greedy decoding selects maximum', () => assert.equal(sampleToken([0,3,1], {temperature:0}), 1));
test('topK=1 restricts candidates', () => assert.equal(sampleToken([1,4,2], {topK:1,random:()=>0.9}),1));
test('topP restricts candidates', () => assert.equal(sampleToken([10,0,-5], {topP:0.5,random:()=>0.99}),0));
test('repetition penalty alters greedy result', () => assert.equal(sampleToken([2,1.9], {temperature:0,recentTokens:[0],repetitionPenalty:2}),1));
test('exempt token is not penalized', () => assert.equal(sampleToken([2,1.9], {temperature:0,recentTokens:[0],exemptTokenIds:[0],repetitionPenalty:2}),0));
test('seeded random is injectable', () => assert.equal(sampleToken([0,0], {topK:2,topP:1,random:()=>0.75}),1));
test('rejects invalid inputs', () => {
  assert.throws(()=>sampleToken([]),TypeError);
  assert.throws(()=>sampleToken([NaN]),TypeError);
  assert.throws(()=>sampleToken([1],{topP:0}),RangeError);
  assert.throws(()=>sampleToken([1],{random:()=>1}),RangeError);
});
