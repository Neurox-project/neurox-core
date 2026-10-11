import { NeuroxTokenizer } from './neurox-tokenizer.js';

const $ = (id) => document.getElementById(id);
const status = $('status');
const progress = $('progress');
const loadBtn = $('loadBtn');
const sendBtn = $('sendBtn');
const resetBtn = $('resetBtn');
const promptEl = $('prompt');
const messages = $('messages');
const temperatureEl = $('temperature');
const topkEl = $('topk');
const repeatEl = $('repeat');
const toppEl = $('topp');
const stopBtn = $('stopBtn');
const maxNewEl = $('maxNew');
const contextEl = $('context');
const infoEl = $('info');

let ort, tokenizer, session;
let history = [];
let busy = false;
let modelLoaded = false;
let stopRequested = false;
const MODEL_URL = './model-v4/neurox-v4-int8.onnx';
const CDN = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';
let BOS, USER_START, USER_END, ASSISTANT_START, ASSISTANT_END;
const sleepFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

function setStatus(message, error = false) {
  status.textContent = message;
  status.dataset.error = String(error);
}
function appendMessage(role, content = '') {
  const el = document.createElement('div');
  el.className = `message ${role}`;
  const heading = document.createElement('div');
  heading.className = 'role';
  heading.textContent = role === 'user' ? 'YOU' : 'NEUROX CORE V4';
  const body = document.createElement('div');
  body.className = 'body';
  body.textContent = content;
  el.append(heading, body);
  messages.append(el);
  messages.scrollTop = messages.scrollHeight;
  return body;
}
function pickToken(logits, temperature, topK, topP, penalty, recent) {
  const scores = Float32Array.from(logits);
  // Penalize only generated tokens in the current assistant turn, not user text or role markers.
  if (penalty > 1) {
    const used = new Set(recent.slice(-96));
    for (const id of used) {
      if (id >= 0 && id < scores.length && id !== ASSISTANT_END)
        scores[id] = scores[id] < 0 ? scores[id] * penalty : scores[id] / penalty;
    }
  }
  // The model must be allowed to finish its own answer.
  if (temperature <= 0) {
    let best = 0;
    for (let i = 1; i < scores.length; i++) if (scores[i] > scores[best]) best = i;
    return best;
  }
  const indices = Array.from({ length: scores.length }, (_, i) => i);
  indices.sort((a, b) => scores[b] - scores[a]);
  const k = Math.max(1, Math.min(Math.floor(topK) || 30, indices.length));
  const t = Math.max(0.05, temperature);
  const p = Math.max(0.05, Math.min(1, topP));
  const peak = scores[indices[0]];
  const weights = new Float64Array(k);
  let sum = 0;
  for (let i = 0; i < k; i++) {
    weights[i] = Math.exp((scores[indices[i]] - peak) / t);
    sum += weights[i];
  }
  // Nucleus sampling: retain smallest sorted prefix with cumulative probability >= topP.
  let n = k, cumulative = 0;
  for (let i = 0; i < k; i++) {
    cumulative += weights[i] / sum;
    if (cumulative >= p) { n = i + 1; break; }
  }
  let mass = 0;
  for (let i = 0; i < n; i++) mass += weights[i];
  let r = Math.random() * mass;
  for (let i = 0; i < n; i++) {
    r -= weights[i];
    if (r <= 0) return indices[i];
  }
  return indices[n - 1];
}

async function fetchText(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
  return response.text();
}

