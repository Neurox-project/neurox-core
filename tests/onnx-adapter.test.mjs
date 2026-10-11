import test from 'node:test';
import assert from 'node:assert/strict';
import { createOnnxAdapter } from '../src/onnx-adapter.mjs';

function mockOrt(inputNames=['input_ids','attention_mask'], dims=[1,2,3], values=[1,2,3,4,5,6]) {
  const calls=[];
  const session={inputNames,outputNames:['logits'],async run(feeds){calls.push(feeds);return {logits:{dims,data:new Float32Array(values)}};},async release(){calls.push('released');}};
  const ort={Tensor:class {constructor(type,data,shape){this.type=type;this.data=data;this.dims=shape;}},InferenceSession:{async create(url,opts){calls.push([url,opts]);return session;}}};
  return {ort,calls};
}

test('creates int64 tensors and returns last sequence logits',async()=>{
  const {ort,calls}=mockOrt();
  const adapter=await createOnnxAdapter({ort,modelUrl:'/model.onnx'});
  assert.deepEqual([...await adapter.inferLastLogits([7,8])],[4,5,6]);
  assert.deepEqual([...calls[1].input_ids.data],[7n,8n]);
  assert.deepEqual([...calls[1].attention_mask.data],[1n,1n]);
  await adapter.dispose();assert.equal(calls[2],'released');
});
test('supports [1,vocab] logits and models without attention_mask',async()=>{
  const {ort,calls}=mockOrt(['input_ids'],[1,3],[2,4,8]);
  const adapter=await createOnnxAdapter({ort,modelUrl:'/model.onnx'});
  assert.deepEqual([...await adapter.inferLastLogits([1])],[2,4,8]);
  assert.deepEqual(Object.keys(calls[1]),['input_ids']);
});
test('rejects missing runtime and invalid token ids',async()=>{
  await assert.rejects(()=>createOnnxAdapter({ort:{},modelUrl:'/model.onnx'}),TypeError);
  const {ort}=mockOrt();const adapter=await createOnnxAdapter({ort,modelUrl:'/model.onnx'});
  await assert.rejects(()=>adapter.inferLastLogits([-1]),TypeError);
});
test('rejects unsupported logits shape',async()=>{
  const {ort}=mockOrt(['input_ids'],[2,3],[1,2,3,4,5,6]);
  const adapter=await createOnnxAdapter({ort,modelUrl:'/model.onnx'});
  await assert.rejects(()=>adapter.inferLastLogits([1,2]),/Unsupported/);
});
