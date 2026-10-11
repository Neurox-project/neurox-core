/**
 * Minimal ONNX Runtime Web adapter for decoder models accepting int64 input_ids.
 * The runtime is injected; callers must load onnxruntime-web separately.
 * Model-specific tokenization, position IDs, KV caches, and output contracts are NOT provided.
 */
export async function createOnnxAdapter({ ort, modelUrl, executionProviders = ['wasm'] }) {
  if (!ort?.InferenceSession?.create || typeof ort.Tensor !== 'function') throw new TypeError('ONNX Runtime is required');
  if (typeof modelUrl !== 'string' || !modelUrl.trim()) throw new TypeError('modelUrl is required');
  const session = await ort.InferenceSession.create(modelUrl, { executionProviders });
  if (!session.inputNames?.includes('input_ids')) throw new Error('Model must expose input_ids');
  if (!session.outputNames?.includes('logits')) throw new Error('Model must expose logits');
  return {
    inputNames: [...session.inputNames],
    outputNames: [...session.outputNames],
    async inferLastLogits(tokenIds) {
      if (!Array.isArray(tokenIds) || tokenIds.length === 0 || !tokenIds.every(id => Number.isSafeInteger(id) && id >= 0)) {
        throw new TypeError('tokenIds must be nonempty nonnegative safe integers');
      }
      const dims = [1, tokenIds.length];
      const feeds = { input_ids: new ort.Tensor('int64', BigInt64Array.from(tokenIds, BigInt), dims) };
      if (session.inputNames.includes('attention_mask')) {
        feeds.attention_mask = new ort.Tensor('int64', BigInt64Array.from(tokenIds, () => 1n), dims);
      }
      const result = await session.run(feeds);
      const tensor = result?.logits;
      if (!tensor?.data || !Array.isArray(tensor.dims)) throw new Error('Missing logits tensor');
      const shape = tensor.dims;
      let vocabulary;
      if (shape.length === 3 && shape[0] === 1 && shape[1] === tokenIds.length) vocabulary = shape[2];
      else if (shape.length === 2 && shape[0] === 1) vocabulary = shape[1];
      else throw new Error('Unsupported logits dimensions');
      if (!Number.isInteger(vocabulary) || vocabulary < 1 || tensor.data.length !== shape.reduce((a,b)=>a*b,1)) {
        throw new Error('Invalid logits shape');
      }
      return Float32Array.from(tensor.data.slice(tensor.data.length - vocabulary));
    },
    async dispose() { if (typeof session.release === 'function') await session.release(); }
  };
}