async function loadModel() {
  if (busy || modelLoaded) return;
  busy = true; loadBtn.disabled = true;
  try {
    setStatus('Loading NEUROX V4 tokenizer...');
    const [cfgText, ranksText] = await Promise.all([
      fetchText('./model-v4/tokenizer.json'), fetchText('./model-v4/tokenizer.tiktoken')
    ]);
    const cfg = JSON.parse(cfgText);
    const special = cfg.special_tokens;
    for (const key of ['<|bos|>', '<|user_start|>', '<|user_end|>', '<|assistant_start|>', '<|assistant_end|>']) {
      if (!Number.isInteger(special?.[key])) throw new Error(`V4 tokenizer missing ${key}`);
    }
    BOS = special['<|bos|>']; USER_START = special['<|user_start|>'];
    USER_END = special['<|user_end|>']; ASSISTANT_START = special['<|assistant_start|>'];
    ASSISTANT_END = special['<|assistant_end|>'];
    tokenizer = new NeuroxTokenizer(cfg, ranksText);
    if (tokenizer.vocabSize !== 16384) throw new Error(`Unexpected V4 vocabulary size: ${tokenizer.vocabSize}`);
    setStatus('Loading ONNX Runtime Web...');
    ort = await import(`${CDN}ort.min.mjs`);
    ort.env.wasm.wasmPaths = CDN;
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.proxy = false;
    setStatus('Downloading NEUROX V4 INT8 (196 MB). Please wait...');
    progress.hidden = false;
    // Fetch with progress, then pass ArrayBuffer to ORT (avoids duplicate URL fetch).
    const response = await fetch(MODEL_URL);
    if (!response.ok) throw new Error(`Model HTTP ${response.status}. Copy neurox-v4-int8.onnx to model-v4/.`);
    const expected = Number(response.headers.get('content-length')) || 196459955;
    if (!response.body) throw new Error('Streaming download is unsupported in this browser');
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); received += value.length;
      progress.value = Math.min(100, (received / expected) * 100);
      setStatus(`Downloading NEUROX V4: ${(received / 1048576).toFixed(1)} MB / ${(expected / 1048576).toFixed(1)} MB`);
    }
    const bytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    setStatus('Initializing V4 INT8 ONNX WASM session...');
    await sleepFrame();
    session = await ort.InferenceSession.create(bytes, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
    const ids = BigInt64Array.from([BOS, USER_START, USER_END, ASSISTANT_START], BigInt);
    const input = new ort.Tensor('int64', ids, [1, ids.length]);
    const outputs = await session.run({ input_ids: input });
    if (!outputs.logits || outputs.logits.dims[2] !== 16384) throw new Error('Unexpected model output shape');
    history = [BOS];
    modelLoaded = true;
    sendBtn.disabled = false;
    resetBtn.disabled = false;
    infoEl.textContent = `Tokenizer ${tokenizer.vocabSize} · WASM CPU · dynamic context 2–2048 (2048 unverified) · no KV-cache`;
    setStatus('READY · NEUROX V4 INT8 running in your browser');
    appendMessage('assistant', 'NEUROX CORE V4 online. Ask a question.');
  } catch (e) {
    console.error(e);
    setStatus(`ERROR: ${e.message}`, true);
    loadBtn.disabled = false;
  } finally {
    busy = false;
    progress.hidden = true;
  }
}

async function sendMessage() {
  const prompt = promptEl.value.trim();
  if (!modelLoaded || busy || !prompt) return;
  busy = true; stopRequested = false; sendBtn.disabled = true; stopBtn.disabled = false; loadBtn.disabled = true;
  promptEl.value = '';
  appendMessage('user', prompt);
  const body = appendMessage('assistant', 'Thinking...');
  const ids = tokenizer.encode(prompt);
  history.push(USER_START, ...ids, USER_END, ASSISTANT_START);
  const generated = [];
  const maxNew = Math.min(128, Math.max(1, Number(maxNewEl.value) || 48));
  const context = Math.min(2048, Math.max(16, Number(contextEl.value) || 128));
  const temperature = Number(temperatureEl.value);
  const topK = Number(topkEl.value);
  const penalty = Math.max(1, Math.min(2, Number(repeatEl.value) || 1));
  const topP = Number(toppEl.value);
  const started = performance.now();
  let stopped = false;
  let stopReason = 'max tokens';
  try {
    for (let i = 0; i < maxNew; i++) {
      if (stopRequested) { stopReason = 'user stopped'; break; }
      const window = history.slice(-context);
      const tokens = BigInt64Array.from(window, BigInt);
      const result = await session.run({ input_ids: new ort.Tensor('int64', tokens, [1, tokens.length]) });
      const output = result.logits;
      const vocab = output.dims[2];
      const logits = output.data.subarray(output.data.length - vocab);
      const next = pickToken(logits, temperature, topK, topP, penalty, generated);
      if (next === ASSISTANT_END) { history.push(next); stopped = true; stopReason = 'assistant_end'; break; }
      generated.push(next);
      history.push(next);
      body.textContent = tokenizer.decode(generated) || '…';
      messages.scrollTop = messages.scrollHeight;
      // Allow browser to paint incremental output.
      await sleepFrame();
    }
    if (!stopped) history.push(ASSISTANT_END);
    const elapsed = (performance.now() - started) / 1000;
    setStatus(`READY · ${generated.length} tokens / ${elapsed.toFixed(1)}s · ${stopReason}`);
    if (!generated.length) body.textContent = '(empty response)';
  } catch (e) {
    console.error(e);
    body.textContent += `\n[ERROR: ${e.message}]`;
    setStatus(`ERROR: ${e.message}`, true);
  } finally {
    busy = false;
    stopBtn.disabled = true;
    sendBtn.disabled = !modelLoaded;
  }
}

loadBtn.addEventListener('click', loadModel);
sendBtn.addEventListener('click', sendMessage);
stopBtn.addEventListener('click', () => { if (busy && modelLoaded) { stopRequested = true; setStatus('Stopping after current inference step...'); } });
resetBtn.addEventListener('click', () => {
  if (busy) return;
  history = [BOS];
  messages.replaceChildren();
  setStatus('Conversation reset · model still loaded');
});
promptEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); }
});