import test from 'node:test';
import assert from 'node:assert/strict';
import { BpeTokenizer } from '../src/bpe-tokenizer.mjs';

const config={vocab_size:256,special_tokens:{'<|bos|>':255}};
const ranks=Array.from({length:128},(_,i)=>Buffer.from([i]).toString('base64')+' '+i).join('\n');

test('encodes and decodes ASCII text',()=>{
  const tokenizer=new BpeTokenizer(config,ranks);
  assert.deepEqual(tokenizer.encode('Hello!'),[72,101,108,108,111,33]);
  assert.equal(tokenizer.decode([72,101,108,108,111,33]),'Hello!');
});
test('ignores unknown special IDs when decoding',()=>{
  const tokenizer=new BpeTokenizer(config,ranks);
  assert.equal(tokenizer.decode([72,255,105]),'Hi');
});
test('rejects missing ranks and missing byte sequences',()=>{
  assert.throws(()=>new BpeTokenizer(config,''),/Empty/);
  const tokenizer=new BpeTokenizer(config,ranks);
  assert.throws(()=>tokenizer.encode('é'),/missing byte sequence/);
});
test('rejects duplicate ranks',()=>{
  assert.throws(()=>new BpeTokenizer(config,ranks+'\n'+Buffer.from([0]).toString('base64')+' 0'),/duplicate/);
});
